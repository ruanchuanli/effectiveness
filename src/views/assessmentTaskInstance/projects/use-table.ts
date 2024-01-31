/*
 * Licensed to the Apache Software Foundation (ASF) under one or more
 * contributor license agreements.  See the NOTICE file distributed with
 * this work for additional information regarding copyright ownership.
 * The ASF licenses this file to You under the Apache License, Version 2.0
 * (the "License"); you may not use this file except in compliance with
 * the License.  You may obtain a copy of the License at
 *
 *    http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */
import { h, reactive, ref } from 'vue'
import { useI18n } from 'vue-i18n'
import { useAsyncState } from '@vueuse/core'
import ButtonLink from '@/components/button-link'
import {
  pagingplan,
  deleteByIds,
  downloadReport,
  deleteTaskInstanceById
} from '@/service/modules/assessmenttaskinstance'
import {
  parseTime,
  renderTableTime,
  runningType,
  workflowExecutionState
} from '@/common/common'
import { format } from 'date-fns'
import { useRouter, useRoute } from 'vue-router'
import {
  NButton,
  NEllipsis,
  NIcon,
  NPopconfirm,
  NSpace,
  NTooltip,
  NSpin
} from 'naive-ui'
import {
  COLUMN_WIDTH_CONFIG,
  calculateTableWidth,
  DefaultTableWidth
} from '@/common/column-width-config'
import type { Router } from 'vue-router'
import FileSaver from 'file-saver'
import type { IWorkflowInstance } from '@/service/modules/process-instances/types'
import type { PageRes, PageData } from '@/service/modules/assessment/type'
import {
  DeleteOutlined,
  EditOutlined,
  SearchOutlined,
  VerticalAlignBottomOutlined,
  FolderViewOutlined,
  ProjectOutlined
} from '@vicons/antd'
import { IWorkflowExecutionState } from '@/common/types'

