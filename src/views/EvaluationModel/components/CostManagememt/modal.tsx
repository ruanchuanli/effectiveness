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
  NRadio
} from 'naive-ui'
import { useForm } from './use-form'
import Modal from '@/components/modal'
import {
  getStageExpensesMapping,
  getEstimationMethodMapping,
  getEquipmentTypeMappding
} from '@/views/EvaluationModel/api'
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
          variables.model.modelName = ''
          variables.model.equipName = ''
          variables.model.equipType = ''
          variables.model.expenseType = ''
          variables.model.estimationMethod = ''
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
        variables.model.modelName = props.row.modelName
        variables.model.expenseType = props.row.expenseType
        variables.model.estimationMethod = props.row.estimationMethod
      }
    )

    const equipTypeOptions = ref([])
    const expenseTypeOptions = ref([])

    const estimationMethodOptions = reactive([
      {
        label: '工程估算法',
        value: '1'
      },
      {
        label: '相似费用法',
        value: '2'
      },
      {
        label: '参数费用法',
        value: '3'
      },
      {
        label: '专家判断法',
        value: '4'
      }
    ])

    const estimationMethodDocMapping = reactive({
      '1': '工程估算法是将项目划分为多个工作包,每个工作包再细分为具体工作项,通过估计每个工作项的成本并综合计算,得出项目总成本。',
      '2': '根据已知的相似工程项目的价格和规模,通过比较、加权或调整等方法确定估算价格。',
      '3': '按一定的基数乘系数的方法或自定义公式进行计算。',
      '4': '一种多目标决意的优化选择方法，依赖专家的经验、知识，集诸多专家的意见为一体，经综合分析、加权处理与矩阵运算，得出较为客观的各方案的排序，使复杂问题得到解决。'
    })

    onMounted(async () => {
      // 装备类型下拉数据获取
      equipTypeOptions.value = await getEquipmentTypeMappding()
      expenseTypeOptions.value = await getStageExpensesMapping()
    })

    return {
      ...toRefs(variables),
      cancelModal,
      confirmModal,
      trim,
      equipTypeOptions,
      expenseTypeOptions,
      estimationMethodOptions,
      estimationMethodDocMapping
    }
  },
  render() {
    return (
      <Modal
        title={this.statusRef === 0 ? '新增估算' : '修改估算'}
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
          require-mark-placement={'left'}
          label-align={'left'}
        >
          <NFormItem label={'估算模型名称'} path='modelName'>
            <NInput
              allowInput={this.trim}
              v-model={[this.model.modelName, 'value']}
              placeholder={'请输入估算模型名称'}
              class='input-project-name'
            />
          </NFormItem>
          <NFormItem label={'装备名称'} show-require-mark={false}>
            <NInput
              allowInput={this.trim}
              v-model={[this.model.equipName, 'value']}
              placeholder={'请输入装备名称'}
            />
          </NFormItem>
          <NFormItem label={'装备类型'} show-require-mark={false}>
            <NSelect
              v-model={[this.model.equipType, 'value']}
              options={this.equipTypeOptions}
              placeholder={'请选择装备类型'}
              size='small'
            />
          </NFormItem>
          <NFormItem label={'费用阶段'} path='expenseType'>
            <NSelect
              v-model={[this.model.expenseType, 'value']}
              options={this.expenseTypeOptions}
              placeholder={'请选择费用阶段'}
              size='small'
            />
          </NFormItem>
          <NFormItem label={'估算方式'} path='estimationMethod'>
            <NRadioGroup
              v-model={[this.model.estimationMethod, 'value']}
              name='radiobuttongroup1'
            >
              <NSpace>
                {this.estimationMethodOptions.map((estimationMethodItem) => {
                  return (
                    <NRadio value={estimationMethodItem.value}>
                      {estimationMethodItem.label}
                    </NRadio>
                  )
                })}
              </NSpace>
              <NSpace>
                <strong>描述:</strong>
                {
                  this.estimationMethodDocMapping[
                    this.model.estimationMethod
                  ] as CreateReq
                }
              </NSpace>
            </NRadioGroup>
          </NFormItem>
        </NForm>
      </Modal>
    )
  }
})

export default ProjectModal
