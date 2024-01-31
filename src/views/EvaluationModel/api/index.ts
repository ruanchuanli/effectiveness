import { axios } from '@/service/service'
import {
  // PageReq,
  CreateReq,
  EditReq,
  IActiveColVal,
  ICreateExpertJudgment,
  ICreateIndicatorSelection,
  IEditExpertJudgment,
  IEstimationModelReq,
  IExpertJudgment,
  IExpertJudgmentDetails,
  IIndicatorSelection,
  IUpdateCostExpertMaintenance,
  ISaveCostExpertAnalysis,
  IUpdateExpertJudgment,
  PageReq
  // CreatePlanReq,
  // UpdateReq,
  // TaskPageReq,
  // TaskCreateReq,
  // TaskUpdateReq,
  // IndicatorPageReq,
  // IndicatorCreateReq,
  // IndicatorUpdateReq
} from './type'

/**
 * @description 获取阶段费用类型字典
 */
export function getStageExpensesMapping(): any {
  return axios({
    url: '/customOperator/getDictListByType/expense_type',
    method: 'get'
  })
}

/**
 * @description 获取估算方式字典
 */
export function getEstimationMethodMapping(): any {
  return axios({
    url: '/customOperator/getDictListByType/estimation_method',
    method: 'get'
  })
}

/**
 * @description 获取装备类型字典
 */
export function getEquipmentTypeMappding(): any {
  return axios({
    url: '/customOperator/getDictListByType/equipment_type',
    method: 'get'
  })
}

/**
 * @description 新增费用估算模型
 */
export function createCostEstimationModel(data: CreateReq): any {
  return axios({
    url: '/costEstimationModel/create',
    method: 'post',
    data,
    headers: {
      'Content-Type': 'application/json;charset=UTF-8'
    },
    transformRequest: (params) => JSON.stringify(params)
  })
}

/**
 * @description 修改费用估算模型
 */
export function editCostEstimationModel(data: EditReq): any {
  return axios({
    url: '/costEstimationModel/update',
    method: 'post',
    data,
    headers: {
      'Content-Type': 'application/json;charset=UTF-8'
    },
    transformRequest: (params) => JSON.stringify(params)
  })
}

/**
 * @description 删除费用模型
 */
export function deleteCostEstimationModel(id: string): any {
  return axios({
    url: `/costEstimationModel/${id}`,
    method: 'delete'
  })
}

/**
 * @description 获取费用模型列表
 */
export function getCostEstimationModel(params: IEstimationModelReq): any {
  return axios({
    url: '/costEstimationModel/result/page',
    method: 'get',
    params
  })
}

/**
 * @description 费用估算详情
 */
export function getCostEstimationModelDetails(id: string): any {
  return axios({
    url: `/costEstimationModel/${id}`,
    method: 'get'
  })
}

/**
 * @description 获取所有主题数据集
 */
export function getThemeDataset(): any {
  return axios({
    url: '/costEstimationModel/getTopicDataSet',
    method: 'get'
  })
}

/**
 * @description 获取所有主题数据集表
 */
export function getThemeDatasetTable(dataSetName: string): any {
  return axios({
    url: '/costEstimationModel/getTopicDataSetTable',
    params: { dataSetName },
    method: 'get'
  })
}

/**
 * @description 获取数据集的所有列
 */
export function getThemeDatasetTableCol(id: number | string): any {
  return axios({
    url: `/costEstimationModel/getTopicDataSetCol/${id}`,
    method: 'get'
  })
}

/**
 * @description 获取选中数据列的值（带分页）
 */
export function getActiveColVal(data: IActiveColVal): any {
  return axios({
    url: '/costEstimationModel/getTopicDataColValue',
    method: 'post',
    data,
    headers: {
      'Content-Type': 'application/json;charset=UTF-8'
    },
    transformRequest: (params) => JSON.stringify(params)
  })
}

/**
 * @description 获取拟合模型列表
 */
export function getFittedModel(): any {
  return axios({
    url: '/costEstimationModel/getFittedModelList',
    method: 'get'
  })
}

/**
 * @description 获取拟合模型列表
 */
export function getAnalyticalMethodsList(operatorType: string): any {
  return axios({
    url: `/costEstimationModel/getAnalyticalMethodsList/${operatorType}`,
    method: 'get'
  })
}

/**
 * @description 新增估值数据
 */
export function createExpertJudgment(data: ICreateExpertJudgment): any {
  return axios({
    url: '/costEstimationModel/createExpertJudgment',
    method: 'post',
    data,
    headers: {
      'Content-Type': 'application/json;charset=UTF-8'
    },
    transformRequest: (params) => JSON.stringify(params)
  })
}

/**
 * @description 新增估值数据
 */
export function updateExpertJudgment(data: IUpdateExpertJudgment): any {
  return axios({
    url: '/costEstimationModel/updateExpertJudgment',
    method: 'post',
    data,
    headers: {
      'Content-Type': 'application/json;charset=UTF-8'
    },
    transformRequest: (params) => JSON.stringify(params)
  })
}

