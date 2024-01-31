import { axios } from '@/service/service'

export function getDataSetTree(): Promise<any> {
  return axios.get('/topicData/getDataSetTree')
}

export function getAllDataSetDetail(
  dataSetName: string
): Promise<DataSetDetail> {
  return axios.get('/topicData/getAllDataSetDetail', {
    params: { dataSetName }
  })
}

export function getTableInfo(
  pageNo: number,
  pageSize: number,
  dataSetId: number,
  equipName: string | undefined,
  queryCriteria: { column: string; criteria: string; value: string }[],
  rangeCriteria: { column: string; leftValue: string; rightValue: string }[]
): Promise<TableInfo> {
  return axios.post(
    '/topicData/getTableInfo',
    {
      pageNo,
      pageSize,
      dataSetId,
      equipName,
      queryCriteria,
      rangeCriteria
    },
    {
      headers: {
        'Content-Type': 'application/json;charset=UTF-8'
      },
      transformRequest: (params) => JSON.stringify(params)
    }
  )
}

export function createDataTable(data: CreateDataTable): Promise<any> {
  return axios.post('/topicData/createDataTable', data, {
    headers: {
      'Content-Type': 'application/json;charset=UTF-8'
    },
    transformRequest: (params) => JSON.stringify(params)
  })
}

export function getTableStructure(
  dataSetId: number
): Promise<TableStructure[]> {
  return axios.get(`/topicData/getTableStructure/${dataSetId}`)
}

export function deleteDataTable(dataSetId: number): Promise<any> {
  return axios.delete(`/topicData/deleteDataTable/${dataSetId}`)
}

export function modifyDataTable(data: ModifyDataTable): Promise<any> {
  return axios.post('/topicData/modifyDataTable', data, {
    headers: {
      'Content-Type': 'application/json;charset=UTF-8'
    },
    transformRequest: (params) => JSON.stringify(params)
  })
}

export function addTableData(data: {
  dataSetId: number
  dataMap: Object
}): Promise<any> {
  return axios.post('/topicData/addTableData', data, {
    headers: {
      'Content-Type': 'application/json;charset=UTF-8'
    },
    transformRequest: (params) => JSON.stringify(params)
  })
}

export function deleteTableData(
  dataSetId: number,
  dataId: number
): Promise<any> {
  return axios.get(`/topicData/deleteTableData`, {
    params: { dataSetId, dataId }
  })
}

export function updateTableData(data: {
  dataSetId: number
  dataId: number
  dataMap: Object
}): Promise<any> {
  return axios.post('/topicData/updateTableData', data, {
    headers: {
      'Content-Type': 'application/json;charset=UTF-8'
    },
    transformRequest: (params) => JSON.stringify(params)
  })
}

export function uploadPic(pictures: File[]): Promise<any> {
  const formData = new FormData()
  pictures.forEach((picture) => {
    formData.append('file', picture)
  })

  return axios.post('/topicData/uploadPic', formData)
}

export function getEquipIndicatorSystemList(
  pageNo: number,
  pageSize: number,
  indicatorSystemName: string,
  projectName: string,
  createTimeBegin: string,
  createTimeEnd: string
): Promise<EquipIndicatorSystemPageData> {
  return axios.get('/topicData/getEquipIndicatorSystemList', {
    params: {
      pageNo,
      pageSize,
      indicatorSystemName,
      projectName,
      createTimeBegin,
      createTimeEnd
    }
  })
}
