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
      path: '/evaluation-model/fuzzyEvaluationMethod',
      name: 'fuzzyEvaluationMethod',
      component: components['EvaluationModel-pages-fuzzyEvaluationMethod'],
      meta: {
        title: '模糊评判法',
        activeMenu: 'evaluation-model',
        showSide: false,
        auth: []
      }
    },
    {
      path: '/evaluation-model/idealPointMethod',
      name: 'idealPointMethod',
      component: components['EvaluationModel-pages-idealPointMethod'],
      meta: {
        title: '理想点法',
        activeMenu: 'evaluation-model',
        showSide: false,
        auth: []
      }
    },
    {
      path: '/evaluation-model/ADCMethod',
      name: 'ADCMethod',
      component: components['EvaluationModel-pages-ADCMethod'],
      meta: {
        title: 'ADC法',
        activeMenu: 'evaluation-model',
        showSide: false,
        auth: []
      }
    },
    {
      path: '/evaluation-model/SEAMethod',
      name: 'SEAMethod',
      component: components['EvaluationModel-pages-SEAMethod'],
      meta: {
        title: 'SEA法',
        activeMenu: 'evaluation-model',
        showSide: false,
        auth: []
      }
    },
    {
      path: '/evaluation-model/exponentialMethod',
      name: 'exponentialMethod',
      component: components['EvaluationModel-pages-exponentialMethod'],
      meta: {
        title: '指数法',
        activeMenu: 'evaluation-model',
        showSide: false,
        auth: []
      }
    },
  ]
}
