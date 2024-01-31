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

import { SearchOutlined } from '@vicons/antd'
import {
  NButton,
  NDataTable,
  NIcon,
  NInput,
  NDatePicker,
  NPagination,
  NSpace,
  DataTableRowKey,
  NSelect
} from 'naive-ui'
import {
  defineComponent,
  getCurrentInstance,
  onMounted,
  toRefs,
  watch,
  ref,
  reactive
} from 'vue'
import { useI18n } from 'vue-i18n'
import { useTable } from './use-table'
import Card from '@/components/card'
import ProjectModal from './components/modal'
import { useRoute, useRouter } from 'vue-router'
import IndicatorModal from '@/components/page-header'
import { taskDetailById } from '@/service/modules/assessment'
import { RowData } from 'naive-ui/es/data-table/src/interface'

const list = defineComponent({
  name: 'projects',
  setup() {
    const { t } = useI18n()
    const { variables, getTableData, createColumns, handleDelete } = useTable()
    const route = useRoute()
    const router = useRouter()
    // 成功 7 失败 6 已停止 5  运行 1 
    const stateOptions = ref([
      { value: '7', label: '成功' },
      { value: '6', label: '失败' },
      { value: '1', label: '运行' },
      { value: '5', label: '已停止' }
    ])
    let taskDetailData = ref<any>({})
    const checkedRowKeysRef = ref<DataTableRowKey[]>([])
    const requestData = async () => {
      taskDetailData.value = await taskDetailById(Number(route.query.taskid))
      console.log(taskDetailData.value, 'onCancelModal')

      getTableData({
        taskId: route.query.taskid || 1,
        pageSize: variables.pageSize,
        pageNo: variables.page,
        instanceName: variables.instanceName,
        taskName: variables.taskName,
        startRange: variables.startRange,
        endRange: variables.endRange,
        state: variables.state
      })
    }

    const handleModalChange = () => {
      variables.showModalRef = true
      variables.statusRef = 0
    }

    const handleDelBatch = () => {
      handleDelete(checkedRowKeysRef.value.join())
    }

    const handleCheck = (rowKeys: DataTableRowKey[]) => {
      checkedRowKeysRef.value = rowKeys
    }

    const handleSearch = () => {
      variables.page = 1
      requestData()
    }

    const onClearSearch = () => {
      variables.page = 1
      getTableData({
        taskId: route.query.taskid || 1,
        pageSize: variables.pageSize,
        pageNo: variables.page
      })
    }

    const onCancelModal = () => {
      variables.showModalRef = false
    }

    const onConfirmModal = () => {
      variables.showModalRef = false
      requestData()
    }

    const handleChangePageSize = () => {
      variables.page = 1
      requestData()
    }
    const handleBack = () => {
      router.back()
    }
    const trim = getCurrentInstance()?.appContext.config.globalProperties.trim

    onMounted(() => {
      createColumns(variables)
      requestData()
    })

    watch(useI18n().locale, () => {
      createColumns(variables)
    })
    return {
      t,
      ...toRefs(variables),
      requestData,
      handleModalChange,
      handleSearch,
      onCancelModal,
      onConfirmModal,
      onClearSearch,
      handleChangePageSize,
      trim,
      taskDetailData,
      handleBack,
      handleCheck,
      handleDelBatch,
      checkedRowKeys: checkedRowKeysRef,
      stateOptions
    }
  },
  render() {
    const { t, loadingRef } = this
    return (
      <NSpace vertical>
        <Card>
          <IndicatorModal
            active={'instance'}
            taskNum={this.taskDetailData.evaluationTaskNum}
            planNum={this.taskDetailData.evaluationPlanNum}
            systemNum={this.taskDetailData.indicatorSystemNum}
            instanceNum={this.taskDetailData.evaluationTaskInstanceNum}
            onHandleBack={this.handleBack}
          ></IndicatorModal>
        </Card>
        <Card>
          <NSpace justify='space-between'>
            <NSpace>
              <NButton
                size='small'
                onClick={this.handleDelBatch}
                type='error'
                disabled={this.checkedRowKeys.length > 0 ? false : true}
                class='btn-create-project'
              >
                {t('assessmenttaskinstance.button.delete')}
              </NButton>
            </NSpace>

            <NSpace>
              <NInput
                allowInput={this.trim}
                size='small'
                v-model={[this.instanceName, 'value']}
                placeholder='请输入评估任务实例名称'
                clearable
              />
              <NInput
                allowInput={this.trim}
                size='small'
                v-model={[this.taskName, 'value']}
                placeholder='请输入任务名称'
                clearable
              />
              <NSelect
                style={{ width: '200px' }}
                size='small'
                v-model={[this.state, 'value']}
                placeholder='请选择任务状态'
                options={this.stateOptions}
                clearable
              />
              <NDatePicker
                size='small'
                v-model={[this.startRange, 'value']}
                start-placeholder='开始时间'
                end-placeholder='选择年月日'
                type='daterange'
                clearable
              />
              <NDatePicker
                size='small'
                v-model={[this.endRange, 'value']}
                start-placeholder='结束时间'
                end-placeholder='选择年月日'
                type='daterange'
                clearable
              />
              <NButton size='small' type='primary' onClick={this.handleSearch}>
                <NIcon>
                  <SearchOutlined />
                </NIcon>
              </NButton>
            </NSpace>
          </NSpace>
        </Card>


        <Card title={'评估任务实例列表'}>
          <NSpace vertical>
            <NDataTable
              loading={loadingRef}
              columns={this.columns}
              data={this.tableData}
              scrollX={this.tableWidth}
              row-class-name='items'
              rowKey={(row: RowData) => row.id}
              on-update:checked-row-keys={this.handleCheck}
            />
            <NSpace justify='center'>
              <NPagination
                v-model:page={this.page}
                v-model:page-size={this.pageSize}
                page-count={this.totalPage}
                show-size-picker
                page-sizes={[10, 30, 50]}
                show-quick-jumper
                onUpdatePage={this.requestData}
                onUpdatePageSize={this.handleChangePageSize}
              />
            </NSpace>
          </NSpace>
        </Card>
        <ProjectModal
          showModalRef={this.showModalRef}
          statusRef={this.statusRef}
          row={this.row}
          onCancelModal={this.onCancelModal}
          onConfirmModal={this.onConfirmModal}
        />
      </NSpace>
    )
  }
})

export default list
