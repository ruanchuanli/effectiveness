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
import { createtask, updatetask } from '@/service/modules/assessmentTask/index'
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
      evaluationTaskName: '',
      evaluationTaskDesc: '',
      evaluationPlanId: ''
    }
  }

  const variables = reactive({
    formRef: ref(),
    model: {
      evaluationTaskName: '',
      evaluationTaskDesc: '',
      evaluationPlanId: '',
      evaluationTarget: [],
      evaluationLevel: [{ intervalLeftValue: 0.0 }]
    },
    saving: false,
    rules: {
      evaluationTaskName: {
        required: true,
        trigger: ['change', 'blur'],
        validator() {
          if (variables.model.evaluationTaskName === '') {
            return new Error(t('assessmentplan.projects.tips_name'))
          }
        }
      },
      evaluationPlanId: {
        required: true,
        trigger: ['change'],
        validator() {
          if (variables.model.evaluationPlanId === '') {
            return new Error(t('请选择评估方案'))
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
    const taskid = route.query.taskid || 1
    if (variables.saving) return
    variables.saving = true

    try {
      const params = { ...variables.model, taskId: taskid }
      params.evaluationTarget = params.evaluationTarget.join()
      params.evaluationLevel =
        params.evaluationLevel && JSON.stringify(params.evaluationLevel)
      await createtask(params)
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
      params.evaluationTarget = params.evaluationTarget.join()
      params.evaluationLevel =
        params.evaluationLevel && JSON.stringify(params.evaluationLevel)
      await updatetask(params)
      variables.saving = false
      resetForm()
      ctx.emit('confirmModal', props.showModalRef)
    } catch (err) {
      variables.saving = false
    }
  }

  return { variables, t, handleValidate }
}
