import { h, reactive, ref } from 'vue'
import { useI18n } from 'vue-i18n'
import { useAsyncState } from '@vueuse/core'
import {
  deleteExpertJudgment,
  getExpertJudgment
} from '@/views/EvaluationModel/api'
import { useRoute, useRouter } from 'vue-router'
import {
  NButton,
  NIcon,
  NPopconfirm,
  NSpace,
  NTooltip,
  useMessage
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

export function useTable({ rowClickCb }) {
  const { t } = useI18n()
  const router: Router = useRouter()
  const route = useRoute()
  const message = useMessage()

  const handleEdit = (row: any) => {
    variables.showModalRef = true
    variables.statusRef = 1
    variables.row = row
    rowClickCb()
  }

  const handleDelete = (row: any) => {
    deleteExpertJudgment(row.id).then(() => {
      message.success('删除成功')
      getTableData({
        pageSize: variables.pageSize,
        pageNo:
          variables.tableData.length === 1 && variables.page > 1
            ? variables.page - 1
            : variables.page,
        modelId: route.query.manageId
      })
    })
  }

  const checkedRowKeysRef = ref<DataTableRowKey[]>([])
  const handleCheck = (rowKeys: DataTableRowKey[]) => {
    checkedRowKeysRef.value = rowKeys
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
        title: '专家',
        key: 'expertName'
      },
      {
        title: '中估值 ',
        key: 'mediumValuation'
      },
      {
        title: '低估值',
        key: 'lowValuation'
      },
      {
        title: '高估值',
        key: 'strongValuation'
      },
      {
        title: '轮次',
        key: 'round'
      },
      {
        title: '估值依据',
        key: 'valuationBasis'
      },
      {
        title: '专家熟悉度',
        key: 'expertFamiliarityLabel'
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
              )
              // h(
              //   NPopconfirm,
              //   {
              //     onPositiveClick: () => {
              //       handleDelete(row)
              //     }
              //   },
              //   {
              //     trigger: () =>
              //       h(
              //         NTooltip,
              //         {},
              //         {
              //           trigger: () =>
              //             h(
              //               NButton,
              //               {
              //                 circle: true,
              //                 type: 'error',
              //                 size: 'small',
              //                 class: 'delete'
              //               },
              //               {
              //                 icon: () =>
              //                   h(NIcon, null, {
              //                     default: () => h(DeleteOutlined)
              //                   })
              //               }
              //             ),
              //           default: () => t('assessment.button.delete')
              //         }
              //       ),
              //     default: () => t('assessment.button.confirm')
              //   }
              // )
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
    engineering: ref(null),
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

    const { state } = useAsyncState(
      getExpertJudgment(reqParams).then((res: PageRes) => {
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
