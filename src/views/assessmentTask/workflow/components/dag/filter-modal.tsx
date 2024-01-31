import { defineComponent, ref, PropType, reactive, toRefs, watch } from 'vue'
import Styles from './dag.module.scss'
import {
  NModal,
  NCard,
  NSelect,
  NButton,
  NSpace,
  NInput,
  NDataTable,
  NPagination
} from 'naive-ui'
import { MinusOutlined, PlusOutlined } from '@vicons/antd'
import {
  COLUMN_WIDTH_CONFIG,
  calculateTableWidth,
  DefaultTableWidth
} from '@/common/column-width-config'
import { getDataColValuePage } from '@/service/modules/assessmentTask'

interface QueryCriteria {
  column: string
  criteria: string
  value: string
}

const props = {
  show: {
    type: Boolean as PropType<Boolean>,
    default: false
  },
  queryOptions: {
    type: Array as PropType<Array<any>>,
    default: () => []
  },
  dataSetId: {
    type: Number as PropType<number>,
    default: 0
  },
  filterCriteria: {
    type: String as PropType<string>,
    default: ''
  }
}

export default defineComponent({
  name: 'FilterModal',
  props,
  emits: ['confirm', 'cancel'],
  setup(props, context) {
    const variables = reactive({
      typeOptions: ref([
        { label: '所有', value: 'and' },
        { label: '任一', value: 'or' }
      ]),
      criteriaOptions: ref([
        { label: '大于', value: '>' },
        { label: '等于', value: '=' },
        { label: '小于', value: '<' }
      ]),
      criteriaType: ref('and'),
      queryCriteria: ref<QueryCriteria[]>([]),

      columns: ref<any[]>([]),
      tableWidth: DefaultTableWidth,
      tableData: ref<any[]>([]),
      allTableData: ref<any[]>([]),
      page: ref(1),
      pageSize: ref(10),
      totalPage: ref(1),
      loadingRef: ref(false)
    })

    const handlePreview = () => {
      getTableData()
    }

    const handleConfirm = () => {
      context.emit('confirm', variables.allTableData, {
        queryCriteria: variables.queryCriteria,
        criteriaType: variables.criteriaType,
        result: variables.allTableData
      })
    }

    const handleCancel = () => {
      context.emit('cancel')
    }

    const addQuery = () => {
      variables.queryCriteria.push({
        column: props.queryOptions[0].value,
        criteria: '>',
        value: ''
      })
    }

    const removeQuery = (idx: number) => {
      variables.queryCriteria.splice(idx, 1)
    }

    const createColumns = () => {
      variables.columns = [
        {
          title: '#',
          key: 'index',
          render: (unused: any, index: number) => index + 1,
          ...COLUMN_WIDTH_CONFIG['index']
        },
        ...props.queryOptions.map((item) => ({
          title: item.label,
          key: item.value
        }))
      ]
      if (variables.tableWidth) {
        variables.tableWidth = calculateTableWidth(variables.columns)
      }
    }

    const getTableData = async () => {
      const queryCriteria = variables.queryCriteria.filter((item) => item.value)

      if (variables.loadingRef) return
      variables.loadingRef = true

      await getDataColValuePage(
        1,
        99999999,
        props.dataSetId,
        props.queryOptions.map((item) => item.value),
        variables.criteriaType,
        queryCriteria
      )
        .then((res: any) => {
          variables.page = 1
          variables.allTableData = res.totalList as any
          getShowTableData()
        })
        .finally(() => {
          variables.loadingRef = false
        })

      createColumns()
    }

    const getShowTableData = () => {
      variables.totalPage =
        Math.floor((variables.allTableData.length - 1) / variables.pageSize) + 1
      variables.tableData = variables.allTableData.slice(
        (variables.page - 1) * variables.pageSize,
        variables.page * variables.pageSize
      )
    }

    const init = () => {
      variables.tableData = []
      variables.allTableData = []
      variables.columns = []
      variables.queryCriteria = []
      variables.criteriaType = 'and'
    }

    watch(
      () => props.show,
      (show) => {
        if (!show) {
          init()
        } else if (props.filterCriteria) {
          const queryObj = JSON.parse(props.filterCriteria)
          variables.queryCriteria = queryObj.queryCriteria
          variables.criteriaType = queryObj.criteriaType

          getTableData()
        }
      }
    )

    return {
      ...toRefs(variables),
      handlePreview,
      handleConfirm,
      handleCancel,
      addQuery,
      removeQuery,
      getShowTableData
    }
  },
  render() {
    return (
      <NModal
        v-model={[this.show, 'show']}
        mask-closable={false}
        style={{ width: '900px' }}
      >
        <NCard title='筛选条件' closable onClose={this.handleCancel}>
          {{
            default: () => {
              return (
                <>
                  <div class={Styles['filter-modal-header']}>
                    满足下列
                    <NSelect
                      v-model={[this.criteriaType, 'value']}
                      options={this.typeOptions}
                      style={{ width: '100px' }}
                    ></NSelect>
                    条件
                  </div>
                  <div>
                    {this.queryCriteria.map((item, idx) => (
                      <div class={Styles['filter-modal-query']}>
                        <NSelect
                          v-model={[item.column, 'value']}
                          options={this.queryOptions}
                        ></NSelect>
                        <NSelect
                          v-model={[item.criteria, 'value']}
                          options={this.criteriaOptions}
                        ></NSelect>
                        <NInput v-model={[item.value, 'value']}></NInput>
                        <NButton
                          strong
                          secondary
                          circle
                          type='info'
                          size='small'
                          onClick={() => this.removeQuery(idx)}
                        >
                          {{ icon: () => <MinusOutlined /> }}
                        </NButton>
                      </div>
                    ))}
                  </div>
                  <div class={Styles['filter-modal-btns']}>
                    <NButton
                      strong
                      secondary
                      circle
                      type='info'
                      size='small'
                      onClick={this.addQuery}
                    >
                      {{ icon: () => <PlusOutlined /> }}
                    </NButton>
                  </div>
                  <NSpace vertical>
                    <NDataTable
                      loading={this.loadingRef}
                      columns={this.columns}
                      data={this.tableData}
                      scrollX={this.tableWidth}
                      row-class-name='items'
                    />
                    <NSpace justify='center'>
                      <NPagination
                        v-model:page={this.page}
                        v-model:page-size={this.pageSize}
                        page-count={this.totalPage}
                        show-size-picker
                        page-sizes={[10, 30, 50]}
                        show-quick-jumper
                        onUpdatePage={this.getShowTableData}
                        onUpdatePageSize={this.getShowTableData}
                      />
                    </NSpace>
                  </NSpace>
                </>
              )
            },
            footer: () => (
              <NSpace justify='end'>
                <NButton
                  type='primary'
                  size='small'
                  onClick={this.handlePreview}
                >
                  数据预览
                </NButton>
                <NButton
                  type='primary'
                  size='small'
                  onClick={this.handleConfirm}
                >
                  确定筛选
                </NButton>
                <NButton
                  type='primary'
                  size='small'
                  onClick={this.handleCancel}
                >
                  放弃筛选
                </NButton>
              </NSpace>
            )
          }}
        </NCard>
      </NModal>
    )
  }
})
