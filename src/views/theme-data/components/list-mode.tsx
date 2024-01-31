import ButtonLink from '@/components/button-link'
import { deleteDataTable } from '@/service/modules/theme-data'
import {
  DeleteOutlined,
  EditOutlined,
  FormOutlined,
  InfoCircleOutlined
} from '@vicons/antd'
import {
  NButton,
  NDataTable,
  NIcon,
  NPagination,
  NPopconfirm,
  NSpace,
  NTooltip
} from 'naive-ui'
import { PropType, defineComponent, h, reactive, ref, toRefs, watch } from 'vue'
import {
  DefaultTableWidth,
  COLUMN_WIDTH_CONFIG,
  calculateTableWidth
} from '@/common/column-width-config'
import { TableColumn } from 'naive-ui/es/data-table/src/interface'

const props = {
  showStyle: { type: Number as PropType<number>, default: 1 },
  data: { type: Object as PropType<TableInfo>, default: {} }
}

export default defineComponent({
  name: 'ListMode',
  emits: ['editData', 'deleteData', 'requestData', 'editDetail'],
  props,
  setup(props, ctx) {
    const variables = reactive({
      columns: [] as TableColumn[],
      tableWidth: DefaultTableWidth,
      tableData: [] as { [key: string]: any }[],
      page: ref(1),
      pageSize: ref(10),
      totalPage: ref(1),
      loadingRef: ref(false)
    })

    const createTable = () => {
      variables.columns = [
        {
          title: '#',
          key: 'index',
          render: (unused: any, index: number) => index + 1,
          ...COLUMN_WIDTH_CONFIG['index']
        },
        ...props.data.header.map((item) => ({
          title: item.comment,
          key: item.field
        })),
        {
          title: '操作',
          key: 'operate',
          render(row: any) {
            return h(NSpace, null, {
              default: () => {
                let component = [
                  h(
                    NTooltip,
                    {},
                    {
                      trigger: () =>
                        h(
                          NButton,
                          {
                            circle: true,
                            type: 'info',
                            size: 'small',
                            class: 'edit',
                            onClick: () => {
                              handleEditData(row)
                            }
                          },
                          {
                            icon: () =>
                              h(NIcon, null, {
                                default: () => h(EditOutlined)
                              })
                          }
                        ),
                      default: () => '编辑'
                    }
                  ),
                  h(
                    NPopconfirm,
                    {
                      onPositiveClick: () => {
                        handleDeleteData(row)
                      }
                    },
                    {
                      trigger: () =>
                        h(
                          NTooltip,
                          {},
                          {
                            trigger: () =>
                              h(
                                NButton,
                                {
                                  circle: true,
                                  type: 'error',
                                  size: 'small',
                                  class: 'delete'
                                },
                                {
                                  icon: () =>
                                    h(NIcon, null, {
                                      default: () => h(DeleteOutlined)
                                    })
                                }
                              ),
                            default: () => '删除'
                          }
                        ),
                      default: () => '确认'
                    }
                  )
                ]

                if (props.showStyle == 4) {
                  component.push(
                    h(
                      NTooltip,
                      {},
                      {
                        trigger: () =>
                          h(
                            NButton,
                            {
                              circle: true,
                              type: 'info',
                              size: 'small',
                              class: 'edit',
                              onClick: () => {
                                handleEditDetail(row)
                              }
                            },
                            {
                              icon: () =>
                                h(NIcon, null, {
                                  default: () => h(FormOutlined)
                                })
                            }
                          ),
                        default: () => '详情编辑'
                      }
                    )
                  )
                }

                return component
              }
            })
          }
        }
      ]
      if (variables.tableWidth) {
        variables.tableWidth = calculateTableWidth(variables.columns)
      }

      variables.tableData = props.data.data.totalList
      variables.totalPage = props.data.data.totalPage
    }

    const handleEditData = (row: any) => {
      ctx.emit('editData', row)
    }

    const handleDeleteData = (row: any) => {
      ctx.emit('deleteData', row.id)
    }

    const requestData = () => {
      ctx.emit('requestData', variables.page, variables.pageSize)
      variables.loadingRef = true
    }

    const handleEditDetail = (row: any) => {
      ctx.emit('editDetail', row.id)
    }

    const handleChangePageSize = (pageSize: number) => {
      variables.pageSize = pageSize
    }

    watch(
      () => props.data,
      () => {
        createTable()

        variables.loadingRef = false
      }
    )

    return {
      ...toRefs(variables),

      requestData,
      handleChangePageSize
    }
  },
  render() {
    return (
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
            onUpdatePage={this.requestData}
            onUpdatePageSize={this.handleChangePageSize}
          />
        </NSpace>
      </NSpace>
    )
  }
})
