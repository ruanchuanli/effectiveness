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
  createCostEstimationModel,
  createIndicatorSelection,
  editCostEstimationModel
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
      taskName: '',
      equipmentName: '',
      equipmentType: ''
    }
  }

  const variables = reactive({
    formRef: ref(),
    model: {
      taskName: '',
      equipmentName: '',
      equipmentType: ''
    },
    saving: false,
    rules: {
      modelName: {
        required: true,
        trigger: ['input', 'blur'],
        validator() {
          if (variables.model.taskName === '') {
            return new Error('任务名称不能为空')
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
      await createIndicatorSelection(variables.model)
      variables.saving = false
      resetForm()
      ctx.emit('confirmModal', props.showModalRef)
    } catch (err) {
      variables.saving = false
    }
  }

  const updateModal = async () => {
    // if (variables.saving) return
    // variables.saving = true
    // try {
    //   const params = { ...variables.model, id: props.row.id }
    //   await editCostEstimationModel(params)
    //   variables.saving = false
    //   resetForm()
    //   ctx.emit('confirmModal', props.showModalRef)
    // } catch (err) {
    //   variables.saving = false
    // }
  }

  return { variables, t, handleValidate }
}
