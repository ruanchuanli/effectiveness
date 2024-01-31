import { defineComponent, PropType, reactive, Ref, ref, watch } from 'vue'
import { useI18n } from 'vue-i18n'
import { useRoute } from 'vue-router'
import { useThemeStore } from '@/store/theme/theme'
import { NModal, NTabPane, NTabs } from 'naive-ui'
import DagWeightAhp from './dag/dag-weight-ahp'
import DagWeightCustom from './dag/dag-weight-custom'
import { getWeightDetail } from '@/service/modules/assessmentPlan'

const props = {
  show: { type: Boolean as PropType<boolean>, default: false },
  indexList: { type: Object as PropType<any>, default: () => [] },
  labelData: { type: Object as PropType<Record<string, any>> },
  weightDetail: {
    type: Object,
    default: () => ({})
  }
}

export default defineComponent({
  name: 'weight-modal',
  props,
  emits: ['stepOver', 'update:show'],
  setup(props, context) {
    const { t } = useI18n()
    const route = useRoute()
    const theme = useThemeStore()

    const stepOver = () => {
      context.emit('stepOver')
    }

    const close = () => {
      context.emit('update:show')
    }

    return { stepOver, close }
  },

  render() {
    const { weightDetail, stepOver, indexList } = this

    return (
      <NModal
        style='width: 70%'
        show={this.show}
        preset='dialog'
        title='Dialog'
        v-slots={{
          header: () => <div class={'c-#000'}>权重设置</div>
        }}
        onClose={this.close}
      >
        <div class='c-#000'>
          <NTabs type='segment' v-model:value={weightDetail.weightType}>
            <NTabPane name={1} tab='层次分析法'>
              <DagWeightAhp
                weightDetail={weightDetail}
                indexList={indexList}
                onStepOver={stepOver}
              />
            </NTabPane>
            <NTabPane name={3} tab='自定义权重'>
              <DagWeightCustom
                weightDetail={weightDetail}
                indexList={indexList}
                onStepOver={stepOver}
              />
            </NTabPane>
          </NTabs>
        </div>
      </NModal>
    )
  }
})