/**
 * @description 修改专家判断
 */
export function editExpertJudgment(data: IEditExpertJudgment): any {
  return axios({
    url: '/costEstimationModel/updateExpertJudgment',
    method: 'post',
    data,
    headers: {
      'Content-Type': 'application/json;charset=UTF-8'
    },
    transformRequest: (params) => JSON.stringify(params)
  })
}

/**
 * @description 删除专家判断
 */
export function deleteExpertJudgment(id: string): any {
  return axios({
    url: `/costEstimationModel/deleteExpertJudgment/${id}`,
    method: 'delete'
  })
}

/**
 * @description 专家判断数据分页查询
 */
export function getExpertJudgment(params: IExpertJudgment): any {
  return axios({
    url: '/costEstimationModel/expertJudgment/page',
    method: 'get',
    params
  })
}

/**
 * @description 根据模型ID和轮次获取专家判断详情数据
 */
export function getExpertJudgmentDetails(params: IExpertJudgmentDetails): any {
  return axios({
    url: '/costEstimationModel/getExpertJudgmentDetail',
    method: 'get',
    params
  })
}

/**
 * @description 新增指标选择
 */
export function createIndicatorSelection(data: ICreateIndicatorSelection): any {
  return axios({
    url: '/costEstimationModel/createIndicatorSelection',
    method: 'post',
    data,
    headers: {
      'Content-Type': 'application/json;charset=UTF-8'
    },
    transformRequest: (params) => JSON.stringify(params)
  })
}

/**
 * @description 专家维护列表
 */
export function getCostExpertMaintenanceList(id: string): any {
  return axios({
    url: `/costEstimationModel/getCostExpertMaintenanceList/${id}`,
    method: 'get'
  })
}

/**
 * @description 专家判断法分析接口
 */
export function getCostExpertAnalysis(id: string): any {
  return axios({
    url: `/costEstimationModel/expertJudgmentAnalysis/${id}`,
    method: 'get'
  })
}

/**
 * @description 保存专家估值的结果
 */
export function saveCostExpertAnalysis(data: ISaveCostExpertAnalysis): any {
  return axios({
    url: '/costEstimationModel/saveExpertJudgmentAnalysisResult',
    method: 'post',
    data
    // headers: {
    //   'Content-Type': 'application/form-data'
    // },
    // transformRequest: (params) => JSON.stringify(params)
  })
}

/**
 * @description 获取专家估值
 */
export function getCostExpertAnalysisResult(id: string): any {
  return axios({
    url: `/costEstimationModel/getExpertJudgmentAnalysisResult/${id}`,
    method: 'get'
  })
}

/**
 * @description 专家维护接口

 */
export function updateCostExpertMaintenance(
  data: IUpdateCostExpertMaintenance
): any {
  return axios({
    url: '/costEstimationModel/updateCostExpertMaintenance',
    method: 'post',
    data,
    headers: {
      'Content-Type': 'application/json;charset=UTF-8'
    },
    transformRequest: (params) => JSON.stringify(params)
  })
}

/**
 * @description 指标选取分页列表
 */
export function getIndicatorSelection(params: IIndicatorSelection): any {
  return axios({
    url: '/costEstimationModel/indicatorSelection/page',
    method: 'get',
    params
  })
}

/**
 * @description 删除指标选取
 */
export function deleteIndicatorSelection(id: string): any {
  return axios({
    url: `/costEstimationModel/deleteIndicatorSelection/${id}`,
    method: 'delete'
  })
}

/**
 * @description 包络分析数据
 */
export function getEnveloping(
  topicDataSetId: number,
  paramCol: string,
  targetCol: string
): any {
  return axios({
    url: '/costEstimationModel/getEnveloping',
    method: 'get',
    params: { topicDataSetId, paramCol, targetCol }
  })
}

/**
 * @description 参数拟合
 */
export function parameterFitting(
  operatorId: number,
  topicDataSetId: number,
  paramCol: string,
  targetCol: string,
  params: Object
): any {
  return axios({
    url: '/costEstimationModel/parameterFitting',
    method: 'post',
    data: {
      operatorId,
      topicDataSetId,
      paramCol,
      targetCol,
      params
    },
    headers: {
      'Content-Type': 'application/json;charset=UTF-8'
    },
    transformRequest: (params) => JSON.stringify(params)
  })
}

/**
 * @description 根据模型ID获取参数拟合结果和选中参数
 */
export function getParameterFittingResult(id: string): any {
  return axios({
    url: `/costEstimationModel/getParameterFittingResult/${id}`,
    method: 'get'
  })
}

/**
 * @description 保存参数拟合结果和选中参数
 */
