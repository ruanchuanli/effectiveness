import { defineComponent, onMounted, ref, watch } from 'vue'
import { NButton, NButtonGroup, useMessage } from 'naive-ui'
import styles from './right.module.scss'
import { useRoute, useRouter } from 'vue-router'
import WeightModal from '../weight-modal'
import NormalizationModal from '../normalization-modal'
import { getWeightDetail } from '@/service/modules/assessmentPlan'
import PieChart from '@/components/chart/modules/Pie'

const props = {
  labelData: {
    type: Object,
    default: {}
  },
  treeData: {
    type: Object,
    default: () => []
  },
  relationship: {
    type: Object,
    default: () => []
  },
  pieData: {
    type: Array,
    default: () => []
  },
  weightDetail: {
    type: Object,
    default: () => ({})
  }
}

export default defineComponent({
  name: 'right-weight',
  props,
  emits: ['stepOver'],
  setup(props, context) {
    const message = useMessage()
    const router = useRouter()
    const route = useRoute()
    const showModal = ref(false)
    const showNormalizationModal = ref(false)
    const indexList = ref([])
    const weightList = ref<any[]>([])

    const getIndexList = () => {
      const currenNodeCode = props.labelData.code
      // console.log('当前节点', props.labelData)
      // console.log('所有节点', props.treeData)
      // console.log('关系', props.relationship)
      indexList.value = props.relationship
        .filter((item) => {
          // props.treeData.filter((item) => {
          //   console.log(item)
          //   return item.code === item.preTaskCode
          // })
          // return props.treeData.find((item) => item.code === item.preTaskCode)
          return item.postTaskCode === currenNodeCode
          // }
        })
        .map((item) => {
          return props.treeData.find(
            (findItem) => findItem.code === item.preTaskCode
          )
        }).filter(item => item)
    }

    const changeSweight = () => {
      // console.log(props)
      if (!props.labelData.name) {
        message.warning('请选择节点')
        return
      }

      getIndexList()
      console.log(indexList);
      
      if (indexList.value.length > 1) {
        if (indexList.value.some((item:any) => item.indicatorId == null)) {
          window.$message.error("指标体系定义缺失")
          return
        }

        showModal.value = true
      } else {
        message.warning('没有指标或少于一个指标时无需设置权重')
      }
    }
    const changeNormalization = () => {
      if (!props.labelData.name) {
        message.warning('请选择节点')
        return
      }

      getIndexList()
      console.log(111111,indexList);
      
      showNormalizationModal.value = true
    }
    const AddCalculationFlow = () => {
      // /assessmentPlan/computeWork/:taskcode
      console.log(props.labelData.code, '44')
      if (
        props.labelData.taskType &&
        props.labelData.taskType === 'SUB_PROCESS'
      ) {
        router.push({
          path: `/assessmentPlan/computeWork/${props.labelData.code}`,
          query: {
            evaluationEngineeringId: route.query.evaluationEngineeringId,
            projectCode: props.labelData.projectCode,
            processDefinitionCode:
              props.labelData.taskParams.processDefinitionCode
          }
        })
      } else {
        router.push({
          path: `/assessmentPlan/computeWork/${props.labelData.code}`,
          query: {
            evaluationEngineeringId: route.query.evaluationEngineeringId,
            projectCode: props.labelData.projectCode
            // processDefinitionCode: props.labelData.taskParams.processDefinitionCode
          }
        })
      }
    }

    const stepOver = () => {
      context.emit('stepOver')
      showModal.value = false;
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
          <div class={styles.labelTitle}>指标设置</div>
          <WeightModal
            v-model:show={showModal.value}
            onStepOver={stepOver}
            indexList={indexList}
            labelData={props.labelData}
            weightDetail={props.weightDetail}
          />
          <NormalizationModal
            v-model:show={showNormalizationModal.value}
            indexList={indexList}
            labelData={props.labelData}
          />
          {/* <NRadioGroup v-model:value={groupValue} on-update:value={changeGroup}  size={'medium'}>
                            <NRadioButton value={'Sweight'}>
                                设置权重
                            </NRadioButton>
                            <NRadioButton value={'normalization'}>
                            指标归一化
                            </NRadioButton>
                    </NRadioGroup> */}
          <NButtonGroup>
            <NButton ghost onClick={changeSweight}>
              设置权重
            </NButton>
            <NButton ghost onClick={changeNormalization}>
              指标归一化
            </NButton>
            {!props.labelData?.relation?.preTaskCode ? (
              <NButton ghost onClick={AddCalculationFlow}>
                添加计算流程
              </NButton>
            ) : (
              ''
            )}
          </NButtonGroup>

          <div class={styles.below}>
            <div class={styles.labelTitle}>权重信息</div>
            {props.weightDetail.weightList && props.weightDetail.weightList.length > 0  && (
              <PieChart data={props.weightDetail.weightList} height={200} />
            )}
          </div>
        </div>
      </div>
    )
  }
})
