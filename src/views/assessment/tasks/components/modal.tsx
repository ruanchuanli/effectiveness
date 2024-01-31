import {
  defineComponent,
  getCurrentInstance,
  PropType,
  toRefs,
  watch
} from 'vue'

import { NForm, NFormItem, NInput, NDatePicker } from 'naive-ui'
import { useForm } from './use-form'
import Modal from '@/components/modal'

const props = {
  showModalRef: {
    type: Boolean as PropType<boolean>,
    default: false
  },
  statusRef: {
    type: Number as PropType<number>,
    default: 0
  },
  row: {
    type: Object as PropType<any>,
    default: {}
  },
  evaluationEngineeringId: {
    type: Number,
    default: 0
  }
}

const TaskModal = defineComponent({
  name: 'TaskModal',
  props,
  emits: ['cancelModal', 'confirmModal'],
  setup(props, ctx) {
    const { variables, t, handleValidate } = useForm(props, ctx)
    const initModel = () => {
      variables.model.evaluationEngineeringId = props.evaluationEngineeringId
      if (props.statusRef === 0) {
        variables.model.taskName = ''
        variables.model.taskBasis = ''
        variables.model.taskDateRange = null
        variables.model.taskStartTime = ''
        variables.model.taskEndTime = ''

        variables.model.stageName = ''
        variables.model.stageDateRange = null
        variables.model.stageStartDate = ''
        variables.model.stageEndDate = ''
      } else {
        variables.model.taskName = props.row.taskName
        variables.model.taskBasis = props.row.taskBasis

        if (props.row.taskStartTime) {
          variables.model.taskDateRange = []
          variables.model.taskDateRange.push(props.row.taskStartTime)
          variables.model.taskDateRange.push(props.row.taskEndTime)
        }

        variables.model.stageName = props.row.stageName

        if (props.row.stageStartDate) {
          variables.model.stageDateRange = []
          variables.model.stageDateRange.push(props.row.stageStartDate)
          variables.model.stageDateRange.push(props.row.stageEndDate)
        }
      }
    }

    const cancelModal = () => {
      initModel()
      ctx.emit('cancelModal', props.showModalRef)
    }

    const confirmModal = () => {
      if (props.statusRef == 2) {
        cancelModal()
      }
      
      handleValidate(props.statusRef)
    }

    const trim = getCurrentInstance()?.appContext.config.globalProperties.trim

    watch(
      () => props.statusRef,
      () => {
        initModel()
      }
    )
    watch(
      () => props.row,
      () => {
        initModel()
      }
    )
    watch(
      () => props.evaluationEngineeringId,
      () => {
        initModel()
      }
    )
    return { ...toRefs(variables), t, cancelModal, confirmModal, trim }
  },
  render() {
    const { t } = this
    if (this.model.taskDateRange?.length === 0) {
      this.model.taskDateRange = null
    }
    if (this.model.stageDateRange?.length === 0) {
      this.model.stageDateRange = null
    }
    return (
      <Modal
        title={
          this.statusRef === 0
            ? t('assessment.button.create')
            : this.statusRef === 1 
            ? t('assessment.button.edit') 
            : '查看'
        }
        show={this.showModalRef}
        onConfirm={this.confirmModal}
        onCancel={this.cancelModal}
        confirmDisabled={!this.model.taskName}
        confirmClassName='btn-submit'
        cancelClassName='btn-cancel'
        confirmLoading={this.saving}
      >
        <NForm rules={this.rules} disabled={this.statusRef == 2} ref='formRef'>
          <NFormItem
            label={t('assessment.tasks.column_task_name')}
            path='taskName'
          >
            <NInput
              allowInput={this.trim}
              v-model={[this.model.taskName, 'value']}
              placeholder={t('assessment.tasks.tips_task_name')}
              class='input-project-name'
            />
          </NFormItem>
          <NFormItem
            label={t('assessment.tasks.column_task_basis')}
            path='taskBasis'
          >
            <NInput
              allowInput={this.trim}
              type='textarea'
              v-model={[this.model.taskBasis, 'value']}
              placeholder={t('assessment.tasks.tips_task_basis')}
            />
          </NFormItem>
          <NFormItem
            label={t('assessment.tasks.column_task_time')}
            path='taskDateRange'
          >
            <NDatePicker
              v-model={[this.model.taskDateRange, 'formatted-value']}
              value-format='yyyy-MM-dd'
              type='daterange'
              placeholder={t('assessment.tasks.tips_task_time')}
            />
          </NFormItem>
          <NFormItem
            label={t('assessment.tasks.column_stage_name')}
            path='stageName'
          >
            <NInput
              allowInput={this.trim}
              v-model={[this.model.stageName, 'value']}
              placeholder={t('assessment.tasks.tips_stage_name')}
            />
          </NFormItem>
          <NFormItem
            label={t('assessment.tasks.column_step_task_time')}
            path='stageDateRange'
          >
            <NDatePicker
              v-model={[this.model.stageDateRange, 'formatted-value']}
              value-format='yyyy-MM-dd'
              type='daterange'
              placeholder={t('assessment.tasks.tips_stage_date')}
            />
          </NFormItem>
        </NForm>
      </Modal>
    )
  }
})

export default TaskModal
