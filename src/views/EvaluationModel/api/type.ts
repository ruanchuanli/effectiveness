export interface CreateReq {
  modelName: string
  equipName?: string
  equipType?: string
  expenseType: string
  estimationMethod: '1' | '2' | '3' | '4'
}

export interface EditReq {
  id: string
  modelName: string
  equipName?: string
  equipType?: string
  expenseType: string
  estimationMethod: '1' | '2' | '3' | '4'
}
export interface PageReq {
  pageNo: number
  pageSize: number
  modelName?: string
  modelMethod?: string
}
export interface IEstimationModelReq {
  pageNo: number
  pageSize: number
  modelName?: string
  expenseType?: string
  estimationMethod: string
}

export interface IActiveColVal {
  pageNo: number
  pageSize: number
  dataSetId: number | string
  dataSourceCols: Array<string>
}

export interface ModelDisplayData {
  columns: any[]
  data: any[]
  type: 'str' | 'obj'
}

export interface ICreateExpertJudgment {
  /**
   * 专家熟悉度，传字典的value
   */
  expertFamiliarity: string
  /**
   * 专家姓名
   */
  expertName: string
  /**
   * 低估值
   */
  lowValuation: number
  /**
   * 中估值
   */
  mediumValuation: number
  /**
   * 费用模型ID
   */
  modelId: number
  /**
   * 如果新增的是第1轮次，不用传这个，如果是其他轮次，则传对应第一轮次数据的ID
   */
  parentId: number
  /**
   * 轮次
   */
  round: number
  /**
   * 高估值
   */
  strongValuation: number
  /**
   * 依据
   */
  valuationBasis: string
}
export interface IUpdateExpertJudgment {
  id: number
  /**
   * 专家熟悉度，传字典的value
   */
  expertFamiliarity: string
  /**
   * 专家姓名
   */
  expertName: string
  /**
   * 低估值
   */
  lowValuation: number
  /**
   * 中估值
   */
  mediumValuation: number
  /**
   * 费用模型ID
   */
  modelId: number
  /**
   * 如果新增的是第1轮次，不用传这个，如果是其他轮次，则传对应第一轮次数据的ID
   */
  parentId: number
  /**
   * 轮次
   */
  round: number
  /**
   * 高估值
   */
  strongValuation: number
  /**
   * 依据
   */
  valuationBasis: string
}

export interface IEditExpertJudgment {
  id: number
  expertFamiliarity?: string
  expertName?: string
  lowValuation?: number
  mediumValuation?: number
  modelId?: number
  parentId?: number
  round?: number
  strongValuation?: number
  valuationBasis?: string
}

export interface IExpertJudgment {
  modelId: string
  pageNo: number
  pageSize: number
}

export interface IExpertJudgmentDetails {
  /**
   * 模型ID
   */
  modelId: string
  /**
   * 轮次
   */
  round: string
}

export interface ICreateIndicatorSelection {
  /**
   * 装备名称
   */
  equipmentName: string
  /**
   * 装备类型（传字典的 value）
   */
  equipmentType: string
  /**
   * 任务名称
   */
  taskName: string
}

export interface IIndicatorSelection {
  pageNo: number
  pageSize: number
  /**
   * 任务名称
   */
  taskName?: string
}

export interface IUpdateCostExpertMaintenance {
  expertFamiliarity: string
  expertName: string
  id: number | null
  modelId: number
}

export interface ISaveCostExpertAnalysis {
  estimationResult: string
  modelId: string
  operatorName: string
  operatorType: string
  evaluationEngineeringId: string
  modelResult: number
}
