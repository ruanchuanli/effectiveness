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
import { defineComponent, getCurrentInstance, ref, toRefs, watch } from 'vue';
import { NButton, NSpin, NDescriptions, NDescriptionsItem, NDataTable } from 'naive-ui';
import Modal from '@/components/modal';
import { useI18n } from 'vue-i18n';
import { useForm } from './use-form';
import { useDetail } from './use-detail';
import { useMessage } from 'naive-ui';
const props = {
    show: {
        type: Boolean,
        default: false
    },
    id: {
        type: Number
    }
};
const XiangQing = defineComponent({
    name: 'XiangQing',
    props,
    emits: ['cancel', 'update'],
    setup(props, ctx) {
        const { t } = useI18n();
        const { state, resetFieldsValue, setFieldsValue, getFieldsValue } = useForm(props.id);
        const { status, queryById, createOrUpdate, downloadFile } = useDetail(getFieldsValue);
        const onCancel = () => {
            resetFieldsValue();
            ctx.emit('cancel');
        };
        const onSubmit = async () => {
            await state.detailFormRef.validate();
            const res = await createOrUpdate(props.id);
            if (res) {
                onCancel();
                ctx.emit('update');
            }
        };
        const message = useMessage();
        const showShuoMing = ref(false);
        const openShuoMing = () => {
            showShuoMing.value = true;
        };
        const trim = getCurrentInstance()?.appContext.config.globalProperties.trim;
        watch(() => props.show, async () => {
            props.show && props.id && setFieldsValue(await queryById(props.id));
        });
        const customRequest = ({ file }) => {
            state.detailForm.fileName = file.name;
            state.detailForm.file = file.file;
        };
        const columns = [
            {
                title: '序号',
                key: 'index',
                render: (row, index) => index + 1,
                width: 100
            },
            {
                title: t('参数名称'),
                key: 'paramName',
                width: 250
            },
            {
                title: t('参数描述'),
                key: 'paramDes',
                width: 300
            },
            {
                title: t('参数类型'),
                key: 'selectValue',
                width: 200
            }
        ];
        const dowmLoadJiaoBen = () => {
            downloadFile(props.id, state.detailForm.fileName);
        };
        return {
            t,
            ...toRefs(state),
            ...toRefs(status),
            onSubmit,
            onCancel,
            trim,
            async beforeUpload(data) {
                const FileExt = data.file.file?.name.substring(data.file.file?.name.lastIndexOf('.'));
                if (FileExt !== '.py') {
                    message.error('只能上传.py后缀的文件，请重新上传');
                    return false;
                }
                return true;
            },
            customRequest,
            showShuoMing,
            openShuoMing,
            columns,
            dowmLoadJiaoBen
        };
    },
    render() {
        const { show, id, t, detailForm, rules, loading, saving, onCancel, onSubmit, beforeUpload, showShuoMing, openShuoMing, columns, dowmLoadJiaoBen } = this;
        return (<Modal style="width: 60%" class='dialog-create-data-source' show={show} title={'查看'} onConfirm={onCancel} confirmLoading={saving || loading} onCancel={onCancel} confirmClassName='btn-submit' cancelClassName='btn-cancel'>
          {{
                default: () => (<NSpin show={loading}>
                  <NDescriptions label-placement="left" column={1}>
                    <NDescriptionsItem label="算子名称">
                      {[detailForm.operatorName]}
                    </NDescriptionsItem>
                    <NDescriptionsItem label="算子类别">
                      {[detailForm.operatorTypeLabel]}
                    </NDescriptionsItem>
                    <NDescriptionsItem label="算子描述">
                      {[detailForm.operatorDesc]}
                    </NDescriptionsItem>
                    <NDescriptionsItem label="执行命令">
                      {[detailForm.rawScript]}
                    </NDescriptionsItem>
                    <NDescriptionsItem label="上传脚本">
                      <NButton text tag="a" type="primary" onClick={dowmLoadJiaoBen}>
                        {[detailForm.fileName]}
                      </NButton>
                    </NDescriptionsItem>
                    <NDescriptionsItem label="输入参数">
                      <NDataTable columns={columns} data={detailForm.inputParamsList}/>
                    </NDescriptionsItem>
                    <NDescriptionsItem label="输出参数">
                      <NDataTable columns={columns} data={detailForm.outputParamsList}/>
                    </NDescriptionsItem>
                    <NDescriptionsItem label="参数配置">
                      <NDataTable columns={columns} data={detailForm.paramsConfigList}/>
                    </NDescriptionsItem>
                  </NDescriptions>
                </NSpin>)
            }}
        </Modal>);
    }
});
export default XiangQing;
//# sourceMappingURL=xiangQing.jsx.map