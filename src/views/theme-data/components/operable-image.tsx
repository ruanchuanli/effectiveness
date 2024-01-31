import { NButton, NIcon, NImage } from 'naive-ui'
import { PropType, defineComponent } from 'vue'
import Styles from './index.module.scss'
import { CloseOutlined } from '@vicons/antd'

const props = {
  src: {
    type: String as PropType<string>
  }
}

export default defineComponent({
  name: 'OperableImage',
  props,
  emits: ['delete'],
  setup(props, ctx) {
    const handleDeleteClick = () => {
      ctx.emit('delete')
    }

    return { handleDeleteClick }
  },
  render() {
    return (
      <div class={Styles['operable-image']}>
        <NButton
          quaternary
          class={Styles['delete-btn']}
          onClick={this.handleDeleteClick}
        >
          <NIcon>
            <CloseOutlined />
          </NIcon>
        </NButton>
        <NImage width={96} src={this.src} />
      </div>
    )
  }
})
