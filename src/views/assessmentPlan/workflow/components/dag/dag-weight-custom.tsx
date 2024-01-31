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
  getMatrixResult,
  getWeightResult,
  saveWeight
} from '@/service/modules/worker-groups'
import initChart from '@/components/chart'
import DagWeightChart from './dag-weight-charts'
import styles from './right.module.scss'
import * as echarts from 'echarts'
import { useRoute } from 'vue-router'

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
  name: 'dag-weight-custon',
  props,
  emits: ['drop', 'stepOver'],
  setup(props, context) {
    type expertFamiliarizeType = Array<{ importance: number | null }>
    const message = useMessage()
    const step = ref(0)
    const route = useRoute()
    const themeStore = useThemeStore()
    const isNormalization = ref(false)

    // 当前节点
    const labelObj = inject<any>('labelObj')
    const indexList = ref(props.indexList.value.map((item: any) => item))
    const normalization = ref([])

    console.log(labelObj)
    console.log(props.indexList)
    const treeData = ref([
      {
        name: labelObj.value.name,
        code: labelObj.value.code,
        child: props.indexList.value.map((item) => {
          return {
            name: item.name,
            code: item.code
          }
        })
      }
    ])
    console.log(treeData)
    console.log(ref([labelObj.value.code]))
    const defaultExpandedKeys = ref([labelObj.value.code])
    const expertFamiliarize = reactive<expertFamiliarizeType>([
      {
        importance: null
      }
    ])

    const handleNext = async () => {
    //  if (isNormalization.value || importanceSum.value == 1) {
    //    handleNormalization()
      if(1==1) {
		handleNormalization2()
        await saveWeight({
          evaluationPlanId: route.params.id,
          taskDefinitionCode: defaultExpandedKeys.value[0],
          weightType: 3,
          // ahpType: formModelValue.value.radio,
          // specialistNum: formModelValue.value.expertNum,
          // '[{"familiarity":4},{"familiarity":3}]',
          // specialistFamiliarity: JSON.stringify(
          //   expertFamiliarize.map((item) => {
          //     return {
          //       familiarity: item.familiarize
          //     }
          //   })
          // ),
          specialistScore: '[]',
          // indexList.value.map((nodeItem: any) => {
          //   return {
          //     indicatorId: nodeItem.code,
          //     indicatorName: nodeItem.name,
          //     special:
          //   }
          // }),
          // `[
          //     { "special": [1, 2], "indicatorId": 8, "indicatorName": "指标A" },
          //     { "special": [1, 2], "indicatorId": 9, "indicatorName": "指标B" }
          //   ]`,
          weight: JSON.stringify(
            indexList.value.map((nodeItem: any, index: number) => {
              return {
                indicatorId: nodeItem.indicatorId,
                name: nodeItem.name,
                value: normalization.value[index]
              }
            })
          )

          // `[
          //   {"indicatorId":82,"name": "指标10083","value":0.7},
          //   {"indicatorId":83,"name": "指标10084","value":0.3}
          // ]`
        })
        message.success('自定义权重设置成功')
        context.emit('stepOver')
      } else {
        message.error('请归一化之后再提交保存')
      }
      console.log(handleTableData)
      console.log('第三步， 提交')
    }

    function createTableFeedback(bodyData: any) {
      return bodyData.map((row: any, rowIndex: number) => {
        if (row.importance.value === null) {
          return {
            label: '请选择重要度',
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

    const selectTableFeedback = computed(() => {
      return createTableFeedback(handleTableData.value)
    })

    const handleTableData = computed(() => {
      return indexList.value.map((nodeItem: any, index: number) => {
        return {
          name: nodeItem.name,
          importance: ref(Number(props.weightDetail.weightList[index]?.value))
        }
      })
    })

    const importanceSum = computed(() => {
      return handleTableData.value.reduce((prev: number, cur: any) => {
        return prev + cur.importance.value
      }, 0)
    })

    watch(
      () => importanceSum.value,
      () => {
        isNormalization.value = false
      }
    )

    console.log(handleTableData)
    console.log(selectTableFeedback)

    const handleNormalization = () => {
      if (selectTableFeedback.value.every((item) => item.type === undefined)) {
        normalization.value = handleTableData.value.map((rowItem) => {
          const result = rowItem.importance.value / importanceSum.value
          return (isNaN(result) ? 0 : result).toFixed(3)
        })
        isNormalization.value = true
      } else {
        message.error('请完成表单再提交')
      }
    }
	const handleNormalization2 = () => {
      if (selectTableFeedback.value.every((item) => item.type === undefined)) {
        normalization.value = handleTableData.value.map((rowItem) => {
          const result = rowItem.importance.value 
          return (isNaN(result) ? 0 : result).toFixed(3)
        })
        isNormalization.value = true
      } else {
        message.error('请完成表单再提交')
      }
    }

    return () => (
      <div>
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
              <div>
                <NButton type='info' onClick={handleNormalization}>
                  归一化
                </NButton>
                <NTable bordered={false} single-line={false}>
                  <thead>
                    <tr>
                      <th>指标</th>
                      <th>重要度</th>
                    </tr>
                  </thead>
                  <tbody>
                    {handleTableData.value.map(
                      (nodeItem: any, rowIndex: number) => {
                        return (
                          <tr>
                            <td>{nodeItem.name}</td>
                            <td>
                              <NFormItem
                                validation-status={
                                  selectTableFeedback.value[rowIndex].type
                                }
                                feedback={
                                  selectTableFeedback.value[rowIndex].label
                                }
                                show-require-mark={true}
                                require-mark-placement={'left'}
                              >
                                <NInputNumber
                                  v-model={[nodeItem.importance.value, 'value']}
                                  min={0}
                                  precision={3}
                                />
                              </NFormItem>
                            </td>
                          </tr>
                        )
                      }
                    )}
                  </tbody>
                </NTable>
                {normalization.value.length ? (
                  <DagWeightChart
                    key={normalization.value}
                    indexList={indexList.value}
                    weight={normalization.value}
                  />
                ) : (
                  ''
                )}
              </div>
            </NLayoutContent>
          </NLayout>
        </NLayout>
        <div class={styles.dagWeightAhp}>
          <NSpace>
            <NButton onClick={() => context.emit('stepOver')}>取消</NButton>
            <NButton type='info' onClick={handleNext}>
              提交
            </NButton>
          </NSpace>
        </div>
      </div>
    )
  }
})
