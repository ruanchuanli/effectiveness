import utils from '@/utils'
import type { Component } from 'vue'
const modules = import.meta.glob('/src/views/**/**.tsx')
const components: { [key: string]: Component } = utils.mapping(modules)
export default {
  path: '/assessmentTask',
  name: 'assessmentTask',
  meta: {
    title: '评估任务'
  },
  redirect: { name: 'assessmentTask-projects' },
  component: () => import('@/layouts/content'),
  children: [
    {
      path: '/assessmentTask/projects/:id',
      name: 'assessmentTask-projects',
      component: components['assessmentTask-projects'],
      meta: {
        title: '评估方案',
        activeMenu: 'assessmentTask',
        showSide: false,
        auth: []
      }
    },
    {
      path: '/assessmentTask/tasks/:id',
      name: 'assessmentTask-tasks',
      component: components['assessmentTask-tasks'],
      meta: {
        title: '评估方案任务',
        activeMenu: 'assessmentTask',
        showSide: false,
        auth: []
      }
    },
    {
      path: '/assessmentTask/indicator/:id',
      name: 'assessmentTask-indicator',
      component: components['assessmentTask-indicator'],
      meta: {
        title: '指标体系',
        activeMenu: 'assessmentTask',
        showSide: false,
        auth: []
      }
    },
    {
      path: '/assessmentTask/workflow/:id/:evaluationPlanId',
      name: 'assessmentTask-workflow',
      component: components['assessmentTask-workflow'],
      meta: {
        title: '指标体系详情',
        activeMenu: 'assessmentTask',
        showSide: false,
        auth: []
      }
    },
    {
      path: '/assessmentTask/workflow/instances/:projectCode/:id',
      name: 'workflow-instance-detail-task',
      component: components['assessmentTask-workflow-instance-detail'],
      meta: {
        title: '工作流实例详情',
        activeMenu: 'assessmentTask',
        showSide: false,
        auth: []
      }
    },
    {
      path: '/assessmentTask/computeWork/:taskcode',
      name: 'assessmentTask-computeWork',
      component: components['assessmentTask-computeWork-definition-create'],
      meta: {
        title: '计算流程详情',
        activeMenu: 'assessmentTask',
        showSide: false,
        auth: []
      }
    }
  ]
}
