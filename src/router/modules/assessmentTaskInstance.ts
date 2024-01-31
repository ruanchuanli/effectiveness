import utils from '@/utils'
import type { Component } from 'vue'
const modules = import.meta.glob('/src/views/**/**.tsx')
const components: { [key: string]: Component } = utils.mapping(modules)
export default {
  path: '/assessmentTaskInstance',
  name: 'assessmentTaskInstance',
  meta: {
    title: '评估任务实例'
  },
  redirect: { name: 'assessmentTaskInstance-projects' },
  component: () => import('@/layouts/content'),
  children: [
    {
      path: '/assessmentTaskInstance/projects/:id',
      name: 'assessmentTaskInstance-projects',
      component: components['assessmentTaskInstance-projects'],
      meta: {
        title: '评估方案',
        activeMenu: 'assessmentTaskInstance',
        showSide: false,
        auth: []
      }
    },
    {
      path: '/assessmentTaskInstance/tasks/:id',
      name: 'assessmentTaskInstance-tasks',
      component: components['assessmentTaskInstance-tasks'],
      meta: {
        title: '评估方案任务',
        activeMenu: 'assessmentTaskInstance',
        showSide: false,
        auth: []
      }
    },
    {
      path: '/assessmentTaskInstance/indicator/:id',
      name: 'assessmentTaskInstance-indicator',
      component: components['assessmentTaskInstance-indicator'],
      meta: {
        title: '指标体系',
        activeMenu: 'assessmentTaskInstance',
        showSide: false,
        auth: []
      }
    },
    {
      path: '/assessmentTaskInstance/workflow/:id/:projectCode',
      name: 'assessmentTaskInstance-workflow',
      component: components['assessmentTaskInstance-workflow'],
      meta: {
        title: '指标体系详情',
        activeMenu: 'assessmentTaskInstance',
        showSide: false,
        auth: []
      }
    },
    {
      path: '/assessmentTaskInstance/workflow/instances/:projectCode/:id',
      name: 'workflow-instance-detail-task',
      component: components['assessmentTaskInstance-workflow-instance-detail'],
      meta: {
        title: '工作流实例详情',
        activeMenu: 'assessmentTaskInstance',
        showSide: false,
        auth: []
      }
    },
    {
      path: '/assessmentTaskInstance/computeWork/:taskcode',
      name: 'assessmentTaskInstance-computeWork',
      component: components['assessmentTaskInstance-computeWork-definition-create'],
      meta: {
        title: '计算流程详情',
        activeMenu: 'assessmentTaskInstance',
        showSide: false,
        auth: []
      }
    },
    {
      path: '/assessmentTaskInstance/calculationResult/:id/:evaluationTaskId',
      name: 'assessmentTaskInstance-calculationResult',
      component: components['assessmentTaskInstance-calculationResult'],
      meta: {
        title: '运算结果对比',
        activeMenu: 'assessmentTaskInstance',
        showSide: false,
        auth: []
      }
    },
    {
      path: '/assessmentTaskInstance/sub/instances/:projectCode/:id',
      name: 'assessmentTaskInstance-sub-instance-detail',
      component: components['assessmentTaskInstance-sub-instances-detail'],
      meta: {
        title: '子流程实例详情',
        activeMenu: 'assessmentTaskInstance',
        showSide: false,
        auth: []
      }
    },
  ]
}
