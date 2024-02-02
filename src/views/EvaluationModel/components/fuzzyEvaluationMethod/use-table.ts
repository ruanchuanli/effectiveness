import { h, reactive, ref, onBeforeMount } from 'vue'
import { useI18n } from 'vue-i18n'
import { useAsyncState } from '@vueuse/core'
import ButtonLink from '@/components/button-link'
import {
  deleteCostEstimationModel,
  getEffectivenessEvaluationModelDetail,
  getActiveColVal,
  getCostEstimationModel,
  getWeightByPlanId,
  getFuzzyAnalysisResults
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

  const createColumns = (variables: any,dqindex) => {
    variables.columns = [
      {
        title: '#',
        key: 'index',
        render: (unused: any, index: number) => index + 1,
        ...COLUMN_WIDTH_CONFIG['index']
      },
      {
        title: '指标',
        key: 'name',
      },
      ...variables.tableData1.map((item: any,columnIndex:any) => ({
        title: item.name,
        key: dqindex+'-'+columnIndex,
        render(row, rowIndex) {
          return h(NForm, null, [
            h(NFormItem, null, [
              h(NInputNumber, {
                placeholder: '',
                value: variables.zj[variables.activeTab][rowIndex][columnIndex], // 从对应的三维数组位置获取值
                'onUpdate:value': (v) => {
                  // 更新对应的三维数组位置的值
                  variables.zj[variables.activeTab][rowIndex][columnIndex] = v;
                }
              })
            ])
          ]);
        }
      })),
    ]
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
  const createColumnsjg = (variables: any) => {
    variables.columnsjg =variables.tableData1.map(item=>item.name).map((bt, index) => ({
      title: bt,
      key: index
    }));
    // 添加第一列和最后一列
    variables.columnsjg.unshift({
      title: '对象',
      key: 'object'
    });
    variables.columnsjg.push({
      title: '综合评价',
      key: 'fuzzyscore'
    });
  }
  const variables = reactive({
    results:{},
    analysisResults:{},
    activeTab:0,
    columns: [],
    columns1: [],
    tableWidth: DefaultTableWidth,
    checkedRowKeys: checkedRowKeysRef,
    handleCheck,
    show: false,
    tableData: [],
    tableData1: [],
    tableDatas: [],
    columnss:[],
    tablejg:[],
    columnsjg:[],
    zj:[],
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

    evaluationEngineer: ref<SelectMixedOption[]>([]),
    evaluationEngineeringId: ref<string>(),
    evaluationProject: ref<SelectMixedOption[]>([]),
    evaluationProjectId: ref<string>(),
    evaluationPlan: ref<SelectMixedOption[]>([]),
    evaluationPlanId: ref<string>(),
    topicDataColSelected: ref<any[]>([])
  })
  const getDetail = () => {
    getEffectivenessEvaluationModelDetail(route.query.id as string).then(
      (res: any) => {
        variables.evaluationTargetList = res.evaluationTargetList
      }
    )
    getFuzzyAnalysisResults
    (route.query.id).then(
      (res: any) => {
        variables.results = res
      }
    )
  }
  const getTableData = () => {
    if (
      !variables.evaluationProjectId ||
      !variables.evaluationEngineeringId ||
      !variables.evaluationPlanId ||
      variables.evaluationPlanId.length == 0 ||
      variables.loadingRef
    )
      return
    variables.loadingRef = true
    const { state } = useAsyncState(
      getWeightByPlanId(variables.evaluationPlanId)
        .then((res: PageRes) => {
          variables.zj = []
          variables.columnss = []
          variables.totalPage = res.totalPage
          variables.tableData = res as any
          // variables.tableData.forEach(item=>{item.level=''})
          let matrix: number[][] = [];
          for (let i = 0; i < variables.tableData.length; i++) {
            matrix[i] = []; // 初始化当前行的数组
            for (let j = 0; j < variables.tableData1.length; j++) {
              matrix[i][j] = []; // 初始化当前行的列数据
            }
          }
          variables.evaluationTargetList.forEach(item=>{
            variables.zj.push(matrix)
            variables.tableDatas.push(variables.tableData)
            // variables.columnss.push(variables.columns)
          })
          createColumns(variables,0)
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
    createColumns,
    createColumns1,
    createColumnsjg
  }
}
