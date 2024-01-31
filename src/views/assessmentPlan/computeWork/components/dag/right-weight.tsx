import {
    defineComponent,
    ref,
    provide,
    PropType,
    toRef,
    watch,
    onBeforeUnmount,
    computed
} from 'vue'
import {
    NTooltip,
    NIcon,
    NButton,
    NSelect,
    NPopover,
    NText,
    NTag,
    NButtonGroup,
    useMessage,
    NTabs,
    NTabPane,
    NTable
} from 'naive-ui'
import styles from './right.module.scss'
import { useRoute, useRouter } from 'vue-router'
const props = {

    labelData: {
        type: Object,
        default: {}
    }
}

export default defineComponent({
    name: 'right-weight',
    emits: [''],
    props,
    setup(props, context) {
        console.log(props.labelData, 'ddd');
        const message = useMessage()
        const router = useRouter()
        const changeSweight = () => {


            if (!props.labelData.name) {
                message.warning('请选择节点')
                return
            }



        }
        const changeNormalization = () => {
            if (!props.labelData.name) {
                message.warning('请选择节点')
                return
            }
        }
        const AddCalculationFlow = () => {
            // /assessmentPlan/computeWork/:taskcode
            console.log(props.labelData.code, '44');

            router.push({
                path: `/assessmentPlan/computeWork/${props.labelData.code}`
            })
        }
        return () => (
            <div class={styles.withConent}>
                <div class={styles.top}>
                    <div class={styles.labelTitle}>
                        算子信息
                    </div>
                    <div class={styles.labelLi}>
                        算子名称：{props.labelData.name ? props.labelData.name : '--'}
                    </div>
                    <div class={styles.labelLi}>
                        算子描述：
                        {props.labelData.operatorDesc ? props.labelData.operatorDesc : '--'}
                    </div>


                </div>
                <div class={styles.below}>
                    <div class={styles.labelTitle} >参数设置</div>
                    <NTabs type="line" animated>
                        <NTabPane name="输入参数" tab="输入参数">
                            <NTable>
                                <thead>
                                    <tr style={'text-align: center;'}>
                                        <th>参数名称</th>
                                        <th>参数描述</th>
                                        <th>参数类型</th>

                                    </tr>
                                </thead>
                                <tbody>
                                    {
                                     props.labelData.inputParamsList?   props.labelData.inputParamsList.map((item: any, index: any) => {
                                            return (
                                                < tr data-index={index} style={'text-align: center;'}>
                                                    <td>{item.paramName ? item.paramName : '--'}</td>
                                                    <td>{item.paramDes ? item.paramDes : '--'}</td>
                                                    <td>{item.selectValue ? item.selectValue : '--'}</td>

                                                </tr>
                                            )
                                        }): < tr style={'text-align: center;'}>
                                         暂无数据

                                    </tr>
                                    }


                                </tbody>

                            </NTable>
                        </NTabPane>
                        <NTabPane name="输出参数" tab="输出参数">
                            <NTable>
                                <thead>
                                    <tr style={'text-align: center;'}>
                                        <th>参数名称</th>
                                        <th>参数描述</th>
                                        <th>参数类型</th>

                                    </tr>
                                </thead>
                                <tbody>
                                    {
                                        props.labelData.outputParamsList ? props.labelData.outputParamsList.map((item: any, index: any) => {
                                            return (
                                                < tr data-index={index} style={'text-align: center;'}>
                                                    <td>{item.paramName ? item.paramName : '--'}</td>
                                                    <td>{item.paramDes ? item.paramDes : '--'}</td>
                                                    <td>{item.selectValue ? item.selectValue : '--'}</td>

                                                </tr>
                                            )
                                        }) : < tr style={'text-align: center;'}>
                                           暂无数据

                                        </tr>
                                    }


                                </tbody>

                            </NTable>
                        </NTabPane>

                    </NTabs>

                </div>
            </div >
        )
    }
})