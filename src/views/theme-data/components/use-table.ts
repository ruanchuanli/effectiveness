import { h, reactive, ref } from 'vue'
import { NButton, NIcon, NPopconfirm, NSpace, NTooltip } from 'naive-ui'
import {
  COLUMN_WIDTH_CONFIG,
  calculateTableWidth,
  DefaultTableWidth
} from '@/common/column-width-config'
import { DeleteOutlined, EditOutlined, FormOutlined } from '@vicons/antd'

interface Props {
  handleEditData: (data: any) => void
  handleDeleteData: (id: any) => void
  handleEditDetail: (row: any) => void
  getTableData: ({
    pageNo,
    pageSize
  }: {
    pageNo: number
    pageSize: number
  }) => void
}

export function useTable({
  handleEditData,
  handleDeleteData,
  handleEditDetail,
  getTableData
}: Props) {
  const createTable = (showStyle: number, tableInfo: TableInfo) => {
    variables.columns = [
      {
        title: '#',
        key: 'index',
        render: (unused: any, index: number) => index + 1,
        ...COLUMN_WIDTH_CONFIG['index']
      },
      ...tableInfo.header.map((item) => ({
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

              if (showStyle == 4) {
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

    variables.tableData = tableInfo.data.totalList
    variables.totalPage = tableInfo.data.totalPage
  }

  const handlePageSizeChange = (pageSize: number) => {
    variables.pageSize = pageSize
    getTableData({ pageNo: variables.page, pageSize: pageSize })
  }

  const variables = reactive({
    columns: [] as any[],
    tableWidth: DefaultTableWidth,
    tableData: [] as any[],
    page: ref(1),
    pageSize: ref(10),
    engineering: ref(null),
    createdRange: ref(null),

    totalPage: ref(1),
    showModalRef: ref(false),
    statusRef: ref(0),
    row: {},
    loadingRef: ref(false)
  })

  return {
    variables,
    createTable,
    handlePageSizeChange
  }
}
