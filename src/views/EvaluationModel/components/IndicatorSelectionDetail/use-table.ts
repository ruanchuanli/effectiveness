import { h, reactive, ref } from 'vue'
import { useI18n } from 'vue-i18n'
import { useAsyncState } from '@vueuse/core'
import ButtonLink from '@/components/button-link'
import {
  deleteCostEstimationModel,
  getActiveColVal,
  getCostEstimationModel
} from '@/views/EvaluationModel/api'
import { useRouter } from 'vue-router'
import { NButton, NIcon, NPopconfirm, NSpace, NTooltip } from 'naive-ui'
import type { DataTableRowKey } from 'naive-ui'
import {
  COLUMN_WIDTH_CONFIG,
  calculateTableWidth,
  DefaultTableWidth
} from '@/common/column-width-config'
import type { Router } from 'vue-router'
import type { PageRes, PageData } from '@/service/modules/assessment/type'
import { DeleteOutlined, EditOutlined, SearchOutlined } from '@vicons/antd'
import { SelectMixedOption } from 'naive-ui/es/select/src/interface'

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
      getTableData()
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
      ...variables.topicDataCol.map((v: string) => ({ title: v, key: v }))
      // {
      //   title: '主题数据集名称',
      //   key: 'topicData'
      // },
      // {
      //   title: '数据表名称',
      //   key: 'topicDataTable'
      // }
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
    loadingRef: ref(false),

    topicDataSet: ref<SelectMixedOption[]>([]),
    topicData: ref<string>(),
    topicDataSetTable: ref<SelectMixedOption[]>([]),
    topicDataTable: ref<string>(),
    topicDataSetCol: ref<SelectMixedOption[]>([]),
    topicDataCol: ref<string[]>([])
  })

  const getTableData = () => {
    if (
      !variables.topicDataTable ||
      !variables.topicData ||
      !variables.topicDataCol ||
      variables.topicDataCol.length == 0 ||
      variables.loadingRef
    )
      return
    variables.loadingRef = true

    const { state } = useAsyncState(
      getActiveColVal({
        pageSize: variables.pageSize,
        pageNo:
          variables.tableData.length === 1 && variables.page > 1
            ? variables.page - 1
            : variables.page,
        dataSetId: variables.topicDataTable,
        dataSourceCols: variables.topicDataCol
      })
        .then((res: PageRes) => {
          variables.totalPage = res.totalPage
          variables.tableData = res.totalList as any
        })
        .finally(() => {
          variables.loadingRef = false
        }),
      {}
    )

    createColumns(variables)

    return state
  }

  return {
    variables,
    getTableData,
    createColumns
  }
}
