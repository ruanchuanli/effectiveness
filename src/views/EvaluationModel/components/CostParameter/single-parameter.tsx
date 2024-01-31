import {
  NButton,
  NDataTable,
  NSelect,
  NSpace,
  NInput,
  NCheckbox,
  NForm,
  NFormItem,
  NDialog,
  useDialog,
  NModal,
  NCard,
  FormItemRule,
  FormInst
} from 'naive-ui'
import {
  PropType,
  defineComponent,
  nextTick,
  onMounted,
  reactive,
  ref,
  toRefs,
  watch,
  defineExpose
} from 'vue'
import { useI18n } from 'vue-i18n'
import {
  addOperatorType,
  getActiveColVal,
  getAnalyticalMethodsList,
  getDictListByType,
  getEnveloping,
  getEvaluationEngineering,
  getFittedModel,
  parameterFitting,
  saveParameterFittingResult
} from '../../api'
import { SelectBaseOption } from 'naive-ui/es/select/src/interface'
import LineChart from './single-parameter-charts'
import { useRoute } from 'vue-router'
import { TableColumns } from 'naive-ui/es/data-table/src/interface'
import { ModelDisplayData } from '../../api/type'

const props = {
  variables: {
    type: Object as PropType<any>,
    default: () => {}
  }
}

const list = defineComponent({
  name: 'SingleParameter',
  props,
  expose: ['analysis'],
  setup(props) {
    const { t } = useI18n()
    const route = useRoute()

    const variables = reactive({
      paramColumn: ref<string>(''),
      targetColumn: ref<string>(''),
      fittedModel: ref<Record<string, any>>({}),
      fittedModelList: ref<any[]>([]),
      columnList: ref<any[]>([]),
      paramsConfigList: ref<Record<string, string>>({}),

      chartConfig: {
        fitData: [],
        scatterData: [],
        envelopingData: {} as Record<string, any>,
        xName: '',
        yName: '',
        title: ''
      },
      parameterFittingData: ref<Record<string, any>>({}),
      showEnveloping: ref(false),
      showParameterFitting: ref(true),
      modelDisplayData: ref<ModelDisplayData[]>([]),

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
      if (
        !props.variables.topicDataTable ||
        !variables.paramColumn ||
        !variables.fittedModel.id ||
        !variables.targetColumn
      ) {
        return
      }

      await validateForm().catch((msg) => {
        window.$message.error(msg)
        return Promise.reject(msg)
      })

      const fitData = await parameterFitting(
        variables.fittedModel.id,
        props.variables.topicDataTable,
        variables.paramColumn,
        variables.targetColumn,
        variables.paramsConfigList
      )
      const scatterData = (
        await getActiveColVal({
          pageSize: 99999,
          pageNo: 1,
          dataSetId: props.variables.topicDataTable,
          dataSourceCols: [variables.paramColumn, variables.targetColumn]
        })
      ).totalList

      variables.parameterFittingData = fitData

      handleChartData(fitData, scatterData)
      handleTableData(fitData)

      getEnvelopingData()
    }

    const handleChartData = (fitData: any, scatterData: any) => {
      variables.chartConfig.fitData = fitData.content[
        fitData.header[0].paramName
      ].map((item: number, idx: number) => [
        item,
        fitData.content[fitData.header[1].paramName][idx]
      ])

      const paraDes = fitData.content[fitData.header[3].paramName].paraDes
      variables.chartConfig.xName = paraDes?.xlabel
      variables.chartConfig.yName = paraDes?.ylabel
      variables.chartConfig.title = paraDes?.title

      variables.chartConfig.scatterData = scatterData.map((item: any) => [
        item[variables.paramColumn],
        item[variables.targetColumn]
      ])
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

    // 包络图
    const getEnvelopingData = () => {
      variables.chartConfig.envelopingData = {}

      if (variables.showEnveloping && props.variables.topicDataTable) {
        getEnveloping(
          props.variables.topicDataTable,
          variables.paramColumn,
          variables.targetColumn
        )
          .then((res: any) => {
            res.header.forEach((item: any) => {
              if (item.paramName == 'Xindex') {
                return
              }

              variables.chartConfig.envelopingData[item.paramName] =
                res.content[item.paramName].map((k: number, idx: number) => [
                  res.content.Xindex[idx],
                  k
                ])
            })
          })
          .finally(() => {
            refreshChart()
          })
      } else {
        refreshChart()
      }
    }

    const save = async () => {
      await validateForm().catch((msg) => {
        window.$message.error(msg)
        return Promise.reject(msg)
      })

      if (Object.keys(variables.parameterFittingData).length == 0) {
        window.$message.error('请先分析')
        return
      }

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
        fitType: 1
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
      getAnalyticalMethodsList('1').then((res: any) => {
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
      () => variables.showEnveloping,
      () => {
        getEnvelopingData()
      }
    )

    watch(
      () => props.variables.topicDataColSelected,
      (topicDataColSelected) => {
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
          <NForm inline labelWidth='auto' labelPlacement='left' key='1'>
            <NFormItem label='参数列'>
              <NSelect
                v-model={[this.paramColumn, 'value']}
                options={this.columnList}
                placeholder={'参数列'}
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
          <div style={{ position: 'relative' }}>
            <div
              style={{
                position: 'absolute',
                left: '500px',
                zIndex: 1
              }}
            >
              <NCheckbox v-model:checked={this.showEnveloping}>
                包络显示
              </NCheckbox>
            </div>
            {this.showParameterFitting && <LineChart {...this.chartConfig} />}
          </div>
          <div>
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
