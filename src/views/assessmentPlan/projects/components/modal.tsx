import {
  defineComponent,
  getCurrentInstance,
  PropType,
  toRefs,
  watch, ref
} from 'vue'

import { NForm, NFormItem, NInput, NSelect } from 'naive-ui'
import { useForm } from './use-form'
import Modal from '@/components/modal'
import { getIndicatorSystemListByTaskId } from '@/service/modules/assessment/index'
import { useRoute } from 'vue-router'
import { number } from 'echarts'
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
    const route = useRoute()
    const cancelModal = () => {
      if (props.statusRef === 0) {
        variables.model.evaluationPlanName = ''
        variables.model.evaluationPlanDesc = ''
        variables.model.indicatorSystemId = ''
      } else {
        variables.model.evaluationPlanName =
          props.row.evaluationPlanName
        variables.model.evaluationPlanDesc =
          props.row.evaluationPlanDesc
        variables.model.indicatorSystemId = props.row.indicatorSystemId
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
          variables.model.evaluationPlanName = ''
          variables.model.evaluationPlanDesc = ''
          variables.model.indicatorSystemId = ''
        } else {
          variables.model.evaluationPlanName =
            props.row.evaluationPlanName
          variables.model.evaluationPlanDesc =
            props.row.evaluationPlanDesc
          variables.model.indicatorSystemId = props.row.indicatorSystemId
        }
      }
    )

    watch(
      () => props.row,
      () => {
        variables.model.evaluationPlanName =
          props.row.evaluationPlanName
        variables.model.evaluationPlanDesc =
          props.row.evaluationPlanDesc
        variables.model.indicatorSystemId = props.row.indicatorSystemId
      }
    )
    let taskid = Number(route.query.taskid )
    const indicatorOptions = ref([])
    getIndicatorSystemListByTaskId(taskid).then((res: any) => {
      // console.log(res);
      indicatorOptions.value = res
    })

    return { ...toRefs(variables), t, cancelModal, confirmModal, trim, indicatorOptions }
  },
  render() {
    const { t } = this
    return (
      <Modal
        title={
          this.statusRef === 0
            ? t('assessmentplan.button.create')
            : t('assessmentplan.button.edit')
        }
        show={this.showModalRef}
        onConfirm={this.confirmModal}
        onCancel={this.cancelModal}
        confirmDisabled={!this.model.evaluationPlanName && !this.model.indicatorSystemId}
        confirmClassName='btn-submit'
        cancelClassName='btn-cancel'
        confirmLoading={this.saving}
      >
        <NForm rules={this.rules} ref='formRef'>
          <NFormItem
            label={t('assessmentplan.projects.column_name')}
            path='evaluationPlanName'
          >
            <NInput
              allowInput={this.trim}
              v-model={[this.model.evaluationPlanName, 'value']}
              placeholder={t('assessmentplan.projects.tips_name')}
              class='input-project-name'
            />
          </NFormItem>
          <NFormItem
            label={t('assessmentplan.projects.column_desc')}
            path='evaluationPlanDesc'
          >
            <NInput
              allowInput={this.trim}
              type='textarea'
              v-model={[this.model.evaluationPlanDesc, 'value']}
              placeholder={t('assessmentplan.projects.tips_desc')}
            />
          </NFormItem>
          <NFormItem label={'选择指标体系模板'}
            path='indicatorSystemId'>
            <NSelect
              v-model={[this.model.indicatorSystemId, 'value']}
              placeholder='请选择指标体系模板'
              options={this.indicatorOptions}
            />
          </NFormItem>
        </NForm>
      </Modal>
    )
  }
})

export default ProjectModal
