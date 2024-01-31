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
import { createplan, updateplan } from '@/service/modules/assessment'
import { useRoute } from 'vue-router'

export function useForm(
  props: any,
  ctx: SetupContext<('cancelModal' | 'confirmModal')[]>
) {
  const { t } = useI18n()
  //const userStore = useUserStore()
  const route = useRoute()

  const resetForm = () => {
    variables.model = {
      evaluationPlanName: '',
      evaluationPlanDesc: '',
      indicatorSystemId:""
    }
  }

  const variables = reactive({
    formRef: ref(),
    model: {
      evaluationPlanName: '',
      evaluationPlanDesc: '',
      indicatorSystemId:""
    },
    saving: false,
    rules: {
      evaluationPlanName: {
        required: true,
        trigger: ['input', 'blur'],
        validator() {
          if (variables.model.evaluationPlanName === '') {
            return new Error(t('assessmentplan.projects.tips_name'))
          }
        }
      },
      indicatorSystemId:{
        required: true,
        trigger: ['change'],
        validator() {
          if (variables.model.indicatorSystemId === '') {
            return new Error(t('请选择体系指标'))
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
    const taskid = route.query.taskid ||1
    if (variables.saving) return
    variables.saving = true
    try {
      const params = { ...variables.model, taskId: taskid, }
      await createplan(params)
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
    try {
      const params = { ...variables.model, id: props.row.id }
      await updateplan(params)
      variables.saving = false
      resetForm()
      ctx.emit('confirmModal', props.showModalRef)
    } catch (err) {
      variables.saving = false
    }
  }

  return { variables, t, handleValidate }
}
