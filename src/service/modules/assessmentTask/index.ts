import { axios } from '@/service/service'
import {
  PageReq,
  BoundSubProcess
  // CreateReq,
  // CreatePlanReq,
  // UpdateReq,
  // TaskPageReq,
  // TaskCreateReq,
  // TaskUpdateReq,
  // IndicatorPageReq,
  // IndicatorCreateReq,
  // IndicatorUpdateReq
} from './type'

export function pagingplan(params: PageReq): any {
  return axios({
    url: 'evaluationTask/result/page',
    method: 'get',
    params
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

export function getUnboundInputDataSubProcess(id: Number): any {
  return axios({
    url: `/evaluationTask/getUnboundInputDataSubProcess/${id}`,
    method: 'get'
  })
}

export function getDataSet(): any {
  return axios({
    url: `/evaluationTask/getDataSet`,
    method: 'get'
  })
}

export function getDataSetCol(id: number): any {
  return axios({
    url: `/evaluationTask/getDataSetCol/${id}`,
    method: 'get'
  })
}

export function getDataSetColValue(params: {
  dataSetId: string
  dataSourceCol: string
}): any {
  return axios({
    url: `/evaluationTask/getDataColValue`,
    method: 'get',
    params
  })
}

export function boundInputDataSubProcess(data: BoundSubProcess[]): any {
  return axios({
    url: '/evaluationTask/boundInputDataSubProcess',
    method: 'post',
    data,
    headers: {
      'Content-Type': 'application/json;charset=UTF-8'
    },
    transformRequest: (params) => JSON.stringify(params)
  })
}

export function getAssessmentTaskById(id: number): any {
  return axios({
    url: `evaluationTask/getEvaluationTaskWorkFlow/${id}`,
    method: 'get'
  })
}

export function beginCalculate(projectCode: string, data: FormData): any {
  return axios({
    url: `/projects/${projectCode}/executors/start-process-instance`,
    method: 'post',
    data
  })
}

export function stopTask(projectCode: string, data: FormData): any {
  return axios({
    url: `/projects/${projectCode}/executors/execute`,
    method: 'post',
    data
  })
}

export function getWeight(params): any {
  return axios({
    url: `/evaluationEngineering/task/evaluationPlan/getWeightDetail`,
    method: 'get',
    params
  })
}

export function getAllLeafNodeList(id: string): any {
  return axios({
    url: `/evaluationTask/allLeafNodeList/${id}`,
    method: 'get'
  })
}

export function getCalculationProcessInputParameter(
  taskDefinitionCode: number
): any {
  return axios({
    url: `/evaluationTask/getCalculationProcessInputParameter/${taskDefinitionCode}`,
    method: 'get'
  })
}

export function getInputDataSubProcess(
  evaluationTaskId: string,
  processId: number
): any {
  return axios({
    url: `/evaluationTask/getInputDataSubProcess`,
    method: 'get',
    params: { evaluationTaskId, processId }
  })
}

export function getDataColValuePage(
  pageNo: number,
  pageSize: number,
  dataSetId: number,
  dataSourceCols: string[],
  criteriaType: string,
  queryCriteria: any[]
): any {
  return axios({
    url: `/evaluationTask/getDataColValuePage`,
    method: 'post',
    data: {
      pageNo,
      pageSize,
      dataSetId,
      dataSourceCols,
      queryCriteria,
      criteriaType
    },
    headers: {
      'Content-Type': 'application/json;charset=UTF-8'
    },
    transformRequest: (params) => JSON.stringify(params)
  })
}

// export function paging(params: PageReq): any {
//   return axios({
//     url: '/evaluationEngineering/result/page',
//     method: 'get',
//     params
//   })
// }

// export function create(data: CreateReq): any {
//   return axios({
//     url: '/evaluationEngineering/create',
//     method: 'post',
//     data,
//     headers: {
//       'Content-Type': 'application/json;charset=UTF-8'
//     },
//     transformRequest: (params) => JSON.stringify(params)
//   })
// }
// export function update(data: UpdateReq): any {
//   return axios({
//     url: '/evaluationEngineering/update',
//     method: 'post',
//     data,
//     headers: {
//       'Content-Type': 'application/json;charset=UTF-8'
//     },
//     transformRequest: (params) => JSON.stringify(params)
//   })
// }

// export function taskPaging(params: TaskPageReq): any {
//   return axios({
//     url: '/evaluationEngineering/task/result/page',
//     method: 'get',
//     params
//   })
// }

// export function taskDetailById(id: number): any {
//   return axios({
//     url: `/evaluationEngineering/task/${id}`,
//     method: 'get'
//   })
// }

// export function taskCreate(data: TaskCreateReq): any {
//   return axios({
//     url: '/evaluationEngineering/task/create',
//     method: 'post',
//     data,
//     headers: {
//       'Content-Type': 'application/json;charset=UTF-8'
//     },
//     transformRequest: (params) => JSON.stringify(params)
//   })
// }

// export function taskUpdate(data: TaskUpdateReq): any {
//   return axios({
//     url: '/evaluationEngineering/task/update',
//     method: 'post',
//     data,
//     headers: {
//       'Content-Type': 'application/json;charset=UTF-8'
//     },
//     transformRequest: (params) => JSON.stringify(params)
//   })
// }

// export function taskDeleteById(id: number): any {
//   return axios({
//     url: `/evaluationEngineering/task/${id}`,
//     method: 'delete'
//   })
// }

// export function indicatorPaging(params: IndicatorPageReq): any {
//   return axios({
//     url: '/evaluationEngineering/task/indicatorSystem/result/page',
//     method: 'get',
//     params
//   })
// }

// export function indicatorCreate(data: IndicatorCreateReq): any {
//   return axios({
//     url: '/evaluationEngineering/task/indicatorSystem/create',
//     method: 'post',
//     data,
//     headers: {
//       'Content-Type': 'application/json;charset=UTF-8'
//     },
//     transformRequest: (params) => JSON.stringify(params)
//   })
// }

// export function indicatorUpdate(data: IndicatorUpdateReq): any {
//   return axios({
//     url: '/evaluationEngineering/task/indicatorSystem/update',
//     method: 'post',
//     data,
//     headers: {
//       'Content-Type': 'application/json;charset=UTF-8'
//     },
//     transformRequest: (params) => JSON.stringify(params)
//   })
// }

// export function indicatorDeleteById(id: number): any {
//   return axios({
//     url: `/evaluationEngineering/task/indicatorSystem/${id}`,
//     method: 'delete'
//   })
// }

// export function evaluationEngineeringIndicatorSystemListQuery(
//   evaluationEngineeringId: number
// ): any {
//   return axios({
//     url: '/evaluationEngineering/task/queryCurrentEvaluationEngineeringIndicatorSystemList',
//     method: 'get',
//     params: { evaluationEngineeringId }
//   })
// }
// export function getIndicatorSystemListByTaskId(taskId?: number|null|undefined|string): any {
//   return axios({
//     url: `/evaluationEngineering/task/evaluationPlan/getIndicatorSystemListByTaskId/${taskId}`,
//     method: 'get'
//   })
// }
// export function evaluationEngineering(id: number): any {
//   return axios({
//     url: `/dolphinscheduler/evaluationEngineering/task/indicatorSystem/${id}`,
//     method: 'get'
//   })
// }
// // /dolphinscheduler/projects/10811340950304/process-definition/10821239450784
// export function dolphinschedulerprojects(id: number,code:number): any {
//   return axios({
//     url: `/projects/${id}/process-definition/${code}`,
//     method: 'get'
//   })
// }

// export function EditProcessDefinition(
//   data: any,
//   projectCode: number,
//   processCode:number
// ): any {
//   console.log(processCode);

//   return axios({
//     url: `/projects/${projectCode}/process-definition/${processCode}`,
//     method: 'put',
//     data
//   })
// }
