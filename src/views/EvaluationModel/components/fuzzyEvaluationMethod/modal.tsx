import { defineComponent, PropType, reactive, Ref, ref, watch } from 'vue'
import { useI18n } from 'vue-i18n'
import { useRoute } from 'vue-router'
import { useThemeStore } from '@/store/theme/theme'
import { NModal, NTabPane, NTabs,NTable,NInputNumber,NSpace,NButton } from 'naive-ui'

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
      console.log(12)
      
      context.emit('update:show')
    }
    const confirmModal = () => {
    }

    return { stepOver, close, confirmModal, }
  },

  render() {
    const { weightDetail, stepOver, indexList } = this

    return (
      <NModal
        style='width: 70%'
        show={this.show}
        preset='dialog'
        title='权重设置'
      >
        <NTable striped>
          <thead>
            <tr>
              <th>指标</th>
              <th>重要度</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td>量值比对误差</td>
              <td>
                <NInputNumber/>
              </td>
            </tr>
            <tr>
              <td>参考数据权威得分</td>
              <td>
                <NInputNumber 
                 min={0}
                 precision={3}/>
              </td>
            </tr>
            <tr>
              <td>比对广泛性</td>
              <td>
                <NInputNumber/>
              </td>
            </tr>
            </tbody>
          </NTable>
          <div>
          <NSpace>
            <NButton onClick={this.close}>取消</NButton>
            <NButton type='info' onClick={this.confirmModal}>
              提交
            </NButton>
          </NSpace>
        </div>
      </NModal>
    )
  }
})