export function saveParameterFittingResult(
  modelId: string,
  parameterFittingResultJson: string,
  curOperatorId: string,
  operatorName: string,
  operatorType: string,
  evaluationEngineeringId: string,
  modelFittingParam: string
): any {
  const data = new FormData()
  data.append('modelId', modelId)
  data.append('parameterFittingResultJson', parameterFittingResultJson)
  data.append('curOperatorId', curOperatorId)
  data.append('operatorName', operatorName)
  data.append('operatorType', operatorType)
  data.append('evaluationEngineeringId', evaluationEngineeringId)
  data.append('modelFittingParam', modelFittingParam)

  return axios({
    url: '/costEstimationModel/saveParameterFittingResult',
    method: 'post',
    data
  })
}

/**
 * @description 保存参数拟合结果和选中参数
 */
// export function getAnalyticalMethodsList(): any {
//   return axios({
//     url: `/costEstimationModel/getAnalyticalMethodsList`,
//     method: 'get'
//   })
// }

/**
 * @description 根据指标选取ID获取保存的分析结果
 */
export function getIndicatorSelectionAnalysisResult(id: string): any {
  return axios({
    url: `/costEstimationModel/getIndicatorSelectionAnalysisResult/${id}`,
    method: 'get'
  })
}

/**
 * @description 指标选取-保存分析的结果和选择的条件
 */
export function saveIndicatorSelectionAnalysis(
  id: string,
  analyticalMethods: string,
  analysisResultJson: string
): any {
  const data = new FormData()
  data.append('id', id)
  data.append('analyticalMethods', analyticalMethods)
  data.append('analysisResultJson', analysisResultJson)

  return axios({
    url: '/costEstimationModel/saveIndicatorSelectionAnalysis',
    method: 'post',
    data
  })
}

/**
 * @description 指标选取页分析接口
 */
export function indicatorSelectionAnalysis(
  analyticalMethods: string,
  topicDataSetId: string,
  indexList: string[],
  params: object
): any {
  return axios({
    url: '/costEstimationModel/indicatorSelectionAnalysis',
    method: 'post',
    data: { analyticalMethods, topicDataSetId, indexList, params },
    headers: {
      'Content-Type': 'application/json;charset=UTF-8'
    },
    transformRequest: (params) => JSON.stringify(params)
  })
}

/**
 * @description 评估工程列表
 */
export function getEvaluationEngineering(): any {
  return axios({
    url: '/evaluationEngineering/result/page',
    method: 'get',
    params: { pageNo: 1, pageSize: 9999999 }
  })
}
// 根据评估工程ID查询任务分页列表

export function taskPaging(params: any): any {
  return axios({
    url: '/evaluationEngineering/task/result/page',
    method: 'get',
    params: { pageNo: 1, pageSize: 9999999, ...params }
  })
}
// 根据当前任务ID查询评估方案分页列表
export function taskDetailById(params: any): any {
  return axios({
    url: 'evaluationEngineering/task/evaluationPlan/result/page',
    method: 'get',
    params: { pageNo: 1, pageSize: 9999999, ...params }
  })
}
// 根据评估方案ID获取所有叶子节点的权重
export function getWeightByPlanId(planId: any): any {
  return axios({
    url: `effectivenessEvaluationModel/getWeightByPlanId/${planId}`,
    method: 'get'
  })
}
/**
 * @description 获取算子类别列表
 */
export function getDictListByType(type: string): any {
  return axios({
    url: `/customOperator/getDictListByType/${type}`,
    method: 'get'
  })
}

/**
 * @description 获取算子类别列表
 */
export function addOperatorType(label: string): any {
  return axios({
    url: '/costEstimationModel/addOperatorType',
    method: 'post',
    params: { label }
  })
}

/**
 * @description 分页查询效能评估模型列表
 */
export function geteffectivenessEvaluationModelResult(params: PageReq): any {
  return axios({
    url: '/effectivenessEvaluationModel/result/page',
    method: 'get',
    params
  })
}
// 评估方法模型
export function getEvaluationMethodModelList(): any {
  return axios({
    url: '/effectivenessEvaluationModel/getEvaluationMethodModelList',
    method: 'get'
  })
}
// 修改
export function effectivenessEvaluationModelUpdate(data: any): any {
  return axios({
    url: '/effectivenessEvaluationModel/update',
    method: 'post',
    data,
    headers: {
      'Content-Type': 'application/json;charset=UTF-8'
    },
    transformRequest: (params) => JSON.stringify(params)
  })
}
// 新增
export function effectivenessEvaluationModelAdd(data: any): any {
  return axios({
    url: '/effectivenessEvaluationModel/create',
    method: 'post',
    data,
    headers: {
      'Content-Type': 'application/json;charset=UTF-8'
    },
    transformRequest: (params) => JSON.stringify(params)
  })
}
// 删除
export function effectivenessEvaluationModelDel(id: string): any {
  return axios({
    url: `/effectivenessEvaluationModel/${id}`,
    method: 'delete'
  })
}
// 详情
export function getEffectivenessEvaluationModelDetail(id: string): any {
  return axios({
    url: `/effectivenessEvaluationModel/getEffectivenessEvaluationModelDetail/${id}`,
    method: 'get'
  })
}
