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
import { reactive, ref, SetupContext, watch } from 'vue'
import type { FormRules } from 'naive-ui'
import {
  indicatorCreate,
  indicatorUpdate,
  evaluationEngineeringIndicatorSystemListQuery
} from '@/service/modules/assessment'

export function useForm(
  props: any,
  ctx: SetupContext<('cancelModal' | 'confirmModal')[]>
) {
  const { t } = useI18n()
  //const userStore = useUserStore()

  const resetForm = () => {
    variables.model = {
      taskId: props.taskId,
      indicatorSystemName: '',
      indicatorSystemDesc: '',
      indicatorSystemTemplateId: 0,
      indicatorSystemRecommendation: ''
    }
  }

  const variables = reactive({
    formRef: ref(),
    model: {
      taskId: props.taskId,
      indicatorSystemName: '',
      indicatorSystemDesc: '',
      indicatorSystemTemplateId: 0,
      indicatorSystemRecommendation: ''
    },
    indicatorSystemTemplates: ref([]),
    saving: false,
    rules: {
      indicatorSystemName: {
        required: true,
        trigger: ['input', 'blur'],
        validator() {
          if (variables.model.indicatorSystemName === '') {
            return new Error(
              t('assessment.indicators.tips_indicatorSystemName')
            )
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
      await indicatorCreate(variables.model)
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
      await indicatorUpdate({
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
  const initOptions = async () => {
    if (props.evaluationEngineeringId) {
      const data = await evaluationEngineeringIndicatorSystemListQuery(
        props.evaluationEngineeringId
      )
      variables.indicatorSystemTemplates = data
    }
  }

  watch(
    () => props.evaluationEngineeringId,
    () => {
      initOptions()
    }
  )

  return { variables, t, handleValidate }
}
