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
  NTabPane
} from 'naive-ui'
import styles from './right.module.scss'
import PieChart from '@/components/chart/modules/Pie'
import BarChart from '@/components/chart/modules/Bar'
import { useRoute, useRouter } from 'vue-router'
const props = {

  labelData: {
    type: Object,
    default: {}
  },
  pieData: {
    type: Array,
    default: []
  },
  barData: {
    type: Object,
    default: {}
  }
}

export default defineComponent({
  name: 'right-weight',
  emits: [''],
  props,
  setup(props, context) {
    const message = useMessage()
    const router = useRouter()

    const handleUpdateValue = () => {
      if (!props.labelData.name) {
        message.warning('请选择节点')
        return
      }
    }

    const AddCalculationFlow = () => {
      // /assessmentPlan/computeWork/:taskcode
      console.log(props.labelData.code, '44');
      if (props.labelData.taskType && props.labelData.taskType === 'SUB_PROCESS') {
        router.push({
          path: `/assessmentPlan/computeWork/${props.labelData.code}`,
          query: {
            projectCode: props.labelData.projectCode,
            processDefinitionCode: props.labelData.taskParams.processDefinitionCode
          }
        })

      } else {
        router.push({
          path: `/assessmentPlan/computeWork/${props.labelData.code}`,
          query: {
            projectCode: props.labelData.projectCode,
            // processDefinitionCode: props.labelData.taskParams.processDefinitionCode
          }
        })
      }

    }

    return () => (
      <div class={styles.withConent}>
        <div class={styles.top}>
          <div class={styles.labelTitle}>
            指标信息
          </div>
          <div class={styles.labelLi}>
            指标名称：{props.labelData.name ? props.labelData.name : '--'}
          </div>
          <div class={styles.labelLi}>
            指标描述：
            {props.labelData.description ? props.labelData.description : '--'}
          </div>
          <div class={styles.labelLi}>
            指标类型： {props.labelData.indicatorType ? props.labelData.indicatorType : '--'}
          </div>
          <div class={styles.labelLi}>
            单位： {props.labelData.unit ? props.labelData.unit : '--'}
          </div>
        </div>
        <div class={styles.below}>
          <NTabs type="line" animated onUpdateValue={handleUpdateValue}>
            <NTabPane name="指标分值" tab="指标分值">
              {props.barData.xAxisData && <BarChart xAxisData={props.barData?.xAxisData} seriesData={props.barData?.seriesData} height={250} />}
            </NTabPane>
            <NTabPane name="权重饼图" tab="权重饼图">
              {props.pieData.length > 0 && <PieChart data={props.pieData} height={250} />}
            </NTabPane>
            {/* <NTabPane name="隶属度" tab="隶属度">
            </NTabPane> */}
          </NTabs>
        </div>
      </div >
    )
  }
})