import Modal from '@/components/modal'
import {
  addTableData,
  updateTableData,
  uploadPic
} from '@/service/modules/theme-data'
import _ from 'lodash'
import {
  NDatePicker,
  NForm,
  NFormItem,
  NImage,
  NInput,
  NInputNumber,
  NModal,
  NSelect,
  NText,
  NUpload,
  SelectOption,
  UploadFileInfo
} from 'naive-ui'
import {
  PropType,
  Ref,
  computed,
  defineComponent,
  inject,
  reactive,
  toRefs,
  watch
} from 'vue'
import OperableImage from './operable-image'

const props = {
  show: { type: Boolean as PropType<boolean>, default: true },
  type: { type: Number as PropType<number>, default: 0 },
  isMainTable: { type: Boolean as PropType<boolean>, default: false },
  categorySelectOptions: {
    type: Array as PropType<SelectOption[]>,
    default: () => []
  },
  subCategorySelectOptions: {
    type: Object as PropType<{ [key: string]: SelectOption[] }>,
    default: () => {}
  },
  dataSetId: { type: Number as PropType<number>, default: 0 },
  data: { type: Object as PropType<any>, default: {} },
  header: { type: Array as PropType<TableInfo['header']>, default: () => [] }
}

export default defineComponent({
  name: 'DataModal',
  props,
  emits: ['save', 'cancel'],
  setup(props, ctx) {
    const variables = reactive({ formData: {} as any, isSaving: false })
    const isEdit = computed(() => props.type == 1)
    const curEquipment = inject('curEquipment') as Ref<EquipmentDetail | null>

    const isPicture = (field: string) => {
      return field.endsWith('_picture')
    }

    const isPictureOri = (field: string) => {
      return field.endsWith('_picture_ori')
    }

    const getOriPictureField = (field: string) => {
      return field + '_ori'
    }

    const handleUploadPicture = async () => {
      const pictureFields = Object.keys(variables.formData).filter(
        (field) =>
          isPicture(field) &&
          variables.formData[field] &&
          variables.formData[field].length > 0
      )

      return Promise.all(
        pictureFields.map((field) =>
          uploadPic(
            variables.formData[field].map((item: UploadFileInfo) => item.file)
          ).then((res) => {
            variables.formData[field] = res
          })
        )
      )
    }

    const handleSave = async () => {
      await handleUploadPicture()

      const dataMap = afterHandleFormData()

      if (isEdit.value) {
        await updateTableData({
          dataSetId: props.dataSetId,
          dataId: props.data.id,
          dataMap
        })
      } else {
        await addTableData({
          dataSetId: props.dataSetId,
          dataMap
        })
      }

      window.$message.success('保存成功')
      ctx.emit('save', !isEdit.value, variables.formData)
    }

    const handleCancel = () => {
      ctx.emit('cancel')
    }

    const handlePictureChange = (
      options: {
        fileList: UploadFileInfo[]
      },
      field: string
    ) => {
      variables.formData[field] = options.fileList
    }

    const handleDeletePicture = (field: string, src: string) => {
      variables.formData[field] = variables.formData[field].filter(
        (item: string) => item != src
      )
    }

    const handleCategoryChange = () => {
      variables.formData['sub_category'] = null
    }

    const getComponentByColumnType = (column: TableInfo['header'][0]) => {
      if (column.field == 'category') {
        return (
          <NSelect
            v-model:value={variables.formData[column.field]}
            options={props.categorySelectOptions}
            filterable
            tag
            onUpdateValue={handleCategoryChange}
          />
        )
      }
      if (column.field == 'sub_category') {
        return (
          <NSelect
            v-model:value={variables.formData[column.field]}
            options={
              props.subCategorySelectOptions[variables.formData['category']]
            }
            filterable
            tag
          />
        )
      }
      if (isPicture(column.field)) {
        return (
          <>
            {isEdit.value &&
              variables.formData[getOriPictureField(column.field)]?.map(
                (src: string) => (
                  <OperableImage
                    src={
                      import.meta.env.VITE_APP_DEV_WEB_URL + '/images/' + src
                    }
                    onDelete={() =>
                      handleDeletePicture(getOriPictureField(column.field), src)
                    }
                  />
                )
              )}
            <NUpload
              accept='image/*'
              defaultFileList={variables.formData[column.field]}
              listType='image-card'
              defaultUpload={false}
              onChange={(options) => handlePictureChange(options, column.field)}
            />
          </>
        )
      }

      switch (column.type) {
        case 'varchar':
          return <NInput v-model:value={variables.formData[column.field]} />
        case 'text':
          return (
            <NInput
              type='textarea'
              v-model:value={variables.formData[column.field]}
            />
          )
        case 'date':
          return (
            <NDatePicker
              type='date'
              v-model:formatted-value={variables.formData[column.field]}
            />
          )
        case 'datetime':
          return (
            <NDatePicker
              type='datetime'
              v-model:formatted-value={variables.formData[column.field]}
            />
          )
        case 'timestamp':
          return (
            <NDatePicker
              type='datetime'
              v-model:formatted-value={variables.formData[column.field]}
            />
          )
        case 'int':
        case 'double':
          return (
            <NInputNumber v-model:value={variables.formData[column.field]} />
          )
      }
    }

    const preHandleFormData = () => {
      Object.keys(variables.formData).forEach((key) => {
        if (isPicture(key)) {
          const val = variables.formData[key]
          variables.formData[key] = []

          if (typeof val == 'string') {
            variables.formData[getOriPictureField(key)] = val
              .split(',')
              .filter((item) => item)
          } else {
            variables.formData[getOriPictureField(key)] = []
          }
        }
        
        if (curEquipment.value && !isEdit.value) {
          if (props.isMainTable && key == 'category') {
            variables.formData[key] = curEquipment.value.category
          }
          if (props.isMainTable && key == 'sub_category') {
            variables.formData[key] = curEquipment.value.subCategory
          }
          if (key == 'equip_name') {
            variables.formData[key] = curEquipment.value.equip_name
          }
        }
      })
    }

    const afterHandleFormData = () => {
      const data = {} as { [key: string]: any }

      Object.keys(variables.formData).forEach((key) => {
        let val = variables.formData[key]

        if (isPicture(key)) {
          const oriPictureField = getOriPictureField(key)

          val.unshift(...variables.formData[oriPictureField])
          val = val.join(',')
        }

        if (!isPictureOri(key) && val != null) {
          data[key] = val
        }
      })

      return data
    }

    watch(
      () => props.show,
      (show) => {
        if (show) {
          if (isEdit.value) {
            variables.formData = _.cloneDeep(props.data)
          } else {
            variables.formData = {}
            props.header.forEach(
              (item) => (variables.formData[item.field] = null)
            )
          }

          preHandleFormData()
        }
      }
    )

    return {
      ...toRefs(variables),
      handleSave,
      handleCancel,
      getComponentByColumnType
    }
  },
  render() {
    return (
      <Modal
        title={this.type == 0 ? '新增数据' : '编辑数据'}
        show={this.show}
        onConfirm={this.handleSave}
        onCancel={this.handleCancel}
        confirmLoading={this.isSaving}
      >
        <NForm>
          {this.header.map((item) => (
            <NFormItem label={item.comment}>
              {this.getComponentByColumnType(item)}
            </NFormItem>
          ))}
        </NForm>
      </Modal>
    )
  }
})
