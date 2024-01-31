import { defineComponent } from 'vue'
import { useMessage } from 'naive-ui'
import styles from './right.module.scss'
import { useRoute, useRouter } from 'vue-router'
import PieChart from '@/components/chart/modules/Pie'
const props = {
  labelData: {
    type: Object,
    default: {}
  },
  pieData: {
    type: Array,
    default: []
  }
}

export default defineComponent({
  name: 'right-weight',
  props,
  emits: [''],
  setup(props, context) {
    const message = useMessage()

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
      if (
        props.labelData.taskType &&
        props.labelData.taskType === 'SUB_PROCESS'
      ) {
        router.push({
          path: `/assessmentPlan/computeWork/${props.labelData.code}`,
          query: {
            projectCode: props.labelData.projectCode,
            processDefinitionCode:
              props.labelData.taskParams.processDefinitionCode
          }
        })
      } else {
        router.push({
          path: `/assessmentPlan/computeWork/${props.labelData.code}`,
          query: {
            projectCode: props.labelData.projectCode
            // processDefinitionCode: props.labelData.taskParams.processDefinitionCode
          }
        })
      }
    }

    return () => (
      <div class={styles.withConent}>
        <div class={styles.top}>
          <div class={styles.labelTitle}>指标信息</div>
          <div class={styles.labelLi}>
            指标名称：{props.labelData.name ? props.labelData.name : '--'}
          </div>
          <div class={styles.labelLi}>
            指标描述：
            {props.labelData.description ? props.labelData.description : '--'}
          </div>
          <div class={styles.labelLi}>
            指标类型：{' '}
            {props.labelData.indicatorType
              ? props.labelData.indicatorType
              : '--'}
          </div>
          {/* <div class={styles.labelLi}>
                        中心值：
                    </div> */}
          <div class={styles.labelLi}>
            单位： {props.labelData.unit ? props.labelData.unit : '--'}
          </div>
        </div>
        <div class={styles.below}>
          <div class={styles.labelTitle} >权重信息</div>
          {props.pieData.length > 0 && <PieChart data={props.pieData} height={200} />}
        </div>
      </div>
    )
  }
})
