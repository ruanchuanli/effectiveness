import { defineComponent, ref, PropType, watch, reactive } from 'vue'
import { useRoute } from 'vue-router'
import Styles from './dag.module.scss'
import {
  getDataSet,
  getDataSetCol,
  getDataSetColValue,
  getAllLeafNodeList,
  getCalculationProcessInputParameter,
  getInputDataSubProcess
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
  dataSourceCol: string[] | string
  disabled: boolean
}

interface IndexTreeNode {
  name: string
  code: number
  processId: number
  subProcessCode: number
}

const props = {
  show: {
    type: Boolean as PropType<Boolean>,
    default: false
  },
  unboundSubProcess: {
    type: Array as PropType<Array<any>>,
    default: () => []
  },
  evaluationTargetList: {
    type: Array as PropType<Array<any>>,
    default: () => []
  },
  labelObj: {
    type: Object as PropType<any>,
    default: () => ({})
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
    const result = ref<any[][]>([])
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

    const handleEditInput = (value: string, objIdx: number, idx: number) => {
      result.value[objIdx][idx] = value
    }

    const handleSelect = (
      value: string | string[],
      objIdx: number,
      idx: number
    ) => {
      if (!value || value.length == 0) {
        result.value[objIdx][idx] = ''
        return
      }

      if (typeof value == 'string') {
        value = [value]
      }

      if (filterData.value[objIdx].length > 0) {
        let res: string[][] = []
        value.forEach((col) => {
          let arr: string[] = []

          arr = filterData.value[objIdx].slice(0, 10).map((item) => item[col])
          arr[0] = '[' + arr[0]
          if (filterData.value[objIdx].length > 10) {
            arr[arr.length - 1] += '...'
          }
          arr[arr.length - 1] += ']'

          res.push(arr)
        })

        result.value[objIdx][idx] = res
      } else {
        Promise.all(
          value.map((item) =>
            getDataSetColValue({
              dataSetId: variables.model.dataSourceId[objIdx],
              dataSourceCol: item
            })
          )
        ).then((res: any[]) => {
          let arr: any[][] = []

          res.forEach((item) => {
            item.dataList[0] = '[' + item.dataList[0]
            if (item.total > 10) {
              item.dataList[item.dataList.length - 1] += '...'
            }
            item.dataList[item.dataList.length - 1] += ']'

            arr.push(item.dataList)
          })

          result.value[objIdx][idx] = arr
        })
      }
    }

    const handleCancle = () => {
      context.emit('cancel')
    }

    const handleSubmit = () => {
      const data: BoundSubProcess[] = []
      tableData.value.forEach((itemArr, idx) => {
        if (filterData.value[idx].length > 0) {
          itemArr.forEach((item) => {
            if (!item.defaultValue) {
              item.defaultValue = JSON.stringify(filterData.value[idx])
            }
          })
        }

        const arr = itemArr.map((item) => {
          let dataSourceCol = item.dataSourceCol

          if (typeof dataSourceCol == 'string') {
            dataSourceCol = [dataSourceCol]
          }

          return {
            ...item,
            dataSourceCol: item.isEdit ? '' : dataSourceCol.join(','),
            filterCriteria: filterCriteria.value[idx],
            dataSourceId: variables.model.dataSourceId[idx]
          }
        })
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
    const modelResult = ref('')

    const onUpdateSelectedKeys = (keys: Array<number>, option: any[]) => {
      selectedNode.value = option[0]
    }

    const handleEditClick = (objIdx: number, idx: number) => {
      tableData.value[objIdx][idx].isEdit = !tableData.value[objIdx][idx].isEdit

      if (tableData.value[objIdx][idx].isEdit) {
        tableData.value[objIdx][idx].defaultValue = ''
      } else {
        if (inputParamsList.value[idx].selectValue == 'List<List>') {
          tableData.value[objIdx][idx].dataSourceCol = []
        } else {
          tableData.value[objIdx][idx].dataSourceCol = null as unknown as string
        }
      }

      // 如果没有下拉框 重置数据集、筛选数据和筛选条件
      const hasSelected =
        tableData.value[objIdx].findIndex((item) => !item.isEdit) > -1
      if (!hasSelected) {
        variables.model.dataSourceId[objIdx] = null
        filterCriteria.value[objIdx] = ''
        filterData.value[objIdx] = []
      }
    }

    const handleFilterClick = (idx: number) => {
      if (variables.model.dataSourceId[idx] == null) {
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
      previewReload(filterIdx.value)
    }

    // 数据预览重加载
    const previewReload = (objIdx: number) => {
      for (let i = 0; i < inputParamsList.value.length; i++) {
        if (tableData.value[objIdx][i].isEdit) {
          handleEditInput(tableData.value[objIdx][i].defaultValue, objIdx, i)
        } else {
          handleSelect(tableData.value[objIdx][i].dataSourceCol, objIdx, i)
        }
      }
    }

    const initModule = (objIdx: number, showModelResult = true) => {
      filterData.value[objIdx] = []
      result.value[objIdx] = []
      tableData.value[objIdx] = new Array(inputParamsList.value.length)
        .fill(0)
        .map((_, idx) => {
          let obj = {
            dataSourceCol: [],
            subProcessCode: selectedNode.value.subProcessCode,
            inputParamCol: inputParamsList.value[idx].paramName,
            evaluationTarget: props.evaluationTargetList[objIdx],
            isEdit: false,
            defaultValue: '',
            dataColOptions: [],
            processId: selectedNode.value.processId,
            dataSourceId: null as unknown as number,
            evaluationTaskId: '0',
            filterCriteria: '',
            disabled: false
          }

          if (showModelResult && modelResult.value) {
            obj.isEdit = true
            obj.defaultValue = modelResult.value
          }

          return obj
        })
    }

    const init = async (selectedNode: IndexTreeNode) => {
      await getCalculationProcessInputParameter(selectedNode.code).then(
        (res: any) => {
          inputParamsList.value = res.inputParamsList
          modelResult.value = res.modelResult && String(res.modelResult)

          for (let i = 0; i < props.evaluationTargetList.length; i++) {
            initModule(i)
          }
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
        getAllLeafNodeList(id).then((res: any[]) => {
          const leftNode = res.find((item) => item.code == props.labelObj.code)
          if (leftNode) {
            selectedNode.value = leftNode
          } else if (props.unboundSubProcess.length > 0) {
            selectedNode.value = res.find(
              (item) => item.code == props.unboundSubProcess[0].code
            )
          } else {
            selectedNode.value = res[0]
          }

          treeData.value = res
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
            .filter(
              (item) => item.subProcessCode == selectedNode.subProcessCode
            )
            .map((item) => {
              if (!data[item.evaluationTarget]) {
                data[item.evaluationTarget] = {}
              }

              const dataSourceCol = item.dataSourceCol
                .split(',')
                .filter((item) => item)
              const isEdit =
                (dataSourceCol.length == 0 && !!item.defaultValue) &&
                !!modelResult
              data[item.evaluationTarget][item.inputParamCol] = {
                ...item,
                dataSourceCol,
                isEdit,
                defaultValue: item.defaultValue || modelResult.value
              }
            })

          tableData.value = tableData.value.map((itemArr, objIdx) => {
            return itemArr.map((item, idx) => {
              if (!data[props.evaluationTargetList[objIdx]]) {
                variables.model.dataSourceId[objIdx] = null
                return item
              }

              let obj =
                data[props.evaluationTargetList[objIdx]][
                  inputParamsList.value[idx].paramName
                ]

              // 如果单选，需要把列名变为字符串
              if (inputParamsList.value[idx].selectValue != 'List<List>') {
                obj.dataSourceCol = obj.dataSourceCol[0]
              }

              // 数据集
              variables.model.dataSourceId[objIdx] = obj.dataSourceId
              // 筛选
              filterCriteria.value[objIdx] = obj.filterCriteria
              if (obj.filterCriteria) {
                filterData.value[objIdx] = JSON.parse(obj.filterCriteria).result
              } else {
                filterData.value[objIdx] = []
              }
              // 数据预览
              if (obj.isEdit) {
                handleEditInput(obj.defaultValue, objIdx, idx)
              } else {
                handleSelect(obj.dataSourceCol, objIdx, idx)
              }

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
          if (!n[i]) {
            dataColOptions.value[i] = []
          }

          if (n[i] != o[i] && n[i]) {
            handleGetCol(n[i], i)
            filterCriteria.value[i] = ''
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
            // title={`${props.unboundSubProcess[0].name}——输入算子 配置输入数据`}
            title={`输入算子 配置输入数据`}
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
                        (objItem: string, objIdx: number) => {
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
                                    onUpdateValue={() =>
                                      initModule(objIdx, false)
                                    }
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
                              <div class={Styles['column-layout-header']}>
                                <div class={Styles['left-column']}>
                                  <div class={Styles['row-data']}>评估对象</div>
                                </div>
                                <div class={Styles['center-column']}>
                                  <div class={Styles['row-data']}>输入参数</div>
                                </div>
                                <div class={Styles['right-column']}>
                                  <div class={Styles['row-data']}>配置源</div>
                                </div>
                              </div>
                              <div class={Styles['column-layout-outer']}>
                                <div class={[Styles['left-column']]}>
                                  <div class={Styles['row-data']}>
                                    {objItem}
                                  </div>
                                </div>
                                <div class={Styles['column-layout-inner']}>
                                  {inputParamsList.value.map(
                                    (item: any, idx: number) => {
                                      return (
                                        <div class={Styles['column-layout']}>
                                          <div class={Styles['left-column']}>
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
                                                  onUpdateValue={(value) =>
                                                    handleEditInput(
                                                      value,
                                                      objIdx,
                                                      idx
                                                    )
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
                                                    item.selectValue ==
                                                    'List<List>'
                                                  }
                                                  maxTagCount={3}
                                                  onUpdateValue={(value) =>
                                                    handleSelect(
                                                      value,
                                                      objIdx,
                                                      idx
                                                    )
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
                                        </div>
                                      )
                                    }
                                  )}
                                </div>
                              </div>
                              <div>
                                {props.evaluationTargetList[objIdx]}:
                                {inputParamsList.value.map((item, idx) => (
                                  <>{`${idx > 1 ? ',' : ''}${item.paramName}:[${
                                    result.value[objIdx][idx] || '[]'
                                  }]`}</>
                                ))}
                              </div>
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
