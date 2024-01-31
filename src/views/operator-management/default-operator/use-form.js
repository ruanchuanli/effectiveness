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
import { reactive, ref } from 'vue';
import { useI18n } from 'vue-i18n';
export function useForm(id) {
    const { t } = useI18n();
    const initialValues = {
        executeCommandShiLi: 'source activate && conda activate op && python ${filePath} "{\'data1\':${input1},\'data2\':${input2}"\"[\'output1\']\"',
        executeCommandShiLi2: '（1）source activate && conda activate op && python ${filePath} 此部分代码固定，请谨慎修改',
        executeCommandShiLi3: '（2）"{\'data1\':${input1},\'data2\':${input2}"\"[\'output1\']\" 部分为参数信息,data1是入参json，需和代码中入参json名称相同，' +
            '如果有多个入参可以在此命令中追加；input1、input2是输入参数，需与下方添加的输入参数名称和数量保持一致；\"[\'output1\']\"为输出参数信息，output1为输出' +
            '参数名，需与下方添加的输出参数名称和数量保持一致',
        operatorName: '',
        operatorDesc: '',
        operatorCategory: null,
        operatorCategoryName: '',
        operatorTypeLabel: '',
        rawScript: '',
        executeCommand: 'source activate && conda activate op && python ${filePath} "{\'data1\':${input1},\'data2\':${input2}"\"[\'output1\']\"',
        fileName: '',
        file: null,
        filePath: '',
        inputParams: [
            {
                paramName: '',
                paramDes: '',
                selectValue: null,
                selectOptions: [
                    {
                        label: 'List<Double>',
                        value: 'List<Double>'
                    },
                    {
                        label: 'Double',
                        value: 'Double'
                    },
                ]
            }
        ],
        outputParams: [
            {
                paramName: '',
                paramDes: '',
                selectValue: null,
                selectOptions: [
                    {
                        label: 'List<Double>',
                        value: 'List<Double>'
                    },
                    {
                        label: 'Double',
                        value: 'Double'
                    },
                ]
            }
        ],
        inputParamsList: [],
        outputParamsList: []
    };
    const state = reactive({
        detailFormRef: ref(),
        detailForm: initialValues,
        rules: {
            operatorName: {
                trigger: ['input'],
                validator() {
                    if (!state.detailForm.operatorName) {
                        return new Error(t('请输入算子名称'));
                    }
                }
            },
            executeCommand: {
                trigger: ['input'],
                validator() {
                    if (!state.detailForm.executeCommand) {
                        return new Error(t('请输入执行命令'));
                    }
                }
            },
            file: {
                trigger: ['change'],
                validator() {
                    if (!state.detailForm.file) {
                        return new Error(t('请上传脚本'));
                    }
                }
            },
            inputParams: {
                trigger: ['input'],
                validator() {
                    if (state.detailForm.inputParams.length === 0 || state.detailForm.inputParams.length === 1 && state.detailForm.inputParams[0].paramName === '') {
                        return new Error(t('请配置输入参数'));
                    }
                }
            },
            outputParams: {
                trigger: ['input'],
                validator() {
                    if (state.detailForm.outputParams.length === 0 || state.detailForm.outputParams.length === 1 && state.detailForm.outputParams[0].paramName === '') {
                        return new Error(t('请配置输出参数'));
                    }
                }
            }
        }
    });
    const resetFieldsValue = () => {
        state.detailForm = { ...initialValues };
    };
    const setFieldsValue = (values) => {
        state.detailForm = {
            ...state.detailForm,
            ...values
        };
        console.log('---' + JSON.stringify(state.detailForm));
    };
    const getFieldsValue = () => state.detailForm;
    return {
        state,
        resetFieldsValue,
        setFieldsValue,
        getFieldsValue
    };
}
//# sourceMappingURL=use-form.js.map