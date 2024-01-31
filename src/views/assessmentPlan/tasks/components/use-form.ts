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
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implievariables.model.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

import { useI18n } from 'vue-i18n'
import { reactive, ref, SetupContext } from 'vue'
import type { FormRules } from 'naive-ui'
import { taskCreate, taskUpdate } from '@/service/modules/assessment'
import { parseTime } from '@/common/common'
import { format } from 'date-fns'

export function useForm(
  props: any,
  ctx: SetupContext<('cancelModal' | 'confirmModal')[]>
) {
  const { t } = useI18n()
  //const userStore = useUserStore()

  const resetForm = () => {
    variables.model = {
      evaluationEngineeringId: props.evaluationEngineeringId,
      taskName: '',
      taskBasis: '',
      taskDateRange: null,
      taskStartTime: '',
      taskEndTime: '',
      stageName: '',
      stageDateRange: null,
      stageStartDate: '',
      stageEndDate: ''
    }
  }

  const variables = reactive({
    formRef: ref(),
    model: {
      evaluationEngineeringId: props.evaluationEngineeringId,
      taskName: '',
      taskBasis: '',
      taskDateRange: [] as string[] | null,
      taskStartTime: '',
      taskEndTime: '',
      stageName: '',
      stageDateRange: [] as string[] | null,
      stageStartDate: '',
      stageEndDate: ''
    },
    saving: false,
    rules: {
      taskName: {
        required: true,
        trigger: ['input', 'blur'],
        validator() {
          if (variables.model.taskName === '') {
            return new Error(t('assessment.tasks.tips_task_name'))
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

  const formatFormData = () => {
    if (
      variables.model.taskDateRange &&
      variables.model.taskDateRange.length === 2
    ) {
      variables.model.taskStartTime = format(
        parseTime(variables.model.taskDateRange[0]),
        'yyyy-MM-dd HH:mm:ss'
      )
      variables.model.taskEndTime = format(
        parseTime(variables.model.taskDateRange[1]),
        'yyyy-MM-dd HH:mm:ss'
      )
    }
    if (
      variables.model.stageDateRange &&
      variables.model.stageDateRange.length === 2
    ) {
      variables.model.stageStartDate = format(
        parseTime(variables.model.stageDateRange[0]),
        'yyyy-MM-dd HH:mm:ss'
      )
      variables.model.stageEndDate = format(
        parseTime(variables.model.stageDateRange[1]),
        'yyyy-MM-dd HH:mm:ss'
      )
    }
  }

  const submitModal = async () => {
    if (variables.saving) return
    variables.saving = true
    try {
      formatFormData()
      await taskCreate(variables.model)
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
      formatFormData()
      await taskUpdate({
        ...variables.model,
        id: props.row.id
      })
      variables.saving = false
      resetForm()
      ctx.emit('confirmModal', props.showModalRef)
    } catch (err) {
      variables.saving = false
    }
  }

  return { variables, t, handleValidate }
}
