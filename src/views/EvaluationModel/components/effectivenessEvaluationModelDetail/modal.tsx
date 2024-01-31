import {
  defineComponent,
  getCurrentInstance,
  onMounted,
  PropType,
  reactive,
  ref,
  toRefs,
  watch,
  h,
} from 'vue'
import { PlusOutlined } from '@vicons/antd'
import {
  NForm,
  NFormItem,
  NInput,
  NInputNumber,
  NSelect,
  NDynamicTags,
  NSpace,
  NButton,
  NIcon,
  NDataTable,
} from 'naive-ui'
import { useForm} from './use-form'
import Modal from '@/components/modal'
import {
  getStageExpensesMapping,
  getEvaluationMethodModelList
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
    
    const { variables, handleValidate, t } = useForm(props, ctx)

    const cancelModal = () => {
      if (props.statusRef === 0) {
        console.log(11);
        
        variables.model.id = ''
        variables.model.modelName = ''
        variables.model.modelDesc = ''
        variables.model.evaluationMethod = ''
        variables.model.evaluationTarget = []
        variables.model.evaluationLevel = []
      } else {
        // 编辑  从表格获取数据
        console.log(1)
        variables.model.id = ''
        // variables.model.evaluationTarget = props.row.evaluationTarget.split(',')
        // variables.model.modelName = props.row.modelName
        // variables.model.modelDesc = props.row.modelDesc
        // variables.model.evaluationMethod = props.row.evaluationMethod
        // variables.model.evaluationLevel = JSON.parse(props.row.evaluationLevel)
      }
      ctx.emit('cancelModal', props.showModalRef)
    }

    const confirmModal = () => {
      handleValidate(props.statusRef)
    }
    const createColumns = () => [
      {
        title: '序号',
        key: 'index',
        width: 60,
        align: 'center',
        render: (unused: any, index: number) => index + 1
      },
      {
        title: '级别',
        key: 'level',
        render(row, index) {
          return h(NForm, null, [
            h(
              NFormItem,
              {
                // rule: {
                //     required: true,
                //     message: '请输入姓名',
                //     trigger: ['input', 'blur']
                //   }
              },
              [
                h(NInput, {
                  placeholder: '',
                  value: row.level,
                  onUpdateValue(v:any) {
                    variables.model.evaluationLevel[index].level = v
                  }
                })
              ]
            )
          ])
        }
      },
      {
        title: '区间左值',
        key: 'left',
        render(row, index) {
          return h(NForm, { ref }, [
            h(
              NFormItem,
              {
                rule: {
                  // required: true,
                  trigger: ['input', 'blur']
                  // validator() {
                  //   if (variables.model.evaluationLevel.length > 1) {
                  //     return new Error('不能大于等于区间右值')
                  //   }
                  // }
                }
              },
              [
                h(NInputNumber, {
                  showButton: false,
                  placeholder: '',
                  precision: 4,
                  disabled: index === 0 ? true : false,
                  value: row.left,
                  onUpdateValue(v:any) {
                    variables.model.evaluationLevel[index].left = v
                  }
                })
              ]
            )
          ])
        }
      },
      {
        title: '区间右值',
        key: 'right',
        render(row, index) {
          return h(NForm, { ref }, [
            h(
              NFormItem,
              {
                rule: {
                  // required: true,
                  trigger: ['input', 'blur']
                  // validator(value) {
                  //   if (variables.model.evaluationLevel.length > 1) {
                  //     const next = variables.model.evaluationLevel[index + 1]
                  //     if (next.left !== value) {
                  //       return new Error('与下个级别区间左值不相等')
                  //     }
                  //     return true;
                  //   }
                  // }
                }
              },
              [
                h(NInputNumber, {
                  showButton: false,
                  placeholder: '',
                  precision: 4,
                  value: row.right,
                  onUpdateValue(v:any) {
                    variables.model.evaluationLevel[index].right =
                      v
                    // leftFormRef.value?.validate((valid) => {
                    //   if (valid) {
                    //     // 表单校验通过
                    //     console.log('表单校验通过');
                    //   }
                    // })
                  }
                })
              ]
            )
          ])
        }
      },
      {
        title: t('assessmenttask.projects.column_operation'),
        key: 'actions',
        width: 60,
        render(row: any, index: number) {
          return (
            index !== 0 && [
              h(
                NButton,
                {
                  text: true,
                  type: 'primary',
                  style: { marginRight: '10px' },
                  onClick: () => handleDel(index)
                },
                { default: () => '删除' }
              )
            ]
          )
        }
      }
    ]
    const trim = getCurrentInstance()?.appContext.config.globalProperties.trim
      
    watch(
      () => props.statusRef,
      () => {
        if (props.statusRef == 0) {
          variables.model.modelName = ''
          variables.model.modelDesc = ''
          variables.model.evaluationMethod = ''
          variables.model.evaluationTarget = []
          variables.model.evaluationLevel = [{ left: 0.0 }]
          console.log(22);
        } else {
          // 不知道啥时候触发
          variables.model.modelName = props.row.modelName
          variables.model.modelDesc = props.row.modelDesc
          variables.model.evaluationMethod = props.row.evaluationMethod
          // variables.model.evaluationLevel = JSON.parse(
          //   props.row.evaluationLevel
          // )
          console.log(2)
          // variables.model.evaluationTarget = props.row.evaluationTarget.split(',')
        }
      }
    )

    watch(
      () => props.row,
      () => {
        console.log(props.row)
        variables.model.modelName = props.row.modelName
        variables.model.modelDesc = props.row.modelDesc
        variables.model.evaluationMethod = props.row.evaluationMethod
        variables.model.evaluationLevel = []
        variables.model.id = props.row.id
        // variables.model.evaluationLevel = JSON.parse(props.row.evaluationLevel)
        console.log(3)
        // variables.model.evaluationTarget = props.row.evaluationTarget.split(',')
      }
    )

    const equipmentTypeOptions = ref([
      {
        label:"模糊评判法",
        value: 1
      },
      {
        label:"理想点法",
        value: 2
      },
      {
        label:"ADC法",
        value: 3
      },
    ])

    onMounted(async () => {
      console.log(props.statusRef);
      console.log(createColumns())
      variables.model.evaluationLevel = []
      
      
      // equipmentTypeOptions.value = await getEvaluationMethodModelList()
    })
    const handleAddEvaluationTarget = () => {
      // variables.model.evaluationLevel.push({left:0})
      variables.model.evaluationLevel.push({})
    }

    const handleDel = (index: number) => {
      variables.model.evaluationLevel.splice(index, 1)
    }
    return {
      ...toRefs(variables),
      cancelModal,
      confirmModal,
      trim,
      t,
      handleAddEvaluationTarget,
      handleDel,
      equipmentTypeOptions,
      columns: createColumns()
    }
  },
  render() {
    const { t } = this
    return (
      <Modal
        title={this.statusRef == 0 ? '新增评估模型名称' : '修改评估模型名称'}
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
          <NFormItem label='评估模型名称' path='modelName'>
            <NInput
              allowInput={this.trim}
              v-model={[this.model.modelName, 'value']}
              placeholder='评估模型名称'
              class='input-project-name'
            />
          </NFormItem>
          <NFormItem label='评估模型描述' path='modelDesc'>
            <NInput
              type='textarea'
              allowInput={this.trim}
              v-model={[this.model.modelDesc, 'value']}
              placeholder='请输入评估模型描述'
            />
          </NFormItem>
          <NFormItem label='评估方法模型' path='equipType'>
            <NSelect
              v-model={[this.model.evaluationMethod, 'value']}
              options={this.equipmentTypeOptions}
              placeholder='请选择评估方法模型'
              size='small'
            />
          </NFormItem>
          <NFormItem label={'评估对象'} path='evaluationTarget'>
            <NDynamicTags v-model={[this.model.evaluationTarget, 'value']} />
          </NFormItem>
          <NFormItem
            label={'评估等级'}
          >
              <NSpace
                align='center'
                justify='space-between'
                style={{ width: '100%' }}
              >
                <NButton
                  size='small'
                  onClick={this.handleAddEvaluationTarget}
                  type='primary'
                >
                  <NIcon>
                    <PlusOutlined />
                  </NIcon>
                  {'新增评价等级'}
                </NButton>
              </NSpace>
          </NFormItem>
          <NFormItem path='evaluationLevel'>
            <NDataTable
                columns={this.columns}
                data={this.model.evaluationLevel}
              />
          </NFormItem>
        </NForm>
      </Modal>
    )
  }
})

export default ProjectModal
