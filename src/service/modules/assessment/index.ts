import { axios } from '@/service/service'
import {
  PageReq,
  CreateReq,
  CreatePlanReq,
  UpdateReq,
  TaskPageReq,
  TaskCreateReq,
  TaskUpdateReq,
  IndicatorPageReq,
  IndicatorCreateReq,
  IndicatorUpdateReq
} from './type'

export function paging(params: PageReq): any {
  return axios({
    url: '/evaluationEngineering/result/page',
    method: 'get',
    params
  })
}
export function pagingplan(params: PageReq): any {
  return axios({
    url: '/evaluationEngineering/task/evaluationPlan/result/page',
    method: 'get',
    params
  })
}
export function getById(id: string) {
  return axios({
    url: `/evaluationEngineering/${id}`,
    method: 'get'
  })
}

export function create(data: CreateReq): any {
  return axios({
    url: '/evaluationEngineering/create',
    method: 'post',
    data,
    headers: {
      'Content-Type': 'application/json;charset=UTF-8'
    },
    transformRequest: (params) => JSON.stringify(params)
  })
}
export function createplan(data: CreatePlanReq): any {
  return axios({
    url: '/evaluationEngineering/task/evaluationPlan/create',
    method: 'post',
    data,
    headers: {
      'Content-Type': 'application/json;charset=UTF-8'
    },
    transformRequest: (params) => JSON.stringify(params)
  })
}
export function updateplan(data: UpdateReq): any {
  return axios({
    url: '/evaluationEngineering/task/evaluationPlan/update',
    method: 'post',
    data,
    headers: {
      'Content-Type': 'application/json;charset=UTF-8'
    },
    transformRequest: (params) => JSON.stringify(params)
  })
}
export function update(data: UpdateReq): any {
  return axios({
    url: '/evaluationEngineering/update',
    method: 'post',
    data,
    headers: {
      'Content-Type': 'application/json;charset=UTF-8'
    },
    transformRequest: (params) => JSON.stringify(params)
  })
}

export function deleteById(id: number): any {
  return axios({
    url: `/evaluationEngineering/${id}`,
    method: 'delete'
  })
}

export function deletePlanById(id: number): any {
  return axios({
    url: `/evaluationEngineering/task/evaluationPlan/${id}`,
    method: 'delete'
  })
}

export function taskPaging(params: TaskPageReq): any {
  return axios({
    url: '/evaluationEngineering/task/result/page',
    method: 'get',
    params
  })
}

export function taskDetailById(id: number): any {
  return axios({
    url: `/evaluationEngineering/task/${id}`,
    method: 'get'
  })
}

export function taskCreate(data: TaskCreateReq): any {
  return axios({
    url: '/evaluationEngineering/task/create',
    method: 'post',
    data,
    headers: {
      'Content-Type': 'application/json;charset=UTF-8'
    },
    transformRequest: (params) => JSON.stringify(params)
  })
}

export function taskUpdate(data: TaskUpdateReq): any {
  return axios({
    url: '/evaluationEngineering/task/update',
    method: 'post',
    data,
    headers: {
      'Content-Type': 'application/json;charset=UTF-8'
    },
    transformRequest: (params) => JSON.stringify(params)
  })
}

export function taskDeleteById(id: number): any {
  return axios({
    url: `/evaluationEngineering/task/${id}`,
    method: 'delete'
  })
}

export function indicatorPaging(params: IndicatorPageReq): any {
  return axios({
    url: '/evaluationEngineering/task/indicatorSystem/result/page',
    method: 'get',
    params
  })
}

export function indicatorCreate(data: IndicatorCreateReq): any {
  return axios({
    url: '/evaluationEngineering/task/indicatorSystem/create',
    method: 'post',
    data,
    headers: {
      'Content-Type': 'application/json;charset=UTF-8'
    },
    transformRequest: (params) => JSON.stringify(params)
  })
}

export function indicatorUpdate(data: IndicatorUpdateReq): any {
  return axios({
    url: '/evaluationEngineering/task/indicatorSystem/update',
    method: 'post',
    data,
    headers: {
      'Content-Type': 'application/json;charset=UTF-8'
    },
    transformRequest: (params) => JSON.stringify(params)
  })
}

export function indicatorDeleteById(id: number): any {
  return axios({
    url: `/evaluationEngineering/task/indicatorSystem/${id}`,
    method: 'delete'
  })
}

export function evaluationEngineeringIndicatorSystemListQuery(
  evaluationEngineeringId: number
): any {
  return axios({
    url: '/evaluationEngineering/task/queryCurrentEvaluationEngineeringIndicatorSystemList',
    method: 'get',
    params: { evaluationEngineeringId }
  })
}
export function getIndicatorSystemListByTaskId(
  taskId?: number | null | undefined | string
): any {
  return axios({
    url: `/evaluationEngineering/task/evaluationPlan/getIndicatorSystemListByTaskId/${taskId}`,
    method: 'get'
  })
}
export function getCodeEvaluationPlan(id: number): any {
  return axios({
    url: `/evaluationEngineering/task/evaluationPlan/${id}`,
    method: 'get'
  })
}
export function evaluationEngineering(id: number): any {
  return axios({
    url: `/dolphinscheduler/evaluationEngineering/task/indicatorSystem/${id}`,
    method: 'get'
  })
}
// /dolphinscheduler/projects/10811340950304/process-definition/10821239450784
export function dolphinschedulerprojects(id: number, code: number): any {
  return axios({
    url: `/projects/${id}/process-definition/${code}`,
    method: 'get'
  })
}

export function EditProcessDefinition(
  data: any,
  projectCode: number,
  processCode: number
): any {
  console.log(processCode)

  return axios({
    url: `/projects/${projectCode}/process-definition/${processCode}`,
    method: 'put',
    data
  })
}

export function savePic(indicatorSystemId: string, file: Blob): any {
  const data = new FormData()
  data.append('indicatorSystemId', indicatorSystemId)
  data.append('file', file)

  return axios({
    url: `/evaluationEngineering/task/indicatorSystem/savePic`,
    method: 'post',
    data
  })
}
