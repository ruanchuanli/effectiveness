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

import { defineComponent, ref, inject, PropType, Ref, toRef } from 'vue'
import { useI18n } from 'vue-i18n'
import { keyBy } from 'lodash'
import Styles from './dag.module.scss'
import {
  NTooltip,
  NIcon,
  NButton,
  useMessage,
  NSelect,
  NPopover,
  NText,
  NTag
} from 'naive-ui'
import {
  SearchOutlined,
  DownloadOutlined,
  FullscreenOutlined,
  FullscreenExitOutlined,
  InfoCircleOutlined,
  FormatPainterOutlined,
  CopyOutlined,
  DeleteOutlined,
  RightCircleOutlined,
  FundViewOutlined,
  SyncOutlined
} from '@vicons/antd'
import { useNodeSearch, useTextCopy, useTaskEdit } from './dag-hooks'
import { DataUri } from '@antv/x6'
import { useFullscreen } from '@vueuse/core'
import { useRoute, useRouter } from 'vue-router'
import { useThemeStore } from '@/store/theme/theme'
import type { Graph } from '@antv/x6'
import StartupParam from './dag-startup-param'
import VariablesView from '@/views/projects/workflow/instance/components/variables-view'
import { WorkflowDefinition, WorkflowInstance, TaskDefinition } from './types'

const props = {
  layoutToggle: {
    type: Function as PropType<(bool?: boolean) => void>,
    default: () => {}
  },
  // If this prop is passed, it means from definition detail
  instance: {
    type: Object as PropType<WorkflowInstance>,
    default: null
  },
  definition: {
    // The same as the structure responsed by the queryProcessDefinitionByCode api
    type: Object as PropType<WorkflowDefinition>,
    default: null
  }
}

export default defineComponent({
  name: 'workflow-dag-toolbar',
  props,
  emits: ['versionToggle', 'saveModelToggle', 'removeTasks', 'refresh'],
  setup(props, context) {
    const { t } = useI18n()

    const themeStore = useThemeStore()
    const message = useMessage()

    const graph = inject<Ref<Graph | undefined>>('graph', ref())
    const router = useRouter()
    const route = useRoute()
    const { processDefinition } = useTaskEdit({
      graph,
      definition: toRef(props, 'definition')
    })

    /**
     * Node search and navigate
     */
    const {
      searchSelectValue,
      navigateTo,
      toggleSearchInput,
      searchInputVisible,
      reQueryNodes,
      nodesDropdown
    } = useNodeSearch({ graph })

    /**
     * Download Workflow Image
     * @param {string} fileName
     * @param {string} bgColor
     */
    const downloadPNG = (options = { fileName: 'dag', bgColor: '#f2f3f7' }) => {
      const { fileName, bgColor } = options
      graph.value?.toPNG(
        (dataUri: string) => {
          DataUri.downloadDataUri(dataUri, `${fileName}.png`)
        },
        {
          padding: {
            top: 50,
            right: 50,
            bottom: 50,
            left: 50
          },
          backgroundColor: bgColor
        }
      )
    }

    /**
     * Toggle fullscreen
     */
    const { isFullscreen, toggle } = useFullscreen()

    /**
     * Open workflow version modal
     */
    const openVersionModal = () => {
      context.emit('versionToggle', true)
    }

    /**
     * Open DAG format modal
     */
    const onFormat = () => {
      props.layoutToggle(true)
    }

    /**
     * Back to the entrance
     */
    const onClose = () => {
      if (history.state.back !== '/login') {
        router.go(-1)
        return
      }
      if (history.state.current.includes('workflow/definitions')) {
        router.push({
          path: `/projects/${route.params.projectCode}/workflow-definition`
        })
        return
      }
      if (history.state.current.includes('workflow/instances')) {
        router.push({
          path: `/projects/${route.params.projectCode}/workflow/instances`
        })
        return
      }
    }
    const nextToTask = () => {
      if (processDefinition.value) {
        const { taskDefinitionList, processTaskRelationList } =
          processDefinition.value
        const relationMap = keyBy(processTaskRelationList, 'postTaskCode')
        for (const taskItem of taskDefinitionList) {
          const relation = relationMap[taskItem.code]
          if (!relation.preTaskCode && taskItem.taskType !== 'SUB_PROCESS') {
            message.warning(`${taskItem.name} 节点未完成流程绑定`)
            return
          }
        }
      }
      router.push({
        path: `/assessmentTask/projects/${route.query.evaluationEngineeringId}`,
        query: {
          evaluationEngineeringId: route.query.evaluationEngineeringId,
          type: 'evaluationPlan',
          projectCode: route.query.projectCode,
          taskid: route.query.taskId
        }
      })
    }

    /**
     *  Copy workflow name
     */
    const { copy } = useTextCopy()

    /**
     * Delete selected edges and nodes
     */
    const removeCells = () => {
      if (graph.value) {
        const cells = graph.value.getSelectedCells()
        if (cells) {
          const codes = cells
            .filter((cell) => cell.isNode())
            .map((cell) => +cell.id)
          context.emit('removeTasks', codes, cells)
          graph.value?.removeCells(cells)
        }
      }
    }

    return () => (
      <div
        class={[
          Styles.toolbar,
          Styles[themeStore.darkTheme ? 'toolbar-dark' : 'toolbar-light']
        ]}
      >
        <span class={Styles['workflow-name']}>
          {/* {route.name === 'workflow-instance-detail'
            ? props.instance?.name
            : props.definition?.processDefinition?.name ||
              t('project.dag.create')} */}
        </span>
        <div class={Styles['toolbar-right-part']}>
          {/* <NButton secondary onClick={nextToTask} type='info'>
            {'下一步'}
          </NButton> */}
          {/* Return to previous page */}
          <NButton secondary onClick={onClose} class='btn-close'>
            {'返回'}
          </NButton>
        </div>
      </div>
    )
  }
})
