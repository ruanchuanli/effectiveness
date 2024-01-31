import { onMounted, ref, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'

interface RouterInfo {
  name: string
}

export function useRouterInfo() {
  const routerInfo = ref<RouterInfo>({ name: '' })
  const router = useRouter()
  const route = useRoute()

  const handleBack = () => {
    router.back()
  }

  onMounted(() => {
    routerInfo.value.name = route.query.modelName as string
  })

  return {
    routerInfo,
    handleBack
  }
}
