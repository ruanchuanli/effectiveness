import { ArrowLeftOutlined, SearchOutlined } from '@vicons/antd'
import {
  NButton,
  NDataTable,
  NIcon,
  NSelect,
  NPagination,
  NSpace,
  NForm,
  NFormItem,
  NInput,
  NGrid,
  NGridItem,
  NTable,
  NInputNumber,
  NModal,
  NTabPane,
  NTabs
} from 'naive-ui'
import {
  defineComponent,
  getCurrentInstance,
  nextTick,
  onBeforeMount,
  onMounted,
  reactive,
  ref,
  toRefs,
  watch
} from 'vue'
import { useI18n } from 'vue-i18n'
import { useTable } from '../components/fuzzyEvaluationMethod/use-table'
import Card from '@/components/card'
import {
  getEvaluationEngineering,
  taskDetailById,
  taskPaging,
  callMohuPython,
  saveFuzzyAnalysisResults
} from '../api'
import { SelectBaseOption } from 'naive-ui/es/select/src/interface'
import { useRoute, useRouter } from 'vue-router'
import { ModelDisplayData } from '../api/type'

const list = defineComponent({
  name: 'effectivenessSelectionDetail',
  emits: ['addpj'],
  setup(props, context) {
    const { t } = useI18n()
    const { variables, getTableData, createColumns,createColumnsjg, createColumns1 } =
      useTable()
    const route = useRoute()
    const router = useRouter()

    const bottomVariables = reactive({
      dataSelection: ref<string[]>([]),
      dataSelectionOptions: ref<any[]>([]),
      analyticalMethod: ref<Record<string, any>>({}),
      analyticalMethodOptions: ref([]),
      paramsConfigList: ref<Record<string, any>>({}),

      analysisResultData: ref<Record<string, any>>({}),
      chartConfig: { xName: '', yName: '', data: [], title: '' },
      showChart: ref(true),
      modelDisplayData: ref<ModelDisplayData[]>([])
    })
    const addpj = () => {
      variables.tableData1.push({})
    }
    const analysis = () => {
      // if (
      //   !variables.evaluationProjectId ||
      //   bottomVariables.dataSelection.length == 0
      // ) {
      //   return
      // }
      let x:any = []
      // variables.zj.forEach(item=>{

      //   x.push(item.map(item1=>item1.level))
      // })
      callMohuPython(
        {objList:variables.evaluationTargetList,
        weightList:variables.tableData.map(item=>item.weight),
        levelList:variables.tableData1.map(item=>item.name),
        levelRegList:variables.tableData1.map(item=>item.score),
        x:variables.zj}
      ).then((res: any) => {
        console.log(res,'fxxfx');
        // variables.tablejg = res.objList.map((obj, index) => {
        //   const row = {
        //     object: obj,
        //     fuzzyscore: res.fuzzyScore[index],
        //   };
        //   variables.tableData1.forEach((bt, btIndex) => {
        //     row[bt.bt] = res.fuzzyVector[index][btIndex];
        //   });
        //   return row;
        // });
        variables.analysisResults = res
        variables.tablejg = res.objList.map((obj, index) => {
          let row = {
            object: obj,
            fuzzyscore: res.fuzzyScore[index],
          };
          variables.tableData1.forEach((bt, btIndex) => {
            // 为每个 bts 中定义的列赋值
            if (btIndex < res.fuzzyVector[index].length) {
              row[btIndex] = res.fuzzyVector[index][btIndex];
            }
          });
          return row;
        });
        createColumnsjg(variables)
        console.log(variables.tablejg,9898);
        
        // showBottom(res)
        // refreshChart()
      })
    }

    const save = () => {
      const data = {
        modelId:route.query.id*1,
        evaluationSet:JSON.stringify(variables.tableData1),
        evaluationEngineeringId: variables.evaluationEngineeringId,
        evaluationProjectId: variables.evaluationProjectId,
        evaluationPlanId: variables.evaluationPlanId,
        expertVotingResults:JSON.stringify(variables.zj),
        analysisResults:JSON.stringify(variables.analysisResults)
      }

      saveFuzzyAnalysisResults(
        data
      ).then(() => {
        window.$message.success('保存成功')
      })
    }
    const handleModalChange = () => {
      variables.showModalRef = true
      variables.statusRef = 0
    }
    // 搜索
    const handleSearch = () => {
      variables.page = 1
      getTableData()
    }

    const onClearSearch = () => {
      variables.page = 1
      getTableData()
    }

    const onCancelModal = () => {
      variables.show = variables.showModalRef = false
    }

    const onConfirmModal = () => {
      variables.showModalRef = false
      getTableData()
    }
    const confirmModal = () => {
      variables.show = false
      // getTableData()
    }

    const handleChangePageSize = () => {
      variables.page = 1
      getTableData()
    }

    const handleAnalyticalMethodChange = (
      value: string,
      option: SelectBaseOption
    ) => {
      bottomVariables.analyticalMethod = option
      bottomVariables.paramsConfigList = {}
    }

    const handleBack = () => {
      router.back()
    }

    const trim = getCurrentInstance()?.appContext.config.globalProperties.trim

    onBeforeMount(async () => {
      console.log(12)

      // createColumns(variables)
      createColumns1(variables)

      await getEvaluationEngineering().then((res: string[]) => {
        console.log(res)

        variables.evaluationEngineer = res.totalList
      })
      handleSearch()
    })

    watch(useI18n().locale, () => {
      // createColumns(variables)
      createColumns1(variables)
    })

    watch(
      () => variables.evaluationEngineeringId,
      (evaluationEngineeringId, oldVal) => {
        if (!evaluationEngineeringId) {
          return
        }
        taskPaging({ evaluationEngineeringId: evaluationEngineeringId }).then((res: any) => {
          variables.evaluationProject = res.totalList
          // if (oldVal) {
          //   variables.evaluationProjectId = res[0].id
          // }
        })
      }
    )
    watch(
      () => variables.activeTab,
      (activeTab, oldVal) => {
        if (!activeTab) {
          return
        }
        createColumns(variables,variables.activeTab)
      }
    )
    watch(
      () => variables.evaluationProjectId,
      (evaluationProjectId, oldVal) => {
        if (!evaluationProjectId) {
          return
        }

        taskDetailById({ taskId: evaluationProjectId }).then((res: string[]) => {
          variables.evaluationPlan = res.totalList
          if (oldVal) {
            variables.evaluationPlanId = ''
          }
        })
      }
    )

    watch(
      () => variables.evaluationPlanId,
      (evaluationPlanId) => {
      }
    )

    return {
      t,
      ...toRefs(variables),
      ...toRefs(bottomVariables),
      getTableData,
      handleModalChange,
      handleSearch,
      onCancelModal,
      onConfirmModal,
      confirmModal,
      onClearSearch,
      handleChangePageSize,
      analysis,
      save,
      handleAnalyticalMethodChange,
      trim,
      handleBack,
      addpj
    }
  },
  render() {
    const { t, loadingRef } = this
    return (
      <NSpace vertical>
        <NGrid class='current-page-header' cols={1}>
          <NGridItem class='n-grid-item'>
            <div class='title'>
              <NButton onClick={this.handleBack} class='btn-back'>
                <NIcon size='20' component={ArrowLeftOutlined}></NIcon>
              </NButton>
              {this.$route.query.taskName}
            </div>
            {/* <div class='desc'>{this.$route.query.manageName}</div> */}
          </NGridItem>
        </NGrid>
        <Card title='评价集维护'>
          <div style='float:right'>
            <NButton size='small' type='primary' onClick={this.addpj}>
              新增
            </NButton>
          </div>
          <NDataTable
            loading={loadingRef}
            columns={this.columns1}
            data={this.tableData1}
          />
        </Card>
        <Card title='评价方案选择'>
          <NSpace vertical>
            <NSpace justify='space-between'>
              <NSpace>
                <NSelect
                  v-model={[this.evaluationEngineeringId, 'value']}
                  options={this.evaluationEngineer}
                  labelField='evaluationEngineeringName'
                  valueField='id'
                  placeholder={'选择评估工程'}
                  style={{ width: '300px' }}
                  size='small'
                  onClear={this.onClearSearch}
                />
                <NSelect
                  v-model={[this.evaluationProjectId, 'value']}
                  options={this.evaluationProject}
                  labelField='taskName'
                  valueField='id'
                  placeholder={'选择评估项目'}
                  style={{ width: '300px' }}
                  size='small'
                  onClear={this.onClearSearch}
                />
                <NSelect
                  v-model={[this.evaluationPlanId, 'value']}
                  options={this.evaluationPlan}
                  placeholder={'选择评估方案'}
                  style={{ width: '300px' }}
                  size='small'
                  onClear={this.onClearSearch}
                  labelField='evaluationPlanName'
                  valueField='id'
                />
              </NSpace>
              <NSpace>
                <NButton
                  size='small'
                  type='primary'
                  onClick={this.handleSearch}
                  v-slots={{
                    icon: () => (
                      <NIcon>
                        <SearchOutlined />
                      </NIcon>
                    ),
                    default: () => <span>权重预览</span>
                  }}
                ></NButton>
              </NSpace>
            </NSpace>
          </NSpace>
        </Card>
        <Card>
          <NTabs type='line' animated v-model:value={this.activeTab}>
            {this.evaluationTargetList.map((item, index) => (
              <NTabPane name={index} tab={`${item}`}>
              </NTabPane>
            ))}
          </NTabs>
          {this.evaluationTargetList.map((item, index) => (
              <Card title='专家投票结果统计' v-show={this.activeTab==index} key={index}>
              <NDataTable
                key={index}
                loading={loadingRef}
                columns={this.columns}
                data={this.tableDatas[index]}
                scrollX={this.tableWidth}
                class={index+'dhfj'}
                key={index+'dhfj66'}
              />
            </Card>
            ))}
          
        </Card>
        <Card>
          <NSpace justify='space-between'>
            <NSpace>
              <NButton
                size='small'
                onClick={this.analysis}
                type='primary'
                class='btn-create-project'
              >
                分析
              </NButton>
              <NButton
                size='small'
                onClick={this.save}
                type='primary'
                class='btn-create-project'
              >
                保存
              </NButton>
            </NSpace>
          </NSpace>
            <Card title='综合评价结果'>
              <NDataTable
                loading={loadingRef}
                columns={this.columnsjg}
                data={this.tablejg}
                // scrollX={this.tableWidth}
                // row-class-name='items'
              />
            </Card>
        </Card>
      </NSpace>
    )
  }
})

export default list
