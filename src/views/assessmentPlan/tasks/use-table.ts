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
import { taskPaging, taskDeleteById } from '@/service/modules/assessment'
import { parseTime } from '@/common/common'
import { format } from 'date-fns'
import { useRouter } from 'vue-router'
import {
  NButton,
  NEllipsis,
  NIcon,
  NPopconfirm,
  NSpace,
  NTooltip
} from 'naive-ui'
import {
  COLUMN_WIDTH_CONFIG,
  calculateTableWidth,
  DefaultTableWidth
} from '@/common/column-width-config'
import type { Router } from 'vue-router'
import type {
  TaskPageRes,
  TaskPageData
} from '@/service/modules/assessment/type'
import { DeleteOutlined, EditOutlined, SearchOutlined } from '@vicons/antd'

export function useTable() {
  const { t } = useI18n()
  const router: Router = useRouter()

  const handleEdit = (row: any) => {
    variables.showModalRef = true
    variables.statusRef = 1
    variables.row = row
  }

  const handleDelete = (row: any) => {
    taskDeleteById(row.id).then(() => {
      getTableData({
        pageSize: variables.pageSize,
        pageNo:
          variables.tableData.length === 1 && variables.page > 1
            ? variables.page - 1
            : variables.page,
        evaluationEngineeringId: variables.evaluationEngineeringId,
        taskName: variables.taskName,
        taskBasis: variables.taskBasis,
        taskDateRange: variables.taskDateRange
      })
    })
  }

  const handleRowClick = (row: any) => {
    router.push({
      path: `/assessment/indicator/${row.id}`,
      query: { evaluationEngineeringId: variables.evaluationEngineeringId }
    })
  }

  const createColumns = (variables: any) => {
    variables.columns = [
      {
        title: '#',
        key: 'index',
        render: (unused: any, index: number) => index + 1,
        ...COLUMN_WIDTH_CONFIG['index']
      },
      {
        title: t('assessment.tasks.column_task_name'),
        key: 'taskName',
        render: (row: { id: number; taskName: any }) =>
          h(
            ButtonLink,
            {
              onClick: () => {
                handleRowClick(row)
              }
            },
            {
              default: () =>
                h(
                  NEllipsis,
                  COLUMN_WIDTH_CONFIG['linkEllipsis'],
                  () => row.taskName
                )
            }
          )
      },
      {
        title: t('assessment.tasks.column_task_basis'),
        key: 'taskBasis',
        ellipsis: {
          tooltip: true
        }
      },
      {
        title: t('assessment.tasks.column_indicator_system_num'),
        key: 'indicatorSystemNum'
      },
      {
        title: t('assessment.tasks.column_evaluation_plan_num'),
        key: 'evaluationPlanNum'
      },
      {
        title: t('assessment.tasks.column_evaluation_task_num'),
        key: 'evaluationTaskNum'
      },
      {
        title: t('assessment.tasks.column_evaluation_task_instance_num'),
        key: 'evaluationTaskInstanceNum'
      },
      {
        title: t('assessment.tasks.column_task_time'),
        key: 'taskStartTime',
        render: (row: { taskStartTime: string; taskEndTime: string }) => {
          return `${row.taskStartTime || ''} - ${row.taskEndTime || ''}`
        }
      },
      {
        title: t('assessment.projects.column_creator'),
        key: 'userName'
      },
      {
        title: t('assessment.projects.column_created'),
        key: 'createTime'
      },
      {
        title: t('assessment.projects.column_operation'),
        key: 'actions',
        ...COLUMN_WIDTH_CONFIG['operation'](3),
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
                        type: 'info',
                        size: 'small',
                        class: 'edit',
                        onClick: () => {
                          handleEdit(row)
                        }
                      },
                      {
                        icon: () =>
                          h(NIcon, null, { default: () => h(EditOutlined) })
                      }
                    ),
                  default: () => t('assessment.button.edit')
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
                        default: () => t('assessment.button.delete')
                      }
                    ),
                  default: () => t('assessment.button.confirm')
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
                          handleRowClick(row)
                        }
                      },
                      {
                        icon: () =>
                          h(NIcon, null, { default: () => h(SearchOutlined) })
                      }
                    ),
                  default: () => t('assessment.button.details')
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
    columns: [],
    tableWidth: DefaultTableWidth,
    tableData: [],
    page: ref(1),
    pageSize: ref(10),

    evaluationEngineeringId: ref(0),
    taskName: ref(null),
    taskBasis: ref(null),
    taskStartDate: ref(null),
    taskEndDate: ref(null),
    taskDateRange: ref(null),

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
    if (reqParams.taskDateRange && reqParams.taskDateRange.length === 2) {
      reqParams.startTime = format(
        parseTime(reqParams.taskDateRange[0]),
        'yyyy-MM-dd HH:mm:ss'
      )
      reqParams.endTime = format(
        parseTime(reqParams.taskDateRange[1]),
        'yyyy-MM-dd HH:mm:ss'
      )
      reqParams.taskDateRange = null
    }

    const { state } = useAsyncState(
      taskPaging(reqParams).then((res: TaskPageRes) => {
        variables.totalPage = res.totalPage
        variables.tableData = res.totalList.map((item: TaskPageData) => {
          if (item.taskStartTime) {
            item.taskStartTime = format(
              parseTime(item.taskStartTime),
              'yyyy-MM-dd'
            )
            item.taskEndTime = format(parseTime(item.taskEndTime), 'yyyy-MM-dd')
          }
          if (item.stageStartDate) {
            item.stageStartDate = format(
              parseTime(item.stageStartDate),
              'yyyy-MM-dd'
            )
            item.stageEndDate = format(
              parseTime(item.stageEndDate),
              'yyyy-MM-dd'
            )
          }
          item.createTime = format(
            parseTime(item.createTime),
            'yyyy-MM-dd HH:mm:ss'
          )
          return {
            ...item
          }
        }) as any
        variables.loadingRef = false
      }),
      {}
    )
    return state
  }

  return {
    variables,
    getTableData,
    createColumns
  }
}
