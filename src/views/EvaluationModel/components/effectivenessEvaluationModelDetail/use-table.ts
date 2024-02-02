import { h, reactive, ref } from 'vue'
import { useI18n } from 'vue-i18n'
import { useAsyncState } from '@vueuse/core'
import ButtonLink from '@/components/button-link'
import {
  deleteCostEstimationModel,
  effectivenessEvaluationModelDel,
  getCostEstimationModel,
  geteffectivenessEvaluationModelResult
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
    console.log(row)
  }

  const handleDelete = (row: any) => {
    effectivenessEvaluationModelDel(row.id).then(() => {
      getTableData({
        pageSize: variables.pageSize,
        pageNo:
          variables.tableData.length === 1 && variables.page > 1
            ? variables.page - 1
            : variables.page,
        modelName: variables.modelName,
        modelMethod: variables.modelMethod
      })
    })
  }

  const handleSkipClick = (row: any) => {
    if (row.evaluationMethod == 1) { //模糊评判法
      router.push({
        path: '/evaluation-model/fuzzyEvaluationMethod',
        query: {
          id: row.id,
          modelName: row.modelName,
          evaluationMethod:row.evaluationMethod
        }
      })
    } else if(row.evaluationMethod == 2) { //理想点法
      router.push({
        path: '/evaluation-model/idealPointMethod',
        query: {
          id: row.id,
          modelName: row.modelName
        }
      })
    }else if(row.evaluationMethod == 3) { //ADC法
      router.push({
        path: '/evaluation-model/ADCMethod',
        query: {
          id: row.id,
          modelName: row.modelName
        }
      })
    }else if(row.evaluationMethod == 4) { //SEA法
      router.push({
        path: '/evaluation-model/SEAMethod',
        query: {
          id: row.id,
          modelName: row.modelName
        }
      })
    }else if(row.evaluationMethod == 5) { //指数法
      router.push({
        path: '/evaluation-model/exponentialMethod',
        query: {
          id: row.id,
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
        title: '评估模型名称',
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
        title: '评估模型描述',
        key: 'modelDesc',
        ellipsis: {
          tooltip: true
        }
      },
      {
        title: '评估方法模型',
        key: 'evaluationMethodName'
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
    modelMethod: ref(null),

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

    const reqParams = { ...params }

    const { state } = useAsyncState(
      geteffectivenessEvaluationModelResult(reqParams).then((res: PageRes) => {
        console.log(res, '1212')
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
