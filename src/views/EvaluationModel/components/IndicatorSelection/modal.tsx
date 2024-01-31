import {
  defineComponent,
  getCurrentInstance,
  onMounted,
  PropType,
  reactive,
  ref,
  toRefs,
  watch
} from 'vue'

import {
  NForm,
  NFormItem,
  NInput,
  NSelect,
} from 'naive-ui'
import { useForm } from './use-form'
import Modal from '@/components/modal'
import {
  getStageExpensesMapping,
  getEquipmentTypeMappding
} from '@/views/EvaluationModel/api'

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
    const { variables, handleValidate } = useForm(props, ctx)

    const cancelModal = () => {
      if (props.statusRef === 0) {
        variables.model.taskName = ''
        variables.model.equipmentName = ''
        variables.model.equipmentType = ''
      } else {
        // 编辑  从表格获取数据
        // variables.model.evaluationEngineeringName =
        //   props.row.evaluationEngineeringName
        // variables.model.evaluationEngineeringDesc =
        //   props.row.evaluationEngineeringDesc
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
          variables.model.taskName = ''
          variables.model.equipmentName = ''
          variables.model.equipmentType = ''
        } else {
          // 不知道啥时候触发
          // variables.model.evaluationEngineeringName =
          //   props.row.evaluationEngineeringName
          // variables.model.evaluationEngineeringDesc =
          //   props.row.evaluationEngineeringDesc
        }
      }
    )

    watch(
      () => props.row,
      () => {
        console.log(props.row)
        variables.model.taskName = props.row.modelName
      }
    )

    const equipmentTypeOptions = ref([])

    onMounted(async () => {
      equipmentTypeOptions.value = await getEquipmentTypeMappding()
    })

    return {
      ...toRefs(variables),
      cancelModal,
      confirmModal,
      trim,
      equipmentTypeOptions,
    }
  },
  render() {
    return (
      <Modal
        title={this.statusRef === 0 ? '新增指标选取任务' : '修改指标选取任务'}
        show={this.showModalRef}
        onConfirm={this.confirmModal}
        onCancel={this.cancelModal}
        // confirmDisabled={!this.model.evaluationEngineeringName}
        confirmClassName='btn-submit'
        cancelClassName='btn-cancel'
        confirmLoading={this.saving}
      >
        <NForm
          rules={this.rules}
          ref='formRef'
          show-require-mark={true}
          label-placement={'left'}
          label-align={'left'}
        >
          <NFormItem label='任务名称' path='taskName'>
            <NInput
              allowInput={this.trim}
              v-model={[this.model.taskName, 'value']}
              placeholder='任务名称'
              class='input-project-name'
            />
          </NFormItem>
          <NFormItem label='装备名称' path='equipName'>
            <NInput
              allowInput={this.trim}
              v-model={[this.model.equipmentName, 'value']}
              placeholder='请输入装备名称'
            />
          </NFormItem>
          <NFormItem label='装备类型' path='equipType'>
            <NSelect
              v-model={[this.model.equipmentType, 'value']}
              options={this.equipmentTypeOptions}
              placeholder='请选择装备类型'
              size='small'
            />
          </NFormItem>
        </NForm>
      </Modal>
    )
  }
})

export default ProjectModal
