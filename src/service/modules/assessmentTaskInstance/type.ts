/*
 * Licensed to the Apache Software Foundation (ASF) under one or more
 * contributor license agreements.  See the NOTICE file distributed with
 * this work for additional information regarding copyright ownership.
 * The ASF licenses this file to You under the Apache License, Version 2.0
 * (the "License"); you may not use this file except in compliance with
 * the License.  You may obtain a copy of the License at
 *
 *    http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */
interface BoundSubProcess { 
  processId: number,
  subProcessCode: number,
  evaluationTarget: number,
  dataSourceCol: number,
  dataSourceId: number
}

interface PageReq {
  pageNo: number
  pageSize: number
  evaluationEngineeringName?: string
  evaluationEngineeringDesc?: string
  startTime?: string
  endTime?: string
  createdRange?: string[]
}

interface PageData {
  id: number
  evaluationEngineeringName: string
  evaluationEngineeringDesc: string
  taskNum: number
  userId: number
  userName: string
  createTime: string
}

interface PageRes {
  totalList: PageData[]
  total: number
  totalPage: number
  pageSize: number
  currentPage: number
  start: number
}

interface CreateReq {
  evaluationEngineeringName?: string
  evaluationEngineeringDesc?: string
}
interface CreatePlanReq extends CreateReq {
  taskId: number|string
  evaluationPlanId: number|string
  evaluationTaskName: string
  evaluationTaskName: string
  evaluationTarget: string
  evaluationLevel: : string
}

interface UpdateReq extends CreateReq {
  id: number|string
}

interface TaskPageReq {
  pageNo: number
  pageSize: number
  taskName?: string
  taskBasis?: string
  startTime?: string
  endTime?: string
  createdRange?: string[]
}

interface TaskPageData {
  id: number
  taskName: string
  projectCode: number
  taskBasis: string
  taskStartTime: string
  taskEndTime: string
  stageName: string
  stageStartDate: string
  stageEndDate: string
  indicatorSystemNum: number
  evaluationPlanNum: number
  evaluationTaskNum: number
  evaluationTaskInstanceNum: number
  userName: string
  createTime: string
}

interface TaskPageRes {
  totalList: TaskPageData[]
  total: number
  totalPage: number
  pageSize: number
  currentPage: number
  start: number
}

interface TaskCreateReq {
  evaluationEngineeringId: number
  taskName: string
  taskBasis?: string
  taskDateRange?: string[] | null
  taskStartTime?: string
  taskEndTime?: string
  stageName?: string
  stageDateRange?: string[] | null
  stageStartDate?: string
  stageEndDate?: string
}

interface TaskUpdateReq extends TaskCreateReq {
  id: number
}

interface IndicatorPageReq {
  pageNo: number
  pageSize: number
  taskId: number
  indicatorSystemName?: string
  indicatorSystemDesc?: string
  startTime?: string
  endTime?: string
}

interface IndicatorPageData {
  id: number
  processCode: number
  taskId: number
  taskBasis: string
  indicatorSystemName: string
  indicatorSystemDesc: string
  indicatorSystemTemplateId: number
  indicatorSystemRecommendation: string
  userId: number
  userName: string
  createTime: string
}

interface IndicatorPageRes {
  totalList: IndicatorPageData[]
  total: number
  totalPage: number
  pageSize: number
  currentPage: number
  start: number
}

interface IndicatorCreateReq {
  taskId: number
  indicatorSystemName: string
  indicatorSystemDesc: string
  indicatorSystemTemplateId: number
  indicatorSystemRecommendation: string
}
interface IndicatorUpdateReq extends IndicatorCreateReq {
  id: number
}

export {
  PageReq,
  PageRes,
  PageData,
  CreateReq,
  CreatePlanReq,
  UpdateReq,
  TaskPageReq,
  TaskPageRes,
  TaskPageData,
  TaskCreateReq,
  TaskUpdateReq,
  IndicatorPageReq,
  IndicatorPageData,
  IndicatorPageRes,
  IndicatorCreateReq,
  IndicatorUpdateReq
}
