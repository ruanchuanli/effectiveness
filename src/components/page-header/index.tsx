import { ArrowLeftOutlined } from '@vicons/antd'
import { NGrid, NGridItem, NIcon, NButton, NSpace } from 'naive-ui'
import { defineComponent, PropType, toRefs, ref, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { taskDetailById } from '@/service/modules/assessment'

import { useI18n } from 'vue-i18n'

const props = {
  active: {
    type: String as PropType<string>,
    default: 'system'
  },
  title: {
    type: String as PropType<string>,
    default: ''
  },
  systemNum: {
    type: Number as PropType<number | string>,
    default: 0
  },
  planNum: {
    type: Number as PropType<number | string>,
    default: 0
  },
  taskNum: {
    type: Number as PropType<number | string>,
    default: 0
  },
  instanceNum: {
    type: Number as PropType<number | string>,
    default: 0
  }
}

interface RouterInfo {
  id: number
  name: string
}

const IndicatorModal = defineComponent({
  name: 'PageHeader',
  props,
  emits: ['handleBack', 'handleItemClick'],
  setup(props, ctx) {
    const { t } = useI18n()
    const routerInfo = ref<RouterInfo[]>([])
    const route = useRoute()
    const router = useRouter()

    const handleBack = () => {
      ctx.emit('handleBack')
    }

    const handleBackToindex = () => {
      router.replace(`/assessment/tasks/${route.query.evaluationEngineeringId}`)
    }

    onMounted(() => {
      let arr = JSON.parse(localStorage.getItem('assessment_steps') || '[]')
      if (arr.length > 2) {
        arr = arr.slice(0, 2)
      }
      routerInfo.value = arr
    })

    const handleItemClick = (value: string = 'system') => {
      const queryParams = {
        evaluationEngineeringId: route.query.evaluationEngineeringId,
        type: route.query.type,
        projectCode: route.query.projectCode,
        taskid: route.params.id
      }
      switch (value) {
        case 'system':
          router.push({
            path: `/assessment/indicator/${route.params.id}`,
            query: queryParams
          })
          break;
        case 'plan':
          router.push({
            path: `/assessmentPlan/projects/${route.params.id}`,
            query: queryParams
          })
          break;
        case 'task':
          router.push({
            path: `/assessmentTask/projects/${route.params.id}`,
            query: queryParams
          })
          break;
        case 'instance':
          router.push({
            path: `/assessmentTaskInstance/projects/${route.params.id}`,
            query: queryParams
          })
          break;
        default:
          break;
      }
      // ctx.emit('handleItemClick', value)
    }

    return {
      ...toRefs(props),
      t,
      handleBack,
      handleItemClick,
      routerInfo,
      handleBackToindex
    }
  },
  render() {
    const { t } = this
    return (
      <NGrid class='current-page-header' cols={8}>
        <NGridItem class='n-grid-item' span={4}>
          <div class='title'>
            <NSpace>
              <NButton onClick={this.handleBack} class='btn-back'>
                <NIcon size='20' component={ArrowLeftOutlined}></NIcon>
              </NButton>
              <NButton onClick={this.handleBackToindex} class='btn-back'>
                {this.routerInfo.map((opt, index) => (
                  <span class='title-span' key={index}>
                    {opt.name}
                  </span>
                ))}
              </NButton>
            </NSpace>
            <span class='title-span'>{this.title}</span>
          </div>
          <div class='desc'></div>
        </NGridItem>
        <NGridItem
          class={`n-grid-item ngi-data ${this.active === 'system' ? 'active' : ''
            }`}
          onClick={() => this.handleItemClick('system')}
        >
          <div style={'width:100%;height:100%'}>
            <div class='title'>
              {t('assessment.tasks.column_indicator_system_num')}
            </div>
            <div class='desc'>{this.systemNum}</div>
          </div>
        </NGridItem>
        <NGridItem
          class={`n-grid-item ngi-data ${this.active === 'plan' ? 'active' : ''
            }`}
          onClick={() => this.handleItemClick('plan')}
        >
          <div>
            <div class='title'>
              {t('assessment.tasks.column_evaluation_plan_num')}
            </div>
            <div class='desc'>{this.planNum}</div>
          </div>
        </NGridItem>
        <NGridItem
          class={`n-grid-item ngi-data ${this.active === 'task' ? 'active' : ''
            }`}
          onClick={() => this.handleItemClick('task')}
        >
          <div>
            <div class='title'>
              {t('assessment.tasks.column_evaluation_task_num')}
            </div>
            <div class='desc'>{this.taskNum}</div>
          </div>
        </NGridItem>
        <NGridItem
          class={`n-grid-item ngi-data ${this.active === 'instance' ? 'active' : ''
            }`}
          onClick={() => this.handleItemClick('instance')}
        >
          <div>
            <div class='title'>
              {t('assessment.tasks.column_evaluation_task_instance_num')}
            </div>
            <div class='desc'>{this.instanceNum}</div>
          </div>
        </NGridItem>
      </NGrid>
    )
  }
})

export default IndicatorModal
