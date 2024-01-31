import Card from '@/components/card'
import { SearchOutlined } from '@vicons/antd'
import {
  NButton,
  NDataTable,
  NDatePicker,
  NForm,
  NFormItem,
  NIcon,
  NInput,
  NInputNumber,
  NLayout,
  NLayoutContent,
  NLayoutSider,
  NPagination,
  NSpace,
  NTab,
  NTabPane,
  NTabs,
  NTree,
  SelectOption,
  TreeOption
} from 'naive-ui'
import {
  PropType,
  Ref,
  computed,
  defineComponent,
  inject,
  provide,
  reactive,
  ref,
  toRefs,
  watch
} from 'vue'
import ContextMenu from './context-menu'
import {
  deleteTableData,
  getAllDataSetDetail,
  getTableInfo,
  getTableStructure
} from '@/service/modules/theme-data'
import DetailMode from './detail-mode'
import DataModal from './data-modal'
import SubtableModal from './subtable-modal'
import Styles from './index.module.scss'
import WorkflowDefinitionMode from './workflow-definition-mode'
import DetailModal from './detail-modal'
import { useTable } from './use-table'

export default defineComponent({
  name: 'EquipmentDetail',
  setup(props, ctx) {
    const variables = reactive({
      searchForm: {
        queryCriteria: {} as { [key: string]: string | null },
        rangeCriteria: {} as { [key: string]: string[] | null }
      },

      dataSetDetail: { tableList: [], categoryTree: [] } as DataSetDetail,

      // curTab: ref(1),
      curTable: ref<DataSetDetail['tableList'][0]>({} as any),
      tableInfo: { data: {} as any, header: [] } as TableInfo,

      contextMenu: { top: 0, left: 0, show: false },

      equipmentModalProps: {
        show: false,
        type: 0,
        data: {},
        header: [] as TableInfo['header'],
        dataSetId: 0,
        categorySelectOptions: [] as SelectOption[],
        subCategorySelectOptions: {} as {
          [key: string]: SelectOption[]
        },
        isMainTable: false
      },
      subTableModalProps: {
        show: false,
        type: 0,
        data: {
          tableName: '',
          tableDesc: '',
          columns: []
        } as SubTableModalData
      },
      detailModalProps: {
        show: false,
        tableDetail: undefined as DataSetDetail['tableList'][0] | undefined,
        row: {} as any
      },
      hasCreateBtnClick: false
    })
    const curEquipment = ref<EquipmentDetail | undefined>()
    const tabRef = ref<InstanceType<typeof NTabs> | null>(null)
    const workflowDefinitionModeRef = ref<InstanceType<
      typeof WorkflowDefinitionMode
    > | null>(null)
    const isListMode = computed(
      () =>
        variables.curTable.showStyle == 1 || variables.curTable.showStyle == 4
    )
    const dataSetName = inject('dataSetName') as Ref<string>

    provide('curEquipment', curEquipment)
    provide('dataSetDetail', variables.dataSetDetail)

    const handleSearch = async () => {
      if (variables.curTable.showStyle == 3) {
        workflowDefinitionModeRef.value?.getTableData()
        return
      }

      await getCurTableInfo({ equip_name: '' })

      if (variables.curTable == variables.dataSetDetail.tableList[0]) {
        curEquipment.value = findEquipment(
          variables.tableInfo.data.totalList[0]?.equip_name
        )
      }
    }

    const handleContentMenuHide = (isHide: boolean) => {
      variables.contextMenu.show = isHide
    }

    const findEquipment = (equip_name: string) => {
      let res: EquipmentDetail | undefined = undefined

      variables.dataSetDetail.categoryTree.forEach((item) => {
        item.children.forEach((item1) => {
          item1.children.forEach((item2) => {
            if (item2.equip_name == equip_name) {
              res = {
                category: item.equip_name,
                subCategory: item1.equip_name,
                equip_name: item2.equip_name
              }
            }
          })
        })
      })

      return res
    }

    const initSearchForm = () => {
      Object.keys(variables.searchForm.queryCriteria).forEach((k) => {
        variables.searchForm.queryCriteria[k] = null
      })
      Object.keys(variables.searchForm.rangeCriteria).forEach((k) => {
        variables.searchForm.rangeCriteria[k] = null
      })
    }

    const handleSelectEquipment = (
      keys: Array<string | number>,
      option: Array<TreeOption | null>
    ) => {
      if (option.length == 0 || option[0] == null || option[0].children) {
        return
      }

      curEquipment.value = findEquipment(option[0]?.equip_name as string)
      variables.tableInfo = { data: {} as any, header: [] }
      initSearchForm()

      getCurTableInfo()
    }

    const handleAddData = () => {
      variables.equipmentModalProps.show = true
      variables.equipmentModalProps.type = 0
      variables.equipmentModalProps.dataSetId = variables.curTable.dataSetId
      variables.equipmentModalProps.header = variables.tableInfo.header
      if (variables.curTable == variables.dataSetDetail.tableList[0]) {
        variables.equipmentModalProps.isMainTable = true
      } else {
        variables.equipmentModalProps.isMainTable = false
      }
    }

    const handleEditData = (data: any) => {
      variables.equipmentModalProps.show = true
      variables.equipmentModalProps.type = 1
      variables.equipmentModalProps.dataSetId = variables.curTable.dataSetId
      variables.equipmentModalProps.header = variables.tableInfo.header
      if (isListMode.value) {
        variables.equipmentModalProps.data = data
      } else {
        variables.equipmentModalProps.data =
          variables.tableInfo.data.totalList[0]
      }
    }

    const handleDeleteData = async (id: any) => {
      await deleteTableData(variables.curTable.dataSetId, id)

      window.$message.success('删除成功')
      getCurTableInfo()
    }

    const handleEditDetail = (row: any) => {
      variables.detailModalProps.show = true
      variables.detailModalProps.row = row
      variables.detailModalProps.tableDetail =
        variables.dataSetDetail.tableList.find((item) => item.showStyle == 5)
    }

    const handleCreateEquipment = () => {
      const dataSetId = variables.dataSetDetail.tableList[0].dataSetId
      getTableStructure(dataSetId).then((res) => {
        variables.equipmentModalProps.show = true
        variables.equipmentModalProps.type = 0
        variables.equipmentModalProps.data = {}
        variables.equipmentModalProps.dataSetId = dataSetId
        variables.equipmentModalProps.isMainTable = true
        variables.equipmentModalProps.header = res
          .filter((item) => item.columnName != 'id')
          .map((item) => ({
            field: item.columnName,
            comment: item.columnComment,
            type: item.columnType
          }))

        variables.hasCreateBtnClick = true
      })
    }

    const handleCreateSubTable = () => {
      variables.subTableModalProps.show = true
      variables.subTableModalProps.type = 0
    }

    const handleEditSubTable = () => {
      getTableStructure(variables.curTable.dataSetId).then((res) => {
        variables.subTableModalProps.show = true
        variables.subTableModalProps.type = 1
        variables.subTableModalProps.data = {
          tableName: variables.curTable.tableName,
          tableDesc: variables.curTable.tableChName,
          columns: res.filter((item) => item.columnName != 'id')
        }
      })
    }

    const handleEquipmentModalSave = async (
      isAdd: boolean,
      dataMap: { [x: string]: any }
    ) => {
      variables.equipmentModalProps.show = false

      if (
        variables.hasCreateBtnClick ||
        (isAdd && variables.curTable == variables.dataSetDetail.tableList[0])
      ) {
        variables.hasCreateBtnClick = false
        await getDataSetDetail()

        curEquipment.value = findEquipment(dataMap.equip_name)
      }

      getCurTableInfo({
        pageNo: tableVariables.page,
        pageSize: tableVariables.pageSize
      })
    }

    const handleEquipmentModalCancel = () => {
      variables.equipmentModalProps.show = false
      variables.hasCreateBtnClick = false
    }

    const handleSubTableModalSave = (isAdd: boolean) => {}

    const handleSubTableModalCancel = async (isAdd: boolean) => {
      variables.subTableModalProps.show = false

      if (isAdd) {
        getAllDataSetDetail(dataSetName.value).then((res) => {
          variables.dataSetDetail = res
          const tableList = variables.dataSetDetail.tableList
          variables.curTable = tableList[tableList.length - 1]
        })
      } else {
        getCurTableInfo()
      }
    }

    const handleSubTableModalDelete = async () => {
      variables.subTableModalProps.show = false

      getAllDataSetDetail(dataSetName.value).then((res) => {
        variables.dataSetDetail = res
        variables.curTable = res.tableList[0]
      })
    }

    const handleTableChange = (dataSetId: number) => {
      variables.curTable =
        variables.dataSetDetail.tableList.find(
          (item) => item.dataSetId == dataSetId
        ) || ({} as any)
    }

    const handleDetailModalClose = () => {
      variables.detailModalProps.show = false
    }

    const getDataSetDetail = async () => {
      await getAllDataSetDetail(dataSetName.value).then((res) => {
        variables.dataSetDetail = res
        curEquipment.value = findEquipment(
          res.categoryTree[0]?.children[0].children[0].equip_name
        )

        variables.curTable = res.tableList[0]

        variables.equipmentModalProps.categorySelectOptions = []
        variables.equipmentModalProps.subCategorySelectOptions = {}
        res.categoryTree.forEach((item) => {
          variables.equipmentModalProps.categorySelectOptions.push({
            label: item.equip_name,
            value: item.equip_name
          })
          variables.equipmentModalProps.subCategorySelectOptions[
            item.equip_name
          ] = []
          variables.equipmentModalProps.subCategorySelectOptions[
            item.equip_name
          ].push(
            ...item.children.map((item) => ({
              label: item.equip_name,
              value: item.equip_name
            }))
          )
        })
      })
    }

    const getCriteria = () => {
      const queryCriteria = Object.keys(variables.searchForm.queryCriteria).map(
        (key) => {
          const value = variables.searchForm.queryCriteria[key]

          return { column: key, criteria: 'like', value: value || '' }
        }
      )
      const rangeCriteria = Object.keys(variables.searchForm.rangeCriteria)
        .filter((key) => variables.searchForm.rangeCriteria[key] != null)
        .map((key) => {
          const value = variables.searchForm.rangeCriteria[key] as string[]

          return { column: key, leftValue: value[0], rightValue: value[1] }
        })

      return { queryCriteria, rangeCriteria }
    }

    const getCurTableInfo = async (
      {
        pageNo = 1,
        pageSize = 10,
        equip_name = curEquipment.value?.equip_name
      } = {
        pageNo: 1,
        pageSize: 10,
        equip_name: curEquipment.value?.equip_name
      }
    ) => {
      if (
        variables.dataSetDetail.categoryTree.length > 0 &&
        !curEquipment.value
      ) {
        return
      }

      const { queryCriteria, rangeCriteria } = getCriteria()

      await getTableInfo(
        pageNo,
        pageSize,
        variables.curTable.dataSetId,
        equip_name,
        queryCriteria,
        rangeCriteria
      ).then((res: TableInfo) => {
        variables.tableInfo = res
        variables.tableInfo.header = variables.tableInfo.header.filter(
          (item) => item.field != 'id'
        )

        if (isListMode.value) {
          createTable(variables.curTable.showStyle, res)
        }
      })
    }

    const getListModeData = () => {
      getCurTableInfo({
        pageNo: tableVariables.page,
        pageSize: tableVariables.pageSize
      })
    }

    const {
      variables: tableVariables,
      createTable,
      handlePageSizeChange
    } = useTable({
      handleEditData,
      handleDeleteData,
      handleEditDetail,
      getTableData: getCurTableInfo
    })

    const getComponentByColumnType = (
      criteria: DataSetDetail['tableList'][0]['searchCriteria'][0]
    ) => {
      switch (criteria.type) {
        case 'varchar':
          return (
            <NInput
              v-model:value={variables.searchForm.queryCriteria[criteria.field]}
            />
          )
        case 'int':
        case 'double':
          return (
            <NInputNumber
              v-model:value={variables.searchForm.queryCriteria[criteria.field]}
            />
          )
        case 'text':
          return (
            <NInput
              type='textarea'
              v-model:value={variables.searchForm.queryCriteria[criteria.field]}
            />
          )
        case 'date':
        case 'datetime':
        case 'timestamp':
          return (
            <NDatePicker
              type='daterange'
              format='yyyy-MM-dd HH:mm:ss'
              v-model:formattedValue={
                variables.searchForm.rangeCriteria[criteria.field]
              }
            />
          )
      }
    }

    watch(tabRef, () => {
      tabRef.value?.$el.addEventListener('contextmenu', (e: MouseEvent) => {
        if (variables.curTable.showStyle == 3) {
          return
        }

        e.preventDefault()

        variables.contextMenu.left = e.clientX
        variables.contextMenu.top = e.clientY
        variables.contextMenu.show = true
      })
    })

    watch(dataSetName, () => {
      getDataSetDetail()
    })

    watch(
      () => variables.curTable,
      () => {
        variables.tableInfo = { data: {} as any, header: [] }
        variables.searchForm.queryCriteria = {}
        variables.searchForm.rangeCriteria = {}
        tableVariables.page = 1
        tableVariables.pageSize = 10

        if (variables.curTable.showStyle == 3) {
          return
        }

        getCurTableInfo()
      }
    )

    return {
      ...toRefs(variables),
      tableVariables,
      isListMode,
      tabRef,
      workflowDefinitionModeRef,
      curEquipment,

      handleSearch,
      handleContentMenuHide,
      handleCreateEquipment,
      handleCreateSubTable,
      handleEditSubTable,
      handleAddData,
      handleEditData,
      handleDeleteData,
      handleSelectEquipment,
      handleEquipmentModalSave,
      handleEquipmentModalCancel,
      handleSubTableModalSave,
      handleSubTableModalCancel,
      handleSubTableModalDelete,
      getCurTableInfo,
      getComponentByColumnType,
      handleTableChange,
      handleEditDetail,
      handleDetailModalClose,
      handlePageSizeChange,
      getListModeData
    }
  },
  render() {
    return (
      <NSpace vertical wrapItem={false} style={{ height: '100%' }}>
        <Card>
          <NSpace justify='space-between'>
            <NSpace>
              <NForm inline labelPlacement='left' showFeedback={false}>
                {this.curTable.searchCriteria?.map((criteria, idx) => (
                  <NFormItem
                    label={criteria.comment}
                    key={this.curTable.dataSetId + String(idx)}
                  >
                    {this.getComponentByColumnType(criteria)}
                  </NFormItem>
                ))}
              </NForm>
            </NSpace>
            <NSpace>
              <NButton size='small' type='primary' onClick={this.handleSearch}>
                <NIcon>
                  <SearchOutlined />
                </NIcon>
              </NButton>
              {this.curTable.showStyle != 3 && (
                <NButton
                  size='small'
                  onClick={this.handleCreateEquipment}
                  type='primary'
                >
                  新建
                </NButton>
              )}
            </NSpace>
          </NSpace>
        </Card>
        <Card style={{ flex: 1 }}>
          <NLayout
            hasSider={this.dataSetDetail.categoryTree.length > 0}
            style={{ height: '100%' }}
          >
            {this.dataSetDetail.categoryTree.length > 0 && (
              <NLayoutSider
                position='absolute'
              >
                <NTree
                  blockLine
                  data={this.dataSetDetail.categoryTree}
                  default-expand-all
                  keyField='equip_name'
                  labelField='equip_name'
                  childrenField='children'
                  selectable
                  selectedKeys={[this.curEquipment?.equip_name || '']}
                  // defaultSelectedKeys={[this.curEquipment.equip_name]}
                  onUpdateSelectedKeys={this.handleSelectEquipment}
                />
              </NLayoutSider>
            )}
            <NLayoutContent
              position='absolute'
              style={{
                paddingLeft: '20px',
                border: '1px solid #3b516f',
                left:
                  this.dataSetDetail.categoryTree.length > 0 ? '273px' : '0px'
              }}
            >
              <NSpace vertical wrapItem={false} style={{ height: '100%' }}>
                <h2 style={{ textAlign: 'center' }}>
                  {this.curEquipment?.equip_name}
                </h2>
                {this.dataSetDetail.tableList.length > 0 && (
                  <NTabs
                    class={Styles['equipment-card-tab']}
                    v-model={[this.curTable.dataSetId, 'value']}
                    type='card'
                    animated
                    addable
                    onAdd={this.handleCreateSubTable}
                    onUpdateValue={this.handleTableChange}
                    ref='tabRef'
                  >
                    {this.dataSetDetail.tableList.map(
                      (table) =>
                        table.showStyle != 5 && (
                          <NTabPane
                            name={table.dataSetId}
                            tab={table.tableChName}
                            displayDirective='if'
                          >
                            {table.showStyle == 1 || table.showStyle == 4 ? (
                              <NSpace vertical>
                                <NDataTable
                                  loading={this.tableVariables.loadingRef}
                                  columns={this.tableVariables.columns}
                                  data={this.tableVariables.tableData}
                                  scrollX={this.tableVariables.tableWidth}
                                  row-class-name='items'
                                />
                                <NSpace justify='center'>
                                  <NPagination
                                    v-model:page={this.tableVariables.page}
                                    v-model:page-size={
                                      this.tableVariables.pageSize
                                    }
                                    page-count={this.tableVariables.totalPage}
                                    show-size-picker
                                    page-sizes={[10, 30, 50]}
                                    show-quick-jumper
                                    onUpdatePage={this.getListModeData}
                                    onUpdatePageSize={this.handlePageSizeChange}
                                  />
                                </NSpace>
                              </NSpace>
                            ) : table.showStyle == 2 ? (
                              <DetailMode data={this.tableInfo} />
                            ) : (
                              <WorkflowDefinitionMode
                                criteria={this.searchForm}
                                ref='workflowDefinitionModeRef'
                              />
                            )}
                          </NTabPane>
                        )
                    )}
                  </NTabs>
                )}
              </NSpace>

              <ContextMenu
                visible={this.contextMenu.show}
                top={this.contextMenu.top}
                left={this.contextMenu.left}
                editDisplay={!this.isListMode}
                onHide={this.handleContentMenuHide}
                onEditData={this.handleEditData}
                onAddData={this.handleAddData}
                onEditSubTable={this.handleEditSubTable}
              />
            </NLayoutContent>
          </NLayout>
        </Card>

        <DataModal
          {...this.equipmentModalProps}
          onSave={this.handleEquipmentModalSave}
          onCancel={this.handleEquipmentModalCancel}
        />
        <SubtableModal
          {...this.subTableModalProps}
          dataSetId={this.curTable.dataSetId}
          onSave={this.handleSubTableModalSave}
          onCancel={this.handleSubTableModalCancel}
          onDelete={this.handleSubTableModalDelete}
        />
        <DetailModal
          {...this.detailModalProps}
          onClose={this.handleDetailModalClose}
        />
      </NSpace>
    )
  }
})
