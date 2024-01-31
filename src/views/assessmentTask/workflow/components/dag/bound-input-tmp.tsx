import {
  defineComponent,
  ref,
  PropType,
  watch,
  reactive,
  watchEffect
} from 'vue'
import { useRoute } from 'vue-router'
import Styles from './dag.module.scss'
import {
  getDataSet,
  getDataSetCol,
  getDataSetColValue,
  getAllLeafNodeList,
  getCalculationProcessInputParameter,
  getInputDataSubProcess,
  getDataColValuePage
} from '@/service/modules/assessmentTask'
import {
  NModal,
  NCard,
  NForm,
  NFormItem,
  NSelect,
  NButton,
  NSpace,
  NLayout,
  NLayoutContent,
  NLayoutSider,
  NTree,
  NInput,
  TreeOption
} from 'naive-ui'
import { BoundSubProcess } from '@/service/modules/assessmentTask/type'
import FilterModal from './filter-modal'

interface BoundSubProcessConfig extends Omit<BoundSubProcess, 'dataSourceCol'> {
  isEdit: boolean
  dataColOptions: any[]
  dataSourceCol: string[]
  disabled: boolean
}

interface IndexTreeNode {
  name: string
  code: number
  processId: number
}

const props = {
  show: {
    type: Boolean as PropType<Boolean>,
    default: false
  },
  unboundSubProcess: {
    type: Object as PropType<any>,
    default: () => ({})
  },
  evaluationTargetList: {
    type: Array as PropType<Array<any>>,
    default: () => []
  }
}

