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

import { SearchOutlined, ArrowLeftOutlined } from '@vicons/antd'
import {
  NButton,
  NDataTable,
  NIcon,
  NInput,
  NDatePicker,
  NPagination,
  NSpace,
  NSteps,
  NStep,
  NEmpty,
  NGrid,
  NGridItem
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
interface RouterInfo {
  id: number
  name: string
}
const list = defineComponent({
  name: 'tasks',
  setup() {
    const route = useRoute()
    const router = useRouter()
    const { t } = useI18n()
    const { variables, getTableData, createColumns } = useTable()
    const routerInfo = ref<RouterInfo[]>([])

    const handleBack = () => {
      router.back()
    }

    const requestData = () => {
      getTableData({
        pageSize: variables.pageSize,
        pageNo: variables.page,
        evaluationEngineeringId: variables.evaluationEngineeringId,
        taskName: variables.taskName,
        taskBasis: variables.taskBasis,
        taskDateRange: variables.taskDateRange
      })
    }

    const handleModalChange = () => {
      variables.showModalRef = true
      variables.statusRef = 0
    }

    const handleSearch = () => {
      variables.page = 1
      requestData()
    }

    const onClearSearch = () => {
      variables.page = 1
      getTableData({
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

    const trim = getCurrentInstance()?.appContext.config.globalProperties.trim
    onMounted(() => {
      let arr = JSON.parse(localStorage.getItem('assessment_steps') || '[]')
      if (arr.length > 1) {
        arr = arr.slice(0, 1)
      }
      //��ȡ
      routerInfo.value = arr
      variables.evaluationEngineeringId = +route.params.id
      createColumns(variables)
      requestData()
    })

    watch(useI18n().locale, () => {
      createColumns(variables)
    })
    return {
      t,
      ...toRefs(variables),
      handleBack,
      requestData,
      handleModalChange,
      handleSearch,
      onCancelModal,
      onConfirmModal,
      onClearSearch,
      handleChangePageSize,
      trim,
      routerInfo
    }
  },
  render() {
    const { t, loadingRef } = this

    return (
      <NSpace vertical>
        <NGrid class='current-page-header' cols={1}>
          <NGridItem class='n-grid-item'>
            <div class='title'>
              <NButton onClick={this.handleBack} class='btn-back'>
                <NIcon size='20' component={ArrowLeftOutlined}></NIcon>
              </NButton>
              {this.routerInfo.map((opt, index) => (
                <span class='title-span' key={index}>
                  {opt.name}
                </span>
              ))}
            </div>
            <div class='desc'></div>
          </NGridItem>
        </NGrid>
        <NSpace vertical>
          <Card>
            <NSpace justify='space-between'>
              <NButton
                size='small'
                onClick={this.handleModalChange}
                type='primary'
                class='btn-create-project'
              >
                {t('assessment.button.create_task')}
              </NButton>
              <NSpace>
                <NInput
                  allowInput={this.trim}
                  size='small'
                  v-model={[this.taskName, 'value']}
                  placeholder={t('assessment.tasks.tips_task_name')}
                  clearable
                  onClear={this.onClearSearch}
                />
                <NInput
                  allowInput={this.trim}
                  size='small'
                  v-model={[this.taskBasis, 'value']}
                  placeholder={t('assessment.tasks.tips_task_basis')}
                  clearable
                  onClear={this.onClearSearch}
                />
                <NDatePicker
                  size='small'
                  v-model={[this.taskDateRange, 'value']}
                  placeholder={t('assessment.tasks.tips_task_time')}
                  type='daterange'
                  clearable
                  onClear={this.onClearSearch}
                />
                <NButton
                  size='small'
                  type='primary'
                  onClick={this.handleSearch}
                >
                  <NIcon>
                    <SearchOutlined />
                  </NIcon>
                </NButton>
              </NSpace>
            </NSpace>
          </Card>
          {!this.tableData || this.tableData.length === 0 ? (
            <Card class='task-no-data'>
              <NEmpty ></NEmpty>
              <Card class='steps-card'>
                <NSteps>
                  <NStep
                    title={t('assessment.tasks.step1_title')}
                    description={t('assessment.tasks.step1_desc')}
                  ></NStep>
                  <NStep
                    title={t('assessment.tasks.step2_title')}
                    description={t('assessment.tasks.step2_desc')}
                  ></NStep>
                  <NStep
                    title={t('assessment.tasks.step3_title')}
                    description={t('assessment.tasks.step3_desc')}
                  ></NStep>
                  <NStep
                    title={t('assessment.tasks.step4_title')}
                    description={t('assessment.tasks.step4_desc')}
                  ></NStep>
                </NSteps>
                <Card class='button-card'>
                  <NButton
                    type='primary'
                    size='small'
                    onClick={this.handleModalChange}
                  >
                    {t('assessment.button.create_task')}
                  </NButton>
                </Card>
              </Card>
            </Card>
          ) : (
            <Card title={t('assessment.tasks.list_name')}>
              <NSpace vertical>
                <NDataTable
                  loading={loadingRef}
                  columns={this.columns}
                  data={this.tableData}
                  scrollX={this.tableWidth}
                  row-class-name='items'
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
          )}

          <TaskModal
            showModalRef={this.showModalRef}
            statusRef={this.statusRef}
            row={this.row}
            evaluationEngineeringId={this.evaluationEngineeringId}
            onCancelModal={this.onCancelModal}
            onConfirmModal={this.onConfirmModal}
          />
        </NSpace>
      </NSpace>
    )
  }
})

export default list
