import { defineComponent, ref, PropType } from 'vue'
import type { Ref } from 'vue'
import initChart from '@/components/chart'

const props = {
  height: {
    type: [String, Number] as PropType<number | string>,
    default: '500px'
  },
  width: {
    type: [String, Number] as PropType<number | string>,
    default: '500px'
  },
  data: {
    type: Array as PropType<Array<number>>,
    default: () => []
  },
  xName: {
    type: String as PropType<String>,
    default: ''
  },
  yName: {
    type: String as PropType<String>,
    default: ''
  },
  title: {
    type: String as PropType<String>,
    default: ''
  }
}

const ScreeChart = defineComponent({
  name: 'ScreeChart',
  props,
  setup(props) {
    const graphChartRef: Ref<HTMLDivElement | null> = ref(null)

    const option = {
      title: { text: props.title, left: 'center' },
      tooltip: {
        trigger: 'axis'
      },
      xAxis: { name: props.xName, nameLocation: 'center', nameGap: 30 },
      yAxis: { name: props.yName, nameLocation: 'center', nameGap: 30 },
      series: [
        {
          data: props.data,
          type: 'line',
          smooth: false
        }
      ]
    }

    initChart(graphChartRef, option)

    return { graphChartRef }
  },
  render() {
    const { height, width } = this

    return (
      <div
        ref='graphChartRef'
        style={{
          height: typeof height === 'number' ? height + 'px' : height,
          width: typeof width === 'number' ? width + 'px' : width
        }}
      />
    )
  }
})

export default ScreeChart
