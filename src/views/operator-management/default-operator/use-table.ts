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

import {useI18n} from 'vue-i18n'
import {h, reactive, ref} from 'vue'
import {useAsyncState} from '@vueuse/core'
import {queryExecuteResultListPaging, updateStatus, deleteCustomOperator} from '@/service/modules/default-operator'
import {format} from 'date-fns'
import {
    COLUMN_WIDTH_CONFIG,
    calculateTableWidth,
    DefaultTableWidth
} from '@/common/column-width-config'
import type {
    ResultItem,
    ResultListRes
} from '@/service/modules/default-operator/types'
import {NButton, NDropdown, NEllipsis, NIcon, NPopconfirm, NSpace, NTag, NTooltip} from 'naive-ui'
import {useRouter} from 'vue-router'

export function useTable() {
    const {t} = useI18n()
    const router = useRouter()

    const variables = reactive({
        columns: [],
        tableWidth: DefaultTableWidth,
        tableData: [],
        page: ref(1),
        pageSize: ref(10),
        operatorName: ref(null),
        operatorType: ref(null),
        status: ref(null),
        searchVal: ref(null),
        datePickerRange: ref(null),
        totalPage: ref(1),
        loadingRef: ref(false),
        showXiangQing: ref(false),
        showEditModal: ref(false),
        selectId: ref(),
        operatorCategory: ref(null),
    })

    const createColumns = (variables: any) => {
        variables.columns = [
            {
                title: '序号',
                key: 'index',
                render: (row: any, index: number) => index + 1,
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
                width: 400
            },
            {
                title: t('算子描述'),
                key: 'operatorDesc',
                width: 400
            },
            {
                title: '操作',
                key: 'operation',
                ...COLUMN_WIDTH_CONFIG['operation'](1),
                render(record: any) {

                    return [
                        h(NButton, { //NButton是naive ui提供的按钮组件模板，需要引入 import { NTag, NButton, } from 'naive-ui'
                                text: true,
                                style: {marginRight: '10px'},
                                onClick: () => viewdetail(record)
                            },
                            {default: () => '查看'}
                        )]
                }
            }

        ]
        if (variables.tableWidth) {
            variables.tableWidth = calculateTableWidth(variables.columns)
        }
    }

    const viewdetail = (params: any) => {
        variables.showXiangQing = true
        variables.selectId = params.id
    }

    const editdetail = (params: any) => {
        variables.showEditModal = true
        variables.selectId = params.id
    }

    //启用/禁用
    const chuli = (params: any) => {
        variables.selectId = params.id
        updateStatus(variables.selectId).then((res: ResultListRes) => {
            getTableData({
                pageSize: variables.pageSize,
                pageNo: variables.page,
                operatorName: variables.operatorName,
                status: variables.status
            })
        })
    }
    const deletedata = (params: any) => {
        variables.selectId = params.id
        deleteCustomOperator(variables.selectId).then((res: ResultListRes) => {
            getTableData({
                pageSize: variables.pageSize,
                pageNo: variables.page,
                operatorName: variables.operatorName,
                status: variables.status
            })
        })
    }

    const onCallback = (params: any, type: string) => {

    }
    const getTableData = (params: any) => {
        if (variables.loadingRef) return
        variables.loadingRef = true
        const data = {
            pageSize: params.pageSize,
            pageNo: params.pageNo,
            operatorName: params.operatorName,
            operatorType: params.operatorType
        }
        const {state} = useAsyncState(
            queryExecuteResultListPaging(data).then((res: ResultListRes) => {
                variables.totalPage = res.totalPage
                variables.tableData = res.totalList.map((item, unused) => {
                    return {
                        ...item
                    }
                }) as any

                variables.loadingRef = false
            }),
            {}
        )

        return state
    }

    return {
        t,
        variables,
        getTableData,
        createColumns,
        onCallback
    }
}
