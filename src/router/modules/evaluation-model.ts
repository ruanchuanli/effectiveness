import utils from '@/utils'
import type { Component } from 'vue'
const modules = import.meta.glob('/src/views/EvaluationModel/**/**.tsx')
const components: { [key: string]: Component } = utils.mapping(modules)
export default {
  path: '/evaluation-model',
  name: 'evaluation-model',
  meta: {
    title: '评估模型'
  },
  redirect: { name: 'cost-management' },
  component: () => import('@/layouts/content'),
  children: [
    {
      path: '/evaluation-model/cost-management',
      name: 'cost-management',
      component: components['EvaluationModel-pages-CostManagement'],
      meta: {
        title: '费用模型',
        activeMenu: 'evaluation-model',
        showSide: true,
        auth: []
      }
    },
    {
      path: '/evaluation-model/cost-management/parameter',
      name: 'cost-parameter',
      component: components['EvaluationModel-pages-CostParameter'],
      meta: {
        title: '费用估算法',
        activeMenu: 'evaluation-model',
        showSide: false,
        auth: []
      }
    },
    {
      path: '/evaluation-model/cost-management/expert-judgment',
      name: 'expert-judgment',
      component: components['EvaluationModel-pages-ExpertJudgment'],
      meta: {
        title: '参数费用法',
        activeMenu: 'evaluation-model',
        showSide: false,
        auth: []
      }
    },
    {
      path: '/evaluation-model/indicator-selection',
      name: 'indicator-selection',
      component: components['EvaluationModel-pages-IndicatorSelection'],
      meta: {
        title: '指标选取',
        activeMenu: 'evaluation-model',
        showSide: true,
        auth: []
      }
    },
    {
      path: '/evaluation-model/indicator-selection-detail',
      name: 'indicator-selection-detail',
      component: components['EvaluationModel-pages-IndicatorSelectionDetail'],
      meta: {
        title: '指标选取',
        activeMenu: 'evaluation-model',
        showSide: false,
        auth: []
      }
    },
    {
      path: '/evaluation-model/effectiveness-evaluation-model',
      name: 'effectiveness-evaluation-model',
      component:
        components['EvaluationModel-pages-effectivenessEvaluationModel'],
      meta: {
        title: '效能评估模型',
        activeMenu: 'evaluation-model',
        showSide: true,
        auth: []
      }
    },
    {
      path: '/evaluation-model/effectiveness-evaluation-model-detail',
      name: 'effectiveness-evaluation-model-detail',
      component:
        components['EvaluationModel-pages-effectivenessEvaluationModelDetail'],
      meta: {
        title: '效能评估模型详情',
        activeMenu: 'evaluation-model',
        showSide: false,
        auth: []
      }
    },
    {
      path: '/evaluation-model/mh',
      name: 'mh',
      component: components['EvaluationModel-pages-mh'],
      meta: {
        title: '模糊详情',
        activeMenu: 'evaluation-model',
        showSide: false,
        auth: []
      }
    }
  ]
}
