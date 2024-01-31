import {
  defineComponent,
  getCurrentInstance,
  PropType,
  toRefs,
  watch,
  ref,
  h
} from 'vue'
import { PlusOutlined } from '@vicons/antd'

import {
  NForm,
  NFormItem,
  NInput,
  NSelect,
  NDynamicTags,
  NDataTable,
  NButton,
  NSpace,
  NIcon,
  NInputNumber,
  useMessage
} from 'naive-ui'
import { useForm } from './use-form'
import Modal from '@/components/modal'
import { getAsseccmentPlanOption } from '@/service/modules/assessmentTask/index'
import { useRoute } from 'vue-router'
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

const TaskModal = defineComponent({
  name: 'TaskModal',
  props,
  emits: ['cancelModal', 'confirmModal'],
  setup(props, ctx) {
    const { variables, t, handleValidate } = useForm(props, ctx)
    const leftFormRef = ref(null)
    const rightFormRef = ref(null)
    const route = useRoute()
    const message = useMessage()
    const cancelModal = () => {
      if (props.statusRef === 0) {
        variables.model.evaluationTaskName = ''
        variables.model.evaluationTaskDesc = ''
        variables.model.evaluationPlanId = ''
        variables.model.evaluationTarget = []
        variables.model.evaluationLevel = [{ intervalLeftValue: 0.0 }]
      } else {
        variables.model.evaluationTaskName = props.row.evaluationTaskName
        variables.model.evaluationTaskDesc = props.row.evaluationTaskDesc
        variables.model.evaluationTarget = props.row.evaluationTarget.split(',')
        variables.model.evaluationLevel = JSON.parse(props.row.evaluationLevel)
        variables.model.evaluationPlanId = props.row.evaluationPlanId
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
          variables.model.evaluationTaskName = ''
          variables.model.evaluationTaskDesc = ''
          variables.model.evaluationPlanId = ''
          variables.model.evaluationTarget = []
          variables.model.evaluationLevel = [{ intervalLeftValue: 0.0 }]
        } else {
          variables.model.evaluationTaskName = props.row.evaluationTaskName
          variables.model.evaluationTaskDesc = props.row.evaluationTaskDesc
          variables.model.evaluationTarget =
            props.row.evaluationTarget.split(',')
          variables.model.evaluationLevel = JSON.parse(
            props.row.evaluationLevel
          )
          variables.model.evaluationPlanId = props.row.evaluationPlanId
        }
      }
    )

    watch(
      () => props.row,
      () => {
        variables.model.evaluationTaskName = props.row.evaluationTaskName
        variables.model.evaluationTaskDesc = props.row.evaluationTaskDesc
        variables.model.evaluationTarget = props.row.evaluationTarget.split(',')
        variables.model.evaluationLevel = JSON.parse(props.row.evaluationLevel)
        variables.model.evaluationPlanId = props.row.evaluationPlanId
      }
    )
    const taskid = Number(route.query.taskid)
    const assessmentTaskOptions = ref([])
    getAsseccmentPlanOption(taskid).then((res: any) => {
      assessmentTaskOptions.value = res
    })

    const createColumns = (): DataTableColumns<RowData> => [
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
                  onUpdateValue(v) {
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
        key: 'intervalLeftValue',
        render(row, index) {
          return h(NForm, { ref: leftFormRef }, [
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
                  value: row.intervalLeftValue,
                  onUpdateValue(v) {
                    variables.model.evaluationLevel[index].intervalLeftValue = v
                  }
                })
              ]
            )
          ])
        }
      },
      {
        title: '区间右值',
        key: 'intervalRightValue',
        render(row, index) {
          return h(NForm, { ref: rightFormRef }, [
            h(
              NFormItem,
              {
                rule: {
                  // required: true,
                  trigger: ['input', 'blur']
                  // validator(value) {
                  //   if (variables.model.evaluationLevel.length > 1) {
                  //     const next = variables.model.evaluationLevel[index + 1]
                  //     if (next.intervalLeftValue !== value) {
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
                  value: row.intervalRightValue,
                  onUpdateValue(v) {
                    variables.model.evaluationLevel[index].intervalRightValue =
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

    const handleAddEvaluationTarget = () => {
      variables.model.evaluationLevel.push({})
    }

    const handleDel = (index: number) => {
      variables.model.evaluationLevel.splice(index, 1)
    }

    return {
      ...toRefs(variables),
      t,
      cancelModal,
      confirmModal,
      leftFormRef,
      rightFormRef,
      trim,
      handleAddEvaluationTarget,
      handleDel,
      assessmentTaskOptions,
      columns: createColumns()
    }
  },
  render() {
    const { t } = this
    return (
      <Modal
        title={
          this.statusRef === 0
            ? t('assessmenttask.button.create')
            : t('assessmenttask.button.edit')
        }
        show={this.showModalRef}
        onConfirm={this.confirmModal}
        onCancel={this.cancelModal}
        confirmClassName='btn-submit'
        cancelClassName='btn-cancel'
        confirmLoading={this.saving}
        width={800}
      >
        <NForm
          size='large'
          rules={this.rules}
          ref='formRef'
          requireMarkPlacement={'left'}
        >
          <NFormItem
            label={t('assessmenttask.projects.column_name')}
            path='evaluationTaskName'
          >
            <NInput
              allowInput={this.trim}
              v-model={[this.model.evaluationTaskName, 'value']}
              placeholder={t('assessmenttask.projects.tips_name')}
              class='input-project-name'
            />
          </NFormItem>
          <NFormItem
            label={t('assessmenttask.projects.column_desc')}
            path='evaluationTaskDesc'
          >
            <NInput
              allowInput={this.trim}
              type='textarea'
              v-model={[this.model.evaluationTaskDesc, 'value']}
              placeholder={t('assessmenttask.projects.tips_desc')}
            />
          </NFormItem>
          <NFormItem label={'选择评估方案'} path='evaluationPlanId'>
            <NSelect
              v-model={[this.model.evaluationPlanId, 'value']}
              placeholder='请选择指标体系模板'
              options={this.assessmentTaskOptions}
            />
          </NFormItem>
          <NFormItem label={'评估对象'} path='evaluationTarget'>
            <NDynamicTags v-model={[this.model.evaluationTarget, 'value']} />
          </NFormItem>
          {/* show-require-mark */}
          <NFormItem
            label={
              <NSpace
                align='center'
                justify='space-between'
                style={{ width: '100%' }}
                path='evaluationLevel'
              >
                <div>评估等级</div>
                <NButton
                  size='small'
                  onClick={this.handleAddEvaluationTarget}
                  type='primary'
                >
                  <NIcon>
                    <PlusOutlined />
                  </NIcon>
                  {t('新增评价等级')}
                </NButton>
              </NSpace>
            }
          >
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

export default TaskModal
