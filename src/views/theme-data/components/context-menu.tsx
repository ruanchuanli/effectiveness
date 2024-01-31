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

import { defineComponent, onMounted, PropType, onUnmounted } from 'vue'
import styles from './index.module.scss'
import { NButton } from 'naive-ui'

const props = {
  editDisplay: {
    type: Boolean as PropType<boolean>,
    default: false
  },
  visible: {
    type: Boolean as PropType<boolean>,
    default: true
  },
  left: {
    type: Number as PropType<number>,
    default: 0
  },
  top: {
    type: Number as PropType<number>,
    default: 0
  }
}

export default defineComponent({
  name: 'context-menu',
  props,
  emits: ['hide', 'addData', 'editSubTable', 'editData'],
  setup(props, ctx) {
    const hide = () => {
      ctx.emit('hide', false)
    }

    const addData = () => {
      ctx.emit('addData')
    }

    const editSubTable = () => {
      ctx.emit('editSubTable')
    }

    const editData = () => {
      ctx.emit('editData')
    }

    onMounted(() => {
      document.addEventListener('click', hide)
    })

    onUnmounted(() => {
      document.removeEventListener('click', hide)
    })

    return { addData, editSubTable, editData }
  },
  render() {
    return (
      this.visible && (
        <div
          class={styles['dag-context-menu']}
          style={{ left: `${this.left}px`, top: `${this.top}px` }}
        >
          {this.editDisplay && (
            <NButton class={`${styles['menu-item']}`} onClick={this.editData}>
              编辑模式
            </NButton>
          )}
          <NButton class={`${styles['menu-item']}`} onClick={this.addData}>
            新增数据
          </NButton>
          <NButton class={`${styles['menu-item']}`} onClick={this.editSubTable}>
            设计模式
          </NButton>
        </div>
      )
    )
  }
})
