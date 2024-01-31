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

import { defineComponent, ref, inject, renderSlot } from 'vue'
import Styles from './dag.module.scss'
import { useCanvasInit, useCellActive } from './dag-hooks'
import {
  NTooltip,
  NIcon,
  NButton,
  NSelect,
  NPopover,
  NText,
  NTag,
  NButtonGroup,
  useMessage
} from 'naive-ui'
import { useFullscreen } from '@vueuse/core'
export default defineComponent({
  name: 'workflow-dag-canvas',
  emits: ['drop', 'AddPointer', 'editPointer', 'delPointer', 'AutomaticArrangement', 'FullScreen'],
  setup(props, context) {
    const readonly = inject('readonly', ref(false))
    const graph = inject('graph', ref())

    const { paper, minimap, container } = useCanvasInit({ readonly, graph })

    // Change the style on cell hover and select
    useCellActive({ graph })
    const preventDefault = (e: DragEvent) => {
      e.preventDefault()
    }
    const AddPointer = () => {
      // 添加指标
      context.emit('AddPointer')
    }
    const editPointer = () => {
      // 编辑指标
      context.emit('editPointer')
    }
    const delPointer = () => {
      //删除
      if (graph.value) {
        const cells = graph.value.getSelectedCells()
        if (cells) {
          const codes = cells
            .filter((cell: any) => cell.isNode())
            .map((cell: any) => +cell.id)
          context.emit('delPointer', codes, cells)
          graph.value?.removeCells(cells)
        }
      }
      // context.emit('delPointer')
    }
    const AutomaticArrangement = () => {
      // 自动
      context.emit('AutomaticArrangement', true)
    }
    const { isFullscreen, toggle } = useFullscreen()

    return () => (
      <div
        ref={container}
        class={[Styles.canvas, 'dag-container']}
        onDrop={(e) => {
          console.log(e, "cav");

          context.emit('drop', e)
        }}
        onDragenter={preventDefault}
        onDragover={preventDefault}
        onDragleave={preventDefault}
      >
        <div ref={paper} class={Styles.paper}></div>
        <div ref={minimap} class={Styles.minimap}></div>
        <div class={Styles.canvasMeun}>
          <NButtonGroup>
            <NButton type="primary" onClick={AddPointer} ghost>
              添加指标
            </NButton>
            {/* <NButton type="primary" onClick={editPointer} ghost>
              编辑指标
            </NButton> */}
            <NButton type="primary" onClick={delPointer} ghost>
              删除
            </NButton>
            <NButton type="primary" onClick={AutomaticArrangement} ghost>
              自动排列
            </NButton>
            <NButton type="primary" onClick={toggle} ghost>
              全屏
            </NButton>
          </NButtonGroup>

        </div>
      </div>
    )
  }
})
