import {
  defineComponent,
  getCurrentInstance,
  PropType,
  toRefs,
  watch
} from 'vue'

import { NForm, NFormItem, NInput } from 'naive-ui'
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
  }
}

const ProjectModal = defineComponent({
  name: 'ProjectModal',
  props,
  emits: ['cancelModal', 'confirmModal'],
  setup(props, ctx) {
    const { variables, t, handleValidate } = useForm(props, ctx)

    const cancelModal = () => {
      if (props.statusRef === 0) {
        variables.model.evaluationEngineeringName = ''
        variables.model.evaluationEngineeringDesc = ''
      } else {
        variables.model.evaluationEngineeringName =
          props.row.evaluationEngineeringName
        variables.model.evaluationEngineeringDesc =
          props.row.evaluationEngineeringDesc
      }
      ctx.emit('cancelModal', props.showModalRef)
    }

    const confirmModal = () => {
      handleValidate(props.statusRef)
    }

    const trim = getCurrentInstance()?.appContext.config.globalProperties.trim

    watch(
      () => props.statusRef,
      () => {
        if (props.statusRef === 0) {
          variables.model.evaluationEngineeringName = ''
          variables.model.evaluationEngineeringDesc = ''
        } else {
          variables.model.evaluationEngineeringName =
            props.row.evaluationEngineeringName
          variables.model.evaluationEngineeringDesc =
            props.row.evaluationEngineeringDesc
        }
      }
    )

    watch(
      () => props.row,
      () => {
        variables.model.evaluationEngineeringName =
          props.row.evaluationEngineeringName
        variables.model.evaluationEngineeringDesc =
          props.row.evaluationEngineeringDesc
      }
    )

    return { ...toRefs(variables), t, cancelModal, confirmModal, trim }
  },
  render() {
    const { t } = this
    return (
      <Modal
        title={
          this.statusRef === 0
            ? t('assessment.button.create')
            : t('assessment.button.edit')
        }
        show={this.showModalRef}
        onConfirm={this.confirmModal}
        onCancel={this.cancelModal}
        confirmDisabled={!this.model.evaluationEngineeringName}
        confirmClassName='btn-submit'
        cancelClassName='btn-cancel'
        confirmLoading={this.saving}
      >
        <NForm rules={this.rules} ref='formRef'>
          <NFormItem
            label={t('assessment.projects.column_name')}
            path='evaluationEngineeringName'
          >
            <NInput
              allowInput={this.trim}
              v-model={[this.model.evaluationEngineeringName, 'value']}
              placeholder={t('assessment.projects.tips_name')}
              class='input-project-name'
            />
          </NFormItem>
          <NFormItem
            label={t('assessment.projects.column_desc')}
            path='evaluationEngineeringDesc'
          >
            <NInput
              allowInput={this.trim}
              type='textarea'
              v-model={[this.model.evaluationEngineeringDesc, 'value']}
              placeholder={t('assessment.projects.tips_desc')}
            />
          </NFormItem>
        </NForm>
      </Modal>
    )
  }
})

export default ProjectModal
