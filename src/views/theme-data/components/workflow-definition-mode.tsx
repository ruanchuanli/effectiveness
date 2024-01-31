import { InfoCircleOutlined } from '@vicons/antd'
import {
  NButton,
  NDataTable,
  NIcon,
  NPagination,
  NSpace,
  NTooltip
} from 'naive-ui'
import {
  PropType,
  defineComponent,
  h,
  onMounted,
  reactive,
  ref,
  toRefs,
  watch
} from 'vue'
import {
  DefaultTableWidth,
  COLUMN_WIDTH_CONFIG,
  calculateTableWidth
} from '@/common/column-width-config'
import { TableColumn } from 'naive-ui/es/data-table/src/interface'
import { getEquipIndicatorSystemList } from '@/service/modules/theme-data'
import { useRouter } from 'vue-router'

const props = {
  criteria: { type: Object as PropType<any>, default: () => ({}) }
}

export default defineComponent({
  name: 'WorkflowDefinitionMode',
  props,
  emits: ['requestData'],
  expose: ['getTableData'],
  setup(props, ctx) {
    const router = useRouter()

    const variables = reactive({
      columns: [] as TableColumn[],
      tableWidth: DefaultTableWidth,
      tableData: [] as EquipIndicatorSystem[],
      page: ref(1),
      pageSize: ref(10),
      totalPage: ref(1),
      loadingRef: ref(false)
    })

    const createColumn = () => {
      variables.columns = [
        {
          title: '序号',
          key: 'index',
          render: (unused: any, index: number) => index + 1,
          ...COLUMN_WIDTH_CONFIG['index']
        },
        { title: '指标体系名称', key: 'indicatorSystemName' },
        { title: '所在项目', key: 'projectName' },
        { title: '战技术指标数量', key: 'indicatorsNum' },
        { title: '战技术层级', key: 'indicatorHierarchy' },
        { title: '创建时间', key: 'createTime' },
        { title: '创建人', key: 'userName' },
        {
          title: '操作',
          key: 'operate',
          render(row: any) {
            return h(NSpace, null, {
              default: () => [
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
                            handleShowDetail(row)
                          }
                        },
                        {
                          icon: () =>
                            h(NIcon, null, {
                              default: () => h(InfoCircleOutlined)
                            })
                        }
                      ),
                    default: () => '查看'
                  }
                )
              ]
            })
          }
        }
      ]
      if (variables.tableWidth) {
        variables.tableWidth = calculateTableWidth(variables.columns)
      }
    }

    const getTableData = async () => {
      variables.loadingRef = true

      const createTime = props.criteria.rangeCriteria.createTime
      await getEquipIndicatorSystemList(
        variables.page,
        variables.pageSize,
        props.criteria.queryCriteria.indicatorSystemName,
        props.criteria.queryCriteria.projectName,
        createTime && createTime[0],
        createTime && createTime[1]
      ).then((res) => {
        variables.tableData = res.totalList
        variables.totalPage = res.totalPage
      })

      createColumn()
      variables.loadingRef = false
    }

    const handleShowDetail = (row: EquipIndicatorSystem) => {
      const routeUrl = router.resolve({
        name: 'assessment-workflow-definition',
        query: {
          projectCode: row.projectCode,
          processCode: row.processCode,
          indicatorSystemName: row.indicatorSystemName
        },
        params: { id: row.id }
      })

      window.open(routeUrl.href, '_blank')
    }

    const handleChangePageSize = (pageSize: number) => {
      variables.pageSize = pageSize
    }

    onMounted(() => {
      getTableData()
    })

    return {
      ...toRefs(variables),

      getTableData,
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
            onUpdatePage={this.getTableData}
            onUpdatePageSize={this.handleChangePageSize}
          />
        </NSpace>
      </NSpace>
    )
  }
})
