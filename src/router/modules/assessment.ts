import utils from '@/utils'
import type { Component } from 'vue'
const modules = import.meta.glob('/src/views/**/**.tsx')
const components: { [key: string]: Component } = utils.mapping(modules)
export default {
  path: '/assessment',
  name: 'assessment',
  meta: {
    title: '评估工程'
  },
  redirect: { name: 'assessment-projects' },
  component: () => import('@/layouts/content'),
  children: [
    {
      path: '/assessment/projects',
      name: 'assessment-projects',
      component: components['assessment-projects'],
      meta: {
        title: '评估工程',
        activeMenu: 'assessment',
        showSide: false,
        auth: []
      }
    },
    {
      path: '/assessment/tasks/:id',
      name: 'assessment-tasks',
      component: components['assessment-tasks'],
      meta: {
        title: '评估工程任务',
        activeMenu: 'assessment',
        showSide: false,
        auth: []
      }
    },
    {
      path: '/assessment/indicator/:id',
      name: 'assessment-indicator',
      component: components['assessment-indicator'],
      meta: {
        title: '指标体系',
        activeMenu: 'assessment',
        showSide: false,
        auth: []
      }
    },
    {
      path: '/assessment/workflow/definition/:id',
      name: 'assessment-workflow-definition',
      component: components['assessment-workflow-definition-create'],
      meta: {
        title: '指标体系详情',
        activeMenu: 'assessment',
        showSide: false,
        auth: []
      }
    }
  ]
}
