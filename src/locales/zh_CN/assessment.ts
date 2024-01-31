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

export default {
  projects: {
    column_name: '评估工程名称',
    column_desc: '评估工程描述',
    column_num: '项目数量',
    column_creator: '创建人',
    column_created: '创建时间',
    column_operation: '操作',

    tips_name: '请输入评估工程名称',
    tips_desc: '请输入评估工程描述',
    tips_created: '请选择创建时间',

    list_name: '工程列表'
  },
  button: {
    create_project: '创建工程',
    create_task: '创建项目',
    create_indicator: '创建指标体系',

    create: '创建',
    delete: '删除',
    edit: '编辑',
    details: '详情',
    confirm: '确认'
  },
  tasks: {
    column_task_name: '项目名称',
    column_task_basis: '项目依据',
    column_indicator_system_num: '指标体系',
    column_evaluation_task_num: '评估任务',
    column_evaluation_plan_num: '评估方案',

    column_evaluation_task_instance_num: '评估任务实例',
    column_task_time: '任务时间',
    column_step_task_time: '阶段任务时间',
    column_creator: '创建人',
    column_operation: '操作',
    column_stage_name: '阶段划分',

    tips_task_name: '请输入项目名称',
    tips_task_basis: '请输入项目依据',
    tips_task_time: '请选择任务时间',

    tips_stage_name: '请输入阶段名称',
    tips_stage_date: '请选择阶段时间',

    list_name: '项目列表',

    step1_title: '建立指标体系',
    step2_title: '创建评估方案',
    step3_title: '设置评估数据',
    step4_title: '创建评估任务',

    step1_desc:
      '支持用户新建指标，并为指标设定易级并建立编标间的依赖关系,对不直直挑盘量的指标进行分解证绿汇单，形色皆标体系',
    step2_desc:
      '通过对指标体至中各指标的评估方法，指标参数。评估数据进行定义来制定，设计配图指标的计算流单算法',
    step3_desc:
      '对一至列数据速和数据年进行管理，船爹供各出效能评估算法使用的数据',
    step4_desc:
      '在已建立评估方案的基础上，针对若干明确的评估对象进行的具体评估活动。',
    no_task: '暂无任务'
  },
  indicators: {
    indicatorSystemName: '指标体系名称',
    indicatorSystemDesc: '指标体系描述',
    createTime: '创建时间',
    operation: '操作',
    indicatorSystemTemplate: '指标体系模版',
    indicatorSystemRecommendation: '指标体系建议',

    tips_indicatorSystemName: '请输入指标体系名称',
    tips_indicatorSystemDesc: '请输入指标体系描述',
    tips_createTime: '请选择创建时间',
    tips_indicatorSystemTemplate: '请选择指标体系模版',
    tips_indicatorSystemRecommendation: '请输入指标体系建议',

    list_name: '指标体系列表'
  }
}
