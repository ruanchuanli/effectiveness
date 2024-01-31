import {
    defineComponent,
    PropType,
    ref,
    watch,
    nextTick,
    provide,
    computed,
    h,
    Ref,
    toRefs,
    getCurrentInstance,
    reactive
} from 'vue'
import { useI18n } from 'vue-i18n'
import type { FormRules } from 'naive-ui'
import { NForm, NSelect,NFormItem, NInput, NDatePicker } from 'naive-ui'
import Modal from '@/components/modal'
// import Detail from './detail'
import { Router, useRouter } from 'vue-router'
import{ITaskData} from './types'
import { values } from 'lodash'
import { formatModel } from '@/views/projects/task/components/node/format-data'
import { useTaskNodeStore } from '@/store/project/task-node'
const props = {
    show: {
        type: Boolean as PropType<boolean>,
        default: false
    },
    data: {
      type: Object as PropType<ITaskData>,
      default: { code: 0, taskType: 'SHELL', name: '' }
    },
}
const trim = getCurrentInstance()?.appContext.config.globalProperties.trim
const NodeModal = defineComponent({
    name: 'NodeModal',
    props,
    emits: ['confirmModal', 'cancelModal'],
    setup(props, ctx) {
      let model = reactive<any>({
        indicatorName:'',
        indicatorDesc:undefined,
        unit:undefined,
        dataDesc:undefined,
        dataDescInventory:undefined,
        indicatorType:undefined,
        dataRequirements:undefined,
        rawScript:':',
        flag:'YES',
        workerGroup:'default'

        
    })
    const taskStore =  useTaskNodeStore()
    const resetValues = (initialValues: { [field: string]: any }) => {
      const modelKeys = Object.keys(model)
      for (const key of modelKeys) {
        if (!Object.keys(initialValues).includes(key)) {
      model[key]
        }
      }
  
      setValues(initialValues)
    }
        // const { t, locale } = useI18n()
        const router: Router = useRouter()
        console.log(props.show);

        const confirmModal = () => {
            console.log(model);
            
            ctx.emit('confirmModal',model)
        }
        const cancelModal = () => {
            // initModel()
            ctx.emit('cancelModal', props.show)
        }
        const indicatorOptions = [{
            label:'成本型',
            value:'成本型'
        },{
            label:'效益型',
            value:'效益型'
        },{
            label:'固定型',
            value:'固定型'
        },{
            label:'偏离型',
            value:'偏离型'
        }
    
    ]
   
        const rules = {
            rules: {
                indicatorName: {
                  required: true,
                  trigger: ['input', 'blur'],
                  validator() {
                    if (model.indicatorName === '') {
                      return new Error('请填写指标名称')
                    }
                  }
                }
              } as FormRules
        }
        const setValues = (initialValues: { [field: string]: any }) => {
          for (const [key, value] of Object.entries(initialValues)) {
            model[key] = value
          }
        }
        watch(
          () => [props.data],
          async () => {
            if (!props.show) return
            // initHeaderLinks(props.processInstance, props.data.taskType)
            // taskStore.init()
          if(formatModel(props.data).indicatorName){
            // await nextTick()
            console.log(formatModel(props.data),'formatModel(props.data)');
            model = {...formatModel(props.data)}
            // setValues(formatModel(props.data))
          }
        
            // 
            // detailRef.value.value.setValues(formatModel(props.data))
          }
        )
        watch(
          () => [props.show],
          async () => {
            // if (!props.show) return
            // initHeaderLinks(props.processInstance, props.data.taskType)
            // taskStore.init()
              if(props.show === false){
                resetValues({    
                  indicatorName:'',
                    indicatorDesc:undefined,
                    unit:undefined,
                    dataDesc:undefined,
                    dataDescInventory:undefined,
                    indicatorType:undefined,
                    dataRequirements:undefined,
                    rawScript:':'
                })
    
              }
              console.log(model,'wwwwwww');
              
         
          }
        )
    const trim = getCurrentInstance()?.appContext.config.globalProperties.trim
        return  {
           model,
            cancelModal,
            rules,confirmModal,
            trim,indicatorOptions

        }
    },
    
    render() {
        const {rules:{rules:validate }} =this
            return (

            
                <Modal
                v-model:show={this.show}
               title={'新增指标'}
               onConfirm={this.confirmModal}
               onCancel={this.cancelModal}
               confirmDisabled={!this.model.indicatorName}
             >
             <NForm rules={validate} ref='formRef'>
             <NFormItem
               label={'指标名称'}
               path='indicatorName'
             >
                {/* {this.model.indicatorName} */}
               <NInput
                 allowInput={this.trim}
                 maxlength="20" 
                 v-model:value={this.model.indicatorName}
                 placeholder={'请输入指标名称'}
                 class='input-project-name'
               />
             </NFormItem>
             <NFormItem
               label={'指标描述'}
               path='indicatorDesc'
             >
               <NInput
                 allowInput={this.trim}
                 type='textarea'
                 maxlength="500" 
                 v-model:value={this.model.indicatorDesc}
                 placeholder={'请输入指标描述'}
                 show-count
               />
             </NFormItem>
             <NFormItem label={'指标类型'} path='indicatorType'>


                <NSelect
                v-model:value={this.model.indicatorType}
                 placeholder='请选择指标体系模板'
                 options={this.indicatorOptions}
                >

                </NSelect>
             </NFormItem>
             <NFormItem
               label={'单位'}
               path='unit'
             >
               <NInput
                 allowInput={this.trim}
                
                 v-model:value={this.model.unit}
                 maxlength="10" 
                 placeholder={'请输入单位'}
               />
             </NFormItem>
                <div>数据需求 <span style={'color:red;'}>*</span>建议在末级指标填写</div>
                <NFormItem
               label={'数据需求'}
               path='dataRequirements'
             >
               <NInput
                 allowInput={this.trim}
                
                 v-model:value={this.model.dataRequirements}
                 maxlength="10" 
                 placeholder={'请输入数据需求'}
               />
             </NFormItem>
             <NFormItem
               label={'数据描述'}
               path='dataDesc'
             >
               <NInput
                 allowInput={this.trim}
                 type='textarea'
                 maxlength="500" 
                 v-model:value={this.model.dataDesc}
                 placeholder={'请输入数据描述'}
                 show-count
               />
             </NFormItem>
             <NFormItem
               label={'数据描述清单'}
               path='dataDescInventory'
             >
               <NInput
                 allowInput={this.trim}
                 type='textarea'
                 maxlength="500" 
                 v-model:value={this.model.dataDescInventory}
                 placeholder={'请输入数据描述清单'}
                 show-count
               />
             </NFormItem>
           </NForm>
             </Modal>
         )
    },
    
})
export default NodeModal