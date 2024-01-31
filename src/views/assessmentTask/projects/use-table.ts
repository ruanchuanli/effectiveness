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
import { pagingplan, deleteByIds } from '@/service/modules/assessmentTask'
import { parseTime } from '@/common/common'
import { format } from 'date-fns'
import { useRouter, useRoute } from 'vue-router'
import ButtonLink from '@/components/button-link'
import { NButton, NIcon, NPopconfirm, NSpace, NTooltip, NEllipsis } from 'naive-ui'
import {
  COLUMN_WIDTH_CONFIG,
  calculateTableWidth,
  DefaultTableWidth
} from '@/common/column-width-config'
import type { Router } from 'vue-router'
import type { PageRes } from '@/service/modules/assessment/type'
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

  const handleDelete = (ids: string) => {
    deleteByIds(ids).then(() => {
      getTableData({
        pageSize: variables.pageSize,
        pageNo:
          variables.tableData.length === 1 && variables.page > 1
            ? variables.page - 1
            : variables.page,
        evaluationTaskName: variables.evaluationTaskName,
        createdRange: variables.createdRange,
        taskId: variables.taskId
      })
    })
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
        title: t('assessmenttask.projects.column_name'),
        key: 'evaluationTaskName',
        render: (row: { id: number; evaluationTaskName: any, evaluationPlanId: number }) =>
          h(
            ButtonLink,
            {
              onClick: () => {
                router.push({
                  path: `/assessmenttask/workflow/${row.id}/${row.evaluationPlanId}`
                })
              }
            },
            {
              default: () =>
                h(
                  NEllipsis,
                  COLUMN_WIDTH_CONFIG['linkEllipsis'],
                  () => row.evaluationTaskName
                )
            }
          )
      },
      {
        title: t('assessmenttask.projects.column_plan'),
        key: 'evaluationPlanName'
      },
      {
        title: t('assessmenttask.projects.column_desc'),
        key: 'evaluationTaskDesc',
        ellipsis: {
          tooltip: true
        }
      },

      {
        title: t('assessmenttask.projects.column_created'),
        key: 'createTime'
      },
      {
        title: t('assessmenttask.projects.column_update'),
        key: 'updateTime'
      },
      {
        title: t('assessmenttask.projects.column_operation'),
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
                  default: () => t('assessmenttask.button.edit')
                }
              ),
              h(
                NPopconfirm,
                {
                  onPositiveClick: () => {
                    handleDelete(row.id)
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
                        default: () => t('assessmenttask.button.delete')
                      }
                    ),
                  default: () => t('assessmenttask.button.confirm')
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
                            path: `/assessmenttask/workflow/${row.id}/${row.evaluationPlanId}`
                          })
                        }
                      },
                      {
                        icon: () =>
                          h(NIcon, null, { default: () => h(SearchOutlined) })
                      }
                    ),
                  default: () => t('assessmenttask.button.details')
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
    tableData: [] as any,
    page: ref(1),
    pageSize: ref(10),
    taskId: ref(Number(route.query.taskid)),
    evaluationTaskName: ref(null),
    startTime: ref(null),
    endTime: ref(null),
    createdRange: ref(null),

    totalPage: ref(1),
    showModalRef: ref(false),
    statusRef: ref(0),
    row: {},
    loadingRef: ref(false),
    evaluationTarget: ref([]),
    evaluationLevel: ref([{}])
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
