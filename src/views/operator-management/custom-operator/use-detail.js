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
import { reactive } from 'vue';
import { useI18n } from 'vue-i18n';
import { createCustomOperator, updateCustomOperator, queryCustomOperator, downloadJiaoBen } from "@/service/modules/custom-operator";
export function useDetail(getFieldsValue) {
    const { t } = useI18n();
    const status = reactive({
        saving: false,
        loading: false
    });
    let PREV_NAME;
    const formatParams = () => {
        const values = getFieldsValue();
        return {
            ...values
        };
    };
    const queryById = async (id) => {
        if (status.loading)
            return {};
        status.loading = true;
        const customOperator = await queryCustomOperator(id);
        status.loading = false;
        // PREV_NAME = dataSourceRes.name
        return customOperator;
    };
    const downloadFile = async (id, fileName) => {
        await downloadJiaoBen(id).then((res) => {
            downloadBlob(res, fileName);
        });
    };
    const downloadBlob = (data, fileNameS = 'py') => {
        if (!data) {
            return;
        }
        const blob = new Blob([data]);
        const fileName = `${fileNameS}`;
        if ('download' in document.createElement('a')) {
            // Not IE
            const url = window.URL.createObjectURL(blob);
            const link = document.createElement('a');
            link.style.display = 'none';
            link.href = url;
            link.setAttribute('download', fileName);
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link); // remove element after downloading is complete.
            window.URL.revokeObjectURL(url); // release blob object
        }
        else {
            // IE 10+
            if (window.navigator.msSaveBlob) {
                window.navigator.msSaveBlob(blob, fileName);
            }
        }
    };
    const createOrUpdate = async (id) => {
        const values = getFieldsValue();
        if (status.saving)
            return false;
        status.saving = true;
        const formData = new FormData();
        formData.append('id', values.id);
        formData.append('operatorName', values.operatorName);
        formData.append('operatorDesc', values.operatorDesc);
        formData.append('operatorType', values.operatorType);
        formData.append('file', values.file);
        formData.append('rawScript', values.rawScript);
        formData.append('fileName', values.fileName);
        if (id == null) {
            formData.append('inputParams', JSON.stringify(values.inputParams));
            formData.append('outputParams', JSON.stringify(values.outputParams));
            formData.append('paramsConfig', JSON.stringify(values.paramsConfig));
        }
        else {
            formData.append('inputParams', JSON.stringify(values.inputParamsList));
            formData.append('outputParams', JSON.stringify(values.outputParamsList));
            formData.append('paramsConfig', JSON.stringify(values.paramsConfigList));
        }
        try {
            id
                ? await updateCustomOperator(formData)
                : await createCustomOperator(formData);
            status.saving = false;
            return true;
        }
        catch (err) {
            status.saving = false;
            return false;
        }
    };
    return { status, queryById, createOrUpdate, downloadFile };
}
//# sourceMappingURL=use-detail.js.map