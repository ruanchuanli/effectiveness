interface DataSetDetail {
  tableList: {
    tableChName: string
    dataSetId: number
    tableName: string
    showStyle: 1 | 2 | 3 | 4 | 5
    searchCriteria: { comment: string; field: string; type: string }[]
  }[]
  categoryTree: CategoryTree[]
}

interface EquipmentDetail {
  category: string
  equip_name: string
  subCategory: string
}

interface CategoryTree extends EquipmentDetail {
  children: DataSetDetail['categoryTree']
}

interface TableInfo {
  data: {
    totalList: { [property: string]: any }[]
    total: number
    totalPage: number
    pageSize: number
    currentPage: number
    start: number
  }
  header: { field: string; comment: string; type: ColumnType }[]
}

interface DataTable {
  databaseName: string
  dataSetDesc: string
  dataSetName: string
  isShow: number
  showStyle: number
  tableChName: string
  tableInfos: TableStructure[]
  tableName: string
}

interface TableStructure {
  columnComment: string
  columnLength: string | number | null
  columnName: string
  columnType: ColumnType
  [property: string]: any
}

interface SubTableModalData {
  tableName: string
  tableDesc: string
  columns: TableStructure[]
}

interface CreateDataTable {
  // databaseName: string
  // dataSetDesc: string
  dataSetName: string
  isShow: number
  showStyle: number
  tableChName: string
  tableInfos: TableStructure[]
  tableName: string
}

interface ModifyDataTable {
  addColumns: AddColumn[]
  dataSetId: number
  deleteColumns: string[]
  modifyInfos: ModifyInfo[]
  [property: string]: any
}

interface AddColumn {
  comment: string
  length: string | number | null
  name: string
  type: ColumnType
  [property: string]: any
}

interface ModifyInfo {
  name: string
  targetComment: string
  targetLength: string | number | null
  targetName: string
  targetType: ColumnType
  [property: string]: any
}

interface EquipIndicatorSystem {
  id: number
  projectName: string
  taskBasis: string
  projectCode: number
  processCode: number
  taskId: number | null
  indicatorSystemName: string
  indicatorSystemDesc: string | null
  indicatorSystemTemplateId: number | null
  indicatorSystemRecommendation: string | null
  userId: number | null
  userName: string
  createTime: string
  indicatorsNum: number
  indicatorHierarchy: number
}

interface EquipIndicatorSystemPageData {
  totalList: EquipIndicatorSystem[]
  total: number
  totalPage: number
  pageSize: number
  currentPage: number
  start: number
}

type ColumnType =
  | 'int'
  | 'varchar'
  | 'text'
  | 'date'
  | 'double'
  | 'datetime'
  | 'timestamp'
