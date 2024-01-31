import { axios } from '@/service/service'
import { PageReq, BoundSubProcess } from './type'

export function getCaiculatedCompare(data: FormData): any {
  return axios({
    url: '/evaluationTask/comparisonOfCalculationResults',
    method: 'post',
    data
  })
}

export function getCaiculatedDataSet(params): any {
  return axios({
    url: 'evaluationTask/queryCurrentEvaluationTaskConditions',
    method: 'get',
    params
  })
}

export function pagingplan(params: PageReq): any {
  return axios({
    url: '/evaluationTask/evaluationTaskInstance/result/page',
    method: 'get',
    params
  })
}

export function downloadReport(evaluationTaskInstanceId: string): any {
  return axios({
    url: '/evaluationTask/downloadReport/' + evaluationTaskInstanceId,
    method: 'get',
    responseType: 'blob'
  })
}

export function getAsseccmentPlanOption(id: string): any {
  return axios({
    url: `evaluationTask/getEvaluationPlanListByTaskId/${id}`,
    method: 'get'
  })
}

export function getById(id: number) {
  return axios({
    url: `/evaluationTask/${id}`,
    method: 'get'
  })
}

export function createtask(data: CreatePlanReq): any {
  return axios({
    url: 'evaluationTask/create',
    method: 'post',
    data,
    headers: {
      'Content-Type': 'application/json;charset=UTF-8'
    },
    transformRequest: (params) => JSON.stringify(params)
  })
}

export function updatetask(data: UpdateReq): any {
  return axios({
    url: '/evaluationTask/update',
    method: 'post',
    data,
    headers: {
      'Content-Type': 'application/json;charset=UTF-8'
    },
    transformRequest: (params) => JSON.stringify(params)
  })
}

export function deleteByIds(ids: string): any {
  return axios({
    url: `/evaluationTask/${ids}`,
    method: 'delete'
  })
}

export function deleteTaskInstanceById(projectCode: string, id: string): any {
  return axios({
    url: `/projects/${projectCode}/process-instances/${id}`,
    method: 'delete'
  })
}

export function getAssessmentTaskById(id: number): any {
  return axios({
    url: `evaluationTask/getEvaluationTaskWorkFlow/${id}`,
    method: 'get'
  })
}

export function stopTask(projectCode: Number, data: FormData): any {
  return axios({
    url: `/projects/${projectCode}/executors/execute`,
    method: 'post',
    data
  })
}

export function getTaskDetail(data: FormData): any {
  return axios({
    url: `evaluationTask/getProcessCalculation`,
    method: 'post',
    data
  })
}
