import {
  NButton,
  NDataTable,
  NSelect,
  NSpace,
  NInput,
  NForm,
  NFormItem,
  NModal,
  NCard
} from 'naive-ui'
import {
  PropType,
  defineComponent,
  nextTick,
  onMounted,
  reactive,
  ref,
  toRefs,
  watch
} from 'vue'
import { useI18n } from 'vue-i18n'
import {
  addOperatorType,
  getActiveColVal,
  getAnalyticalMethodsList,
  getDictListByType,
  getEvaluationEngineering,
  parameterFitting,
  saveParameterFittingResult
} from '../../api'
import { SelectBaseOption } from 'naive-ui/es/select/src/interface'
import LineChart from './multi-parameter-charts'
import { useRoute } from 'vue-router'
import { ModelDisplayData } from '../../api/type'
const props = {
  variables: {
    type: Object as PropType<any>,
    default: () => {}
  }
}

const list = defineComponent({
  name: 'MultiParameter',
  props,
  expose: ['analysis'],
  setup(props) {
    const { t } = useI18n()
    const route = useRoute()

    const variables = reactive({
      paramColumn: ref<string[]>([]),
      targetColumn: ref<string>(),
      fittedModel: ref<Record<string, any>>({}),
      fittedModelList: ref<any[]>([]),
      columnList: ref<any[]>([]),
      paramsConfigList: ref<Record<string, string>>({}),

      parameterFittingData: ref<Record<string, any>>({}),
      chartConfig: {
        title: '',
        xName: '',
        yName: '',
        realData: [],
        predictData: []
      },
      modelDisplayData: [] as ModelDisplayData[],
      showParameterFitting: ref(true),

      saveModelShow: ref(false),
      evaluationEngineeringOptions: ref<any[]>([]),
      dictListByTypeOptions: ref<any[]>([]),
      evaluationEngineeringIds: ref<any[]>([]),
      operatorType: ref<string>(),
      operatorName: ref('')
    })

    // 校验参数方法
    const validateFormParam = (value: any) => {
      if (!value || Number.isNaN(Number(value))) {
        return Error('请输入合法参数')
      }

      return true
    }

    // 校验参数
    const validateForm = () => {
      return new Promise((resolve, reject) => {
        Object.values(variables.paramsConfigList).map((value) => {
          const res = validateFormParam(value)
          if (res instanceof Error) {
            reject(res.message)
          }
        })

        resolve('')
      })
    }

    const analysis = async () => {
      await validateForm().catch((msg) => {
        window.$message.error(msg)
        return Promise.reject(msg)
      })

      if (
        !props.variables.topicDataTable ||
        !variables.paramColumn ||
        !variables.fittedModel.id ||
        !variables.targetColumn
      ) {
        return
      }

      const fitData = await parameterFitting(
        variables.fittedModel.id,
        props.variables.topicDataTable,
        variables.paramColumn.join(','),
        variables.targetColumn,
        variables.paramsConfigList
      )
      const realData = (
        await getActiveColVal({
          pageSize: 99999,
          pageNo: 1,
          dataSetId: props.variables.topicDataTable,
          dataSourceCols: [variables.targetColumn]
        })
      ).totalList

      variables.parameterFittingData = fitData

      handleChartData(fitData, realData)
      handleTableData(fitData)

      refreshChart()
    }

    const handleChartData = (fitData: any, realData: any) => {
      variables.chartConfig.predictData = fitData.content[
        fitData.header[0].paramName
      ].map((item: number, idx: number) => [
        item,
        fitData.content[fitData.header[1].paramName][idx]
      ])

      variables.chartConfig.realData = realData.map(
        (item: any, idx: number) => [
          idx + 1,
          item[variables.targetColumn as string]
        ]
      )

      const paraDes = fitData.content[fitData.header[3].paramName].paraDes
      variables.chartConfig.xName = paraDes?.xlabel
      variables.chartConfig.yName = paraDes?.ylabel
      variables.chartConfig.title = paraDes?.title
    }

    const handleTableData = (data: any) => {
      variables.modelDisplayData = []

      const params = data.content[data.header[3].paramName]
      const keys: string[] = params.view

      for (let key of keys) {
        let obj = {} as ModelDisplayData

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
        }

        variables.modelDisplayData.push(obj)
      }
    }

    const save = async () => {
      await validateForm().catch((msg) => {
        window.$message.error(msg)
        return Promise.reject(msg)
      })

      variables.saveModelShow = true
    }

    const handleSave = async () => {
      if (
        variables.operatorType == undefined ||
        variables.operatorType.trim() == ''
      ) {
        return
      }

      let operatorType: any = variables.dictListByTypeOptions.find(
        (item) => item.value == variables.operatorType
      )
      if (operatorType == null) {
        await addOperatorType(variables.operatorType)
        await getDictListByType('operator_type').then((res: any) => {
          variables.dictListByTypeOptions = res
          operatorType = res.find(
            (item: any) => item.label == variables.operatorType
          )
        })
      }

      const parameterFittingResultJson = JSON.stringify({
        topicData: props.variables.topicData,
        topicDataTable: props.variables.topicDataTable,
        topicDataCol: props.variables.topicDataCol,
        paramCol: variables.paramColumn,
        targetCol: variables.targetColumn,
        operatorId: variables.fittedModel.id,
        params: variables.paramsConfigList,
        header: variables.parameterFittingData.header,
        content: variables.parameterFittingData.content,
        fitType: 2
      })

      saveParameterFittingResult(
        route.query.manageId as string,
        parameterFittingResultJson,
        variables.fittedModel.id,
        variables.operatorName,
        operatorType.value,
        JSON.stringify(variables.evaluationEngineeringIds),
        JSON.stringify(
          variables.parameterFittingData.content[
            variables.parameterFittingData.header[3].paramName
          ]
        )
      ).then(() => {
        window.$message.success('保存成功')
      })

      handleSaveClose()
    }

    const handleSaveClose = () => {
      variables.saveModelShow = false
    }

    const refreshChart = () => {
      variables.showParameterFitting = false
      nextTick(() => {
        variables.showParameterFitting = true
      })
    }

    const handleFittedModelChange = (
      value: string,
      option: SelectBaseOption
    ) => {
      variables.fittedModel = option
      variables.paramsConfigList = {}
    }

    const initFittedModel = () => {
      if (
        variables.fittedModelList.length > 0 &&
        props.variables.operatorId != undefined
      ) {
        variables.fittedModel =
          variables.fittedModelList.find(
            (item) => item.id == props.variables.operatorId
          ) || {}
      }
    }

    onMounted(async () => {
      getAnalyticalMethodsList('8').then((res: any) => {
        variables.fittedModelList = res
        initFittedModel()
      })

      getEvaluationEngineering().then(
        (res: any) => (variables.evaluationEngineeringOptions = res.totalList)
      )

      getDictListByType('operator_type').then(
        (res: any) => (variables.dictListByTypeOptions = res)
      )
    })

    watch(
      () => props.variables,
      () => {
        variables.paramColumn = props.variables.paramColumn
        variables.targetColumn = props.variables.targetColumn
        variables.evaluationEngineeringIds =
          props.variables.evaluationEngineeringIds
        variables.operatorType = props.variables.operatorType
        variables.operatorName = props.variables.operatorName
        variables.paramsConfigList = props.variables.params

        initFittedModel()
      }
    )

    watch(
      () => props.variables.topicDataColSelected,
      (topicDataColSelected: any) => {
        variables.columnList = topicDataColSelected
      }
    )

    return {
      t,
      ...toRefs(variables),
      ...toRefs(variables),
      handleFittedModelChange,
      analysis,
      save,
      handleSave,
      handleSaveClose,
      validateFormParam
    }
  },
  render() {
    return (
      <>
        <NSpace justify='space-between'>
          <NForm inline labelWidth='auto' labelPlacement='left' key='2'>
            <NFormItem label='参数列'>
              <NSelect
                v-model={[this.paramColumn, 'value']}
                options={this.columnList}
                placeholder={'参数列'}
                multiple
                style={{ width: '200px' }}
                size='small'
              />
            </NFormItem>
            <NFormItem label='目标列'>
              <NSelect
                v-model={[this.targetColumn, 'value']}
                options={this.columnList}
                placeholder={'目标列'}
                style={{ width: '200px' }}
                size='small'
              />
            </NFormItem>
            <NFormItem label='拟合模型'>
              <NSelect
                value={this.fittedModel.id}
                options={this.fittedModelList}
                labelField='operatorName'
                valueField='id'
                placeholder={'拟合模型'}
                style={{ width: '200px' }}
                size='small'
                onUpdateValue={this.handleFittedModelChange}
              />
            </NFormItem>
            {this.fittedModel?.paramsConfigList?.map((config: any) => (
              <NFormItem
                label={config.paramDes}
                rule={{
                  message: '请输入合法参数',
                  trigger: ['input', 'blur'],
                  validator: () =>
                    this.validateFormParam(
                      this.paramsConfigList[config.paramName]
                    )
                }}
              >
                <NInput
                  v-model={[this.paramsConfigList[config.paramName], 'value']}
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
          align='center'
          itemStyle={{ flex: '1' }}
          style={{ margin: '30px 0' }}
        >
          <div>
            {this.showParameterFitting && <LineChart {...this.chartConfig} />}
          </div>
          <div>
            {/* <p style={{ textAlign: 'center' }}>{this.modelTableConfig.title}</p>
            <NDataTable
              columns={this.modelTableConfig.columns}
              data={this.modelTableConfig.data}
              row-class-name='items'
            /> */}
            {this.modelDisplayData.map((item) => (
              <div style={{ 'margin-top': '10px' }}>
                {item.type === 'str' ? (
                  <span>
                    {item.columns}: {item.data}
                  </span>
                ) : (
                  <NDataTable
                    columns={item.columns}
                    data={item.data}
                    // scrollX={this.tableWidth}
                    row-class-name='items'
                  />
                )}
              </div>
            ))}
          </div>
        </NSpace>
        <NModal
          v-model={[this.saveModelShow, 'show']}
          onPositiveClick={this.handleSave}
          onNegativeClick={this.handleSaveClose}
          maskClosable={false}
          style={{ width: '500px' }}
        >
          <NCard closable onClose={this.handleSaveClose}>
            {{
              default: () => (
                <NForm labelAlign='left'>
                  <NFormItem label='评估工程'>
                    <NSelect
                      placeholder='请选择评估工程'
                      options={this.evaluationEngineeringOptions}
                      v-model={[this.evaluationEngineeringIds, 'value']}
                      multiple
                      labelField='evaluationEngineeringName'
                      valueField='id'
                    />
                  </NFormItem>
                  <NFormItem label='算子类别'>
                    <NSelect
                      placeholder='请选择算子类别'
                      options={this.dictListByTypeOptions}
                      v-model={[this.operatorType, 'value']}
                      tag
                      filterable
                    />
                  </NFormItem>
                  <NFormItem label='算子名称'>
                    <NInput
                      placeholder='请输入算子名称'
                      v-model={[this.operatorName, 'value']}
                    />
                  </NFormItem>
                </NForm>
              ),
              footer: () => (
                <NSpace justify='end'>
                  <NButton
                    type='primary'
                    size='small'
                    onClick={this.handleSaveClose}
                  >
                    取消
                  </NButton>
                  <NButton
                    type='primary'
                    size='small'
                    onClick={this.handleSave}
                  >
                    确认
                  </NButton>
                </NSpace>
              )
            }}
          </NCard>
        </NModal>
      </>
    )
  }
})

export default list
