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
  NModal
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
import { useTable } from '../components/effectivenessSelectionDetail/use-table'
import Card from '@/components/card'
import WeightModal from '../components/effectivenessSelectionDetail/modal'
import {
  getAnalyticalMethodsList,
  getParameterFittingResult,
  getThemeDataset,
  getThemeDatasetTable,
  getThemeDatasetTableCol,
  indicatorSelectionAnalysis,
  saveIndicatorSelectionAnalysis
} from '../api'
import { SelectBaseOption } from 'naive-ui/es/select/src/interface'
import LineChart from '../components/effectivenessSelectionDetail/scree-charts'
import { useRoute, useRouter } from 'vue-router'
import { ModelDisplayData } from '../api/type'

const list = defineComponent({
  name: 'effectivenessSelectionDetail',
  emits: ['stepOver'],
  setup(props, context) {
    const { t } = useI18n()
    const { variables, getTableData, createColumns } = useTable()
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

    const stepOver = () => {
      console.log(12)

      variables.show = true
    }
    const analysis = () => {
      if (
        !variables.topicDataTable ||
        bottomVariables.dataSelection.length == 0
      ) {
        return
      }

      indicatorSelectionAnalysis(
        bottomVariables.analyticalMethod.id,
        variables.topicDataTable,
        bottomVariables.dataSelection,
        bottomVariables.paramsConfigList
      ).then((res: any) => {
        showBottom(res)
        refreshChart()
      })
    }

    const save = () => {
      const analysisResultJson = JSON.stringify({
        topicData: variables.topicData,
        topicDataTable: variables.topicDataTable,
        topicDataCol: variables.topicDataCol,
        dataSelection: bottomVariables.dataSelection,
        analyticalMethod: bottomVariables.analyticalMethod,
        paramsConfigList: bottomVariables.paramsConfigList,
        header: bottomVariables.analysisResultData.header,
        content: bottomVariables.analysisResultData.content
      })

      saveIndicatorSelectionAnalysis(
        route.query.id as string,
        bottomVariables.analyticalMethod.id,
        analysisResultJson
      ).then(() => {
        window.$message.success('保存成功')
      })
    }

    const showBottom = (data: any) => {
      // 图表数据
      bottomVariables.chartConfig.data = data.content[
        data.header[0].paramName
      ].map((item: number, idx: number) => [
        item,
        data.content[data.header[1].paramName][idx]
      ])
      const paraDes = data.content[data.header[3].paramName].paraDes
      bottomVariables.chartConfig.xName = paraDes?.xlabel
      bottomVariables.chartConfig.yName = paraDes?.ylabel
      bottomVariables.chartConfig.title = paraDes?.title

      bottomVariables.analysisResultData = data

      handleTableData(data)

      refreshChart()
    }

    const handleTableData = (data: any) => {
      bottomVariables.modelDisplayData = []

      const params = data.content[data.header[3].paramName]
      const keys: string[] = params.view

      for (const key of keys) {
        const obj = {} as ModelDisplayData

        if (typeof params.jsonData[key] === 'string') {
          obj.type = 'str'
          obj.data = params.jsonData[key]
          obj.columns = params.columnsDict[key]
        } else {
          obj.type = 'obj'
          obj.data = Object.keys(params.jsonData[key]).map((k) => ({
            [params.columnsDict[key][0]]: k,
            [params.columnsDict[key][1]]: params.jsonData[key][k]
          }))
          obj.columns = params.columnsDict[key].map((item: string) => ({
            title: item,
            key: item
          }))
          console.log(obj)
        }

        bottomVariables.modelDisplayData.push(obj)
      }
    }

    const refreshChart = () => {
      bottomVariables.showChart = false
      nextTick(() => {
        bottomVariables.showChart = true
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

      createColumns(variables)

      await getThemeDataset().then((res: string[]) => {
        // console.log(res);

        variables.topicDataSet = res.map((v) => ({
          value: v,
          label: v
        }))
      })

      // await getParameterFittingResult(route.query.id as string).then(
      //   (res: any) => {
      //     if (res == null) {
      //       return
      //     }

      //     const resultJson = res.parameterFittingResultJson

      //     bottomVariables.paramColumn = resultJson.paramCol
      //     bottomVariables.targetColumn = resultJson.targetCol
      //     bottomVariables.operatorId = resultJson.operatorId
      //     bottomVariables.evaluationEngineeringIds = JSON.parse(
      //       res.evaluationEngineeringId
      //     )
      //     bottomVariables.operatorType = res.operatorType
      //     bottomVariables.operatorName = res.operatorName
      //     bottomVariables.params = resultJson.params
      //     bottomVariables.fitType = resultJson.fitType || 1
      //     variables.topicData = resultJson.topicData
      //     variables.topicDataTable = resultJson.topicDataTable
      //     variables.topicDataCol = resultJson.topicDataCol

      //     nextTick(() => {
      //       bottomVariables.singleParameterRef?.analysis()
      //       bottomVariables.multiParameterRef?.analysis()
      //     })
      //   }
      // )
      handleSearch()
    })

    watch(useI18n().locale, () => {
      createColumns(variables)
    })

    watch(
      () => variables.topicData,
      (topicData, oldVal) => {
        if (!topicData) {
          return
        }

        getThemeDatasetTable(topicData).then((res: any) => {
          variables.topicDataSetTable = res
          if (oldVal) {
            variables.topicDataTable = res[0].id
          }
        })
      }
    )

    watch(
      () => variables.topicDataTable,
      (topicDataTable, oldVal) => {
        if (!topicDataTable) {
          return
        }

        getThemeDatasetTableCol(topicDataTable).then((res: string[]) => {
          console.log(res)

          variables.topicDataSetCol = res.map((v: any) => ({
            value: v.field,
            label: v.comment
          }))

          if (oldVal) {
            variables.topicDataCol = []
          }
        })
      }
    )

    watch(
      () => variables.topicDataCol,
      (topicDataCol) => {
        console.log(topicDataCol, 'topicDataCol')

        bottomVariables.dataSelectionOptions = topicDataCol.map((v: any) => ({
          label: v,
          value: v
        }))

        if (topicDataCol.length == 0) {
          bottomVariables.dataSelection = []
          bottomVariables.analyticalMethod =
            bottomVariables.analyticalMethodOptions[0]
        }
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
      stepOver
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
        <Card>
          <NSpace vertical>
            <NSpace justify='space-between'>
              <NSpace>
                <NSelect
                  v-model={[this.topicData, 'value']}
                  options={this.topicDataSet}
                  placeholder={'主题数据集选择'}
                  style={{ width: '300px' }}
                  size='small'
                  onClear={this.onClearSearch}
                />
                <NSelect
                  v-model={[this.topicDataTable, 'value']}
                  options={this.topicDataSetTable}
                  labelField='tableName'
                  valueField='id'
                  placeholder={'数据表选择'}
                  style={{ width: '300px' }}
                  size='small'
                  onClear={this.onClearSearch}
                />
                <NSelect
                  v-model={[this.topicDataCol, 'value']}
                  options={this.topicDataSetCol}
                  placeholder={'数据列选择'}
                  multiple={true}
                  style={{ width: '300px' }}
                  size='small'
                  onClear={this.onClearSearch}
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
                    default: () => <span>数据预览</span>
                  }}
                ></NButton>
              </NSpace>
            </NSpace>
            <NSpace vertical>
              <NDataTable
                loading={loadingRef}
                columns={this.columns}
                data={this.tableData}
                scrollX={this.tableWidth}
                row-class-name='items'
              />
              <NSpace justify='center'>
                <NPagination
                  v-model:page={this.page}
                  v-model:page-size={this.pageSize}
                  page-count={this.totalPage}
                  show-size-picker
                  page-sizes={[10, 30, 50]}
                  show-quick-jumper
                  onUpdatePage={this.getTableData}
                  onUpdatePageSize={this.handleChangePageSize}
                />
              </NSpace>
            </NSpace>
          </NSpace>
        </Card>
        <Card title='理想点法配置'>
          <div style='float:right'>
            <NButton size='small' type='primary' onClick={this.stepOver}>
              权重设置
            </NButton>
          </div>
          <NDataTable
            loading={loadingRef}
            columns={this.columns1}
            data={this.tableData1}
          />
        </Card>
        <Card>
          <NSpace justify='space-between'>
            <NForm inline labelPlacement='left'>
              <NFormItem label='数据选择'>
                <NSelect
                  v-model={[this.dataSelection, 'value']}
                  options={this.dataSelectionOptions}
                  multiple
                  placeholder='数据选择'
                  style={{ width: '200px' }}
                  size='small'
                />
              </NFormItem>
              <NFormItem label='分析方法'>
                <NSelect
                  v-model={[this.analyticalMethod.id, 'value']}
                  options={this.analyticalMethodOptions}
                  labelField='operatorName'
                  valueField='id'
                  placeholder='分析方法'
                  style={{ width: '200px' }}
                  size='small'
                  onUpdateValue={this.handleAnalyticalMethodChange}
                />
              </NFormItem>
              {this.analyticalMethod.paramsConfig &&
                this.analyticalMethod.paramsConfigList.map((config: any) => (
                  <NFormItem label={config.paramDes}>
                    <NInput
                      v-model={[
                        this.paramsConfigList[config.paramName],
                        'value'
                      ]}
                      placeholder={config.paramDes}
                      style={{ width: '200px' }}
                      size='small'
                      clearable
                    />
                  </NFormItem>
                ))}
            </NForm>
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
          <NSpace
            justify='space-between'
            itemStyle={{ flex: 1 }}
            style={{ margin: '30px 0' }}
          >
            {this.showChart && (
              <LineChart
                data={this.chartConfig.data}
                xName={this.chartConfig.xName}
                yName={this.chartConfig.xName}
                title={this.chartConfig.title}
              />
            )}
            <div>
              {this.modelDisplayData.map((item) =>
                item.type === 'str' ? (
                  <span>
                    {item.columns[0]}: {item.data}
                  </span>
                ) : (
                  <NDataTable
                    loading={loadingRef}
                    columns={item.columns}
                    data={item.data}
                    scrollX={this.tableWidth}
                    row-class-name='items'
                  />
                )
              )}
            </div>
          </NSpace>
        </Card>
        <NModal
          style='width: 70%'
          v-model:show={this.show}
          preset='dialog'
          title='权重设置'
        >
          <NTable striped>
            <thead>
              <tr>
                <th>指标</th>
                <th>重要度</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td>量值比对误差</td>
                <td>
                  <NInputNumber />
                </td>
              </tr>
              <tr>
                <td>参考数据权威得分</td>
                <td>
                  <NInputNumber min={0} precision={3} />
                </td>
              </tr>
              <tr>
                <td>比对广泛性</td>
                <td>
                  <NInputNumber />
                </td>
              </tr>
            </tbody>
          </NTable>
          <div>
            <NSpace justify='center'>
              <NButton onClick={this.onCancelModal}>取消</NButton>
              <NButton type='info' onClick={this.confirmModal}>
                提交
              </NButton>
            </NSpace>
          </div>
        </NModal>
      </NSpace>
    )
  }
})

export default list
