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

import { defineComponent, ref } from 'vue'
import {
  TaskType,
  TASK_TYPES_MAP
} from '@/views/projects/task/constants/task-type'
import styles from './dag.module.scss'
import { getOperatorTree } from '@/service/modules/assessmentPlan'

import { MenuNodeProps, MenuOption, NMenu } from 'naive-ui'

export default defineComponent({
  name: 'workflow-dag-sidebar',
  emits: ['dragStart'],
  setup(props, context) {
    // const allTaskTypes = Object.keys(TASK_TYPES_MAP).map((type) => ({
    //   type,
    //   ...TASK_TYPES_MAP[type as TaskType]
    // }))
    let allTaskTypes = ref([] as any[])
    getOperatorTree().then((res: any[]) => {
      allTaskTypes.value = res
    })

    const createItemNode = (options: any) => {
      if (options.operatorType && options.id ) {
        return {
          class: `${styles.draggable} task-item-${options.type}`,
          draggable: 'true' as any,
          onDragstart: (e: any) => {
            console.log(e, options.type, options, '-----------------');
            if (options.operatorType) {

              context.emit('dragStart', e, "SHELL", options, options.operatorName, options.id)
            } else {
              return
            }
          }
        } as any
      } else {
        return {
          draggable: 'false' as any,
        }
      }


    }

    return () => (
      <div class={styles.sidebar}>
        <NMenu
          options={allTaskTypes.value}
          keyField='id'
          labelField='operatorName'
          nodeProps={createItemNode}
        />
        {/* // {allTaskTypes.map((task: any) => (
          // <div
          //   class={[styles.draggable, `task-item-${task.type}`]}
          //   draggable='true'
          //   onDragstart={(e) => {
          //     context.emit('dragStart', e, task.type as TaskType)
          //   }}
          // >
          //   <em
          //     class={[
          //       styles['sidebar-icon'],
          //       styles['icon-' + task.type.toLocaleLowerCase()]
          //     ]}
          //   />
          //   <span>{task.alias}</span>
          // </div>
        // ))} */}
      </div>
    )
  }
})