export default defineComponent({
  name: 'BoundInput',
  props,
  emits: ['save', 'cancel', 'close'],
  setup(props, context) {
    const route = useRoute()

    const dataOptions = ref([])
    const dataColOptions = ref<any[][]>([])
    const evaluationTargetRestlt = ref<any[]>([])
    const dataSourceColRestlt = ref([] as any)
    const result = ref([] as any)
    const variables = reactive({
      formRef: ref(),
      model: {
        dataSourceId: [] as any[]
      }
    })

    const handleClose = () => {
      context.emit('close')
    }

    getDataSet().then((res: any) => {
      dataOptions.value = res
      dataColOptions.value = new Array(res.length).fill([])
    })

    const handleGetCol = (dataSourceId: number, idx: number) => {
      tableData.value[idx].forEach((item) => {
        item.dataSourceId = dataSourceId
      })

      getDataSetCol(dataSourceId).then((res: any) => {
        const tempArr = ref([] as any)
        let tempObj: { label: string; value: string }
        res.map((item: any) => {
          tempObj = {
            label: item.comment || item.field,
            value: item.field
          }
          tempArr.value.push(tempObj)
        })
        dataColOptions.value[idx] = tempArr.value
      })
    }

    const handleSelect = (value: string[], index: number) => {
      if (!value || value.length == 0) {
        result.value[index] = ''
        evaluationTargetRestlt.value[index] = props.evaluationTargetList[index]
        dataSourceColRestlt.value[index] = ''
        return
      }

      Promise.all(
        value.map((item) =>
          getDataSetColValue({
            dataSetId: variables.model.dataSourceId[index],
            dataSourceCol: item
          })
        )
      ).then((res: any[]) => {
        result.value[index] = `${
          props.evaluationTargetList[index]
        }:${JSON.stringify(res)}`
        evaluationTargetRestlt.value[index] = props.evaluationTargetList[index]
        dataSourceColRestlt.value[index] = value
      })
    }

    const handleCancle = () => {
      context.emit('cancel')
    }

    const handleSubmit = () => {
      const data: BoundSubProcess[] = []
      tableData.value.forEach((itemArr, idx) => {
        if (filterData.value[idx].length > 0) {
          itemArr.forEach((item) => {
            item.defaultValue = JSON.stringify(filterData.value[idx])
          })
        }

        const arr = itemArr.map((item) => ({
          ...item,
          dataSourceCol: item.isEdit ? '' : item.dataSourceCol.join(','),
          filterCriteria: filterCriteria.value[idx]
        }))
        data.push(...arr)
      })

      context.emit('save', data)
    }

    const treeData = ref<any[]>([])
    const selectedNode = ref<IndexTreeNode>({} as IndexTreeNode)
    const inputParamsList = ref<any[]>([])
    const tableData = ref<BoundSubProcessConfig[][]>([])
    const filterModalShow = ref(false)
    const queryOptions = ref<any[]>([])
    const dataSetId = ref<number>(0)
    const filterData = ref<any[][]>([])
    const filterIdx = ref(0)
    const filterCriteria = ref<string[]>([])

    const onUpdateSelectedKeys = (keys: Array<number>, option: any[]) => {
      selectedNode.value = option[0]
    }

    const handleEditClick = (objIdx: number, idx: number) => {
      tableData.value[objIdx][idx].isEdit = !tableData.value[objIdx][idx].isEdit

      if (tableData.value[objIdx][idx].isEdit) {
        if (filterData.value[objIdx].length > 0) {
          tableData.value[objIdx][idx].defaultValue = JSON.stringify(
            filterData.value[objIdx]
          )
          tableData.value[objIdx][idx].disabled = true
        } else {
          tableData.value[objIdx][idx].defaultValue = ''
          tableData.value[objIdx][idx].disabled = false
        }

        tableData.value[objIdx][idx].filterCriteria = ''
        filterData.value[objIdx] = []
      }
    }

    const handleFilterClick = (idx: number) => {
      if (dataColOptions.value[idx].length == 0) {
        return
      }

      filterIdx.value = idx
      dataSetId.value = variables.model.dataSourceId[idx]
      queryOptions.value = dataColOptions.value[idx]
      filterModalShow.value = true
    }

    const handleFilterCancel = () => {
      filterModalShow.value = false
    }

    const handleFilterConfirm = (
      data: any[],
      queryObj: Record<string, any>
    ) => {
      filterModalShow.value = false
      filterData.value[filterIdx.value] = data
      filterCriteria.value[filterIdx.value] = JSON.stringify(queryObj)
    }

    const init = async (selectedNode: IndexTreeNode) => {
      await getCalculationProcessInputParameter(selectedNode.code).then(
        (res: any) => {
          inputParamsList.value = res.inputParamsList
          filterData.value = new Array(props.evaluationTargetList.length)
            .fill(0)
            .map(() => [])
          tableData.value = new Array(props.evaluationTargetList.length)
            .fill(0)
            .map((_, objIdx) => {
              return new Array(inputParamsList.value.length)
                .fill(0)
                .map((_, idx) => {
                  let obj = {
                    dataSourceCol: [],
                    subProcessCode: selectedNode.code,
                    inputParamCol: inputParamsList.value[idx].paramName,
                    evaluationTarget: props.evaluationTargetList[objIdx],
                    isEdit: false,
                    defaultValue: '',
                    dataColOptions: [],
                    processId: selectedNode.processId,
                    dataSourceId: 0,
                    evaluationTaskId: '0',
                    filterCriteria: '',
                    disabled: false
                  }

                  if (inputParamsList.value[idx].modelResult) {
                    obj.isEdit = true
                    obj.defaultValue = inputParamsList.value[idx].modelResult
                  }

                  return obj
                })
            })
        }
      )
    }

    watch(
      () => props.show,
      (show) => {
        if (!show) {
          return
        }

        const id = route.params.id as string
        getAllLeafNodeList(id).then((res: any) => {
          selectedNode.value = res[0]
          treeData.value = res.map((item: any) => {
            return {
              name: item.name,
              code: item.code,
              processId: item.processId
            }
          })
        })
      }
    )

    watch(selectedNode, async (selectedNode) => {
      await init(selectedNode)

      const evaluationTaskId = route.params.id as string
      const processId = selectedNode.processId
      await getInputDataSubProcess(evaluationTaskId, processId).then(
        (res: BoundSubProcess[]) => {
          // {'A': {'inputParamCol': {item}}}
          const data = {} as any
          res
            .filter((item) => item.subProcessCode == selectedNode.code)
            .map((item) => {
              if (!data[item.evaluationTarget]) {
                data[item.evaluationTarget] = {}
              }

              const dataSourceCol = item.dataSourceCol
                .split(',')
                .filter((item) => item)
              data[item.evaluationTarget][item.inputParamCol] = {
                ...item,
                dataSourceCol,
                isEdit: dataSourceCol.length == 0 && !!item.defaultValue
              }
            })

          tableData.value = tableData.value.map((itemArr, objIdx) => {
            return itemArr.map((item, idx) => {
              let obj =
                data[props.evaluationTargetList[objIdx]][
                  inputParamsList.value[idx].paramName
                ]

              // 数据集
              variables.model.dataSourceId[objIdx] = obj.dataSourceId
              // 筛选
              filterCriteria.value[objIdx] = obj.filterCriteria
              filterData.value[objIdx] = new Array(JSON.parse(obj.filterCriteria).size)
              return obj
            })
          })
        }
      )
    })

    // 数据集变化
    watch(
      () => JSON.stringify(variables.model.dataSourceId),
      (newVal, oldVal) => {
        let n = JSON.parse(newVal)
        let o = JSON.parse(oldVal)

        for (let i = 0; i < n.length; i++) {
          if (n[i] != o[i]) {
            handleGetCol(n[i], i)
          }
        }
      },
      { deep: true }
    )

    return () => (
      <>
        <NModal
          v-model={[props.show, 'show']}
          mask-closable={false}
          style={{ width: '900px' }}
        >
          <NCard
            title={`${props.unboundSubProcess[0].name}——输入算子 配置输入数据`}
            closable
            onClose={handleClose}
          >
            {{
              default: () => {
                return (
                  <NLayout hasSider>
                    <NLayoutSider content-style='padding: 24px;' width={200}>
                      <NTree
                        block-line
                        data={treeData.value}
                        key-field='code'
                        label-field='name'
                        selectable
                        selectedKeys={[selectedNode.value.code]}
                        onUpdateSelectedKeys={onUpdateSelectedKeys}
                        cancelable={false}
                      />
                    </NLayoutSider>
                    <NLayoutContent>
                      {props.evaluationTargetList.map(
                        (item: string, objIdx: number) => {
                          return (
                            <div class={Styles['table-content']}>
                              <NForm
                                size='small'
                                ref='formRef'
                                label-placement='left'
                              >
                                <NFormItem
                                  label={'选择数据集'}
                                  showFeedback={false}
                                >
                                  <NSelect
                                    v-model={[
                                      variables.model.dataSourceId[objIdx],
                                      'value'
                                    ]}
                                    label-field='dataSetName'
                                    value-field='id'
                                    options={dataOptions.value}
                                    // onUpdateValue={(value) =>
                                    //   handleGetCol(value, objIdx)
                                    // }
                                  />
                                  <NButton
                                    type='primary'
                                    onClick={() => handleFilterClick(objIdx)}
                                  >
                                    筛选样本
                                  </NButton>
                                </NFormItem>
                                <p class={Styles['filter-selected-count']}>
                                  已选中 {filterData.value[objIdx]?.length} 条
                                </p>
                              </NForm>
                              <div class={Styles['three-column-layout']}>
                                <div
                                  class={[
                                    Styles['row-data-header'],
                                    Styles['left-column']
                                  ]}
                                >
                                  评估对象
                                </div>
                                <div
                                  class={[
                                    Styles['row-data-header'],
                                    Styles['center-column']
                                  ]}
                                >
                                  输入参数
                                </div>
                                <div
                                  class={[
                                    Styles['row-data-header'],
                                    Styles['right-column']
                                  ]}
                                >
                                  配置源
                                </div>
                              </div>
                              <div class={Styles['three-column-layout']}>
                                {inputParamsList.value.map(
                                  (item: any, idx: number) => {
                                    return (
                                      <>
                                        <div class={Styles['left-column']}>
                                          <div
                                            key={objIdx}
                                            class={Styles['row-data']}
                                          >
                                            {item}
                                          </div>
                                        </div>
                                        <div class={Styles['center-column']}>
                                          <div class={Styles['row-data']}>
                                            {item.paramDes}
                                          </div>
                                        </div>
                                        <div class={Styles['right-column']}>
                                          <div class={Styles['row-data']}>
                                            {tableData.value[objIdx][idx]
                                              .isEdit ? (
                                              <NInput
                                                v-model={[
                                                  tableData.value[objIdx][idx]
                                                    .defaultValue,
                                                  'value'
                                                ]}
                                                disabled={
                                                  tableData.value[objIdx][idx]
                                                    .disabled
                                                }
                                              />
                                            ) : (
                                              <NSelect
                                                v-model={[
                                                  tableData.value[objIdx][idx]
                                                    .dataSourceCol,
                                                  'value'
                                                ]}
                                                options={
                                                  dataColOptions.value[objIdx]
                                                }
                                                multiple={
                                                  item.selectValue == 'List'
                                                }
                                                maxTagCount={3}
                                                onUpdateValue={(value) =>
                                                  handleSelect(value, objIdx)
                                                }
                                              />
                                            )}
                                            <NButton
                                              type='primary'
                                              onClick={() =>
                                                handleEditClick(objIdx, idx)
                                              }
                                            >
                                              {tableData.value[objIdx][idx]
                                                .isEdit
                                                ? '选择'
                                                : '编辑'}
                                            </NButton>
                                          </div>
                                        </div>
                                      </>
                                    )
                                  }
                                )}
                              </div>
                              <div>{result.value[objIdx]}</div>
                            </div>
                          )
                        }
                      )}
                    </NLayoutContent>
                  </NLayout>
                )
              },
              footer: () => (
                <NSpace justify='end'>
                  <NButton ghost size='small' onClick={handleCancle}>
                    取消
                  </NButton>
                  <NButton type='primary' size='small' onClick={handleSubmit}>
                    保存
                  </NButton>
                </NSpace>
              )
            }}
          </NCard>
        </NModal>
        <FilterModal
          show={filterModalShow.value}
          queryOptions={queryOptions.value}
          filterCriteria={filterCriteria.value[filterIdx.value]}
          dataSetId={dataSetId.value}
          onCancel={handleFilterCancel}
          onConfirm={handleFilterConfirm}
        />
      </>
    )
  }
})
