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
    defineComponent,
    getCurrentInstance,
    onMounted, ref,
    toRefs,
    watch
} from 'vue'
import {
    NSpace,
    NInput,
    NSelect,
    NDatePicker,
    NButton,
    NIcon,
    NDataTable,
    NPagination
} from 'naive-ui'
import {SearchOutlined} from '@vicons/antd'
import {useTable} from './use-table'
import {useI18n} from 'vue-i18n'
import Card from '@/components/card'
import DetailModal from "./detail";
import XiangQing from "./xiangQing";
import EditModal from "./editModal";
import {getDictListByType} from "@/service/modules/custom-operator";
const TaskResult = defineComponent({
    name: 'default-operator',
    setup() {
        const {t, variables, getTableData, createColumns} = useTable()
        const showDetailModal = ref(false)
        const selectId = ref()
        const requestTableData = () => {
            getTableData({
                pageSize: variables.pageSize,
                pageNo: variables.page,
                operatorName: variables.operatorName,
                operatorType: variables.operatorType
            })
        }

        const onUpdatePageSize = () => {
            variables.page = 1
            requestTableData()
        }

        const onSearch = () => {
            variables.page = 1
            requestTableData()
        }
        const reset = () => {
            variables.page = 1
            variables.operatorName = null
            variables.operatorType = null
            requestTableData()
        }
        const onCreate = () => {
            selectId.value = null
            showDetailModal.value = true
        }

        const trim = getCurrentInstance()?.appContext.config.globalProperties.trim
        const selectOptions = ref([])
        onMounted(() => {
            createColumns(variables)
            requestTableData()
            getDictListByType('operator_type').then((res: any) => {
                selectOptions.value = res
            })
        })

        watch(useI18n().locale, () => {
            createColumns(variables)
        })

        return {
            t,
            id: selectId,
            ...toRefs(variables),
            requestTableData,
            onUpdatePageSize,
            onSearch,
            reset,
            onCreate,
            showDetailModal,
            trim,
            selectOptions
        }
    },
    render() {
        const {t, requestTableData, id, showDetailModal, onCreate, onUpdatePageSize, onSearch, reset, loadingRef} = this

        return (
            <NSpace vertical>
                <Card>
                    <NSpace justify='space-between'>


                        <NSpace justify='end' wrap={false}>
                            <NInput
                                allowInput={this.trim}
                                v-model={[this.operatorName, 'value']}
                                size='small'
                                placeholder='请输入算子名称'
                                clearable
                            />
                            <NSelect
                                v-model={[this.operatorType, 'value']}
                                size='small'
                                options={this.selectOptions}
                                placeholder={'算子类别'}
                                style={{width: '180px'}}
                                clearable
                            />
                            <NButton size='small' type='primary' onClick={onSearch}>
                                查询
                            </NButton>

                            <NButton size='small' onClick={reset}>
                                重置
                            </NButton>
                        </NSpace>
                    </NSpace>
                </Card>
                <Card title='算子列表'>
                    <NSpace vertical>
                        <NDataTable
                            loading={loadingRef}
                            columns={this.columns}
                            data={this.tableData}
                            scrollX={this.tableWidth}
                        />
                        <NSpace justify='center'>
                            <NPagination
                                v-model:page={this.page}
                                v-model:page-size={this.pageSize}
                                page-count={this.totalPage}
                                show-size-picker
                                page-sizes={[10, 30, 50]}
                                show-quick-jumper
                                onUpdatePage={requestTableData}
                                onUpdatePageSize={onUpdatePageSize}
                            />
                        </NSpace>
                    </NSpace>
                </Card>
                <DetailModal
                    show={showDetailModal}
                    id={id}
                    onCancel={() => void (this.showDetailModal = false)}
                    onUpdate={requestTableData}
                />
                <EditModal
                    show={this.showEditModal}
                    id={this.selectId}
                    onCancel={() => void (this.showEditModal = false)}
                    onUpdate={requestTableData}
                />

                <XiangQing show={this.showXiangQing}
                           id={this.selectId}
                           onCancel={() => void (this.showXiangQing = false)}
                />
            </NSpace>
        )
    }
})

export default TaskResult
