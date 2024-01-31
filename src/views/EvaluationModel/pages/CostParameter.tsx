import { ArrowLeftOutlined, SearchOutlined } from '@vicons/antd'
import {
  NButton,
  NDataTable,
  NIcon,
  NSelect,
  NPagination,
  NSpace,
  NTabs,
  NTabPane,
  NInput,
  NCheckbox,
  NGrid,
  NGridItem,
  NForm,
  NFormItem
} from 'naive-ui'
import {
  VNode,
  defineComponent,
  getCurrentInstance,
  nextTick,
  onMounted,
  reactive,
  ref,
  toRefs,
  watch
} from 'vue'
import { useI18n } from 'vue-i18n'
import { useTable } from '../components/CostParameter/use-table'
import Card from '@/components/card'
import {
  getParameterFittingResult,
  getThemeDataset,
  getThemeDatasetTable,
  getThemeDatasetTableCol
} from '../api'
import { useRoute } from 'vue-router'
import { useRouterInfo } from '../components/CostParameter/use-router-info'
import SingleParameter from '../components/CostParameter/single-parameter'
import MultiParameter from '../components/CostParameter/multi-parameter'
import { SelectBaseOption } from 'naive-ui/es/select/src/interface'

const list = defineComponent({
  name: 'CostParameter',
  setup() {
    const { t } = useI18n()
    const { variables, getTableData, createColumns } = useTable()
    const route = useRoute()
    const { routerInfo, handleBack } = useRouterInfo()

    const bottomVariables = reactive({
      paramColumn: ref<string>(''),
      targetColumn: ref<string>(''),
      operatorId: ref(),
      evaluationEngineeringIds: ref([]),
      operatorType: ref(),
      operatorName: ref(),
      params: ref({}),
      fitType: 1,

      singleParameterRef: ref<any>(null),
      multiParameterRef: ref<any>(null)
    })

    const handleModalChange = () => {
      variables.showModalRef = true
      variables.statusRef = 0
    }

    const handleSearch = () => {
      variables.page = 1
      getTableData()
    }

    const onClearSearch = () => {
      variables.page = 1
      getTableData()
    }

    const onCancelModal = () => {
      variables.showModalRef = false
    }

    const onConfirmModal = () => {
      variables.showModalRef = false
      getTableData()
    }

    const handleChangePageSize = () => {
      variables.page = 1
      getTableData()
    }

    const handleTopicDataColSelected = (
      value: any,
      option: SelectBaseOption[]
    ) => {
      variables.topicDataColSelected = [
        ...option.map((item) => ({ value: item.value, label: item.label }))
      ]
    }

    const trim = getCurrentInstance()?.appContext.config.globalProperties.trim

    onMounted(async () => {
      createColumns(variables)

      await getThemeDataset().then((res: string[]) => {
        variables.topicDataSet = res.map((v) => ({
          value: v,
          label: v
        }))
      })

      await getParameterFittingResult(route.query.manageId as string).then(
        (res: any) => {
          if (res == null) {
            return
          }

          const resultJson = res.parameterFittingResultJson

          bottomVariables.paramColumn = resultJson.paramCol
          bottomVariables.targetColumn = resultJson.targetCol
          bottomVariables.operatorId = resultJson.operatorId
          bottomVariables.evaluationEngineeringIds = JSON.parse(
            res.evaluationEngineeringId
          )
          bottomVariables.operatorType = res.operatorType
          bottomVariables.operatorName = res.operatorName
          bottomVariables.params = resultJson.params
          bottomVariables.fitType = resultJson.fitType || 1
          variables.topicData = resultJson.topicData
          variables.topicDataTable = resultJson.topicDataTable
          variables.topicDataCol = resultJson.topicDataCol

          nextTick(() => {
            bottomVariables.singleParameterRef?.analysis()
            bottomVariables.multiParameterRef?.analysis()
          })
        }
      )

      handleSearch()
    })

    watch(useI18n().locale, () => {
      createColumns(variables)
    })

    watch(
      () => variables.topicData,
      (topicData, oldVal) => {
        if (!topicData) {
          return
        }

        getThemeDatasetTable(topicData).then((res: any) => {
          variables.topicDataSetTable = res
          if (oldVal) {
            variables.topicDataTable = res[0].id
            bottomVariables.paramColumn = ''
            bottomVariables.targetColumn = ''
          }
        })
      }
    )

    watch(
      () => variables.topicDataTable,
      (topicDataTable, oldVal) => {
        if (!topicDataTable) {
          return
        }

        getThemeDatasetTableCol(topicDataTable).then((res: any[]) => {
          variables.topicDataSetCol = res.map((item) => ({
            value: item.field,
            label: item.comment || item.field
          }))

          if (oldVal) {
            variables.topicDataCol = []
          } else {
            variables.topicDataColSelected = variables.topicDataCol.map(
              (s) => ({
                ...variables.topicDataSetCol.find((item) => item.value == s)
              })
            )
            createColumns(variables)
          }

          // getTableData()
        })
      }
    )

    return {
      t,
      ...toRefs(variables),
      ...toRefs(bottomVariables),
      getTableData,
      handleModalChange,
      handleSearch,
      onCancelModal,
      onConfirmModal,
      onClearSearch,
      handleChangePageSize,
      trim,
      routerInfo,
      handleBack,
      handleTopicDataColSelected
    }
  },
  render() {
    const { t, loadingRef } = this
    return (
      <NSpace vertical>
        <NGrid class='current-page-header' cols={1}>
          <NGridItem class='n-grid-item'>
            <div class='title'>
              <NButton onClick={this.handleBack} class='btn-back'>
                <NIcon size='20' component={ArrowLeftOutlined}></NIcon>
              </NButton>
              <span class='title-span'>{this.routerInfo.name}</span>
            </div>
            <div class='desc'></div>
          </NGridItem>
        </NGrid>
        <Card>
          <NSpace vertical>
            <NSpace justify='space-between'>
              <NSpace>
                <NSelect
                  v-model={[this.topicData, 'value']}
                  options={this.topicDataSet}
                  placeholder={'主题数据集选择'}
                  style={{ width: '300px' }}
                  size='small'
                  onClear={this.onClearSearch}
                />
                <NSelect
                  v-model={[this.topicDataTable, 'value']}
                  options={this.topicDataSetTable}
                  labelField='tableName'
                  valueField='id'
                  placeholder={'数据表选择'}
                  style={{ width: '300px' }}
                  size='small'
                  onClear={this.onClearSearch}
                />
                <NSelect
                  v-model={[this.topicDataCol, 'value']}
                  options={this.topicDataSetCol}
                  placeholder={'数据列选择'}
                  multiple={true}
                  style={{ width: '300px' }}
                  size='small'
                  onClear={this.onClearSearch}
                  onUpdateValue={this.handleTopicDataColSelected}
                />
              </NSpace>
              <NSpace>
                <NButton
                  size='small'
                  type='primary'
                  onClick={this.handleSearch}
                  v-slots={{
                    icon: () => (
                      <NIcon>
                        <SearchOutlined />
                      </NIcon>
                    ),
                    default: () => <span>数据预览</span>
                  }}
                ></NButton>
              </NSpace>
            </NSpace>
            <NSpace vertical>
              <NDataTable
                loading={loadingRef}
                columns={this.columns}
                data={this.tableData}
                scrollX={this.tableWidth}
                row-class-name='items'
                // row-key={this.rowKey}
                onUpdateCheckedRowKeys={this.handleCheck}
              />
              <NSpace justify='center'>
                <NPagination
                  v-model:page={this.page}
                  v-model:page-size={this.pageSize}
                  page-count={this.totalPage}
                  show-size-picker
                  page-sizes={[10, 30, 50]}
                  show-quick-jumper
                  onUpdatePage={this.getTableData}
                  onUpdatePageSize={this.handleChangePageSize}
                />
              </NSpace>
            </NSpace>
          </NSpace>
        </Card>
        <Card>
          <NSpace vertical>
            <NTabs type={'line'} animated v-model={[this.fitType, 'value']}>
              <NTabPane name={1} tab='单参数拟合' displayDirective='show'>
                <SingleParameter
                  variables={{
                    paramColumn: this.paramColumn,
                    targetColumn: this.targetColumn,
                    operatorId: this.operatorId,
                    topicDataTable: this.topicDataTable,
                    topicData: this.topicData,
                    topicDataCol: this.topicDataCol,
                    topicDataColSelected: this.topicDataColSelected,
                    evaluationEngineeringIds: this.evaluationEngineeringIds,
                    operatorType: this.operatorType,
                    operatorName: this.operatorName,
                    params: this.params
                  }}
                  ref='singleParameterRef'
                />
              </NTabPane>
              <NTabPane name={2} tab='多参数拟合' displayDirective='show'>
                <MultiParameter
                  variables={{
                    paramColumn: this.paramColumn,
                    targetColumn: this.targetColumn,
                    operatorId: this.operatorId,
                    topicDataTable: this.topicDataTable,
                    topicData: this.topicData,
                    topicDataCol: this.topicDataCol,
                    topicDataColSelected: this.topicDataColSelected,
                    evaluationEngineeringIds: this.evaluationEngineeringIds,
                    operatorType: this.operatorType,
                    operatorName: this.operatorName,
                    params: this.params
                  }}
                  ref='multiParameterRef'
                />
              </NTabPane>
            </NTabs>
          </NSpace>
        </Card>
        {/* <ProjectModal
          showModalRef={this.showModalRef}
          statusRef={this.statusRef}
          row={this.row}
          onCancelModal={this.onCancelModal}
          onConfirmModal={this.onConfirmModal}
        /> */}
      </NSpace>
    )
  }
})

export default list
