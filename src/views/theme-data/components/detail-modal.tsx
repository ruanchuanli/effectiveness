import {
  addTableData,
  deleteTableData,
  getTableInfo,
  updateTableData
} from '@/service/modules/theme-data'
import _ from 'lodash'
import {
  NButton,
  NCard,
  NDatePicker,
  NForm,
  NFormItem,
  NInput,
  NInputNumber,
  NLayout,
  NLayoutContent,
  NLayoutSider,
  NModal,
  NTree,
  TreeOption
} from 'naive-ui'
import { PropType, defineComponent, reactive, ref, toRefs, watch } from 'vue'
import DetailContextMenu from './detail-context-menu'

interface TreeNode {
  fatherId: number
  id: number
  name: string
  zbtxId: number
  [key: string]: any
}

const props = {
  tableDetail: {
    type: Object as PropType<DataSetDetail['tableList'][0]>,
    default: () => {}
  },
  show: { type: Boolean as PropType<boolean>, default: false },
  row: { type: Object as PropType<any>, default: () => ({}) }
}

export default defineComponent({
  name: 'DetailModal',
  props,
  emits: ['close'],
  setup(props, ctx) {
    const variables = reactive({
      tableInfo: undefined as TableInfo | undefined,
      treeData: [] as TreeOption[],

      formData: {} as TreeNode,

      contextMenuProps: { visible: false, top: 0, left: 0, id: 0 }
    })
    const treeRef = ref<InstanceType<typeof NTree> | null>(null)

    const copyToFormData = (data: any) => {
      initFormData()

      variables.tableInfo?.header.map((item) => {
        variables.formData[item.field] = data[item.field]
      })
    }

    const getDataMap = () => {
      const dataMap = {} as any

      Object.keys(variables.formData).forEach((key) => {
        if (variables.formData[key] != null) {
          dataMap[key] = variables.formData[key]
        }
      })

      return dataMap
    }

    const handleSave = async () => {
      variables.contextMenuProps.visible = false
      const id = variables.formData.id
      const name = variables.formData.name
      const dataMap = getDataMap()

      if (id == null) {
        await addTableData({
          dataSetId: props.tableDetail.dataSetId,
          dataMap
        })

        window.$message.success('新增成功')
      } else {
        await updateTableData({
          dataSetId: props.tableDetail.dataSetId,
          dataId: variables.formData.id,
          dataMap
        })

        window.$message.success('修改成功')
      }

      await getData()

      copyToFormData(
        variables.tableInfo?.data.totalList.find(
          (item) => item.id == id || item.name == name
        )
      )
    }

    const handleClose = () => {
      ctx.emit('close')
    }

    const getData = async () => {
      if (!props.tableDetail) {
        return
      }

      console.log(props.row)

      await getTableInfo(
        1,
        9999999,
        props.tableDetail?.dataSetId,
        '',
        [{ column: 'zbtxId', criteria: '=', value: String(props.row.id) }],
        []
      ).then((res) => {
        variables.tableInfo = res
        variables.treeData = createTree() || []
        copyToFormData(res.data.totalList[0])
      })
    }

    const initFormData = () => {
      variables.tableInfo?.header.map((item) => {
        variables.formData[item.field] = null
      })
      variables.formData.zbtxId = props.row.id
    }

    const createTree = (parent = 0) => {
      let tree = [] as TreeOption[]
      const data = variables.tableInfo?.data.totalList || []

      for (let i = 0; i < data.length; i++) {
        if (data[i].fatherId === parent) {
          let node = {
            children: createTree(data[i].id),
            ...data[i]
          }

          tree.push(node)
        }
      }

      return tree.length > 0 ? tree : undefined
    }

    const setNodeProps = ({ option }: { option: TreeOption }) => {
      return {
        onContextmenu(e: MouseEvent): void {
          e.preventDefault()

          variables.contextMenuProps.left = e.clientX
          variables.contextMenuProps.top = e.clientY
          variables.contextMenuProps.visible = true

          setTimeout(() => {
            variables.contextMenuProps.id = option.id as number
            variables.formData.id = option.id as number
          }, 0)
        }
      }
    }

    const handleTreeSelect = (
      keys: Array<string | number>,
      option: Array<TreeOption | null>
    ) => {
      if (!option[0]) {
        return
      }

      copyToFormData(option[0])
    }

    const handleAddIndicator = () => {
      initFormData()
      variables.formData.fatherId = variables.contextMenuProps.id
      variables.contextMenuProps.visible = false
    }

    const handleEditIndicator = () => {
      variables.contextMenuProps.visible = false
      if (variables.contextMenuProps.id == 0) {
        return
      }

      copyToFormData(
        variables.tableInfo?.data.totalList.find(
          (item) => item.id == variables.contextMenuProps.id
        )
      )
    }

    const handleDeleteIndicator = async () => {
      variables.contextMenuProps.visible = false
      if (variables.contextMenuProps.id == 0) {
        return
      }

      await deleteTableData(
        props.tableDetail?.dataSetId,
        variables.contextMenuProps.id
      )

      window.$message.success('删除成功')
      getData()
    }

    const handleDetailContentMenuHide = () => {
      variables.contextMenuProps.visible = false
    }

    const getComponentByColumnType = (column: TableInfo['header'][0]) => {
      switch (column.type) {
        case 'varchar':
          return <NInput v-model:value={variables.formData[column.field]} />
        case 'int':
        case 'double':
          return (
            <NInputNumber v-model:value={variables.formData[column.field]} />
          )
        case 'text':
          return (
            <NInput
              type='textarea'
              v-model:value={variables.formData[column.field]}
            />
          )
        case 'date':
        case 'timestamp':
          return (
            <NDatePicker
              type='date'
              v-model:formattedValue={variables.formData[column.field]}
            />
          )
        case 'datetime':
          return (
            <NDatePicker
              type='datetime'
              v-model:formattedValue={variables.formData[column.field]}
            />
          )
      }
    }

    watch(treeRef, () => {
      variables.contextMenuProps.visible = false

      treeRef.value?.$el.addEventListener('contextmenu', (e: MouseEvent) => {
        e.preventDefault()

        variables.contextMenuProps.left = e.clientX
        variables.contextMenuProps.top = e.clientY
        variables.contextMenuProps.visible = true
        variables.contextMenuProps.id = 0
        variables.formData.id = 0
      })
    })

    watch(
      () => props.show,
      (show) => {
        if (!show) {
          return
        }

        getData()
      }
    )

    return {
      ...toRefs(variables),
      treeRef,

      handleSave,
      handleClose,
      getComponentByColumnType,
      setNodeProps,
      handleTreeSelect,
      handleAddIndicator,
      handleEditIndicator,
      handleDeleteIndicator,
      handleDetailContentMenuHide
    }
  },
  render() {
    return (
      <NModal show={this.show} style={{ width: '760px' }}>
        <NCard
          closable={true}
          title={this.row.name}
          size='huge'
          role='dialog'
          aria-modal='true'
          onClose={this.handleClose}
        >
          <NLayout hasSider>
            <NLayoutSider style={{ backgroundColor: '#f8f8fc' }} ref='treeRef'>
              <NTree
                data={this.treeData}
                cancelable={false}
                selectable
                expandOnClick
                defaultExpandAll
                keyField='id'
                labelField='name'
                selectedKeys={[this.formData.id]}
                onUpdateSelectedKeys={this.handleTreeSelect}
                nodeProps={this.setNodeProps}
              />
            </NLayoutSider>
            <NLayoutContent
              style={{ backgroundColor: '#fff', paddingLeft: '20px' }}
            >
              <NForm>
                {this.tableInfo?.header
                  .filter(
                    (item) =>
                      item.field != 'id' &&
                      item.field != 'fatherId' &&
                      item.field != 'zbtxId'
                  )
                  .map((item) => (
                    <NFormItem label={item.comment}>
                      {this.getComponentByColumnType(item)}
                    </NFormItem>
                  ))}
              </NForm>
              <NButton type='primary' onClick={this.handleSave}>
                保存
              </NButton>
            </NLayoutContent>
          </NLayout>
          <DetailContextMenu
            {...this.contextMenuProps}
            onAddIndicator={this.handleAddIndicator}
            onEditInidcator={this.handleEditIndicator}
            onDeleteIndicator={this.handleDeleteIndicator}
            onHide={this.handleDetailContentMenuHide}
          />
        </NCard>
      </NModal>
    )
  }
})
