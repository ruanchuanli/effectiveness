import { NLayout, NLayoutContent, NLayoutSider, NMenu } from 'naive-ui'
import { defineComponent, onMounted, provide, reactive, ref, toRefs } from 'vue'
import EquipmentCard from './components/equipment-card'
import { getDataSetTree } from '@/service/modules/theme-data'

export default defineComponent({
  name: 'EquipmentDir',
  setup() {
    const variables = reactive({
      dataSetNameList: []
    })
    const dataSetName = ref('')

    provide('dataSetName', dataSetName)

    onMounted(() => {
      getDataSetTree().then((res: any) => {
        variables.dataSetNameList = res.map((k: string) => ({
          label: k,
          key: k
        }))
        dataSetName.value = res[0]
      })
    })

    return {
      ...toRefs(variables),
      dataSetName
    }
  },
  render() {
    return (
      <NLayout hasSider position='absolute'>
        <NLayoutSider>
          <NMenu
            class='tab-vertical'
            v-model:value={this.dataSetName}
            options={this.dataSetNameList}
          />
        </NLayoutSider>
        <NLayoutContent style={{ padding: '0 0 0 20px' }}>
          <EquipmentCard />
        </NLayoutContent>
      </NLayout>
    )
  }
})
