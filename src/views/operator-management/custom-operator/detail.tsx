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

import {defineComponent, getCurrentInstance, PropType, ref, toRefs, watch,onMounted} from 'vue'
import type {UploadFileInfo} from 'naive-ui'
import {
  NButton,
  NDynamicInput,
  NForm,
  NFormItem,
  NGrid,
  NGridItem,
  NInput,
  NSelect,
  NSpace,
  NSpin,
  NUpload,
  useMessage
} from 'naive-ui'
import Modal from '@/components/modal'
import {useI18n} from 'vue-i18n'
import {useForm} from './use-form'
import {useDetail} from './use-detail'
import {getDictListByType} from "@/service/modules/custom-operator";

const props = {
  show: {
    type: Boolean as PropType<boolean>,
    default: false
  },
  id: {
    type: Number as PropType<number>
  }
}

const DetailModal = defineComponent({
  name: 'DetailModal',
  props,
  emits: ['cancel', 'update'],
  setup(props, ctx) {
    const { t } = useI18n()
    const {
      state,
      resetFieldsValue,
      setFieldsValue,
      getFieldsValue
    } = useForm(props.id)

    const { status, queryById, createOrUpdate } =
        useDetail(getFieldsValue)
    const selectOptions = ref([])
    const operatorTypeSelectOptions = ref([])
    onMounted(() => {
      getDictListByType('operator_params_type').then((res: any) => {
        selectOptions.value = res
      })
      getDictListByType('operator_type').then((res: any) => {
        operatorTypeSelectOptions.value = res
      })
    })
    const onCancel = () => {
      resetFieldsValue()
      ctx.emit('cancel')
    }

    const onSubmit = async () => {
      await state.detailFormRef.validate()
      const res = await createOrUpdate(props.id)
      if (res) {
        onCancel()
        ctx.emit('update')
      }
    }

    const message = useMessage()
    const showShuoMing = ref(false)

    const openShuoMing = () => {
      showShuoMing.value = true
    }

    const trim = getCurrentInstance()?.appContext.config.globalProperties.trim

    watch(
        () => props.show,
        async () => {
          // props.show && props.id && setFieldsValue(await queryById(props.id))
        }
    )


    const customRequest = ({ file }: any) => {
      state.detailForm.fileName = file.name
      state.detailForm.file = file.file
    }

    return {
      t,
      ...toRefs(state),
      ...toRefs(status),
      onSubmit,
      onCancel,
      trim,
      async beforeUpload (data: {
        file: UploadFileInfo
        fileList: UploadFileInfo[]
      }) {
        const FileExt: string | undefined = data.file.file?.name.substring(data.file.file?.name.lastIndexOf('.'))
        if (FileExt !== '.py') {
          message.error('只能上传.py后缀的文件，请重新上传')
          return false
        }
        return true
      },
      customRequest,
      showShuoMing,
      openShuoMing,
      selectOptions,
      operatorTypeSelectOptions
    }
  },
  render() {
    const {
      show,
      id,
      t,
      detailForm,
      rules,
      loading,
      saving,
      onCancel,
      onSubmit,
      beforeUpload,
      showShuoMing,
      openShuoMing
    } = this

    const onCreate = () => {

      return {
        paramName: '',
        paramDes: '',
        selectValue: null
      }
    }

    return (
        <NSpace>
        <Modal style="width: 95%"
               class='dialog-create-data-source'
               show={show}
               title={`${t(id ? '编辑' : '新增')}${t(
                   '算子'
               )}`}
               onConfirm={onSubmit}
               confirmLoading={saving || loading}
               onCancel={onCancel}
               confirmClassName='btn-submit'
               cancelClassName='btn-cancel'
        >
          {{
            default: () => (
                <NSpin show={loading}>
                  <NForm
                      rules={rules}
                      ref='detailFormRef'
                      require-mark-placement='left'
                      label-align='left'
                  >
                    <NGrid x-gap={12} cols={2}>
                      <NGridItem>
                        <NFormItem
                            label='算子名称'
                            path='operatorName'
                            show-require-mark
                        >
                          <NInput
                              class='input-data-source-name'
                              v-model={[detailForm.operatorName, 'value']}
                              placeholder='请输入算子名称'
                          />
                        </NFormItem>
                        <NFormItem
                            label='算子类别'
                            path='operatorType'
                            show-require-mark
                        >
                          <NSelect
                              v-model={[detailForm.operatorType, 'value']}
                              size='small'
                              options={this.operatorTypeSelectOptions}
                              placeholder={'算子类别'}
                              clearable
                          />
                        </NFormItem>
                        <NFormItem label='算子描述'>
                          <NInput
                              class='input-data-source-description'
                              v-model={[detailForm.operatorDesc, 'value']}
                              type='textarea'
                              placeholder='请输入算子描述'
                          />
                        </NFormItem>
                        <NFormItem label='执行命令' path='rawScript'>
                          <NInput
                              class='input-data-source-description'
                              v-model={[detailForm.rawScript, 'value']}
                              placeholder='执行命令'
                              type='textarea'
                              disabled={true}
                          >
                          </NInput>
                        </NFormItem>
                        <NFormItem label='上传脚本' show-require-mark path={'file'}>
                          <NUpload
                              v-model={[detailForm.file, 'value']}
                              class='btn-upload'
                              max={1}
                              onBeforeUpload={beforeUpload}
                              customRequest={this.customRequest}
                          >
                            <NButton type='primary'>点击上传脚本</NButton>
                            <p>仅支持Python脚本，仅支持.py格式文件，不超过300M</p>
                            <p>仅可上传一个.py文件</p>
                          </NUpload>
                        </NFormItem>
                      </NGridItem>
                      <NGridItem>
                        <h3>执行命令字段说明：</h3>
                        <p>执行命令字段主要用于用户使用本次上传的算子时系统启用Python环境和调用本算子参数，需按照以下红字格式编写：</p>
                        <p v-text={[detailForm.rawScriptShiLi, 'value']} style="color: red;margin-left: 20px"></p>
                        <p>命令说明：</p>
                        <p v-text={[detailForm.rawScriptShiLi2, 'value']}></p>
                        <p v-text={[detailForm.rawScriptShiLi3, 'value']}></p>
                        <h3>上传脚本字段说明：</h3>
                        <p>1、仅支持上传Python脚本文件，文件后缀名需为.py</p>
                        <p>2、支持Python环境：服务器目前已安装python3.8.16版本、Anaconda，编写自定义python脚本时，可调用默认安装包</p>
                        <p>3、由于上传的脚本需要和系统中输入输出算子做对接，因此对上传的脚本编写格式有一定的要求，您可
                          <NButton
                              text
                              tag="a"
                              type="primary"
                              onClick={openShuoMing}
                          >
                            点击此处
                          </NButton>
                          查看脚本编写格式说明，请按照说明中格式进行编写，可参考
                          <a href={'http://139.219.2.184:12201/user_operator_example_main.py'}>样例脚本-求和算子（点击下载）</a>
                        </p>
                        <p>4、请不要上传破坏性代码脚本</p>
                        <p>5、一个算子仅支持上传一个.py文件，再次上传将替换之前上传的文件</p>
                        <p>6、上传文件大小不要超过300M</p>
                        <p>请严格按照上述要求上传脚本，否则算子将无法使用</p>
                      </NGridItem>
                    </NGrid>
                    <NFormItem label='输入参数'>
                      <NDynamicInput
                          on-create={onCreate}
                          v-model={[detailForm.inputParams, 'value']}
                      >
                        {
                            ({ value: formData }:any) => {
                              return (
                                  <NGrid x-gap='12' cols='3'>
                                    <NGridItem>
                                      <NInput
                                          v-model:value={formData.paramName}
                                          placeholder='请输入参数名称'
                                      />
                                    </NGridItem>
                                    <NGridItem>
                                      <NInput
                                          v-model:value={formData.paramDes}
                                          placeholder='请输入参数描述'
                                      />
                                    </NGridItem>
                                    <NGridItem>
                                      <NSelect
                                          v-model:value={formData.selectValue}
                                          options={this.selectOptions}
                                          placeholder={'请选择参数值类型'}
                                          clearable
                                      />
                                    </NGridItem>
                                  </NGrid>
                              )
                            }
                        }
                      </NDynamicInput>
                    </NFormItem>
                    <NFormItem label='输出参数'>
                      <NDynamicInput
                          on-create={onCreate}
                          v-model={[detailForm.outputParams, 'value']}
                      >
                        {
                          ({ value: formData }:any) => {
                            return (
                                <NGrid x-gap='12' cols='3'>
                                  <NGridItem>
                                    <NInput
                                        v-model:value={formData.paramName}
                                        placeholder='请输入参数名称'
                                    />
                                  </NGridItem>
                                  <NGridItem>
                                    <NInput
                                        v-model:value={formData.paramDes}
                                        placeholder='请输入参数描述'
                                    />
                                  </NGridItem>
                                  <NGridItem>
                                    <NSelect
                                        v-model:value={formData.selectValue}
                                        options={this.selectOptions}
                                        placeholder={'请选择参数值类型'}
                                        clearable
                                    />
                                  </NGridItem>
                                </NGrid>
                            )
                          }
                        }
                      </NDynamicInput>
                    </NFormItem>
                    <NFormItem label='参数配置'>
                      <NDynamicInput
                        on-create={onCreate}
                        v-model={[detailForm.paramsConfig, 'value']}
                      >
                        {
                          ({ value: formData }:any) => {
                            return (
                              <NGrid x-gap='12' cols='3'>
                                <NGridItem>
                                  <NInput
                                    v-model:value={formData.paramName}
                                    placeholder='请输入参数KEY'
                                  />
                                </NGridItem>
                                <NGridItem>
                                  <NInput
                                    v-model:value={formData.paramDes}
                                    placeholder='请输入参数名'
                                  />
                                </NGridItem>
                                <NGridItem>
                                  <NSelect
                                    v-model:value={formData.selectValue}
                                    options={this.selectOptions}
                                    placeholder={'请选择参数值类型'}
                                    clearable
                                  />
                                </NGridItem>
                              </NGrid>
                            )
                          }
                        }
                      </NDynamicInput>
                    </NFormItem>
                  </NForm>
                </NSpin>
            )
          }}
        </Modal>
            <Modal style="width: 50%"
                   confirmClassName='btn-cancel'
                   confirmText={'关闭'}
                   show= {showShuoMing}
                   title={'脚本填写格式说明'}
                   cancelShow = {false}
                   onConfirm={
                     () => {
                        this.showShuoMing = false
                     }
                   }
            >
              <h3>执行命令字段说明：</h3>
              <p>执行命令字段主要用于用户使用本次上传的算子时系统启用Python环境和调用本算子参数，需按照以下红字格式编写：</p>
              <p v-text={[detailForm.rawScriptShiLi, 'value']} style="color: red;margin-left: 20px"></p>
            </Modal>
        </NSpace>
    )
  }
})

export default DetailModal
