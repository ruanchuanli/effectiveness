import { h, reactive, ref, onBeforeMount } from 'vue'
import { useI18n } from 'vue-i18n'
import { useAsyncState } from '@vueuse/core'
import ButtonLink from '@/components/button-link'
import {
  deleteCostEstimationModel,
  getEffectivenessEvaluationModelDetail,
  getActiveColVal,
  getCostEstimationModel
} from '@/views/EvaluationModel/api'
import { useRoute } from 'vue-router'
import { NButton, NIcon, NPopconfirm, NSpace, NTooltip, NSelect,NEllipsis } from 'naive-ui'
import type { DataTableRowKey } from 'naive-ui'
import {
  COLUMN_WIDTH_CONFIG,
  calculateTableWidth,
  DefaultTableWidth
} from '@/common/column-width-config'
import type { PageRes, PageData } from '@/service/modules/assessment/type'
import { DeleteOutlined, EditOutlined, SearchOutlined } from '@vicons/antd'
import { SelectMixedOption } from 'naive-ui/es/select/src/interface'

export function useTable() {
  const { t } = useI18n()
  const route = useRoute()

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
  onBeforeMount(()=>{
    getDetail()
  })
  const checkedRowKeysRef = ref<DataTableRowKey[]>([])
  const handleCheck = (rowKeys: DataTableRowKey[]) => {
    checkedRowKeysRef.value = rowKeys
  }

  const createColumns = (variables: any) => {
    variables.topicDataColSelected = variables.topicDataCol.map((s:string) => ({
      ...variables.topicDataSetCol.find((item:any) => item.value == s)
    }))

    variables.columns = [
      {
        title: '#',
        key: 'index',
        render: (unused: any, index: number) => index + 1,
        ...COLUMN_WIDTH_CONFIG['index']
      },
      ...variables.topicDataColSelected.map((item: any) => ({
        title: item.label,
        key: item.value
      })),
      {
        title: '选择评估对象',
        key: 'modelName', 
        render: (row,index) =>
        h(
          NSelect,
          {
            value: row.modelName,
            multiple: true,
            clearable: true,
            options: variables.evaluationTargetList,
            onUpdateValue: (v) => {
              console.log(v)
              console.log(row)
              variables.tableData[index].modelName = v
            },
          },
        )
      },
    ]
    if (variables.tableWidth) {
      variables.tableWidth = calculateTableWidth(variables.columns)
    }
  }
  const createColumns1 = (variables: any) => {
    variables.columns1 = [
      {
        title: '指标',
        key: 'targets',
      },
      {
        title: '权重',
        key: '',
      },
      {
        title: '归一化方式',
        key: ''
      },
      {
        title: '归一化参数',
        key: ''
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

                        }
                      },
                      {
                        icon: () =>
                          h(NIcon, null, { default: () => h(EditOutlined) })
                      }
                    ),
                  default: () => '设置'
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
    columns1: [],
    tableWidth: DefaultTableWidth,
    checkedRowKeys: checkedRowKeysRef,
    handleCheck,
    show:false,
    tableData: [],
    tableData1: [],
    page: ref(1),
    pageSize: ref(10),
    engineering: ref(null),
    createdRange: ref(null),

    totalPage: ref(1),
    showModalRef: ref(false),
    statusRef: ref(0),
    row: {},
    evaluationTargetList: [],
    loadingRef: ref(false),

    topicDataSet: ref<SelectMixedOption[]>([]),
    topicData: ref<string>(),
    topicDataSetTable: ref<SelectMixedOption[]>([]),
    topicDataTable: ref<string>(),
    topicDataSetCol: ref<SelectMixedOption[]>([]),
    topicDataCol: ref<string[]>([]),
    topicDataColSelected: ref<any[]>([])
  })
  const getDetail = ()=>{
    getEffectivenessEvaluationModelDetail( route.query.id as string )
    .then((res: any) => {
      console.log(res,'11')
      
      variables.evaluationTargetList = res.evaluationTargetList.map(item=>{
        return {
          label: item,
          value: item,
        }
      })
    })

 
  }
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
    if (variables.topicDataCol.length == 0) {
      variables.topicDataCol = variables.topicDataSetCol.map(
        (item) => item.value as string
      )
    }
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
          console.log(res,'res');
          
          variables.totalPage = res.totalPage
          variables.tableData = res.totalList as any
        })
        .finally(() => {
          variables.loadingRef = false
          console.log(variables.topicDataCol)
          if(variables.topicDataCol){
            console.log(12);
            createColumns1(variables)
            
            variables.tableData1 = variables.topicDataCol.map(item=>{
              return {
                targets: item,
                qz: '',
              }
            })
            console.log(variables.tableData1);

          }
        }),
      {}
    )

    createColumns(variables)

    return state
  }

  return {
    variables,
    getTableData,
    createColumns,
    createColumns1,
  }
}
