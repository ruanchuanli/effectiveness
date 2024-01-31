import { NDatePicker, NForm, NFormItem, NImage, NInput } from 'naive-ui'
import { PropType, defineComponent, reactive, toRefs } from 'vue'

const props = {
  data: { type: Object as PropType<TableInfo>, default: {} }
}

export default defineComponent({
  name: 'DetailMode',
  emits: [],
  props,
  setup(props, ctx) {
    const variables = reactive({})

    const getComponentByColumnType = (column: TableInfo['header'][0]) => {
      const value = props.data.data.totalList[0][column.field]

      if (column.field.endsWith('_picture')) {
        return props.data.data.totalList[0][column.field]
          ?.split(',')
          .map((src: string) => (
            <NImage
              width={96}
              src={import.meta.env.VITE_APP_DEV_WEB_URL + '/images/' + src}
            />
          ))
      }

      switch (column.type) {
        case 'varchar':
        case 'int':
        case 'double':
          return <NInput readonly value={String(value || '')} />
        case 'text':
          return <NInput type='textarea' readonly value={String(value || '')} />
        case 'date':
          return (
            <NDatePicker type='date' formattedValue={value} inputReadonly />
          )
        case 'datetime':
          return (
            <NDatePicker type='datetime' formattedValue={value} inputReadonly />
          )
        case 'timestamp':
          return <NDatePicker format='T' formattedValue={value} inputReadonly />
      }
    }

    return {
      ...toRefs(variables),

      getComponentByColumnType
    }
  },
  render() {
    return (
      <NForm>
        {this.data.data.totalList?.length > 0 &&
          this.data.header
            .filter((item) => item.field != 'id')
            .map((item) => (
              <NFormItem
                label={item.comment}
                labelStyle={{ fontWeight: 'bold' }}
              >
                {this.getComponentByColumnType(item)}
              </NFormItem>
            ))}
      </NForm>
    )
  }
})
