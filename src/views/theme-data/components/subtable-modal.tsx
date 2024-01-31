import Modal from '@/components/modal'
import {
  createDataTable,
  deleteDataTable,
  modifyDataTable,
  updateTableData
} from '@/service/modules/theme-data'
import { MinusOutlined, PlusOutlined } from '@vicons/antd'
import _ from 'lodash'
import {
  NButton,
  NDatePicker,
  NForm,
  NFormItem,
  NIcon,
  NInput,
  NPopconfirm,
  NSelect,
  NSpace,
  NTooltip,
  NUpload
} from 'naive-ui'
import {
  PropType,
  Ref,
  computed,
  defineComponent,
  inject,
  onMounted,
  reactive,
  toRefs,
  watch
} from 'vue'

const props = {
  show: { type: Boolean as PropType<boolean>, default: true },
  type: { type: Number as PropType<number>, default: 0 },
  dataSetId: { type: Number as PropType<number>, default: 0 },
  data: { type: Object as PropType<SubTableModalData>, default: () => {} }
}

export default defineComponent({
  name: 'SubTableModal',
  props,
  emits: ['save', 'cancel', 'delete'],
  setup(props, ctx) {
    const variables = reactive({
      tableName: '',
      tableDesc: '',
      tableColList: [] as TableStructure[],

      columnTypeOptions: [
        'int',
        'varchar',
        'text',
        'date',
        'double',
        'datetime',
        'timestamp'
      ].map((k) => ({ label: k, value: k })),

      isSaving: false,
      hasSaved: false
    })
    const isEdit = computed(() => props.type == 1)
    const dataSetName = inject('dataSetName') as Ref<string>

    const computeColumns = () => {
      const oldColumns = props.data.columns
      const oldColumnName2Column = {} as { [k: string]: any }
      oldColumns.forEach(
        (column) => (oldColumnName2Column[column.columnName] = column)
      )

      const newColumns = variables.tableColList
        .filter((column) => column.columnName)
        .map((column) => ({
          ...column,
          columnLength:
            column.columnType != 'varchar' ? null : column.columnLength
        }))
      const newColumnNameSet = new Set(
        newColumns.map((item) => item.columnName)
      )

      const addColumns: AddColumn[] = []
      const modifyInfos: ModifyInfo[] = []
      const deleteColumns: string[] = []

      newColumns.forEach((newColumn: any) => {
        if (!oldColumnName2Column[newColumn.columnName]) {
          addColumns.push({
            name: newColumn.columnName,
            comment: newColumn.columnComment,
            length: newColumn.columnLength,
            type: newColumn.columnType
          })
        } else {
          if (
            Object.keys(newColumn).some(
              (k) =>
                newColumn[k] != oldColumnName2Column[newColumn.columnName][k]
            )
          ) {
            modifyInfos.push({
              name: newColumn.columnName,
              targetName: newColumn.columnName,
              targetComment: newColumn.columnComment,
              targetLength: newColumn.columnLength,
              targetType: newColumn.columnType
            })
          }
        }
      })

      oldColumns.forEach((oldColumn) => {
        if (!newColumnNameSet.has(oldColumn.columnName)) {
          deleteColumns.push(oldColumn.columnName)
        }
      })

      return { addColumns, deleteColumns, modifyInfos }
    }

    const handleSave = async () => {
      if (props.type == 0) {
        await createDataTable({
          tableChName: variables.tableDesc,
          tableName: variables.tableName,
          dataSetName: dataSetName.value,
          isShow: 1,
          showStyle: 1,
          tableInfos: variables.tableColList
            .filter((column) => column.columnName)
            .map((column) => ({
              ...column,
              columnLength: Number(column.columnLength) || null
            }))
        })
      } else {
        const { addColumns, deleteColumns, modifyInfos } = computeColumns()
        await modifyDataTable({
          dataSetId: props.dataSetId,
          addColumns,
          deleteColumns,
          modifyInfos
        })
      }

      variables.hasSaved = true
      window.$message.success('保存成功')
      ctx.emit('save', !isEdit.value)
    }

    const handleCancel = () => {
      ctx.emit('cancel', !isEdit.value && variables.hasSaved)
    }

    const handleDeleteTable = async () => {
      await deleteDataTable(props.dataSetId)

      window.$message.success('删除成功')

      ctx.emit('delete', true)
    }

    const addTableCol = () => {
      variables.tableColList.push({
        columnComment: '',
        columnLength: '50',
        columnName: '',
        columnType: 'varchar'
      })
    }

    const removeTableCol = (idx: number) => {
      variables.tableColList.splice(idx, 1)[0]
    }

    const handleColumnTypeChange = (
      value: ColumnType,
      tableCol: TableStructure
    ) => {
      if (value != 'varchar') {
        tableCol.columnLength = ''
      } else {
        tableCol.columnLength = '50'
      }
    }

    const init = () => {
      variables.tableName = ''
      variables.tableDesc = ''
      variables.tableColList = []
      addTableCol()
    }

    watch(
      () => props.show,
      () => {
        if (props.show) {
          if (props.type == 0) {
            init()
          } else {
            variables.tableName = props.data.tableName
            variables.tableDesc = props.data.tableDesc
            variables.tableColList = _.cloneDeep(props.data.columns).map(
              (item) => ({
                ...item,
                columnLength: String(item.columnLength || '')
              })
            )
          }
        }
      },
      { immediate: true }
    )

    return {
      ...toRefs(variables),
      isEdit,

      handleSave,
      handleCancel,
      handleDeleteTable,
      addTableCol,
      removeTableCol,
      handleColumnTypeChange
    }
  },
  render() {
    return (
      <Modal
        title='新建子表'
        show={this.show}
        onConfirm={this.handleSave}
        cancelShow={false}
        confirmLoading={this.isSaving}
        style={{ width: '900px' }}
      >
        {{
          default: () => (
            <>
              <NForm labelPlacement='left'>
                <NFormItem label='数据表名'>
                  <NInput
                    v-model={[this.tableName, 'value']}
                    readonly={this.isEdit}
                  />
                </NFormItem>
                <NFormItem label='数据表描述'>
                  <NInput
                    v-model={[this.tableDesc, 'value']}
                    readonly={this.isEdit}
                  />
                </NFormItem>
              </NForm>
              <NSpace wrapItem itemStyle={{ width: '180px' }}>
                <span>名字</span>
                <span>类型</span>
                <span>长度/值</span>
                <span>注释</span>
              </NSpace>
              {this.tableColList.map((tableCol, idx) => (
                <NSpace style={{ margin: '10px 0' }} align='center'>
                  <NInput v-model={[tableCol.columnName, 'value']} />
                  <NSelect
                    style={{ width: '180px' }}
                    v-model={[tableCol.columnType, 'value']}
                    options={this.columnTypeOptions}
                    onUpdateValue={(value) =>
                      this.handleColumnTypeChange(value, tableCol)
                    }
                  />
                  <NInput
                    v-model={[tableCol.columnLength, 'value']}
                    disabled={tableCol.columnType != 'varchar'}
                  />
                  <NInput
                    v-model:value={tableCol.columnComment}
                    type='textarea'
                    rows={1}
                  />
                  <NButton
                    strong
                    secondary
                    circle
                    type='info'
                    size='small'
                    onClick={() => this.removeTableCol(idx)}
                  >
                    {{ icon: () => <MinusOutlined /> }}
                  </NButton>
                </NSpace>
              ))}
              <NButton
                strong
                secondary
                circle
                type='info'
                size='small'
                onClick={this.addTableCol}
              >
                {{ icon: () => <PlusOutlined /> }}
              </NButton>
            </>
          ),
          'btn-middle': () => (
            <>
              {this.isEdit && (
                <NPopconfirm onPositiveClick={this.handleDeleteTable}>
                  {{
                    trigger: () => (
                      <NButton type='error' size='small'>
                        删除表
                      </NButton>
                    ),
                    default: () => '确认'
                  }}
                </NPopconfirm>
              )}
              <NButton type='primary' size='small' onClick={this.handleCancel}>
                数据模式
              </NButton>
            </>
          )
        }}
      </Modal>
    )
  }
})
