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
  NInput,
  NDatePicker,
  NPagination,
  NSpace,
  NGrid,
  NGridItem,
  NIcon
} from 'naive-ui'
import {
  defineComponent,
  getCurrentInstance,
  onMounted,
  toRefs,
  watch,
  ref
} from 'vue'
import { taskDetailById } from '@/service/modules/assessment'
import type { TaskPageData } from '@/service/modules/assessment/type'
import { useI18n } from 'vue-i18n'
import { useTable } from './use-table'
import Card from '@/components/card'
import IndicatorModal from './components/modal'
import PageHeader from '@/components/page-header'

import { useRoute, useRouter } from 'vue-router'

interface RouterInfo {
  id: number
  name: string
}
const list = defineComponent({
  name: 'indicators',
  setup() {
    const route = useRoute()
    const router = useRouter()
    const { t } = useI18n()
    const { variables, getTableData, createColumns } = useTable()
    const routerInfo = ref<RouterInfo[]>([])
    const taskDetailData = ref<TaskPageData>()

    const handleBack = () => {
      router.back()
    }
    const toQuest = () => {
      // 去哪儿
      router.push({
        path: `/assessmentPlan/projects/${route.params.id}`,
        query: {
          evaluationEngineeringId: route.query.evaluationEngineeringId,
          type: route.query.type,
          projectCode: route.query.projectCode,
          taskid: route.params.id
        }
      })
    }
    const requestData = async () => {
      taskDetailData.value = await taskDetailById(variables.taskId)
      getTableData({
        pageSize: variables.pageSize,
        pageNo: variables.page,
        taskId: variables.taskId,

        indicatorSystemName: variables.indicatorSystemName,
        indicatorSystemDesc: variables.indicatorSystemDesc,
        createDateRange: variables.createDateRange
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
        taskId: variables.taskId,
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
    const onNextModal = () => {
      variables.showModalRef = false
      requestData()
      handleSkipClick()
    }

    const handleSkipClick = () => {
      router.push({
        path: '/assessment/workflow/definition',
        query: {}
      })
    }

    const handleChangePageSize = () => {
      variables.page = 1
      requestData()
    }

    const trim = getCurrentInstance()?.appContext.config.globalProperties.trim

    onMounted(() => {
      let arr = JSON.parse(localStorage.getItem('assessment_steps') || '[]')
      if (arr.length > 2) {
        arr = arr.slice(0, 2)
      }
      //��ȡ
      routerInfo.value = arr
      variables.taskId = +route.params.id
      variables.evaluationEngineeringId = +(
        route.query.evaluationEngineeringId ?? 0
      )
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
      onNextModal,
      onClearSearch,
      handleChangePageSize,
      trim,
      routerInfo,
      taskDetailData,
      toQuest
    }
  },
  render() {
    const { t, loadingRef } = this

    return (
      <NSpace vertical>
        {/* <NGrid class='current-page-header' cols={8}>
          <NGridItem class='n-grid-item' span={4}>
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
          <NGridItem class='n-grid-item ngi-data active'   >
            <div class='title' >
              {t('assessment.tasks.column_indicator_system_num')}
            </div>
            <div class='desc'>{this.taskDetailData?.indicatorSystemNum}</div>
          </NGridItem>
          <NGridItem class='n-grid-item ngi-data'>
            <div onClick={this.toQuest}>
              <div class='title'>
                {t('assessment.tasks.column_evaluation_plan_num')}
              </div>
              <div class='desc'>{this.taskDetailData?.evaluationPlanNum}</div>
            </div>

          </NGridItem>
          <NGridItem class='n-grid-item ngi-data'>
            <div class='title'>
              {t('assessment.tasks.column_evaluation_task_num')}
            </div>
            <div class='desc'>{this.taskDetailData?.evaluationTaskNum}</div>
          </NGridItem>
          <NGridItem class='n-grid-item ngi-data'>
            <div class='title'>
              {t('assessment.tasks.column_evaluation_task_instance_num')}
            </div>
            <div class='desc'>
              {this.taskDetailData?.evaluationTaskInstanceNum}
            </div>
          </NGridItem>
        </NGrid> */}
        <Card>
          <PageHeader
            active={'system'}
            planNum={this.taskDetailData?.evaluationPlanNum}
            taskNum={this.taskDetailData?.evaluationTaskNum}
            systemNum={this.taskDetailData?.indicatorSystemNum}
            instanceNum={this.taskDetailData?.evaluationTaskInstanceNum}
            onHandleBack={this.handleBack}
          ></PageHeader>
        </Card>
        <NSpace vertical>
          <Card>
            <NSpace justify='space-between'>
              <NButton
                size='small'
                onClick={this.handleModalChange}
                type='primary'
                class='btn-create-project'
              >
                {t('assessment.button.create_indicator')}
              </NButton>
              <NSpace>
                <NInput
                  allowInput={this.trim}
                  size='small'
                  v-model={[this.indicatorSystemName, 'value']}
                  placeholder={t(
                    'assessment.indicators.tips_indicatorSystemName'
                  )}
                  clearable
                // onClear={this.onClearSearch}
                />
                <NInput
                  allowInput={this.trim}
                  size='small'
                  v-model={[this.indicatorSystemDesc, 'value']}
                  placeholder={t(
                    'assessment.indicators.tips_indicatorSystemDesc'
                  )}
                  clearable
                // onClear={this.onClearSearch}
                />
                <NDatePicker
                  size='small'
                  v-model={[this.createDateRange, 'value']}
                  placeholder={t('assessment.tasks.tips_createTime')}
                  type='daterange'
                  clearable
                // onClear={this.onClearSearch}
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
          <Card title={t('assessment.indicators.list_name')}>
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

          <IndicatorModal
            showModalRef={this.showModalRef}
            statusRef={this.statusRef}
            row={this.row}
            taskId={this.taskId}
            evaluationEngineeringId={this.evaluationEngineeringId}
            onCancelModal={this.onCancelModal}
            onConfirmModal={this.onConfirmModal}
            onNextModal={this.onNextModal}
          />
        </NSpace>
      </NSpace>
    )
  }
})

export default list
