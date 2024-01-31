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
  DataTableRowKey
} from 'naive-ui'
import {
  defineComponent,
  getCurrentInstance,
  onMounted,
  toRefs,
  watch,
  ref
} from 'vue'
import { useI18n } from 'vue-i18n'
import { useTable } from './use-table'
import Card from '@/components/card'
import TaskModal from './components/modal'
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
    const taskDetailData = ref<any>({})
    const checkedRowKeysRef = ref<DataTableRowKey[]>([])
    const requestData = async () => {
      taskDetailData.value = await taskDetailById(Number(route.query.taskid))

      getTableData({
        pageSize: variables.pageSize,
        pageNo: variables.page,
        evaluationTaskName: variables.evaluationTaskName,
        createdRange: variables.createdRange,
        taskId: variables.taskId
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
        pageSize: variables.pageSize,
        pageNo: variables.page,
        taskId: variables.taskId
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
      // console.log(';333');
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
      checkedRowKeys: checkedRowKeysRef
    }
  },
  render() {
    const { t, loadingRef } = this
    return (
      <NSpace vertical>
        <Card>
          <IndicatorModal
            active={'task'}
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
                onClick={this.handleModalChange}
                type='primary'
                class='btn-create-project'
              >
                {t('assessmenttask.button.create')}
              </NButton>
              <NButton
                size='small'
                onClick={this.handleDelBatch}
                type='error'
                disabled={this.checkedRowKeys.length > 0 ? false : true}
                class='btn-create-project'
              >
                {t('assessmenttask.button.delete')}
              </NButton>
            </NSpace>
            <NSpace>
              <NInput
                allowInput={this.trim}
                size='small'
                v-model={[this.evaluationTaskName, 'value']}
                placeholder={t('assessmenttask.projects.tips_name')}
                clearable
              // onClear={this.onClearSearch}
              />
              <NDatePicker
                size='small'
                v-model={[this.createdRange, 'value']}
                placeholder={t('assessmentplan.projects.tips_created')}
                type='daterange'
                clearable
              // onClear={this.onClearSearch}
              />
              <NButton size='small' type='primary' onClick={this.handleSearch}>
                <NIcon>
                  <SearchOutlined />
                </NIcon>
              </NButton>
            </NSpace>
          </NSpace>
        </Card>

        <Card title={'评估任务列表'}>
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
        <TaskModal
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
