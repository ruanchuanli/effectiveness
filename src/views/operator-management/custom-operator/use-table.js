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
import { useI18n } from 'vue-i18n';
import { h, reactive, ref } from 'vue';
import { useAsyncState } from '@vueuse/core';
import { queryExecuteResultListPaging, updateStatus, deleteCustomOperator } from '@/service/modules/custom-operator';
import { COLUMN_WIDTH_CONFIG, calculateTableWidth, DefaultTableWidth } from '@/common/column-width-config';
import { NButton, NPopconfirm, NTag, NTooltip } from 'naive-ui';
import { useRouter } from 'vue-router';
export function useTable() {
    const { t } = useI18n();
    const router = useRouter();
    const variables = reactive({
        columns: [],
        tableWidth: DefaultTableWidth,
        tableData: [],
        page: ref(1),
        pageSize: ref(10),
        operatorName: ref(null),
        status: ref(null),
        searchVal: ref(null),
        datePickerRange: ref(null),
        totalPage: ref(1),
        loadingRef: ref(false),
        showXiangQing: ref(false),
        showEditModal: ref(false),
        selectId: ref()
    });
    const createColumns = (variables) => {
        variables.columns = [
            {
                title: '序号',
                key: 'index',
                render: (row, index) => index + 1,
                width: 150
            },
            {
                title: '算子名称',
                key: 'operatorName',
                width: 300
            },
            {
                title: '算子类别',
                key: 'operatorTypeLabel',
                width: 300
            },
            {
                title: '算子描述',
                key: 'operatorDesc',
                width: 400
            },
            {
                title: '状态',
                key: 'status',
                render: (row) => {
                    if (row.status === 0) {
                        return h(NTag, { type: 'info', size: 'small' }, {
                            default: () => '未启用'
                        });
                    }
                    else if (row.status === 1) {
                        return h(NTag, { type: 'success', size: 'small' }, {
                            default: () => '启用中'
                        });
                    }
                    else if (row.status === 2) {
                        return h(NTag, { type: 'error', size: 'small' }, {
                            default: () => '已禁用'
                        });
                    }
                    else {
                        return '-';
                    }
                },
                ...COLUMN_WIDTH_CONFIG['state']
            },
            {
                title: '创建人',
                key: 'createUser',
                ...COLUMN_WIDTH_CONFIG['userName']
            },
            {
                title: '创建时间',
                key: 'createTime',
                ...COLUMN_WIDTH_CONFIG['time']
            },
            {
                title: '操作',
                key: 'operation',
                ...COLUMN_WIDTH_CONFIG['operation'](5),
                render(record) {
                    return [
                        h(NButton, {
                            //NButton是naive ui提供的按钮组件模板，需要引入 import { NTag, NButton, } from 'naive-ui'
                            text: true,
                            style: { marginRight: '10px' },
                            onClick: () => viewdetail(record)
                        }, { default: () => '查看' }),
                        h(NButton, {
                            //NButton是naive ui提供的按钮组件模板，需要引入 import { NTag, NButton, } from 'naive-ui'
                            text: true,
                            style: { marginRight: '10px' },
                            onClick: () => editdetail(record)
                        }, { default: () => '编辑' }),
                        h(NButton, {
                            text: true,
                            style: { marginRight: '10px' },
                            onClick: () => chuli(record)
                        }, {
                            default: () => {
                                let text = '';
                                if (record.status == 0 || record.status == 2) {
                                    text = '启用';
                                }
                                else if (record.status == 1) {
                                    text = '禁用';
                                }
                                return text;
                            }
                        }),
                        h(NPopconfirm, {
                            onPositiveClick: () => {
                                deletedata(record);
                            }
                        }, {
                            trigger: () => h(NTooltip, {}, {
                                trigger: () => h(NButton, {
                                    text: true
                                }, { default: () => '删除' }),
                                default: () => t('project.task.delete')
                            }),
                            default: () => t('project.task.delete_confirm')
                        })
                    ];
                }
            }
        ];
        if (variables.tableWidth) {
            variables.tableWidth = calculateTableWidth(variables.columns);
        }
    };
    const viewdetail = (params) => {
        variables.showXiangQing = true;
        variables.selectId = params.id;
    };
    const editdetail = (params) => {
        variables.showEditModal = true;
        variables.selectId = params.id;
    };
    //启用/禁用
    const chuli = (params) => {
        variables.selectId = params.id;
        updateStatus(variables.selectId).then((res) => {
            getTableData({
                pageSize: variables.pageSize,
                pageNo: variables.page,
                operatorName: variables.operatorName,
                status: variables.status
            });
        });
    };
    const deletedata = (params) => {
        variables.selectId = params.id;
        deleteCustomOperator(variables.selectId).then((res) => {
            getTableData({
                pageSize: variables.pageSize,
                pageNo: variables.page,
                operatorName: variables.operatorName,
                status: variables.status
            });
        });
    };
    const onCallback = (params, type) => { };
    const getTableData = (params) => {
        if (variables.loadingRef)
            return;
        variables.loadingRef = true;
        const data = {
            pageSize: params.pageSize,
            pageNo: params.pageNo,
            operatorName: params.operatorName,
            status: params.status
        };
        const { state } = useAsyncState(queryExecuteResultListPaging(data).then((res) => {
            variables.totalPage = res.totalPage;
            variables.tableData = res.totalList.map((item, unused) => {
                return {
                    ...item
                };
            });
            variables.loadingRef = false;
        }), {});
        return state;
    };
    return {
        t,
        variables,
        getTableData,
        createColumns,
        onCallback
    };
}
//# sourceMappingURL=use-table.js.map