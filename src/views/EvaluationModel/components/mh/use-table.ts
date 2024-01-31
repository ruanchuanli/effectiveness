import { h, reactive, ref, onBeforeMount } from 'vue'
import { useI18n } from 'vue-i18n'
import { useAsyncState } from '@vueuse/core'
import ButtonLink from '@/components/button-link'
import {
  deleteCostEstimationModel,
  getEffectivenessEvaluationModelDetail,
  getActiveColVal,
  getCostEstimationModel,
  getWeightByPlanId
} from '@/views/EvaluationModel/api'
import { useRoute } from 'vue-router'
import {
  NButton,
  NIcon,
  NPopconfirm,
  NSpace,
  NTooltip,
  NSelect,
  NEllipsis,
  NTable,
  NInputNumber,
  NFormItem,
  NForm,
  NInput
} from 'naive-ui'
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

  const handleDel = (index: any) => {
    variables.tableData1.splice(index, 1)
  }
  onBeforeMount(() => {
    getDetail()
  })
  const checkedRowKeysRef = ref<DataTableRowKey[]>([])
  const handleCheck = (rowKeys: DataTableRowKey[]) => {
    checkedRowKeysRef.value = rowKeys
  }

  const createColumns = (variables: any) => {
    variables.topicDataColSelected = variables.topicDataCol.map(
      (s: string) => ({
        ...variables.topicDataSetCol.find((item: any) => item.value == s)
      })
    )

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
        render: (row, index) =>
          h(NSelect, {
            value: row.modelName,
            multiple: true,
            clearable: true,
            options: variables.evaluationTargetList,
            onUpdateValue: (v) => {
              console.log(v)
              console.log(row)
              variables.tableData[index].modelName = v
            }
          })
      }
    ]
    if (variables.tableWidth) {
      variables.tableWidth = calculateTableWidth(variables.columns)
    }
  }
  const createColumns1 = (variables: any) => {
    variables.columns1 = [
      {
        title: '序号',
        key: 'index',
        width: 60,
        align: 'center',
        render: (unused: any, index: number) => index + 1
      },
      {
        title: '评价集名称',
        key: 'name',
        render(row, index) {
          return h(NForm, null, [
            h(
              NFormItem,
              {
                // rule: {
                //     required: true,
                //     message: '请输入姓名',
                //     trigger: ['input', 'blur']
                //   }
              },
              [
                h(NInput, {
                  placeholder: '',
                  value: row.name,
                  onUpdateValue(v: any) {
                    variables.tableData1[index].name = v
                  }
                })
              ]
            )
          ])
        }
      },
      {
        title: '分值',
        key: 'score',
        render(row, index) {
          return h(NForm, { ref }, [
            h(
              NFormItem,
              {
                rule: {
                  // required: true,
                  trigger: ['input', 'blur']
                  // validator(value) {
                  //   if (variables.model.evaluationLevel.length > 1) {
                  //     const next = variables.model.evaluationLevel[index + 1]
                  //     if (next.left !== value) {
                  //       return new Error('与下个级别区间左值不相等')
                  //     }
                  //     return true;
                  //   }
                  // }
                }
              },
              [
                h(NInputNumber, {
                  showButton: false,
                  placeholder: '',
                  precision: 4,
                  value: row.score,
                  onUpdateValue(v: any) {
                    variables.tableData1[index].score = v
                    // leftFormRef.value?.validate((valid) => {
                    //   if (valid) {
                    //     // 表单校验通过
                    //     console.log('表单校验通过');
                    //   }
                    // })
                  }
                })
              ]
            )
          ])
        }
      },
      {
        title: t('assessmenttask.projects.column_operation'),
        key: 'actions',
        width: 60,
        render(row: any, index: number) {
          return [
            h(
              NButton,
              {
                text: true,
                type: 'primary',
                style: { marginRight: '10px' },
                onClick: () => handleDel(index)
              },
              { default: () => '删除' }
            )
          ]
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
    show: false,
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
  const getDetail = () => {
    getEffectivenessEvaluationModelDetail(route.query.id as string).then(
      (res: any) => {
        console.log(res, '11')

        variables.evaluationTargetList = res.evaluationTargetList.map(
          (item) => {
            return {
              label: item,
              value: item
            }
          }
        )
      }
    )
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
      getWeightByPlanId(variables.topicDataCol)
        .then((res: PageRes) => {
          console.log(res, 'res')

          variables.totalPage = res.totalPage
          variables.tableData = res.totalList as any
          createColumns(variables)
        })
        .finally(() => {
          variables.loadingRef = false
          // console.log(variables.topicDataCol)
          // if (variables.topicDataCol) {
          //   console.log(12)
          //   createColumns1(variables)

          //   variables.tableData1 = variables.topicDataCol.map((item) => {
          //     return {
          //       targets: item,
          //       qz: ''
          //     }
          //   })
          //   console.log(variables.tableData1)
          // }
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
    createColumns1
  }
}