export function useTable() {
  const { t } = useI18n()
  const router: Router = useRouter()
  const route = useRoute()

  const handleEdit = (row: any) => {
    variables.showModalRef = true
    variables.statusRef = 1
    variables.row = row
  }

  const handleDelete = (row: any) => {
    deleteTaskInstanceById(route.query.projectCode as string, row.id).then(
      () => {
        getTableData({
          taskId: route.query.taskid || 1,
          pageSize: variables.pageSize,
          pageNo:
            variables.tableData.length === 1 && variables.page > 1
              ? variables.page - 1
              : variables.page,
          instanceName: variables.instanceName,
          taskName: variables.taskName,
          startRange: variables.startRange,
          endRange: variables.endRange,
          state: variables.state
        })
      }
    )
    // deleteByIds(row.id).then(() => {
    //   getTableData({
    //     taskId: variables.taskId,
    //     pageSize: variables.pageSize,
    //     pageNo:
    //       variables.tableData.length === 1 && variables.page > 1
    //         ? variables.page - 1
    //         : variables.page,
    //     evaluationPlanName: variables.evaluationPlanName,
    //     evaluationPlanDesc: variables.evaluationPlanDesc,
    //     createdRange: variables.createdRange,
    //     // startTime:'',
    //     // endTime: '',
    //   })
    // })
  }

  const createColumns = (variables: any) => {
    variables.columns = [
      {
        type: 'selection'
      },
      {
        title: '#',
        key: 'index',
        render: (unused: any, index: number) => index + 1,
        ...COLUMN_WIDTH_CONFIG['index']
      },
      {
        title: t('assessmenttaskinstance.projects.column_instance_name'),
        key: 'name',
        render: (row: {
          id: number
          name: any
          processDefinitionCode: number
        }) =>
          h(
            ButtonLink,
            {
              onClick: () => {
                router.push({
                  name: 'workflow-instance-detail-task',
                  params: { projectCode: route.query.projectCode, id: row.id },
                  query: {
                    code: row.processDefinitionCode,
                    name: row.name,
                    evaluationEngineeringId: route.query.evaluationEngineeringId
                  }
                })
              }
            },
            {
              default: () =>
                h(
                  NEllipsis,
                  COLUMN_WIDTH_CONFIG['linkEllipsis'],
                  () => row.name
                )
            }
          )
      },
      {
        title: t('assessmenttaskinstance.projects.column_name'),
        key: 'evaluationTaskName',
        ellipsis: {
          tooltip: true
        }
      },
      {
        title: t('assessmenttaskinstance.projects.column_created'),
        key: 'startTime'
      },
      {
        title: t('assessmenttaskinstance.projects.column_end'),
        key: 'endTime'
      },
      {
        title: t('assessmenttaskinstance.projects.column_status'),
        key: 'state',
        render: (_row: IWorkflowInstance) =>
          renderWorkflowStateCell(_row.state, t)
      },
      {
        title: t('assessmenttaskinstance.projects.column_operation'),
        key: 'actions',
        ...COLUMN_WIDTH_CONFIG['operation'](6),
        render(row: any) {
          return h(NSpace, null, {
            default: () => [
              h(
                NTooltip,
                {},
                {
                  trigger: () =>
                    h(
                      NButton,
                      {
                        circle: true,
                        type: 'default',
                        size: 'small',
                        class: 'search',
                        onClick: () => {
                          router.push({
                            name: 'workflow-instance-detail-task',
                            params: {
                              projectCode: route.query.projectCode,
                              id: row.id
                            },
                            query: {
                              code: row.processDefinitionCode,
                              name: row.name,
                              evaluationEngineeringId:
                                route.query.evaluationEngineeringId
                            }
                          })
                        }
                      },
                      {
                        icon: () =>
                          h(NIcon, null, { default: () => h(SearchOutlined) })
                      }
                    ),
                  default: () => t('assessmenttaskinstance.button.details')
                }
              ),
              h(
                NPopconfirm,
                {
                  onPositiveClick: () => {
                    handleDelete(row)
                  }
                },
                {
                  trigger: () =>
                    h(
                      NTooltip,
                      {},
                      {
                        trigger: () =>
                          h(
                            NButton,
                            {
                              circle: true,
                              type: 'error',
                              size: 'small',
                              class: 'delete'
                            },
                            {
                              icon: () =>
                                h(NIcon, null, {
                                  default: () => h(DeleteOutlined)
                                })
                            }
                          ),
                        default: () => t('assessmenttaskinstance.button.delete')
                      }
                    ),
                  default: () => t('assessmenttaskinstance.button.confirm')
                }
              ),
              h(
                NTooltip,
                {},
                {
                  trigger: () =>
                    h(
                      NButton,
                      {
                        circle: true,
                        type: 'default',
                        size: 'small',
                        class: 'search',
                        onClick: () => {
                          downloadReport(row.id).then((res: any) => {
                            FileSaver.saveAs(res, `${row.name}.pdf`)
                          })
                        }
                      },
                      {
                        icon: () =>
                          h(NIcon, null, {
                            default: () => h(FolderViewOutlined)
                          })
                      }
                    ),
                  default: () => '查看报告'
                }
              ),
              h(
                NTooltip,
                {},
                {
                  trigger: () =>
                    h(
                      NButton,
                      {
                        circle: true,
                        type: 'default',
                        size: 'small',
                        class: 'search',
                        onClick: () => {
                          router.push({
                            path: `/assessmentTaskInstance/calculationResult/${row.id}/${row.evaluationTaskId}`
                          })
                        }
                      },
                      {
                        icon: () =>
                          h(NIcon, null, { default: () => h(ProjectOutlined) })
                      }
                    ),
                  default: () => '运算结果对比'
                }
              )
            ]
          })
        }
      }
    ]
    if (variables.tableWidth) {
      variables.tableWidth = calculateTableWidth(variables.columns)
    }
  }

  const variables = reactive({
    taskId: '',
    state: undefined,
    instanceName: '',
    taskName: '',
    columns: [],
    tableWidth: DefaultTableWidth,
    tableData: [] as any,
    page: ref(1),
    pageSize: ref(10),
    startTime: ref(null),
    endTime: ref(null),
    startRange: ref(null),
    endRange: ref(null),
    totalPage: ref(1),
    showModalRef: ref(false),
    statusRef: ref(0),
    row: {},
    loadingRef: ref(false)
  })

  const getTableData = (params: any) => {
    if (variables.loadingRef) return
    variables.loadingRef = true
    const reqParams = { ...params }
    if (reqParams.startRange && reqParams.startRange.length === 2) {
      reqParams.startTimeBegin = format(
        parseTime(reqParams.startRange[0]),
        'yyyy-MM-dd HH:mm:ss'
      )
      reqParams.startTimeEnd = format(
        parseTime(reqParams.startRange[1]),
        'yyyy-MM-dd HH:mm:ss'
      )
      reqParams.startRange = null
      delete reqParams.startRange
    } else {
      reqParams.startTimeBegin = ''
      reqParams.startTimeBegin = ''
      delete reqParams.startRange
    }

    if (reqParams.endRange && reqParams.endRange.length === 2) {
      reqParams.endTimeBegin = format(
        parseTime(reqParams.endRange[0]),
        'yyyy-MM-dd HH:mm:ss'
      )
      reqParams.endTimeEnd = format(
        parseTime(reqParams.endRange[1]),
        'yyyy-MM-dd HH:mm:ss'
      )
      reqParams.endRange = null
      delete reqParams.endRange
    } else {
      reqParams.endTimeBegin = ''
      reqParams.endTimeEnd = ''
      delete reqParams.endRange
    }

    const { state } = useAsyncState(
      pagingplan(reqParams).then((res: PageRes) => {
        variables.totalPage = res.totalPage
        variables.tableData = res.totalList
        //   .map((item: PageData) => {
        //   item.createTime = format(
        //     parseTime(item.createTime),
        //     'yyyy-MM-dd HH:mm:ss'
        //   )
        //   return {
        //     ...item
        //   }
        // }) as any
        variables.loadingRef = false
      }),
      {}
    )
    return state
  }

  return {
    variables,
    getTableData,
    createColumns,
    handleDelete
  }
}

export function renderWorkflowStateCell(
  state: IWorkflowExecutionState,
  t: Function
) {
  if (!state) return ''

  const stateOption = workflowExecutionState(t)[state]

  const Icon = h(
    NIcon,
    {
      color: stateOption.color,
      class: stateOption.classNames,
      style: {
        display: 'flex'
      },
      size: 20
    },
    () => h(stateOption.icon)
  )
  return h(NTooltip, null, {
    trigger: () => {
      if (!stateOption.isSpin) return Icon
      return h(NSpin, { size: 20 }, { icon: () => Icon })
    },
    default: () => stateOption.desc
  })
}
