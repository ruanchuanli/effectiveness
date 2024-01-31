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
  NButton,
  NInput,
  NSpace,
  NSelect,
  NFormItem,
  NTree,
  useMessage,
  TreeOption
} from 'naive-ui'
import { defineComponent, onMounted, ref, reactive } from 'vue'
import { useI18n } from 'vue-i18n'
import Card from '@/components/card'
import { useRoute, useRouter } from 'vue-router'
import BarChart from '@/components/chart/modules/Bar'
import Styles from './index.module.scss'
import {
  getCaiculatedCompare,
  getCaiculatedDataSet
} from '@/service/modules/assessmenttaskinstance'

const list = defineComponent({
  name: 'projects',
  setup() {
    const { t } = useI18n()
    const message = useMessage()
    const router = useRouter()
    const route = useRoute()
    const evaluationInstanceId = ref(
      Number(route.params.id) as number | null | string
    )
    const evaluationTaskId = ref(Number(route.params.evaluationTaskId))
    const instanceOptions = ref([])
    const targetOptions = ref([] as any)
    const treeData = ref([] as any)
    const defaultCheckedKey = ref([] as any)

    // 变量
    const variables = reactive({
      pattern: '',
      taskDefinitionCode: defaultCheckedKey,
      evaluationTarget: {
        instanceId: evaluationInstanceId.value,
        targetIds: [] as any
      },
      evaluationTaskInstance: {
        instanceIds: [evaluationInstanceId.value],
        targetIds: [] as any
      }
    })

    // 生命周期
    onMounted(() => {
      initDataSet()
    })

    // 初始化数据
    const initDataSet = () => {
      getCaiculatedDataSet({ evaluationTaskId: evaluationTaskId.value }).then(
        (res: {
          currentEvaluationTaskInstanceList: never[]
          treeNodeList: { code: any }[]
          evaluationTargetList: string[]
        }) => {
          instanceOptions.value = res.currentEvaluationTaskInstanceList
          treeData.value = res.treeNodeList
          const tempArr = ref([] as any)
          let tempObj: { label: string; value: string }
          res.evaluationTargetList.map((item: string) => {
            tempObj = {
              label: item,
              value: item
            }
            tempArr.value.push(tempObj)
          })
          targetOptions.value = tempArr.value
          defaultCheckedKey.value.push(res.treeNodeList[0]?.code)
          variables.evaluationTarget.targetIds = targetOptions.value.map(
            (item: { value: any }) => item.value
          )
          variables.evaluationTaskInstance.targetIds = targetOptions.value.map(
            (item: { value: any }) => item.value
          )
          handleSearch(0)
          handleSearch(1)
        }
      )
    }

    // 返回上一页
    const onClose = () => {
      router.go(-1)
    }

    const xAxisData = ref([] as string[])
    const seriesData = ref([] as any)

    const xAxisData1 = ref([] as string[])
    const seriesData1 = ref([] as number[])

    // 点击搜索
    const handleSearch = (flag: number) => {
      if (variables.taskDefinitionCode.length <= 0) {
        message.warning('请选择指标名称')
        return
      }
      if (flag) {
        if (!variables.evaluationTarget.instanceId) {
          message.warning('请选择评估任务实例')
          return
        }
        if (variables.evaluationTarget.targetIds.length <= 0) {
          message.warning('请选择评估对象')
          return
        }
        const formData = new FormData()
        formData.append(
          'evaluationTaskInstanceIds',
          variables.evaluationTarget.instanceId!.toString()
        )
        formData.append(
          'evaluationTargets',
          variables.evaluationTarget.targetIds.join()
        )
        formData.append(
          'taskDefinitionCode',
          variables.taskDefinitionCode.join()
        )
        xAxisData1.value = []
        seriesData1.value = []
        getCaiculatedCompare(formData).then((res: any) => {
          res[0].map((item: any) => {
            xAxisData1.value.push(item.evaluationTarget)
            seriesData1.value.push(item.indicatorValue)
          })
        })
      } else {
        if (variables.evaluationTaskInstance.instanceIds.length <= 0) {
          message.warning('请选择评估任务实例')
          return
        }
        if (variables.evaluationTaskInstance.targetIds.length <= 0) {
          message.warning('请选择评估对象')
          return
        }
        const formData = new FormData()
        formData.append(
          'evaluationTaskInstanceIds',
          variables.evaluationTaskInstance.instanceIds.join()
        )
        formData.append(
          'evaluationTargets',
          variables.evaluationTaskInstance.targetIds.join()
        )
        formData.append(
          'taskDefinitionCode',
          variables.taskDefinitionCode.join()
        )
        xAxisData.value = []
        seriesData.value = []
        getCaiculatedCompare(formData).then((res: any) => {
          let yAxis = [] as any
          let ydataList = [] as any
          variables.evaluationTaskInstance.instanceIds.map(
            (item: any, index: number) => {
              const targetInstance: { name: string } =
                instanceOptions.value.filter((v: any) => v.id == item)[0]
              xAxisData.value.push(targetInstance.name)
              yAxis = res[index]
              ydataList[index] = res[index].map(
                (item: any) => item.indicatorValue
              )
            }
          )
          seriesData.value = variables.evaluationTaskInstance.targetIds.map(
            (item: any) => {
              return {
                name: item,
                type: 'bar',
                data: [],
                barWidth: '10%'
              }
            }
          )
          seriesData.value.map((item: any, index: number) => {
            item.data = ydataList.map((e: any, i: number) => e[index] || 0)
          })
          // console.log(xAxisData.value);
          // console.log(ydataList);
          // console.log(seriesData.value);
        })
      }
    }

    // 清空
    const handleClear = (flag: Number) => {
      variables.taskDefinitionCode = []
      defaultCheckedKey.value = []
      if (flag) {
        variables.evaluationTarget.targetIds = []
        variables.evaluationTarget.instanceId = null
      } else {
        variables.evaluationTaskInstance.targetIds = []
        variables.evaluationTaskInstance.instanceIds = []
      }
    }

    // 选中
    const onChecked = (val: any[]) => {
      defaultCheckedKey.value = []
      variables.taskDefinitionCode = [val[val.length - 1]]
      handleSearch(0)
      handleSearch(1)
    }

    return {
      onClose,
      instanceOptions,
      targetOptions,
      variables,
      treeData,
      handleSearch,
      handleClear,
      onChecked,
      defaultCheckedKey,
      xAxisData,
      seriesData,
      xAxisData1,
      seriesData1
    }
  },
  render() {
    const { variables } = this
    return (
      <NSpace vertical>
        <Card>
          <NButton secondary onClick={this.onClose} class={Styles['back-btn']}>
            返回
          </NButton>
        </Card>
        <div class={Styles['tree-wrap']}>
          <Card class={Styles['tree-card']}>
            <NInput
              v-model={[variables.pattern, 'value']}
              placeholder='请输入指标名称'
              class={Styles['tree-input']}
            />
            <NTree
              show-irrelevant-nodes={false}
              default-checked-keys={this.defaultCheckedKey}
              pattern={variables.pattern}
              block-node
              default-expand-all
              checked-keys={variables.taskDefinitionCode}
              data={this.treeData}
              checkable
              expand-on-click
              selectable
              key-field='code'
              on-update:checked-keys={this.onChecked}
            />
          </Card>
          <NSpace vertical class={Styles['c-space']}>
            <Card
              title={
                <div class={Styles['c-title-wrap']}>
                  <div class={Styles['c-border']} />
                  任务实例间对象指标数据对比
                </div>
              }
              headerStyle={{ paddingLeft: 0 }}
            >
              <NSpace>
                <NFormItem label='评估任务实例' label-placement='left'>
                  <NSelect
                    class={Styles['c-select']}
                    filterable
                    multiple
                    max-tag-count={1}
                    v-model={[
                      variables.evaluationTaskInstance.instanceIds,
                      'value'
                    ]}
                    options={this.instanceOptions}
                    label-field='name'
                    value-field='id'
                  />
                </NFormItem>
                <NFormItem label='评估对象' label-placement='left'>
                  <NSelect
                    class={Styles['c-select']}
                    multiple
                    max-tag-count='responsive'
                    v-model={[
                      variables.evaluationTaskInstance.targetIds,
                      'value'
                    ]}
                    options={this.targetOptions}
                  />
                </NFormItem>
                <NButton type='primary' onClick={() => this.handleSearch(0)}>
                  搜索
                </NButton>
                <NButton onClick={() => this.handleClear(0)}>清空</NButton>
              </NSpace>
              {this.xAxisData.length > 0 && (
                <BarChart
                  multiple={true}
                  xAxisData={this.xAxisData}
                  seriesData={this.seriesData}
                />
              )}
            </Card>
            <Card
              title={
                <div class={Styles['c-title-wrap']}>
                  <div class={Styles['c-border']} />
                  单个实例评估对象指标数值对比
                </div>
              }
              headerStyle={{ paddingLeft: 0 }}
            >
              <NSpace>
                <NFormItem label='评估任务实例' label-placement='left'>
                  <NSelect
                    class={Styles['c-select']}
                    filterable
                    v-model={[variables.evaluationTarget.instanceId, 'value']}
                    options={this.instanceOptions}
                    label-field='name'
                    value-field='id'
                  />
                </NFormItem>
                <NFormItem label='评估对象' label-placement='left'>
                  <NSelect
                    class={Styles['c-select']}
                    multiple
                    max-tag-count='responsive'
                    v-model={[variables.evaluationTarget.targetIds, 'value']}
                    options={this.targetOptions}
                  />
                </NFormItem>
                <NButton type='primary' onClick={() => this.handleSearch(1)}>
                  搜索
                </NButton>
                <NButton onClick={() => this.handleClear(1)}>清空</NButton>
              </NSpace>
              {this.xAxisData1.length > 0 ? (
                <BarChart
                  xAxisData={this.xAxisData1}
                  seriesData={this.seriesData1}
                  barWidth='10%'
                />
              ) : (
                <div style={{ height: '300px' }}></div>
              )}
            </Card>
          </NSpace>
        </div>
      </NSpace>
    )
  }
})

export default list
