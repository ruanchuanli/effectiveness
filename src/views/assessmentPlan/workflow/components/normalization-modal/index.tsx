import {
  computed,
  defineComponent,
  inject,
  PropType,
  reactive,
  ref,
  watch
} from 'vue'
import { useI18n } from 'vue-i18n'
import { useRoute } from 'vue-router'
import { useThemeStore } from '@/store/theme/theme'
import {
  NImage,
  NInputNumber,
  NLayout,
  NLayoutContent,
  NLayoutSider,
  NModal,
  NTabPane,
  NTabs,
  NTree
} from 'naive-ui'
import {
  getNormalizationEcho,
  updateNormalizationEchoType
} from '@/service/modules/assessmentPlan'
import NormalizationChart from './components/normalization-chart'
import jcpng from '@/assets/images/jc.png'
import xxpng from '@/assets/images/xx.png'

const props = {
  show: { type: Boolean as PropType<boolean>, default: false },
  indexList: { type: Object as PropType<any>, default: () => [] },
  labelData: { type: Object as PropType<Record<string, any>> }
}

export default defineComponent({
  name: 'normalization-modal',
  props,
  emits: ['update:show'],
  setup(props, context) {
    const route = useRoute()
    const labelObj = inject<any>('labelObj')
    const selectedKey = ref<string>('')

    const treeData = computed(() => [
      {
        name: labelObj.value.name,
        code: labelObj.value.code,
        child: props.indexList.value.map((item: any) => {
          return {
            name: item.name,
            code: item.code
          }
        })
      }
    ])
    const defaultExpandedKeys = computed(() => [labelObj.value.code])

    const data = reactive({
      normalizationLimits: { lower: 0, upper: 1 },
      normalizationEchoType: 0
    })

    const close = () => {
      context.emit('update:show')
    }

    const save = () => {
      const normalizationLimits =
        data.normalizationEchoType == 1
          ? JSON.stringify(data.normalizationLimits)
          : undefined

      updateNormalizationEchoType(
        route.params.id as string,
        selectedKey.value,
        data.normalizationEchoType,
        normalizationLimits
      ).then(() => {
        window.$message.success('保存成功')
      })
    }

    const onUpdateSelectedKeys = (keys: Array<string>) => {
      selectedKey.value = keys[0]
      updateNormalizationEcho()
    }

    const updateNormalizationEcho = () => {
      getNormalizationEcho(route.params.id as string, selectedKey.value)
        .then((res: any) => {
          data.normalizationLimits = res.normalizationLimits || {
            lower: 0,
            upper: 1
          }
          data.normalizationEchoType = res.normalizationEchoType || 0
        })
        .catch(() => {
          data.normalizationLimits = {
            lower: 0,
            upper: 1
          }
          data.normalizationEchoType = 0
        })
    }

    watch(
      () => props.show,
      (show) => {
        if (!show) {
          return
        }

        selectedKey.value = props.labelData?.code
        updateNormalizationEcho()
      }
    )

    return {
      treeData,
      defaultExpandedKeys,
      close,
      data,
      save,
      onUpdateSelectedKeys,
      selectedKey
    }
  },

  render() {
    const { treeData, defaultExpandedKeys, close, data } = this

    return (
      <NModal
        style='width: 70%'
        show={this.show}
        preset='dialog'
        title='Dialog'
        v-slots={{
          header: () => <div class={'c-#000'}>归一化设置</div>
        }}
        onClose={close}
        positiveText='保存'
        negativeText='关闭'
        onPositiveClick={this.save}
        onNegativeClick={close}
      >
        <NLayout has-sider>
          <NLayoutSider content-style='padding: 24px;'>
            <NTree
              block-line
              data={treeData}
              default-expanded-keys={defaultExpandedKeys}
              key-field='code'
              label-field='name'
              children-field='child'
              selectable
              defaultSelectedKeys={[this.selectedKey]}
              onUpdateSelectedKeys={this.onUpdateSelectedKeys}
              cancelable={false}
            />
          </NLayoutSider>
          <NLayoutContent content-style='padding: 24px;'>
            <p>选择归一化方式：</p>
            <NTabs type='segment' v-model:value={data.normalizationEchoType}>
              <NTabPane name={1} tab='线性归一化'>
                <div style={{ display: 'flex' }}>
                  <div>
                    <span>下限</span>
                    <NInputNumber
                      v-model:value={data.normalizationLimits.lower}
                      max={data.normalizationLimits.upper - 1}
                    ></NInputNumber>
                  </div>
                  <div>
                    <span>上限</span>
                    <NInputNumber
                      v-model:value={data.normalizationLimits.upper}
                      min={data.normalizationLimits.lower + 1}
                    ></NInputNumber>
                  </div>
                </div>
                <NormalizationChart
                  lower={data.normalizationLimits.lower}
                  upper={data.normalizationLimits.upper}
                />
              </NTabPane>
              <NTabPane name={2} tab='线性尺度变换法'>
                <NImage
                  src={xxpng}
                  style={{ display: 'flex', justifyContent: 'center' }}
                  imgProps={{ style: { width: '100%' } }}
                />
              </NTabPane>
              <NTabPane name={3} tab='极差变换法'>
                <NImage
                  src={jcpng}
                  style={{ display: 'flex', justifyContent: 'center' }}
                  imgProps={{ style: { width: '100%' } }}
                />
              </NTabPane>
            </NTabs>
          </NLayoutContent>
        </NLayout>
      </NModal>
    )
  }
})
