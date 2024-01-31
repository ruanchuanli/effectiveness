import {
  defineComponent,
  getCurrentInstance,
  PropType,
  toRefs,
  watch
} from 'vue'

import { NForm, NFormItem, NInput, NSelect } from 'naive-ui'
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
  },
  taskId: {
    type: Number,
    default: 0
  }
}

const IndicatorModal = defineComponent({
  name: 'TaskModal',
  props,
  emits: ['cancelModal', 'confirmModal', 'nextModal'],
  setup(props, ctx) {
    const { variables, t, handleValidate } = useForm(props, ctx)
    const initModel = () => {
      variables.model.taskId = props.taskId

      if (props.statusRef === 0) {
        variables.model.indicatorSystemName = ''
        variables.model.indicatorSystemDesc = ''
        variables.model.indicatorSystemTemplateId = ''
        variables.model.indicatorSystemRecommendation = ''
      } else {
        variables.model.indicatorSystemName = props.row.indicatorSystemName
        variables.model.indicatorSystemDesc = props.row.indicatorSystemDesc
        variables.model.indicatorSystemTemplateId =
          props.row.indicatorSystemDesc
        variables.model.indicatorSystemRecommendation =
          props.row.indicatorSystemRecommendation
      }
    }

    const cancelModal = () => {
      initModel()
      ctx.emit('cancelModal', props.showModalRef)
    }

    const confirmModal = () => {
      handleValidate(props.statusRef)
    }
    const nextModal = () => {
      ctx.emit('nextModal', props.showModalRef)
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
      () => props.taskId,
      () => {
        initModel()
      }
    )
    return {
      ...toRefs(variables),
      t,
      cancelModal,
      confirmModal,
      nextModal,
      trim
    }
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
        nextShow={false}
        onNext={this.nextModal}
        confirmDisabled={!this.model.indicatorSystemName}
        confirmClassName='btn-submit'
        cancelClassName='btn-cancel'
        confirmLoading={this.saving}
      >
        <NForm rules={this.rules} ref='formRef'>
          <NFormItem
            label={t('assessment.indicators.indicatorSystemName')}
            path='indicatorSystemName'
          >
            <NInput
              allowInput={this.trim}
              v-model={[this.model.indicatorSystemName, 'value']}
              placeholder={t('assessment.indicators.indicatorSystemName')}
            />
          </NFormItem>
          <NFormItem
            label={t('assessment.indicators.indicatorSystemDesc')}
            path='indicatorSystemDesc'
          >
            <NInput
              allowInput={this.trim}
              type='textarea'
              v-model={[this.model.indicatorSystemDesc, 'value']}
              placeholder={t('assessment.indicators.tips_indicatorSystemDesc')}
            />
          </NFormItem>
          <NFormItem
            label={t('assessment.indicators.indicatorSystemTemplate')}
            path='indicatorSystemTemplateId'
          >
            <NSelect
              v-model={[this.model.indicatorSystemTemplateId, 'value']}
              options={this.indicatorSystemTemplates}
              placeholder={t(
                'assessment.indicators.tips_indicatorSystemTemplate'
              )}
            />
          </NFormItem>
          <NFormItem
            label={t('assessment.indicators.indicatorSystemRecommendation')}
            path='indicatorSystemRecommendation'
          >
            <NInput
              allowInput={this.trim}
              type='textarea'
              v-model={[this.model.indicatorSystemRecommendation, 'value']}
              placeholder={t(
                'assessment.indicators.tips_indicatorSystemRecommendation'
              )}
            />
          </NFormItem>
        </NForm>
      </Modal>
    )
  }
})

export default IndicatorModal
