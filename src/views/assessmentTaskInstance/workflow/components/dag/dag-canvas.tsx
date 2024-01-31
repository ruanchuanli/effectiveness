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

import {
  NButton
} from 'naive-ui'
import { defineComponent, ref, inject, provide, toRef,PropType } from 'vue'
import Styles from './dag.module.scss'
import FileSaver from 'file-saver'
import { useCanvasInit, useCellActive } from './dag-hooks'
import { useRoute, useRouter } from 'vue-router'
import { downloadReport } from '@/service/modules/assessmenttaskinstance'

const props = {
  taskProcessInstanceState: {
    type: Number as PropType<number>,
    default: null
  }
}
export default defineComponent({
  name: 'workflow-dag-canvas',
  props,
  emits: ['drop','stop'],
  setup(props, context) {

    const readonly = inject('readonly', ref(false))
    const graph = inject('graph', ref())
    const route = useRoute()
    const router = useRouter()
    const btnArr = ref([0, 1, 2, 3])

    const { paper, minimap, container } = useCanvasInit({ readonly, graph })
    // Change the style on cell hover and select
    useCellActive({ graph })
    const preventDefault = (e: DragEvent) => {
      e.preventDefault()
    }

    const onStop = () => {
      context.emit('stop')
    }

    const viewReport = () => {
      downloadReport(route.params.id as string).then((res: string | Blob) => {
        FileSaver.saveAs(res, `${route.query.name}.pdf`)
       })
    }

    return () => (
      <div
        ref={container}
        class={[Styles.canvas, 'dag-container']}
        onDrop={(e) => {
          context.emit('drop', e)
        }}
        onDragenter={preventDefault}
        onDragover={preventDefault}
        onDragleave={preventDefault}
      >
        <div ref={paper} class={Styles.paper}></div>
        <div ref={minimap} class={Styles.minimap}></div>
        <div class={Styles.canvasMeun}>
          {props.taskProcessInstanceState == 7 ?
            <NButton type="primary" onClick={viewReport} ghost>
              查看报告
            </NButton> : btnArr.value.includes(props.taskProcessInstanceState) ?
              <NButton type="primary" onClick={onStop} ghost>
                停止
              </NButton> : ''
          }
        </div>
      </div>
    )
  }
})
