import { ArrowLeftOutlined, SearchOutlined } from '@vicons/antd'
import {
  NButton,
  NDataTable,
  NIcon,
  NInput,
  NSelect,
  NPagination,
  NSpace,
  NTabs,
  NTable,
  NTabPane,
  NLayout,
  NLayoutSider,
  NLayoutContent,
  NModal,
  NCard,
  NInputNumber,
  NFormItem,
  useMessage,
  NForm,
  NPageHeader,
  NGrid,
  NGridItem,
  NRow,
  NCol,
  NGi
} from 'naive-ui'
import {
  defineComponent,
  getCurrentInstance,
  onMounted,
  ref,
  toRefs,
  watch
} from 'vue'
import { useI18n } from 'vue-i18n'
import { useTable } from '../components/ExpertJudgment/use-table'
import Card from '@/components/card'
import LineChart from '../components/expert-charts'
import { useRoute, useRouter } from 'vue-router'
import { getProficiencySelectOptions } from '@/service/modules/worker-groups'
import {
  getCostExpertMaintenanceList,
  updateCostExpertMaintenance,
  getCostExpertAnalysis,
  saveCostExpertAnalysis,
  getCostExpertAnalysisResult,
  createExpertJudgment,
  getExpertJudgmentDetails,
  updateExpertJudgment,
  addOperatorType,
  getEvaluationEngineering
} from '@/views/EvaluationModel/api'
import { getDictListByType } from '@/service/modules/custom-operator'
const list = defineComponent({
  name: 'ExpertJudgment',
  setup() {
    const { t } = useI18n()
    const enterVariables = ref({
      enterShowModalRef: false,
      enterStatusRef: '',
      round: 1,
      enterInfoList: ref([]) as any,
      modelTitle: '新增录入'
    })
    const rowClickCb = () => {
      enterVariables.value.enterShowModalRef = true
    }

    const { variables, getTableData, createColumns } = useTable({
      rowClickCb
    })
    const route = useRoute()
    const router = useRouter()
    const modelId = ref(route.query.manageId as string)
    const message = useMessage()

    const handleBack = () => {
      router.back()
    }
    const requestData = () => {
      getTableData({
        pageSize: variables.pageSize,
        pageNo: variables.page,
        modelId: modelId.value
      })
    }
    const roundSleectOptions = ref(
      new Array(10).fill(10).map((item: any, index: number) => {
        return {
          label: index + 1,
          value: index + 1
        }
      })
    )

    const modelSummaryHeader = ref<Record<string, any>[]>([])
    const modelSummaryData = ref<any[]>([])

    const familiarizeList = ref()

    const expertVariables = ref({
      expertShowModalRef: false,
      expertStatusRef: 0,
      expertNum: 0,
      expertInfoList: ref<any>([]),

      saveModelShow: false,
      evaluationEngineeringOptions: ref<any[]>([]),
      dictListByTypeOptions: ref<any[]>([]),
      evaluationEngineeringIds: ref<any[]>([]),
      operatorType: ref<string>(),
      operatorName: ref('')
    })
    const enterShowModalClear = () => {
      // variables.row = {}
    }

    const expertSubmit = async () => {
      if (
        !expertVariables.value.expertInfoList.every(
          (item: any) => item.expertName && item.expertFamiliarity
        )
      ) {
        message.error('请完成表单再提交')
        return
      }
      await updateCostExpertMaintenance(
        expertVariables.value.expertInfoList.map((item: any) => {
          return {
            modelId: modelId.value,
            ...item
          }
        })
      )
      expertVariables.value.expertShowModalRef = false
      message.success('保存成功')
    }

    const expertClear = () => {
      expertVariables.value.expertShowModalRef = false
    }

    const enterClear = () => {
      enterVariables.value.enterShowModalRef = false
    }

    const enterSubmit = async () => {
      if (enterVariables.value.enterStatusRef) {
        await updateExpertJudgment(enterVariables.value.enterInfoList)
        message.success('编辑成功')
      } else {
        await createExpertJudgment(
          enterVariables.value.enterInfoList.map((item: any) => {
            return {
              modelId: modelId.value,
              round: enterVariables.value.round,
              ...item
            }
          })
        )
        message.success('录入成功')
      }

      enterVariables.value.enterShowModalRef = false
      requestData()
    }

    const handleExpertModalChange = () => {
      expertVariables.value.expertShowModalRef = true
      expertVariables.value.expertStatusRef = 0
    }

    const handleEnterModalChange = () => {
      enterVariables.value.enterShowModalRef = true
      enterVariables.value.enterStatusRef = 0
      enterVariables.value.modelTitle = '新增录入'
      enterVariables.value.round = 1
      enterVariables.value.enterInfoList =
        expertVariables.value.expertInfoList.map((item: any) => {
          return {
            expertId: item.id,
            expertName: item.expertName,
            expertFamiliarity: item.expertFamiliarity,
            mediumValuation: 0,
            lowValuation: 0,
            strongValuation: 0,
            valuationBasis: ''
          }
        })
    }

    const handleModalChange = () => {
      if (expertVariables.value.expertNum === 0) {
        message.error('请先设置专家')
        return
      }

      variables.showModalRef = true
      variables.statusRef = 0
    }

    const handleModalAnalysis = async () => {
      const res = await getCostExpertAnalysis(modelId.value as string)
      message.success('分析成功')

      const map = ['低1/4分位数', '估值', '高1/4分位数', '轮次']
      modelSummaryHeader.value = res.header
        .slice(0, 3)
        .map((item: any, idx: number) => {
          return {
            // title: item.paramDes,
            title: map[idx],
            key: item.paramName
          }
        })
      modelSummaryHeader.value.unshift({
        title: map[3],
        key: res.header[3].paramName
      })

      modelSummaryData.value = res.content
    }

    const handleSaveCostExpertAnalysis = async () => {
      expertVariables.value.saveModelShow = true
      // await saveCostExpertAnalysis({
      //   modelId: modelId.value,
      //   estimationResult: JSON.stringify({
      //     header: modelSummaryHeader.value.map((item: any) => {
      //       return {
      //         paramName: item.key,
      //         paramDes: item.title
      //       }
      //     }),
      //     content: modelSummaryData.value
      //   })
      // })
      // message.success('保存成功')
    }

    const handleGetExpertAnalysisResult = async () => {
      const res = await getCostExpertAnalysisResult(modelId.value)

      if (!res) {
        return
      }

      // 右下角表格 动态表头
      modelSummaryHeader.value = res.estimationResult.header.map((item: any) => {
        return {
          title: item.paramDes,
          key: item.paramName
        }
      })
      modelSummaryData.value = res.estimationResult.content

      // 算子
      expertVariables.value.evaluationEngineeringIds = JSON.parse(
        res.evaluationEngineeringId || '[]'
      )
      expertVariables.value.operatorType = res.operatorType
      expertVariables.value.operatorName = res.operatorName
    }

    const handleSearch = () => {
      variables.page = 1
      requestData()
    }

    const onClearSearch = () => {
      variables.page = 1
      getTableData({
        pageSize: variables.pageSize,
        pageNo: variables.page,
        modelId: modelId.value
      })
    }

    const onCancelModal = () => {
      variables.showModalRef = false
    }

    const onConfirmModal = () => {
      variables.showModalRef = false
      requestData()
    }

    const handleChangePageSize = () => {
      variables.page = 1
      requestData()
    }

    const getExpertList = async () => {
      const res = await getCostExpertMaintenanceList(modelId.value)

      expertVariables.value.expertInfoList = res
      expertVariables.value.expertNum = res.length
    }

    const getModelResult = () => {
      let round = modelSummaryData.value[0].round
      let res = modelSummaryData.value[0].midEstimate

      modelSummaryData.value.forEach((item) => {
        if (item.round > round) {
          res = item.midEstimate
        }
      })

      return res
    }

    const handleSave = async () => {
      if (
        expertVariables.value.operatorType == undefined ||
        expertVariables.value.operatorType.trim() == ''
      ) {
        return
      }

      let operatorType: any = expertVariables.value.dictListByTypeOptions.find(
        (item) => item.value == expertVariables.value.operatorType
      )
      if (operatorType == null) {
        await addOperatorType(expertVariables.value.operatorType)
        await getDictListByType('operator_type').then((res: any) => {
          expertVariables.value.dictListByTypeOptions = res
          operatorType = res.find(
            (item: any) => item.label == expertVariables.value.operatorType
          )
        })
      }

      const estimationResult = JSON.stringify({
        header: modelSummaryHeader.value.map((item: any) => {
          return {
            paramName: item.key,
            paramDes: item.title
          }
        }),
        content: modelSummaryData.value
      })

      console.log(modelSummaryData.value)

      saveCostExpertAnalysis({
        modelId: modelId.value,
        estimationResult,
        operatorName: expertVariables.value.operatorName,
        operatorType: expertVariables.value.operatorType,
        evaluationEngineeringId: JSON.stringify(
          expertVariables.value.evaluationEngineeringIds
        ),
        modelResult: getModelResult()
      }).then(() => {
        window.$message.success('保存成功')
      })

      handleSaveClose()
    }

    const handleSaveClose = () => {
      expertVariables.value.saveModelShow = false
    }

    const trim = getCurrentInstance()?.appContext.config.globalProperties.trim

    // const handleEnterInfo = () => {
    //   if () {

    //   }

    // }
    watch(
      () => expertVariables.value.expertNum,
      (newVal, oldVal) => {
        console.log(newVal, oldVal)
        console.log(expertVariables.value.expertInfoList)
        if (expertVariables.value.expertInfoList.length !== newVal) {
          if (newVal > oldVal) {
            for (let i = 0; i < newVal - oldVal; i++) {
              expertVariables.value.expertInfoList.push({
                expertName: '',
                expertFamiliarity: ref('')
              })
            }
          } else {
            for (let i = 0; i < oldVal - newVal; i++) {
              expertVariables.value.expertInfoList.pop()
            }
          }
        }
        // handleEnterInfo()
      }
    )

    watch(
      () => expertVariables.value.expertShowModalRef,
      () => {
        if (!expertVariables.value.expertShowModalRef) {
          getExpertList()
        }
      }
    )
    watch(
      () => variables.row,
      () => {
        enterVariables.value.enterStatusRef = 1
        // 不知道啥时候触发
        // variables.model.evaluationEngineeringName =
        //   props.row.evaluationEngineeringName
        // variables.model.evaluationEngineeringDesc =
        //   props.row.evaluationEngineeringDesc
      }
    )

    watch(
      () => variables.row,
      () => {
        enterVariables.value.modelTitle = '编辑录入'
        getExpertJudgmentDetails({
          modelId: modelId.value,
          round: variables.row.round
        }).then((res: any) => {
          ;(enterVariables.value.round = variables.row.round),
            (enterVariables.value.enterInfoList = res.map((item: any) => {
              return item
            }))
        })
      },
      {
        deep: true
      }
    )

    onMounted(async () => {
      createColumns(variables)
      requestData()
      const proficiencyRes = await getProficiencySelectOptions()
      familiarizeList.value = proficiencyRes

      // 获取专家数量
      await getExpertList()
      // 获取专家估值结果
      await handleGetExpertAnalysisResult()

      getEvaluationEngineering().then(
        (res: any) =>
          (expertVariables.value.evaluationEngineeringOptions = res.totalList)
      )

      getDictListByType('operator_type').then(
        (res: any) => (expertVariables.value.dictListByTypeOptions = res)
      )
    })

    return {
      t,
      ...toRefs(variables),
      requestData,
      handleModalChange,
      handleSearch,
      onCancelModal,
      onConfirmModal,
      onClearSearch,
      handleChangePageSize,

      roundSleectOptions,
      // 专家维护
      expertVariables,
      expertSubmit,
      expertClear,
      handleExpertModalChange,

      // 新增录入
      enterVariables,
      enterSubmit,
      enterClear,
      handleEnterModalChange,

      // 分析
      handleModalAnalysis,
      // 分析结果保存
      handleSaveCostExpertAnalysis,

      familiarizeList,

      modelSummaryHeader,
      modelSummaryData,
      trim,
      handleBack,
      enterShowModalClear,
      handleSave,
      handleSaveClose
    }
  },
  render() {
    const { loadingRef } = this
    return (
      <NSpace vertical>
        <NGrid class='current-page-header' cols={1}>
          <NGridItem class='n-grid-item'>
            <div class='title'>
              <NButton onClick={this.handleBack} class='btn-back'>
                <NIcon size='20' component={ArrowLeftOutlined}></NIcon>
              </NButton>
              {this.$route.query.modelName}
            </div>
            {/* <div class='desc'>{this.$route.query.manageName}</div> */}
          </NGridItem>
        </NGrid>
        <Card>
          <NSpace vertical>
            <NSpace justify='space-between'>
              <NSpace>
                <NButton
                  size='small'
                  onClick={this.handleExpertModalChange}
                  type='primary'
                  class='btn-create-project'
                >
                  专家维护
                </NButton>
                <NButton
                  size='small'
                  onClick={this.handleEnterModalChange}
                  type='primary'
                  class='btn-create-project'
                >
                  新增录入
                </NButton>
                {/* <NButton
                    size='small'
                    onClick={this.handleModalChange}
                    type='primary'
                    class='btn-create-project'
                  >
                    导入
                  </NButton> */}
                </NSpace>
              </NSpace>
              <NSpace vertical>
                <NDataTable
                  loading={loadingRef}
                  columns={this.columns}
                  data={this.tableData}
                  scrollX={this.tableWidth}
                  row-class-name='items'
                  // row-key={this.rowKey}
                  onUpdateCheckedRowKeys={this.handleCheck}
                />
                <NSpace justify='center'>
                  <NPagination
                    v-model:page={this.page}
                    v-model:page-size={this.pageSize}
                    page-count={this.totalPage}
                    show-size-picker
                    page-sizes={[10, 30, 50]}
                    show-quick-jumper
                    onUpdatePage={this.requestData}
                    onUpdatePageSize={this.handleChangePageSize}
                  />
                </NSpace>
              </NSpace>
            </NSpace>
          </Card>
          <Card>
            <NSpace vertical>
              <NSpace justify='space-between'>
                <NSpace>
                  <NButton
                    size='small'
                    onClick={this.handleModalAnalysis}
                    type='primary'
                    class='btn-create-project'
                  >
                    分析
                  </NButton>
                  <NButton
                    size='small'
                    onClick={this.handleSaveCostExpertAnalysis}
                    type='primary'
                    class='btn-create-project'
                  >
                    保存
                  </NButton>
                </NSpace>
              </NSpace>
              <NLayout has-sider>
                <NLayoutSider content-style={'padding: 24px;'} width={500}>
                  <LineChart
                    key={ref(this.modelSummaryHeader).value}
                    indexList={ref(this.modelSummaryHeader).value}
                    weight={ref(this.modelSummaryData).value}
                  />
                </NLayoutSider>
                <NLayout>
                  <NLayoutContent>
                    <Card title={'专家估算结果统计'} style={{ flex: 1 }}>
                      <NDataTable
                        columns={this.modelSummaryHeader}
                        data={this.modelSummaryData}
                        pagination={{
                          pageSize: 15
                        }}
                        max-height={250}
                      />
                    </Card>
                  </NLayoutContent>
                </NLayout>
              </NLayout>
              <NSpace>
                <NSpace></NSpace>
              </NSpace>
            </NSpace>
          </Card>

        {/* 专家维护弹窗 */}
        <NModal
          v-model={[this.expertVariables.expertShowModalRef, 'show']}
          mask-closable={false}
          close-on-esc={false}
        >
          <NCard
            style={{ width: '600px' }}
            title={'专家维护'}
            bordered={false}
            size={'huge'}
            role={'dialog'}
            aria-modal={true}
          >
            <NFormItem label='专家数量'>
              <NInputNumber
                v-model={[this.expertVariables.expertNum, 'value']}
                min={1}
                show-require-mark={true}
                require-mark-placement={'lefshi t'}
              />
            </NFormItem>
            <NGrid cols={2} xGap={12}>
              {this.expertVariables.expertInfoList.map((item: any) => {
                return (
                  <>
                    <NGridItem>
                      <NFormItem
                        validation-status={
                          item.expertName === '' ? 'error' : ''
                        }
                        feedback={
                          item.expertName === '' ? '请输入专家姓名' : undefined
                        }
                      >
                        <NInput
                          v-model:value={item.expertName}
                          type={'text'}
                          placeholder={'专家姓名'}
                        />
                      </NFormItem>
                    </NGridItem>
                    <NGridItem>
                      <NFormItem
                        validation-status={
                          item.expertFamiliarity === '' ? 'error' : ''
                        }
                        feedback={
                          item.expertFamiliarity === ''
                            ? '请选择专家熟练度'
                            : undefined
                        }
                      >
                        <NSelect
                          v-model:value={item.expertFamiliarity}
                          options={this.familiarizeList}
                          placeholder={'请选择熟悉程度'}
                          style={
                            {
                              // width: 'px'
                            }
                          }
                        />
                      </NFormItem>
                    </NGridItem>
                  </>
                )
              })}
            </NGrid>
            <NSpace
              justify={'end'}
              style={{
                marginTop: '12px'
              }}
            >
              <NButton onClick={this.expertClear}>取消</NButton>
              <NButton type='info' onClick={this.expertSubmit}>
                保存
              </NButton>
            </NSpace>
          </NCard>
        </NModal>
        {/* 新增录入弹窗 */}
        <NModal
          v-model={[this.enterVariables.enterShowModalRef, 'show']}
          mask-closable={false}
          close-on-esc={false}
          on-after-leave={this.enterShowModalClear}
        >
          <NCard
            style={{ width: '600px' }}
            title={this.enterVariables.modelTitle}
            bordered={false}
            size={'huge'}
            role={'dialog'}
            aria-modal={true}
          >
            <NForm
              ref='formRef'
              rules={this.rules}
              show-require-mark={true}
              label-placement={'left'}
              label-align={'left'}
            >
              <NFormItem
                label={'轮次'}
                path='modelName'
                // validation-status={this.enterVariables.round 》 ? 'error' : ''}
                // feedback={this.enterVariables.round === '' ? '请输入专家姓名' : undefined}
              >
                <NInputNumber
                  v-model={[this.enterVariables.round, 'value']}
                  min={1}
                  disabled={!!this.enterVariables.enterStatusRef}
                  placeholder={'请选择轮次'}
                  show-require-mark={true}
                  require-mark-placement={'left'}
                />
              </NFormItem>
              {this.enterVariables.enterInfoList.map((item: any) => {
                return (
                  <NCard style={{ marginBottom: '12px' }}>
                    <NFormItem label={'专家姓名'} path='equipName'>
                      <NInput
                        allowInput={this.trim}
                        disabled
                        v-model={[item.expertName, 'value']}
                        placeholder={'请输入专家姓名'}
                      />
                    </NFormItem>
                    <NFormItem label={'专家熟练度'} path='equipType'>
                      <NSelect
                        v-model={[item.expertFamiliarity, 'value']}
                        disabled
                        options={this.familiarizeList}
                        placeholder={'请选择专家熟练度'}
                        size='small'
                      />
                    </NFormItem>

                    <NFormItem label={'中估值'}>
                      <NInputNumber
                        v-model={[item.mediumValuation, 'value']}
                        min={0}
                        show-require-mark={true}
                        require-mark-placement={'left'}
                      />
                    </NFormItem>
                    <NFormItem label={'低估值'}>
                      <NInputNumber
                        v-model={[item.lowValuation, 'value']}
                        min={0}
                        show-require-mark={true}
                        require-mark-placement={'left'}
                      />
                    </NFormItem>
                    <NFormItem label={'高估值'}>
                      <NInputNumber
                        v-model={[item.strongValuation, 'value']}
                        min={0}
                        show-require-mark={true}
                        require-mark-placement={'left'}
                      />
                    </NFormItem>
                    <NFormItem label={'估值依据'} show-require-mark={false}>
                      <NInput
                        allowInput={this.trim}
                        v-model={[item.valuationBasis, 'value']}
                        placeholder={'请输入估值依据'}
                      />
                    </NFormItem>
                  </NCard>
                )
              })}
            </NForm>
            <NSpace justify={'end'}>
              <NButton onClick={this.enterClear}>取消</NButton>
              <NButton type='info' onClick={this.enterSubmit}>
                保存
              </NButton>
            </NSpace>
          </NCard>
        </NModal>
          <NModal
            v-model={[this.expertVariables.saveModelShow, 'show']}
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
                        options={
                          this.expertVariables.evaluationEngineeringOptions
                        }
                        v-model={[
                          this.expertVariables.evaluationEngineeringIds,
                          'value'
                        ]}
                        multiple
                        labelField='evaluationEngineeringName'
                        valueField='id'
                      />
                    </NFormItem>
                    <NFormItem label='算子类别'>
                      <NSelect
                        placeholder='请选择算子类别'
                        options={this.expertVariables.dictListByTypeOptions}
                        v-model={[this.expertVariables.operatorType, 'value']}
                        tag
                        filterable
                      />
                    </NFormItem>
                    <NFormItem label='算子名称'>
                      <NInput
                        placeholder='请输入算子名称'
                        v-model={[this.expertVariables.operatorName, 'value']}
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
        </NSpace>
   
    )
  }
})

export default list
