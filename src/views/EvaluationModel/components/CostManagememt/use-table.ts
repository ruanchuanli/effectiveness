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
  deleteCostEstimationModel,
  getCostEstimationModel
} from '@/views/EvaluationModel/api'
import { useRouter } from 'vue-router'
import {
  NButton,
  NEllipsis,
  NIcon,
  NPopconfirm,
  NSpace,
  NTooltip
} from 'naive-ui'
import type { DataTableRowKey } from 'naive-ui'
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

  const handleEdit = (row: any) => {
    variables.showModalRef = true
    variables.statusRef = 1
    variables.row = row
  }

  const handleDelete = (row: any) => {
    deleteCostEstimationModel(row.id).then(() => {
      getTableData({
        pageSize: variables.pageSize,
        pageNo:
          variables.tableData.length === 1 && variables.page > 1
            ? variables.page - 1
            : variables.page,
        createdRange: variables.createdRange
      })
    })
  }

  const handleSkipClick = (row: any) => {
    // 查看详情  根据 估算方式类型不同 跳转不同页面
    // const routerInfo = [{ id: row.id, name: row.evaluationEngineeringName }]
    // localStorage.setItem('assessment_steps', JSON.stringify(routerInfo))

    if (row.estimationMethodLabel === '参数费用法') {
      console.log(row)

      router.push({
        name: 'cost-parameter',
        query: {
          manageId: row.id,
          modelName: row.modelName
        }
      })
    } else if (row.estimationMethodLabel === '专家判断法') {
      router.push({
        path: '/evaluation-model/cost-management/expert-judgment',
        query: {
          manageId: row.id,
          modelName: row.modelName
        }
      })
    }
  }

  const checkedRowKeysRef = ref<DataTableRowKey[]>([])
  const handleCheck = (rowKeys: DataTableRowKey[]) => {
    checkedRowKeysRef.value = rowKeys
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
        title: '费用估算模型名称',
        key: 'modelName',
        render: (row: { id: number; modelName: any }) =>
          h(
            ButtonLink,
            {
              onClick: () => {
                handleSkipClick(row)
              }
            },
            {
              default: () =>
                h(
                  NEllipsis,
                  COLUMN_WIDTH_CONFIG['linkEllipsis'],
                  () => row.modelName
                )
            }
          )
      },
      {
        title: t('assessment.projects.column_desc'),
        key: 'evaluationEngineeringDesc',
        ellipsis: {
          tooltip: true
        }
      },
      // {
      //   title: '费用估算模型名称',
      //   key: 'modelName'
      // },
      {
        title: '阶段费用类型',
        key: 'expenseTypeLabel'
      },
      {
        title: '估算方式',
        key: 'estimationMethodLabel'
      },
      {
        title: '创建时间',
        key: 'createTime'
      },
      {
        title: '创建者',
        key: 'userName'
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
                          handleSkipClick(row)
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
    checkedRowKeys: checkedRowKeysRef,
    handleCheck,
    tableData: [],
    page: ref(1),
    pageSize: ref(10),

    modelName: ref(null),
    expenseType: ref(null),
    estimationMethod: ref(null),

    totalPage: ref(1),
    showModalRef: ref(false),
    statusRef: ref(0),
    row: {},
    rowKey: (row: any) => row.id,
    loadingRef: ref(false)
  })

  const getTableData = (params: any) => {
    if (variables.loadingRef) return
    variables.loadingRef = true

    console.log(params)
    const reqParams = { ...params }

    const { state } = useAsyncState(
      getCostEstimationModel(reqParams).then((res: PageRes) => {
        console.log(res)
        variables.totalPage = res.totalPage
        variables.tableData = res.totalList as any
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
