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
  deleteById,
  deletePlanById
} from '@/service/modules/assessment'
import { parseTime } from '@/common/common'
import { format } from 'date-fns'
import { useRoute, useRouter } from 'vue-router'
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
import type { PageRes, PageData } from '@/service/modules/assessment/type'
import { DeleteOutlined, EditOutlined, SearchOutlined } from '@vicons/antd'

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
    deletePlanById(row.id).then(() => {
      getTableData({
        taskId: route.query.taskid || 1,
        pageSize: variables.pageSize,
        pageNo:
          variables.tableData.length === 1 && variables.page > 1
            ? variables.page - 1
            : variables.page,
        evaluationPlanName: variables.evaluationPlanName,
        evaluationPlanDesc: variables.evaluationPlanDesc,
        createdRange: variables.createdRange
        // startTime:'',
        // endTime: '',
      })
    })
  }

  const handleDetail = (row: any) => {
    router.push({
      query: {
        evaluationEngineeringId: route.query.evaluationEngineeringId,
        projectCode: route.query.projectCode,
        taskId: row.taskId
      },
      path: `/assessmentPlan/workflow/${row.id}/${row.processCode}`
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
        title: t('assessmentplan.projects.column_name'),
        key: 'evaluationPlanName',
        render: (row: any) =>
          h(
            ButtonLink,
            {
              onClick: () => {
                handleDetail(row)
              }
            },
            {
              default: () =>
                h(
                  NEllipsis,
                  COLUMN_WIDTH_CONFIG['linkEllipsis'],
                  () => row.evaluationPlanName
                )
            }
          )
      },
      {
        title: t('assessmentplan.projects.column_desc'),
        key: 'evaluationPlanDesc',
        ellipsis: {
          tooltip: true
        }
      },

      {
        title: t('assessmentplan.projects.column_created'),
        key: 'createTime'
      },
      {
        title: t('assessmentplan.projects.column_operation'),
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
                  default: () => t('assessmentplan.button.edit')
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
                        default: () => t('assessmentplan.button.delete')
                      }
                    ),
                  default: () => t('assessmentplan.button.confirm')
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
                          handleDetail(row)
                        }
                      },
                      {
                        icon: () =>
                          h(NIcon, null, { default: () => h(SearchOutlined) })
                      }
                    ),
                  default: () => t('assessmentplan.button.details')
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
    columns: [],
    tableWidth: DefaultTableWidth,
    tableData: [],
    page: ref(1),
    pageSize: ref(10),

    evaluationPlanName: ref(null),
    evaluationPlanDesc: ref(null),
    startTime: ref(null),
    endTime: ref(null),
    createdRange: ref(null),

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
    if (reqParams.createdRange && reqParams.createdRange.length === 2) {
      reqParams.startTime = format(
        parseTime(reqParams.createdRange[0]),
        'yyyy-MM-dd HH:mm:ss'
      )
      reqParams.endTime = format(
        parseTime(reqParams.createdRange[1]),
        'yyyy-MM-dd HH:mm:ss'
      )
      reqParams.createdRange = null
      delete reqParams.createdRange
    } else {
      reqParams.startTime = ''
      reqParams.endTime = ''
      delete reqParams.createdRange
    }

    const { state } = useAsyncState(
      pagingplan(reqParams).then((res: PageRes) => {
        variables.totalPage = res.totalPage
        variables.tableData = res.totalList.map((item: PageData) => {
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
