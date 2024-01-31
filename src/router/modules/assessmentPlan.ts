import utils from '@/utils'
import type { Component } from 'vue'
const modules = import.meta.glob('/src/views/**/**.tsx')
const components: { [key: string]: Component } = utils.mapping(modules)
export default {
  path: '/assessmentPlan',
  name: 'assessmentPlan',
  meta: {
    title: '评估方案'
  },
  redirect: { name: 'assessmentPlan-projects' },
  component: () => import('@/layouts/content'),
  children: [
    {
      path: '/assessmentPlan/projects/:id',
      name: 'assessmentPlan-projects',
      component: components['assessmentPlan-projects'],
      meta: {
        title: '评估方案',
        activeMenu: 'assessmentPlan',
        showSide: false,
        auth: []
      }
    },
    {
      path: '/assessmentPlan/tasks/:id',
      name: 'assessmentPlan-tasks',
      component: components['assessmentPlan-tasks'],
      meta: {
        title: '评估方案任务',
        activeMenu: 'assessmentPlan',
        showSide: false,
        auth: []
      }
    },
    {
      path: '/assessmentPlan/indicator/:id',
      name: 'assessmentPlan-indicator',
      component: components['assessmentPlan-indicator'],
      meta: {
        title: '指标体系',
        activeMenu: 'assessmentPlan',
        showSide: false,
        auth: []
      }
    },
    {
      path: '/assessmentPlan/workflow/:id/:projectCode',
      name: 'assessmentPlan-workflow',
      component: components['assessmentPlan-workflow'],
      meta: {
        title: '指标体系详情',
        activeMenu: 'assessmentPlan',
        showSide: false,
        auth: []
      }
    },
    {
      path: '/assessmentPlan/computeWork/:taskcode',
      name: 'assessmentPlan-computeWork',
      component: components['assessmentPlan-computeWork-definition-create'],
      meta: {
        title: '计算流程详情',
        activeMenu: 'assessmentPlan',
        showSide: false,
        auth: []
      }
    }
  ]
}
