import { axios } from '@/service/service'
import {} from './type'
import { useUserStore } from '@/store/user/user'

export function getCodeEvaluationPlan(id: number): any {
  return axios({
    url: `/evaluationEngineering/task/evaluationPlan/${id}`,
    method: 'get'
  })
}
// /evaluationEngineering/task/evaluationPlan/getOperatorTree
export function getOperatorTree(evaluationEngineeringId: string): any {
  return axios({
    url: `/evaluationEngineering/task/evaluationPlan/getOperatorTree/${evaluationEngineeringId}`,
    method: 'get'
  })
}

// /evaluationEngineering/task/evaluationPlan/updateCalculationProcess
export function updateCalculationProcess(data: any): any {
  return axios({
    url: `/evaluationEngineering/task/evaluationPlan/updateCalculationProcess`,
    method: 'post',
    data
  })
}
// /evaluationEngineering/task/evaluationPlan/getOperatorDetail
export function getOperatorDetail(id: any): any {
  return axios({
    url: `/evaluationEngineering/task/evaluationPlan/getOperatorDetail?id=${id}`,
    method: 'get'
  })
}
// /evaluationTask/determineIfConnectionIsPossible
export function determineIfConnectionIsPossible(params: any): any {
  return axios({
    url: `/evaluationTask/determineIfConnectionIsPossible`,
    method: 'get',
    params
  })
}

export function savePic(taskDefinitionCode: string, file: Blob): any {
  const data = new FormData()
  data.append('taskDefinitionCode', taskDefinitionCode)
  data.append('file', file)

  return axios({
    url: `/evaluationEngineering/task/calculationProcess/savePic`,
    method: 'post',
    data
  })
}

export function getWeightDetail(
  evaluationPlanId: string,
  taskDefinitionCode: string
): any {
  return axios({
    method: 'get',
    url: '/evaluationEngineering/task/evaluationPlan/getWeightDetail',
    params: { evaluationPlanId, taskDefinitionCode }
  })
}

export function getNormalizationEcho(
  evaluationPlanId: string,
  taskDefinitionCode: string
): any {
  return axios({
    method: 'get',
    url: '/evaluationEngineering/task/evaluationPlan/getNormalizationEcho',
    params: { evaluationPlanId, taskDefinitionCode }
  })
}

export function updateNormalizationEchoType(
  evaluationPlanId: string,
  taskDefinitionCode: string,
  normalizationEchoType: number,
  normalizationLimits?: string
): any {
  return axios({
    method: 'post',
    headers: {
      'Content-Type': 'application/json;charset=UTF-8'
    },
    transformRequest: (params) => JSON.stringify(params),
    url: '/evaluationEngineering/task/evaluationPlan/updateNormalizationEchoType',
    data: {
      evaluationPlanId,
      taskDefinitionCode,
      normalizationEchoType,
      normalizationLimits
    }
  })
}
