import { SearchOutlined } from '@vicons/antd'
import {
  NButton,
  NDataTable,
  NIcon,
  NInput,
  NSelect,
  NPagination,
  NSpace
} from 'naive-ui'
import {
  defineComponent,
  getCurrentInstance,
  onMounted,
  ref,
  toRefs,
  watch
} from 'vue'
import {
  getStageExpensesMapping,
  getEstimationMethodMapping,
  getEquipmentTypeMappding
} from '@/views/EvaluationModel/api'
import { useI18n } from 'vue-i18n'
import { useTable } from '../components/CostManagememt/use-table'
import Card from '@/components/card'
import ProjectModal from '../components/CostManagememt/modal'
import { async } from '@antv/x6/lib/registry/marker/async'

const list = defineComponent({
  name: 'CostManagement',
  setup() {
    const { t } = useI18n()
    const { variables, getTableData, createColumns } = useTable()
    const expenseTypeOptions = ref([])
    const estimationMethodOptions = ref([])

    const requestData = () => {
      getTableData({
        pageSize: variables.pageSize,
        pageNo: variables.page,
        modelName: variables.modelName,
        expenseType: variables.expenseType,
        estimationMethod: variables.estimationMethod
      })
    }

    const handleModalChange = () => {
      variables.showModalRef = true
      variables.statusRef = 0
    }

    const handleSearch = () => {
      variables.page = 1
      requestData()
    }

    const onClearSearch = () => {
      variables.page = 1
      getTableData({
        pageSize: variables.pageSize,
        pageNo: variables.page
      })
    }

    const onCancelModal = () => {
      variables.showModalRef = false
    }

    const onConfirmModal = () => {
      variables.showModalRef = false
      requestData()
    }

    const handleChangePageSize = () => {
      variables.page = 1
      requestData()
    }

    const jointAnalysis = () => {
      console.log(variables.checkedRowKeys)
      console.log('联合分析')
    }

    const trim = getCurrentInstance()?.appContext.config.globalProperties.trim

    onMounted(() => {
      createColumns(variables)
      requestData()
    })

    watch(useI18n().locale, () => {
      createColumns(variables)
    })

    onMounted(async () => {
      expenseTypeOptions.value = await getStageExpensesMapping()
      estimationMethodOptions.value = await getEstimationMethodMapping()
      console.log('获取搜索下拉数据')
    })

    return {
      t,
      ...toRefs(variables),
      requestData,
      handleModalChange,
      handleSearch,
      onCancelModal,
      onConfirmModal,
      onClearSearch,
      handleChangePageSize,

      expenseTypeOptions,
      estimationMethodOptions,

      jointAnalysis,

      trim
    }
  },
  render() {
    const { t, loadingRef } = this
    return (
      <NSpace vertical>
        <Card>
          <NSpace justify='space-between'>
            <NSpace>
              <NSelect
                v-model={[this.modelName, 'value']}
                options={this.expenseTypeOptions}
                placeholder={'费用阶段'}
                style={{ width: '300px' }}
                size='small'
                clearable
                onClear={this.onClearSearch}
              />
              <NSelect
                v-model={[this.expenseType, 'value']}
                options={this.estimationMethodOptions}
                placeholder={'估算方式'}
                style={{ width: '300px' }}
                size='small'
                clearable
                onClear={this.onClearSearch}
              />
              <NInput
                allowInput={this.trim}
                size='small'
                v-model={[this.estimationMethod, 'value']}
                placeholder={'费用估算模型名称'}
                clearable
                onClear={this.onClearSearch}
              />
            </NSpace>
            <NSpace>
              <NButton size='small' type='primary' onClick={this.handleSearch}>
                <NIcon>
                  <SearchOutlined />
                </NIcon>
              </NButton>
              <NButton
                size='small'
                onClick={this.handleModalChange}
                type='primary'
                class='btn-create-project'
              >
                新建
              </NButton>
              <NButton
                size='small'
                onClick={this.jointAnalysis}
                type='primary'
                class='btn-create-project'
              >
                联合分析
              </NButton>
            </NSpace>
          </NSpace>
        </Card>
        <Card>
          <NSpace vertical>
            <NDataTable
              loading={loadingRef}
              columns={this.columns}
              data={this.tableData}
              scrollX={this.tableWidth}
              row-class-name='items'
              row-key={this.rowKey}
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
                onUpdatePage={this.requestData}
                onUpdatePageSize={this.handleChangePageSize}
              />
            </NSpace>
          </NSpace>
        </Card>
        <ProjectModal
          showModalRef={this.showModalRef}
          statusRef={this.statusRef}
          row={this.row}
          onCancelModal={this.onCancelModal}
          onConfirmModal={this.onConfirmModal}
        />
      </NSpace>
    )
  }
})

export default list
