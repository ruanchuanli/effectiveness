import { h, reactive, ref } from 'vue'
import { useI18n } from 'vue-i18n'
import { useAsyncState } from '@vueuse/core'
import ButtonLink from '@/components/button-link'
import {
  deleteCostEstimationModel,
  deleteIndicatorSelection,
  getCostEstimationModel,
  getIndicatorSelection
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
    deleteIndicatorSelection(row.id).then(() => {
      getTableData({
        pageSize: variables.pageSize,
        pageNo:
          variables.tableData.length === 1 && variables.page > 1
            ? variables.page - 1
            : variables.page,
        taskName: variables.taskName,
        selectionType: variables.selectionType
      })
    })
  }

  const handleSkipClick = (row: any) => {
    router.push({
      path: '/evaluation-model/indicator-selection-detail',
      query: {
        manageId: row.id,
        taskName: row.taskName
      }
    })
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
        title: '任务名称',
        key: 'taskName',
        render: (row: { id: number; taskName: any }) =>
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
                  () => row.taskName
                )
            }
          )
      },
      {
        title: '选取方法',
        key: 'analyticalMethods',
        ellipsis: {
          tooltip: true
        }
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

    taskName: ref(null),
    selectionType: ref(null),

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
      getIndicatorSelection(reqParams).then((res: PageRes) => {
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
