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
import { getEvaluationMethodModelList } from '@/views/EvaluationModel/api'
import { useI18n } from 'vue-i18n'
import { useTable } from '../components/effectivenessEvaluationModelDetail/use-table'
import Card from '@/components/card'
import ProjectModal from '../components/effectivenessEvaluationModelDetail/modal'

const list = defineComponent({
  name: 'CostManagement',
  setup() {
    const { t } = useI18n()
    const { variables, getTableData, createColumns } = useTable()
    const selectionTypeOptions = ref([])

    const requestData = () => {
      getTableData({
        pageSize: variables.pageSize,
        pageNo: variables.page,
        modelName: variables.modelName,
        modelMethod: variables.modelMethod
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

    const handleReset = () => {
      variables.modelName = null
      variables.modelMethod = null
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

    onMounted(() => {
      createColumns(variables)
      requestData()
    })

    watch(useI18n().locale, () => {
      createColumns(variables)
    })

    onMounted(async () => {
      selectionTypeOptions.value = await getEvaluationMethodModelList()
      console.log(selectionTypeOptions)
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
      handleReset,

      selectionTypeOptions
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
                v-model={[this.modelMethod, 'value']}
                options={this.selectionTypeOptions}
                valueField='id'
                labelField='operatorName'
                placeholder='评估方法模型'
                style={{ width: '300px' }}
                size='small'
                clearable
                onClear={this.onClearSearch}
              />
              <NInput
                v-model={[this.modelName, 'value']}
                placeholder='评估模型名称'
                style={{ width: '300px' }}
                size='small'
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
                onClick={this.handleReset}
                type='primary'
                class='btn-create-project'
              >
                重置
              </NButton>
              <NButton
                size='small'
                onClick={this.handleModalChange}
                type='primary'
                class='btn-create-project'
              >
                新建
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
