/*
 * Licensed to the Apache Software Foundation (ASF) under one or more
 * contributor license agreements.  See the NOTICE file distributed with
 * this work for additional information regarding copyright ownership.
 * The ASF licenses this file to You under the Apache License, Version 2.0
 * (the "License"); you may not use this file except in compliance with
 * the License.  You may obtain a copy of the License at
 *
 *    http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

import type { Graph } from '@antv/x6'
import {
  defineComponent,
  ref,
  provide,
  PropType,
  toRef,
  watch,
  onBeforeUnmount,
  computed,
  reactive,
  onMounted
} from 'vue'
import { useI18n } from 'vue-i18n'
import { useRoute } from 'vue-router'
import DagToolbar from './dag-toolbar'
import DagCanvas from './dag-canvas'
import Styles from './dag.module.scss'
import RightWeight from './right-weight'
import DagAutoLayoutModal from './dag-auto-layout-modal'
import {
  useGraphAutoLayout,
  useGraphBackfill,
  useDagDragAndDrop,
  useTaskEdit,
  useBusinessMapper,
  useNodeMenu,
  useNodeStatus
} from './dag-hooks'
import { useThemeStore } from '@/store/theme/theme'
import VersionModal from '../../instance/components/variables-view'
import { WorkflowInstance } from './types'
import DagSaveModal from './dag-save-modal'
import TaskModal from '@/views/projects/task/components/node/detail-modal'
import StartModal from '@/views/projects/workflow/definition/components/start-modal'
import LogModal from '@/components/log-modal'
import './x6-style.scss'
import { queryLog } from '@/service/modules/log'
import { useAsyncState } from '@vueuse/core'
import utils from '@/utils'
import {
  getUnboundInputDataSubProcess,
  getDataSet,
  getDataSetCol,
  getById,
  getDataSetColValue,
  boundInputDataSubProcess,
  beginCalculate,
  getWeight,
  getAllLeafNodeList,
  getCalculationProcessInputParameter
} from '@/service/modules/assessmentTask'
import {
  NModal,
  NCard,
  NForm,
  NFormItem,
  NSelect,
  NButton,
  NSpace,
  useMessage,
  NLayout,
  NLayoutContent,
  NLayoutSider,
  NTree,
  TreeOption
} from 'naive-ui'
import { Key } from 'naive-ui/es/tree/src/interface'
import { BoundSubProcess } from '@/service/modules/assessmentTask/type'
import BoundInput from './bound-input'

const props = {
  // If this prop is passed, it means from definition detail
  instance: {
    type: Object as PropType<WorkflowInstance>,
    default: undefined
  },
  definition: {
    type: Object as PropType<any>,
    default: {}
  },
  readonly: {
    type: Boolean as PropType<boolean>,
    default: false
  },
  projectCode: {
    type: Number as PropType<number>,
    default: 0
  }
}

export default defineComponent({
  name: 'workflow-dag',
  props,
  emits: ['refresh', 'save'],
  setup(props, context) {
    const message = useMessage()
    const { t } = useI18n()
    const route = useRoute()
    const theme = useThemeStore()

    // Whether the graph can be operated
    provide('readonly', toRef(props, 'readonly'))

    const graph = ref<Graph>()
    provide('graph', graph)
    context.expose(graph)

    // Auto layout modal
    const {
      visible: layoutVisible,
      toggle: layoutToggle,
      formValue,
      formRef,
      submit,
      cancel
    } = useGraphAutoLayout({ graph })

    // Edit task
    const {
      taskConfirm,
      taskModalVisible,
      currTask,
      taskCancel,
      appendTask,
      editTask,
      copyTask,
      processDefinition,
      removeTasks,
      labelShow,
      labelObj
    } = useTaskEdit({ graph, definition: toRef(props, 'definition') })

    // Right click cell
    const { nodeVariables, menuHide, menuStart, viewLog } = useNodeMenu({
      graph
    })

    const taskInstance = computed(() => {
      if (nodeVariables.menuCell) {
        const taskCode = Number(nodeVariables.menuCell!.id)
        return taskList.value.find((task: any) => task.taskCode === taskCode)
      } else {
        return undefined
      }
    })

    const currentTaskInstance = ref()

    watch(
      () => taskModalVisible.value,
      () => {
        if (props.instance && taskModalVisible.value) {
          const taskCode = currTask.value.code
          currentTaskInstance.value = taskList.value.find(
            (task: any) => task.taskCode === taskCode
          )
        }
      }
    )

    const statusTimerRef = ref()
    const { taskList, refreshTaskStatus } = useNodeStatus({ graph })

    const { onDragStart, onDrop } = useDagDragAndDrop({
      graph,
      readonly: toRef(props, 'readonly'),
      appendTask
    })

    // backfill
    useGraphBackfill({ graph, definition: toRef(props, 'definition') })

    // version modal
    const versionModalShow = ref(false)
    const versionToggle = (bool: boolean) => {
      if (typeof bool === 'boolean') {
        versionModalShow.value = bool
      } else {
        versionModalShow.value = !versionModalShow.value
      }
    }
    const refreshDetail = () => {
      context.emit('refresh')
      versionModalShow.value = false
    }

    // Save modal
    const saveModalShow = ref(false)
    const saveModelToggle = (bool: boolean) => {
      if (typeof bool === 'boolean') {
        saveModalShow.value = bool
      } else {
        saveModalShow.value = !versionModalShow.value
      }
    }
    const { getConnects, getLocations } = useBusinessMapper()
    const onSave = (saveForm: any) => {
      const edges = graph.value?.getEdges() || []
      const nodes = graph.value?.getNodes() || []
      if (!nodes.length) {
        window.$message.error(t('project.dag.node_not_created'))
        saveModelToggle(false)
        return
      }
      const connects = getConnects(
        nodes,
        edges,
        processDefinition.value.taskDefinitionList as any
      )
      const locations = getLocations(nodes)
      context.emit('save', {
        taskDefinitions: processDefinition.value.taskDefinitionList,
        saveForm,
        connects,
        locations
      })
      saveModelToggle(false)
    }

    const handleViewLog = (taskId: number, taskType: string) => {
      taskModalVisible.value = false
      viewLog(taskId, taskType)
      getLogs()
    }

    const getLogs = () => {
      const { state } = useAsyncState(
        queryLog({
          taskInstanceId: nodeVariables.logTaskId,
          limit: nodeVariables.limit,
          skipLineNum: nodeVariables.skipLineNum
        }).then((res: any) => {
          if (res.message) {
            nodeVariables.logRef += res.message
            nodeVariables.limit += 1000
            nodeVariables.skipLineNum += res.lineNum
            getLogs()
          } else {
            nodeVariables.logLoadingRef = false
          }
        }),
        {}
      )

      return state
    }

    const refreshLogs = () => {
      nodeVariables.logRef = ''
      nodeVariables.limit = 1000
      nodeVariables.skipLineNum = 0
      getLogs()
    }

    const downloadLogs = () => {
      utils.downloadFile('log/download-log', {
        taskInstanceId: nodeVariables.logTaskId
      })
    }

    const onConfirmModal = () => {
      nodeVariables.showModalRef = false
    }

    const layoutSubmit = () => {
      submit()

      // Refresh task status in workflow instance
      if (props.instance) {
        refreshTaskStatus()
      }
    }

    watch(
      () => props.definition,
      () => {
        if (props.instance) {
          refreshTaskStatus()
          statusTimerRef.value = setInterval(() => refreshTaskStatus(), 90000)
        }
      }
    )

    watch(
      () => nodeVariables.showModalRef,
      () => {
        if (!nodeVariables.showModalRef) {
          nodeVariables.row = {}
          nodeVariables.logRef = ''
          nodeVariables.logLoadingRef = true
          nodeVariables.skipLineNum = 0
          nodeVariables.limit = 1000
        }
      }
    )

    const runModalShow = ref(false)
    const continueModalShow = ref(false)
    const boundResultShow = ref(false)
    const unboundSubProcess = ref([] as any)
    const dataOptions = ref([])
    const dataColOptions = ref([])
    const evaluationTargetList = ref([])
    const evaluationTargetRestlt = ref([])
    const dataSourceColRestlt = ref([] as any)
    const evaluationPlanId = ref(Number(route.params.evaluationPlanId))
    const result = ref([] as any)
    const variables = reactive({
      formRef: ref(),
      model: {
        dataSourceId: ''
      }
    })
    const pieData = ref([])
    const curLabelData = ref({})

    watch(labelObj, () => {
      if (labelObj?.value?.name) {
        pieData.value = []
        getWeight({
          evaluationPlanId: evaluationPlanId.value,
          taskDefinitionCode: labelObj.value.code
        }).then((res: { weightList: [] }) => {
          pieData.value = res.weightList
        })
      }
    })

    const onCalculate = (flag: Boolean) => {
      curLabelData.value = {}
      getUnboundInputDataSubProcess(props.projectCode).then((res: any) => {
        if (res.length > 0) {
          unboundSubProcess.value = res
          if (flag) {
            boundResultShow.value = true
          } else {
            runModalShow.value = true
          }
        } else {
          handleClose()
          const formData = new FormData()
          const processDefinitionCode =
            props.definition.value.processDefinition.code
          formData.append('processDefinitionCode', processDefinitionCode)
          formData.append('failureStrategy', 'CONTINUE')
          formData.append('warningType', 'NONE')
          formData.append('scheduleTime', '')
          formData.append('evaluationTaskId', route.params.id.toString())
          const projectCode =
            props.definition.value.processDefinition.projectCode
          beginCalculate(projectCode, formData).then(() => {
            message.success('调度成功,请稍后到实例列表查看')
            // router.push({
            //   name: 'workflow-instance-detail-task',
            //   params: { projectCode, id: 163 },
            //   query: { code: processDefinitionCode }
            // })
          })
        }
      })
    }

    const onBound = () => {
      curLabelData.value = labelObj.value
      getUnboundInputDataSubProcess(props.projectCode).then((res: any) => {
        unboundSubProcess.value = res
        handleContinue()
      })
    }

    const handleContinue = () => {
      getById(props.projectCode).then((res: any) => {
        evaluationTargetList.value = res.evaluationTargetList
        runModalShow.value = false
        result.value = []
        continueModalShow.value = true
      })
    }

    const handleClose = () => {
      runModalShow.value = false
      continueModalShow.value = false
      boundResultShow.value = false
    }

    getDataSet().then((res: any) => {
      dataOptions.value = res
    })

    const handleGetCol = (dataSourceId: number) => {
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
        dataColOptions.value = tempArr.value
      })
    }

    const handleSelect = (value: string, index: number) => {
      if (!value || value.length == 0) {
        result.value[index] = ''
        evaluationTargetRestlt.value[index] = evaluationTargetList.value[index]
        dataSourceColRestlt.value[index] = ''
        return
      }

      getDataSetColValue({
        dataSetId: variables.model.dataSourceId,
        dataSourceCol: value
      }).then((res: any) => {
        result.value[index] = `${
          evaluationTargetList.value[index]
        }:${JSON.stringify(res)}`
        evaluationTargetRestlt.value[index] = evaluationTargetList.value[index]
        dataSourceColRestlt.value[index] = value
      })
    }

    const handleCancle = () => {
      result.value = []
      variables.model.dataSourceId = ''
      handleClose()
    }

    const handleSubit = (tableData: BoundSubProcess[]) => {
      const data = tableData.map((item) => ({
        ...item,
        processId: props.definition.value.processDefinition.id,
        evaluationTaskId: route.params.id as string
      }))

      boundInputDataSubProcess(data).then(() => {
        message.success('保存成功')
        handleClose()
      })
    }

    const handleNext = () => {
      result.value = []
      continueModalShow.value = true
    }

    onBeforeUnmount(() => clearInterval(statusTimerRef.value))

    return () => (
      <div
        class={[
          Styles.dag,
          Styles[`dag-${theme.darkTheme ? 'dark' : 'light'}`]
        ]}
      >
        <NModal
          v-model={[runModalShow.value, 'show']}
          mask-closable={false}
          style={{ width: '600px' }}
        >
          <NCard title='运行' closable onClose={handleClose}>
            {{
              default: () => {
                {
                }
                return (
                  <div>
                    <div>部分指标未设置输入，是否继续执行</div>
                    {unboundSubProcess.value.map((item: { name: any }) => {
                      return <div style={{ fontSize: '12px' }}>{item.name}</div>
                    })}
                    <div>说明：</div>
                    <div>1)指标若未配量输入，会运行失败</div>
                    <div>2)默认按照每一层指标从左到右，从下到上汇总计算</div>
                  </div>
                )
              },
              footer: () => (
                <NSpace justify='end'>
                  <NButton ghost size='small' onClick={handleContinue}>
                    继续设置指标输入
                  </NButton>
                  <NButton
                    type='primary'
                    size='small'
                    disabled={unboundSubProcess.value.length > 0}
                  >
                    {/* onClick={onConfirm}
                    disabled={confirmDisabled}
                    loading={confirmLoading} */}
                    继续执行
                  </NButton>
                </NSpace>
              )
            }}
          </NCard>
        </NModal>
        <BoundInput
          show={continueModalShow.value}
          unboundSubProcess={unboundSubProcess.value}
          evaluationTargetList={evaluationTargetList.value}
          labelObj={curLabelData.value}
          onSave={handleSubit}
          onCancel={handleCancle}
          onClose={handleClose}
        />
        {/* <NModal
          v-model={[continueModalShow.value, 'show']}
          mask-closable={false}
          style={{ width: '700px' }}
        >
          <NCard
            title={`${unboundSubProcess.value[0].name}——输入算子 配置输入数据`}
            closable
            onClose={handleClose}
          >
            {{
              default: () => {
                return (
                  <NLayout hasSider>
                    <NLayoutSider content-style='padding: 24px;'>
                      <NTree
                        block-line
                        data={treeData.value}
                        key-field='code'
                        label-field='name'
                        children-field='child'
                        selectable
                        defaultSelectedKeys={[selectedNode.value]}
                        onUpdateSelectedKeys={onUpdateSelectedKeys}
                        cancelable={false}
                      />
                    </NLayoutSider>
                    <NLayoutContent>
                      <NForm size='small' ref='formRef' label-placement='left'>
                        <NFormItem label={'选择数据集'}>
                          <NSelect
                            v-model={[variables.model.dataSourceId, 'value']}
                            label-field='dataSetName'
                            value-field='id'
                            options={dataOptions.value}
                            onUpdateValue={handleGetCol}
                          />
                        </NFormItem>
                        {evaluationTargetList.value.map(
                          (item: string, objIdx: number) => {
                            return (
                              <div class={Styles['three-column-layout']}>
                                <div class={Styles['left-column']}>
                                  <div class={Styles['row-data']}></div>
                                  <div key={objIdx} class={Styles['row-data']}>
                                    {item}
                                  </div>
                                </div>
                                {inputParamsList.value.map(
                                  (item: any, idx: number) => {
                                    return (
                                      <>
                                        <div class={Styles['center-column']}>
                                          <div class={Styles['row-data']}></div>
                                          <div
                                            key={idx}
                                            class={Styles['row-data']}
                                          >
                                            {item.paramDes}
                                          </div>
                                        </div>
                                        <div class={Styles['right-column']}>
                                          <div class={Styles['row-data']}>
                                            配置源
                                          </div>
                                          <div
                                            key={idx}
                                            class={Styles['row-data']}
                                          >
                                            <NSelect
                                              key={idx}
                                              options={dataColOptions.value}
                                              multiple={
                                                item.selectValue == 'List'
                                              }
                                              onUpdateValue={(value) =>
                                                handleSelect(value, objIdx)
                                              }
                                            />
                                          </div>
                                        </div>
                                      </>
                                    )
                                  }
                                )}
                              </div>
                            )
                          }
                        )}
                        <pre style={{ minHeight: '50px' }}>
                          {result.value.map((item: any) => {
                            return <div>{item}</div>
                          })}
                        </pre>
                      </NForm>
                    </NLayoutContent>
                  </NLayout>
                )
              },
              footer: () => (
                <NSpace justify='end'>
                  <NButton ghost size='small' onClick={handleCancle}>
                    取消
                  </NButton>
                  <NButton type='primary' size='small' onClick={handleSubit}>
                    保存
                  </NButton>
                </NSpace>
              )
            }}
          </NCard>
        </NModal> */}
        <NModal
          v-model:show={boundResultShow.value}
          preset='dialog'
          title='保存成功'
          positive-text='设置下一个'
          negative-text='回到指标页'
          onPositiveClick={() => handleNext()}
          onNegativeClick={() => handleClose()}
        />
        <DagToolbar></DagToolbar>
        <div class={Styles.content}>
          {/* {props.projectCode} */}
          {/* <DagSidebar onDragStart={onDragStart} /> */}
          <DagCanvas
            onDrop={onDrop}
            onCalculate={onCalculate}
            onBound={onBound}
          />
          <RightWeight labelData={labelObj.value} pieData={pieData.value} />
        </div>
        <DagAutoLayoutModal
          visible={layoutVisible.value}
          submit={layoutSubmit}
          cancel={cancel}
          formValue={formValue}
          formRef={formRef}
        />
        {!!props.definition && (
          <VersionModal
            isInstance={!!props.instance}
            v-model:row={props.definition.processDefinition}
            v-model:show={versionModalShow.value}
            onUpdateList={refreshDetail}
          />
        )}
        <DagSaveModal
          v-model:show={saveModalShow.value}
          onSave={onSave}
          definition={props.definition}
          instance={props.instance}
        />
        <TaskModal
          readonly={props.readonly}
          show={taskModalVisible.value}
          projectCode={props.projectCode}
          processInstance={props.instance}
          taskInstance={currentTaskInstance.value}
          onViewLog={handleViewLog}
          data={currTask.value as any}
          definition={processDefinition}
          onSubmit={taskConfirm}
          onCancel={taskCancel}
        />
        {/* <ContextMenuItem
          startDisplay={startDisplay.value}
          menuDisplay={menuDisplay.value}
          taskInstance={taskInstance.value}
          cell={nodeVariables.menuCell as Cell}
          visible={nodeVariables.menuVisible}
          left={nodeVariables.pageX}
          top={nodeVariables.pageY}
          onHide={menuHide}
          onStart={menuStart}
          onEdit={editTask}
          onCopyTask={copyTask}
          onRemoveTasks={removeTasks}
          onViewLog={handleViewLog}
        /> */}
        {!!props.definition && (
          <StartModal
            v-model:row={props.definition.processDefinition}
            v-model:show={nodeVariables.startModalShow}
            taskCode={nodeVariables.taskCode}
          />
        )}
        {!!props.instance && (
          <LogModal
            showModalRef={nodeVariables.showModalRef}
            logRef={nodeVariables.logRef}
            row={nodeVariables.row}
            showDownloadLog={true}
            logLoadingRef={nodeVariables.logLoadingRef}
            onConfirmModal={onConfirmModal}
            onRefreshLogs={refreshLogs}
            onDownloadLogs={downloadLogs}
          />
        )}
      </div>
    )
  }
})
