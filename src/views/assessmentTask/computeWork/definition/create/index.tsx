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

import { defineComponent, ref } from 'vue'
import { useMessage } from 'naive-ui'
import Dag from '../../components/dag'
import { useThemeStore } from '@/store/theme/theme'
import { useRoute, useRouter } from 'vue-router'
import {
  SaveForm,
  TaskDefinition,
  Connect,
  Location
} from '../../components/dag/types'
import { updateCalculationProcess, getOperatorDetail } from '@/service/modules/assessmentPlan'
import {

  queryProcessDefinitionByCode
} from '@/service/modules/process-definition'
import { EditProcessDefinition } from '@/service/modules/assessment'
import { useI18n } from 'vue-i18n'
import Styles from './index.module.scss'

interface SaveData {
  saveForm: SaveForm
  taskDefinitions: TaskDefinition[]
  connects: Connect[]
  locations: Location[]
}

export default defineComponent({
  name: 'WorkflowDefinitionCreate',
  setup() {
    const theme = useThemeStore()

    const message = useMessage()
    const { t } = useI18n()
    const route = useRoute()
    const router = useRouter()
    const taskcode = Number(route.params.taskcode)
    const projectCode = Number(route.query.projectCode)
    const processDefinitionCode = Number(route.query.processDefinitionCode)
    const onSave = ({
      taskDefinitions,
      saveForm,
      connects,
      locations
    }: SaveData) => {
      const globalParams = saveForm.globalParams.map((p) => {
        return {
          prop: p.key,
          value: p.value,
          direct: 'IN',
          type: 'VARCHAR'
        }
      })
      if (processDefinitionCode) {
        EditProcessDefinition(
          {
            taskDefinitionJson: JSON.stringify(taskDefinitions),
            taskRelationJson: JSON.stringify(connects),
            locations: JSON.stringify(locations),
            name: saveForm.name,
            tenantCode: saveForm.tenantCode,
            executionType: saveForm.executionType,
            description: saveForm.description,
            globalParams: JSON.stringify(globalParams),
            timeout: saveForm.timeoutFlag ? saveForm.timeout : 0,
            projectCode: projectCode,
            targetTaskDefinitionCode: taskcode
          },
          projectCode, processDefinitionCode
        ).then((ignored: any) => {
          message.success(t('project.dag.success'))
          // router.push({ path: `/projects/${projectCode}/workflow-definition` })
        })
      } else {
        updateCalculationProcess(
          {
            taskDefinitionJson: JSON.stringify(taskDefinitions),
            taskRelationJson: JSON.stringify(connects),
            locations: JSON.stringify(locations),
            name: saveForm.name,
            tenantCode: saveForm.tenantCode,
            executionType: saveForm.executionType,
            description: saveForm.description,
            globalParams: JSON.stringify(globalParams),
            timeout: saveForm.timeoutFlag ? saveForm.timeout : 0,
            projectCode: projectCode,
            targetTaskDefinitionCode: taskcode
          },

        ).then((ignored: any) => {
          message.success(t('project.dag.success'))
          // router.push({ path: `/projects/${projectCode}/workflow-definition` })
        })
      }

    }
    const formDataJson = ref({
      processDefinition: [], processTaskRelationList: [], taskDefinitionList: [],
    })
    if (processDefinitionCode) {
      queryProcessDefinitionByCode(processDefinitionCode, projectCode).then((res: any) => {
        console.log(res);
        formDataJson.value = res
      })
    }
    return () => (
      <div
        class={[
          Styles.container,
          theme.darkTheme ? Styles['dark'] : Styles['light']
        ]}
      >
        <Dag projectCode={projectCode} definition={formDataJson} onSave={onSave} />
      </div>
    )
  }
})
