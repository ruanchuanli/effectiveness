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

import { ref } from 'vue'
import type { Ref } from 'vue'
import type { Graph } from '@antv/x6'
import { genTaskCodeList } from '@/service/modules/task-definition'
import { Coordinate, Dragged } from './types'
import { TaskType } from '@/views/projects/task/constants/task-type'
import { useRoute } from 'vue-router'

interface Options {
  readonly: Ref<boolean>
  graph: Ref<Graph | undefined>
  appendTask: (
    code: number,
    type: TaskType,
    options: Dragged['options'],
    coor: Coordinate,
    name?: string,
    operatorId?: string | number
  ) => void
}

/**
 * Sidebar item drag && drop in canvas
 */
export function useDagDragAndDrop(options: Options) {
  const { readonly, graph, appendTask } = options

  const route = useRoute()
  const projectCode = Number(route.params.projectCode)

  // The element currently being dragged up
  const dragged = ref<Dragged>({
    x: 0,
    y: 0,
    type: 'SHELL',
    options: { type: 'SHELL', localParams: [], rawScript: '' },
    name: '',
    operatorId: ''
  })

  function onDragStart(
    e: DragEvent,
    type: TaskType,
    options: Dragged['options'],
    name: Dragged['name'],
    operatorId: string | number
  ) {
    console.log(e, type, options, 'e');

    if (readonly.value) {
      e.preventDefault()
      return
    }

    dragged.value = {
      x: e.offsetX,
      y: e.offsetY,
      type: type,
      options,
      name,
      operatorId
    }
  }

  function onDrop(e: DragEvent) {
    e.stopPropagation()
    e.preventDefault()
    if (readonly.value) {
      return
    }
    if (dragged.value && graph.value) {
      const { type, x: eX, y: eY, options, name, operatorId } = dragged.value
      const { x, y } = graph.value.clientToLocal(e.clientX, e.clientY)
      const genNums = 1

      genTaskCodeList(genNums, projectCode).then((res) => {
        const [code] = res
        appendTask(code, type, options, { x: x - eX, y: y - eY }, name, operatorId)
      })


    }
  }

  const preventDefault = (e: DragEvent) => {
    e.preventDefault()
  }

  return {
    onDragStart,
    onDrop,
    onDragenter: preventDefault,
    onDragover: preventDefault,
    onDragleave: preventDefault
  }
}
