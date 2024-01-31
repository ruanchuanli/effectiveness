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
  NRadioGroup,
  NSpace,
  NRadio,
  NCard,
  NInputNumber
} from 'naive-ui'
import { useForm } from './use-form'
import Modal from '@/components/modal'
import {
  getStageExpensesMapping,
  getEquipmentTypeMappding
} from '@/views/EvaluationModel/api'
import { getProficiencySelectOptions } from '@/service/modules/worker-groups'

import { CreateReq } from '../api/type'

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
        variables.model.modelName = ''
        variables.model.equipName = ''
        variables.model.equipType = ''
        variables.model.expenseType = ''
        variables.model.estimationMethod = ''
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
          variables.model.round = ''
          variables.model.expertInfo = []
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
        // 不知道啥时候触发
        // variables.model.evaluationEngineeringName =
        //   props.row.evaluationEngineeringName
        // variables.model.evaluationEngineeringDesc =
        //   props.row.evaluationEngineeringDesc
      }
    )

    const expenseTypeOptions = ref([])

    onMounted(async () => {
      // 专家熟悉度
      expenseTypeOptions.value = await getProficiencySelectOptions()
    })

    return {
      ...toRefs(variables),
      cancelModal,
      confirmModal,
      trim,
      expenseTypeOptions
    }
  },
  render() {
    return (
      <Modal
        title={this.statusRef === 0 ? '专家判断数据录入' : '专家判断数据修改'}
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
          <NFormItem label={'轮次'} path='modelName'>
            <NSelect
              v-model={[this.model.round, 'value']}
              options={this.expenseTypeOptions}
              placeholder={'请选择轮次'}
              size='small'
            />
            {/* <NInput
              allowInput={this.trim}
              v-model={[this.model.modelName, 'value']}
              placeholder={'请输入估算模型名称'}
              class='input-project-name'
            /> */}
          </NFormItem>
          {this.model.expertInfo.map((item: any) => {
            return (
              <NCard>
                <NFormItem label={'专家姓名'} path='equipName'>
                  <NInput
                    allowInput={this.trim}
                    v-model={[item.expertName, 'value']}
                    placeholder={'请输入专家姓名'}
                  />
                </NFormItem>
                <NFormItem label={'专家熟练度'} path='equipType'>
                  <NSelect
                    v-model={[item.expertFamiliarity, 'value']}
                    options={this.expenseTypeOptions}
                    placeholder={'请选择专家熟练度'}
                    size='small'
                  />
                </NFormItem>
                <NFormItem label={'中估值'} path='equipName'>
                  <NInputNumber
                    v-model={[item.mediumValuation, 'value']}
                    min={1}
                    show-require-mark={true}
                    require-mark-placement={'left'}
                  />
                </NFormItem>
                <NFormItem label={'低估值'} path='equipName'>
                  <NInputNumber
                    v-model={[item.lowValuation, 'value']}
                    min={1}
                    show-require-mark={true}
                    require-mark-placement={'left'}
                  />
                </NFormItem>
                <NFormItem label={'高估值'} path='equipName'>
                  <NInputNumber
                    v-model={[item.strongValuation, 'value']}
                    min={1}
                    show-require-mark={true}
                    require-mark-placement={'left'}
                  />
                </NFormItem>
                <NFormItem label={'估值依据'} path='equipName'>
                  <NInput
                    allowInput={this.trim}
                    v-model={[item.valuationBasis, 'value']}
                    placeholder={'请输入估值依据'}
                  />
                </NFormItem>
              </NCard>
            )
          })}
        </NForm>
      </Modal>
    )
  }
})

export default ProjectModal
