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

import { useI18n } from 'vue-i18n'
import { reactive, ref, SetupContext } from 'vue'
//import { useUserStore } from '@/store/user/user'
import type { FormRules } from 'naive-ui'
//import type { UserInfoRes } from '@/service/modules/users/types'
import {
  effectivenessEvaluationModelAdd,
  effectivenessEvaluationModelUpdate
} from '@/views/EvaluationModel/api'
import { CreateReq } from '../../api/type'

export function useForm(
  props: any,
  ctx: SetupContext<('cancelModal' | 'confirmModal')[]>
) {
  const { t } = useI18n()
  //const userStore = useUserStore()

  const resetForm = () => {
    variables.model = {
      modelName: '',
      modelDesc: '',
      evaluationMethod: '',
    }
  }

  const variables = reactive({
    formRef: ref(),
    model: {
      id:'',
      modelName: '',
      modelDesc: '',
      evaluationMethod: '',
      evaluationTarget: [],
      evaluationLevel: [],
    },
    saving: false,
    rules: {
      modelName: {
        required: true,
        trigger: ['input', 'blur'],
        validator() {
          if (variables.model.modelName === '') {
            return new Error('评估模型名称不能为空')
          }
        }
      },
      evaluationTarget: {
        required: true,
        trigger: ['change'],
        validator(rule, value, callback) {
          if (
            !variables.model.evaluationTarget ||
            variables.model.evaluationTarget?.length <= 0
          ) {
            return new Error(t('请创建评估对象'))
          }
          const recource = variables.model.evaluationTarget
          if (recource.some((tag, index) => recource.indexOf(tag) !== index)) {
            callback(new Error('重复的评估对象'))
          } else {
            callback()
          }
        }
      },
      evaluationLevel: {
        required: true,
        validator() {
          if (variables.model.evaluationLevel.length <= 1) {
            return new Error(t('请创建评估等级'))
          }
        }
      }
    } as FormRules
  })

  const handleValidate = (statusRef: number) => {
    variables.formRef.validate((errors: any) => {
      if (!errors) {
        statusRef === 0 ? submitModal() : updateModal()
      } else {
        return
      }
    })
  }

  const submitModal = async () => {
    if (variables.saving) return
    variables.saving = true
    try {
      console.log(variables)
      const params = { ...variables.model}
      params.evaluationTarget = params.evaluationTarget.join()
      params.evaluationLevel = params.evaluationLevel && JSON.stringify(params.evaluationLevel)
      await effectivenessEvaluationModelAdd(params)
      variables.saving = false
      resetForm()
      ctx.emit('confirmModal', props.showModalRef)
    } catch (err) {
      variables.saving = false
    }
  }

  const updateModal = async () => {
    if (variables.saving) return
    variables.saving = true
    console.log(variables)
    
    try {
      const params = { ...variables.model }
      params.evaluationTarget = params.evaluationTarget.join()
      params.evaluationLevel = params.evaluationLevel && JSON.stringify(params.evaluationLevel)
      await effectivenessEvaluationModelUpdate(params)
      variables.saving = false
      resetForm()
      ctx.emit('confirmModal', props.showModalRef)
    } catch (err) {
      variables.saving = false
    }
  }

  return { variables, t, handleValidate }
}
