import {
  defineComponent,
  reactive,
  ref,
  watch,
  computed,
  inject,
  onMounted,
  Ref,
  defineEmits
} from 'vue'
import { useI18n } from 'vue-i18n'

import {
  NRadio,
  NRadioGroup,
  NSpace,
  NForm,
  NFormItem,
  NInputNumber,
  NSelect,
  NCard,
  NButton,
  useMessage,
  NLayout,
  NLayoutSider,
  NLayoutContent,
  NTree,
  NTable
} from 'naive-ui'
import { useThemeStore } from '@/store/theme/theme'

import {
  getIndexSelectOptions,
  getProficiencySelectOptions,
  getMatrixResult,
  getWeightResult,
  saveWeight
} from '@/service/modules/worker-groups'
import initChart from '@/components/chart'
import DagWeightChart from './dag-weight-charts'
import styles from './right.module.scss'
import * as echarts from 'echarts'
import { useRoute } from 'vue-router'
import log from '@/utils/log'

const props = {
  indexList: {
    type: Object,
    default: () => []
  },
  weightDetail: {
    type: Object,
    default: () => ({})
  }
}

export default defineComponent({
  name: 'dag-weight-ahp',
  props,
  emits: ['drop', 'stepOver'],
  setup(props, context) {
    type expertFamiliarizeType = Array<{ familiarity: number | null }>
    const message = useMessage()
    const step = ref(0)
    const route = useRoute()
    const themeStore = useThemeStore()

    // 当前节点
    const labelObj = inject<any>('labelObj')
    const processDefinition = inject('processDefinition')
    const graphChartRef: Ref<HTMLDivElement | null> = ref(null)
    const indexList = ref(props.indexList.value.map((item: any) => item))
    const weight = ref([])
    const treeData = ref([
      {
        name: labelObj.value.name,
        code: labelObj.value.code,
        child: props.indexList.value.map((item) => {
          return {
            name: item.name,
            code: item.indicatorId
          }
        })
      }
    ])

    const defaultExpandedKeys = ref([labelObj.value.code])
    const expertFamiliarize = ref<expertFamiliarizeType>([])

    const formModelValue = ref({
      radio: '1',
      expertNum: -1,
      expertFamiliarize
    })

    // 专家熟练度
    const familiarizeList = ref()
    // 指标熟练度
    const indexSelectList = ref()

    const handleNext = async () => {
      console.log(indexList);
      
      // console.log(props.treeData)
      if (step.value === 0) {
        if (selectFeedback.value.every((item) => item.type === undefined)) {
          console.log('第一步通过')
          step.value++
        } else {
          message.error('请完成表单再提交')
        }
      } else if (step.value === 1) {
        console.log('第二步')

        if (
          selectTableFeedback.value.every((row) =>
            row.every((item) => item.type === undefined)
          )
        ) {
          console.log('第2步通过')
          console.log(handleTableData)
          const weightResultParams = {
            [formModelValue.value.radio === '1' ? 'data' : 'inputMatrix']:
              expertFamiliarize.value.map((item: any, index: number) => {
                return handleTableData.value.tableBodyData.map(
                  (rowItem: any, rowIndex: number) => {
                    if (formModelValue.value.radio === '1') {
                      return rowItem.indexList
                        .map((node: any) => {
                          return node.indicatorId
                        })
                        .concat([rowItem.expertBodyCol[rowIndex][index].value])
                    } else {
                      return rowItem.expertBodyCol[rowIndex][index].value
                    }
                  }
                )
              }),
            indexList: indexList.value.map((item: any) => item.indicatorId),
            expertFamiliarity: expertFamiliarize.value.map((item: any) => {
              return item.familiarity
            })
          }

          if (formModelValue.value.radio === '1') {
            await getMatrixResult(
              {
                ...weightResultParams
              },
              formModelValue.value.radio
            )
          }
          weight.value = await getWeightResult(
            {
              ...weightResultParams
            },
            formModelValue.value.radio
          )
          step.value++
        } else {
          message.error('请完成表单再提交')
        }
      } else {
        const res = await saveWeight({
          evaluationPlanId: route.params.id,
          taskDefinitionCode: defaultExpandedKeys.value[0],
          weightType: 1,
          ahpType: formModelValue.value.radio,
          specialistNum: formModelValue.value.expertNum,
          // '[{"familiarity":4},{"familiarity":3}]',
          specialistFamiliarity: JSON.stringify(
            expertFamiliarize.value.map((item) => {
              return {
                familiarity: item.familiarity
              }
            })
          ),
          specialistScore: JSON.stringify(
            handleTableData.value.tableBodyData.map(
              (item: any, index: number) => {
                return {
                  indicator:
                    formModelValue.value.radio === '1'
                      ? item.indexList.map((nodeItem: any) => {
                          return {
                            indicatorId: nodeItem.indicatorId,
                            indicatorName: nodeItem.indicatorName
                          }
                        })
                      : {
                          indicatorId: item.indexList.indicatorId,
                          indicatorName: item.indexList.indicatorName
                        },
                  expertBodyCol: item.expertBodyCol[index].map(
                    (rowVal: any) => {
                      return rowVal.value
                    }
                  )
                }
              }
            )
          ),
          weight: JSON.stringify(
            indexList.value.map((nodeItem: any) => {
              return {
                indicatorId: nodeItem.indicatorId,
                name: nodeItem.name,
                value: weight.value[nodeItem.indicatorId]
              }
            })
          )
        })
        message.success('权重保存成功')
        console.log('第三步， 提交')
        step.value = 0
        context.emit('stepOver')
      }
      // console.log(formModelValue)
    }

    const handleBack = () => {
      step.value--
    }

    function createFeedback(value: expertFamiliarizeType) {
      return value.map((item) => {
        if (!item.familiarity) {
          return {
            label: '请选择专家熟悉度',
            type: 'error'
          }
        } else {
          return {
            label: '',
            type: undefined
          }
        }
      })
    }

    function createTableFeedback(bodyData: any) {
      return bodyData.map((row: any, rowIndex: number) => {
        return row.expertBodyCol[rowIndex].map((cell: any) => {
          if (!cell.value) {
            return {
              label: '请选择专家熟悉度',
              type: 'error'
            }
          } else {
            return {
              label: '',
              type: undefined
            }
          }
        })
      })
    }

    const selectFeedback = computed(() => {
      return createFeedback(expertFamiliarize.value)
    })

    const selectTableFeedback = computed(() => {
      return createTableFeedback(handleTableData.value.tableBodyData)
    })

    const handleTableData = computed(() => {
      const expertHeaderList = ref<string[]>([])
      const expertBodyCol: Ref<string>[][] = []
      // const indexHeaderList = ref(
      //   props.indexList.value.map((item, index) => `指标${index + 1}`)
      // )
      for (let i = 0; i < formModelValue.value.expertNum; i++) {
        expertHeaderList.value.push(`专家${i + 1}`)
      }

      indexList.value.forEach((item:any) => {
        // item.indicatorId = item.indicatorId || item.code
        item.indicatorName = item.indicatorName || item.name
      })

      if (formModelValue.value.radio === '1') {
        // 两两对比
        // const contrast: string[][] = []
        // for (let i = 0; i < indexList.value.length; i++) {
        //   for (let j = i + 1; j < indexList.value.length; j++) {
        //     contrast.push([indexList.value[i], indexList.value[j]])
        //   }

        //   const rowSelect = reactive<Ref<string>[]>([])
        //   for (let k = 0; k < formModelValue.value.expertNum; k++) {
        //     if (
        //       !props.weightDetail.specialistScoreList ||
        //       props.weightDetail.specialistScoreList.length <= 0
        //     ) {
        //       rowSelect.push(ref(''))
        //     } else {
        //       rowSelect.push(
        //         ref(props.weightDetail.specialistScoreList[i].expertBodyCol[k])
        //       )
        //     }
        //   }
        //   expertBodyCol.push(rowSelect)
        // }

        let tableBodyData = []
        if (
          !props.weightDetail.specialistScoreList ||
          props.weightDetail.specialistScoreList.length <= 0
          || formModelValue.value.radio != props.weightDetail.ahpType
        ) {
          // 如果接口传参为空，自动生成
          for (let i = 0; i < indexList.value.length; i++) {
            for (let j = i + 1; j < indexList.value.length; j++) {
              const rowSelect = reactive<Ref<string>[]>([])
              for (let k = 0; k < formModelValue.value.expertNum; k++) {
                rowSelect.push(ref(''))
              }
              expertBodyCol.push(rowSelect)

              tableBodyData.push({
                indexList: [indexList.value[i], indexList.value[j]],
                expertBodyCol
              })
            }
          }
        } else {
          // 展示接口的值
          tableBodyData = props.weightDetail.specialistScoreList.map(
            (item: any) => {
              let arr = []
              for (let i = 0; i < formModelValue.value.expertNum; i++) {
                arr.push(ref(item.expertBodyCol[i] || ''))
              }
              expertBodyCol.push(arr)

              return {
                indexList: item.indicator,
                expertBodyCol
              }
            }
          )
        }

        return {
          tableHeaderData: ['指标1', '指标2'].concat(expertHeaderList.value),
          tableBodyData
        }
      } else {
        // const tableBodyData = []
        // for (let i = 0; i < indexList.value.length; i++) {
        //   const rowSelect = reactive<Ref<string>[]>([])
        //   for (let j = 0; j < formModelValue.value.expertNum; j++) {
        //     if (!props.weightDetail.specialistScoreList) {
        //       rowSelect.push(ref(''))
        //     } else {
        //       rowSelect.push(
        //         ref(props.weightDetail.specialistScoreList[i].expertBodyCol[j])
        //       )
        //     }
        //   }
        //   expertBodyCol.push(rowSelect)

        //   tableBodyData.push({
        //     indexList: indexList.value[i],
        //     expertBodyCol
        //   })
        // }

        let tableBodyData = []
        if (
          !props.weightDetail.specialistScoreList ||
          props.weightDetail.specialistScoreList.length <= 0
          || formModelValue.value.radio != props.weightDetail.ahpType
        ) {
          // 如果接口传参为空，自动生成
          for (let i = 0; i < indexList.value.length; i++) {
            const rowSelect = reactive<Ref<string>[]>([])
            for (let j = 0; j < formModelValue.value.expertNum; j++) {
              rowSelect.push(ref(''))
            }
            expertBodyCol.push(rowSelect)

            tableBodyData.push({
              indexList: indexList.value[i],
              expertBodyCol
            })
          }
        } else {
          // 展示接口的值
          tableBodyData = props.weightDetail.specialistScoreList.map(
            (item: any) => {
              let arr = []
              for (let i = 0; i < formModelValue.value.expertNum; i++) {
                arr.push(ref(item.expertBodyCol[i] || ''))
              }
              expertBodyCol.push(arr)

              return {
                indexList: item.indicator,
                expertBodyCol
              }
            }
          )
        }

        return {
          tableHeaderData: ['指标'].concat(expertHeaderList.value),
          tableBodyData
        }
      }
    })

    const getIndexSelect = async (id: string) => {
      const indexRes = await getIndexSelectOptions(id)
      indexSelectList.value = indexRes
    }

    watch(
      () => formModelValue.value.expertNum,
      (newVal, oldVal) => {
        if (oldVal == -1) {
          return
        }

        if (newVal > oldVal) {
          for (let i = 0; i < newVal - oldVal; i++) {
            expertFamiliarize.value.push({
              familiarity: null
            })
          }
        } else {
          for (let i = 0; i < oldVal - newVal; i++) {
            expertFamiliarize.value.pop()
          }
        }
      }
    )

    watch(
      () => formModelValue.value.radio,
      (newVal) => {
        getIndexSelect(
          newVal === '1'
            ? 'specialist_familiarity_type'
            : 'delphi_familiarity_type'
        )
      },
      {
        immediate: true
      }
    )

    watch(
      () => props.weightDetail,
      (weightDetail) => {
        formModelValue.value.radio = String(weightDetail.ahpType || 1)
        formModelValue.value.expertNum = weightDetail.specialistNum || 1
        expertFamiliarize.value = weightDetail.specialistFamiliarityList || [
          { familiarity: null }
        ]
      },
      { immediate: true }
    )

    onMounted(async () => {
      const proficiencyRes = await getProficiencySelectOptions()
      familiarizeList.value = proficiencyRes
    })

    return () => (
      <div>
        {step.value === 0 ? (
          <NForm ref='startFormRef' model={formModelValue}>
            <NFormItem label=''>
              <NRadioGroup v-model:value={formModelValue.value.radio}>
                <NSpace>
                  <NRadio value={'1'}>AHP对比打分法单机版</NRadio>
                  <NRadio value={'2'}>AHP直接打分法单机版</NRadio>
                </NSpace>
              </NRadioGroup>
            </NFormItem>
            <NFormItem label='专家数量'>
              <NInputNumber
                v-model:value={formModelValue.value.expertNum}
                min={1}
                show-require-mark={true}
                require-mark-placement={'left'}
              />
            </NFormItem>
            {expertFamiliarize.value.map((item: any, index: number) => {
              return (
                <NFormItem
                  label={`专家${index + 1}熟悉度`}
                  validation-status={selectFeedback.value[index].type}
                  feedback={selectFeedback.value[index].label}
                  show-require-mark={true}
                  require-mark-placement={'left'}
                >
                  <NSelect
                    v-model:value={item.familiarity}
                    options={familiarizeList.value}
                    placeholder={'请选择熟悉程度'}
                  />
                </NFormItem>
              )
            })}
            <NCard title='说明' embedded={true} bordered={false}>
              输入参数：指标体系；每位专家对每个指标的熟悉程度；打分分值。
              <br></br>
              输出参数：各个指标的权重。
              <br></br>
              2、AHP对比打分法：针对子指标间的重要程度比值打分。
              <br></br>
              3、AHP直接打分法：针对子指标重要程度打分。
            </NCard>
          </NForm>
        ) : (
          ''
        )}
        {step.value === 1 || step.value === 2 ? (
          <NLayout>
            <NLayout has-sider>
              <NLayoutSider content-style='padding: 24px;'>
                <NTree
                  block-line
                  data={treeData.value}
                  default-expanded-keys={defaultExpandedKeys.value}
                  key-field='code'
                  label-field='name'
                  children-field='child'
                  selectable
                />
              </NLayoutSider>
              <NLayoutContent content-style='padding: 24px;'>
                {step.value === 1 ? (
                  <NTable bordered={false} single-line={false}>
                    <thead>
                      <tr>
                        {handleTableData.value.tableHeaderData.map(
                          (item: any) => {
                            return <th>{item}</th>
                          }
                        )}
                      </tr>
                    </thead>
                    <tbody>
                      {formModelValue.value.radio === '2'
                        ? handleTableData.value.tableBodyData.map(
                            (rowItem: any, rowIndex: any) => {
                              return (
                                <tr>
                                  <td>{rowItem.indexList.indicatorName}</td>
                                  {rowItem.expertBodyCol[rowIndex].map(
                                    (cellItem: any, cellIndex: number) => {
                                      return (
                                        <td>
                                          <NFormItem
                                            validation-status={
                                              selectTableFeedback.value[
                                                rowIndex
                                              ][cellIndex].type
                                            }
                                            feedback={
                                              selectTableFeedback.value[
                                                rowIndex
                                              ][cellIndex].label
                                            }
                                            show-require-mark={true}
                                            require-mark-placement={'left'}
                                          >
                                            <NSelect
                                              v-model:value={cellItem.value}
                                              options={indexSelectList.value}
                                              placeholder={'请选择熟悉程度'}
                                            />
                                          </NFormItem>
                                          {/* <NSelect
                                              v-model:value={cellItem.value}
                                              options={familiarizeList}
                                              placeholder={'请选择熟悉程度'}
                                            /> */}
                                        </td>
                                      )
                                    }
                                  )}
                                </tr>
                              )
                            }
                          )
                        : handleTableData.value.tableBodyData.map(
                            (bodyItem: any, rowIndex: number) => {
                              return (
                                <tr>
                                  {bodyItem.indexList.map((cell: any) => {
                                    return <td>{cell.indicatorName}</td>
                                  })}

                                  {bodyItem.expertBodyCol[rowIndex].map(
                                    (cell: any, cellIndex: number) => {
                                      return (
                                        <td>
                                          <NFormItem
                                            validation-status={
                                              selectTableFeedback.value[
                                                rowIndex
                                              ][cellIndex].type
                                            }
                                            feedback={
                                              selectTableFeedback.value[
                                                rowIndex
                                              ][cellIndex].label
                                            }
                                            show-require-mark={true}
                                            require-mark-placement={'left'}
                                          >
                                            <NSelect
                                              v-model:value={cell.value}
                                              options={indexSelectList.value}
                                              placeholder={'请选择熟悉程度'}
                                            />
                                          </NFormItem>
                                          {/* <NSelect
                                              v-model:value={cell.value}
                                              options={familiarizeList}
                                              placeholder={'请选择熟悉程度'}
                                            /> */}
                                        </td>
                                      )
                                    }
                                  )}
                                </tr>
                              )
                            }
                          )}
                    </tbody>
                  </NTable>
                ) : (
                  ''
                )}
                {step.value === 2 ? (
                  <div>
                    <NTable bordered={false} single-line={false}>
                      <thead>
                        <tr>
                          <th></th>
                          {indexList.value.map((nodeItem: any) => {
                            return <th>{nodeItem.name}</th>
                          })}
                        </tr>
                      </thead>
                      <tbody>
                        <tr>
                          <td>权重系数</td>
                          {indexList.value.map((nodeItem: any) => {
                            return <td>{weight.value[nodeItem.indicatorId]}</td>
                          })}
                        </tr>
                      </tbody>
                    </NTable>
                    <DagWeightChart
                      indexList={indexList.value}
                      weight={weight.value}
                    />
                  </div>
                ) : (
                  ''
                )}
              </NLayoutContent>
            </NLayout>
          </NLayout>
        ) : (
          ''
        )}
        <div class={styles.dagWeightAhp}>
          <NSpace>
            <NButton onClick={() => context.emit('stepOver')}>取消</NButton>
            {step.value > 0 ? (
              <NButton type='info' onClick={handleBack}>
                上一步
              </NButton>
            ) : (
              ''
            )}
            <NButton type='info' onClick={handleNext}>
              {step.value > 1 ? '提交' : '下一步'}
            </NButton>
          </NSpace>
        </div>
      </div>
    )
  }
})
