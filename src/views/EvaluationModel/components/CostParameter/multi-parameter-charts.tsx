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
    default: '670px'
  },
  realData: {
    type: Array as PropType<Array<number[]>>,
    default: () => []
  },
  predictData: {
    type: Array as PropType<Array<number[]>>,
    default: () => ({})
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

const ParameterChart = defineComponent({
  name: 'ParameterChart',
  props,
  setup(props) {
    const graphChartRef: Ref<HTMLDivElement | null> = ref(null)

    const option = {
      width: 500,
      title: { text: props.title, left: 200 },
      legend: {
        data: ['实际值', '预测值'],
        top: 'center', //距上
        right: '0px', //距右
        orient: 'vertical' //纵向排列
      },
      xAxis: {
        name: props.xName,
        nameLocation: 'center',
        nameGap: 30
      },
      yAxis: {
        name: props.yName,
        nameLocation: 'center',
        nameGap: 30
      },
      series: [
        {
          data: props.realData,
          type: 'line',
          smooth: true,
          name: '实际值',
          itemStyle: { color: '#5470c6' },
          symbol: 'none'
        },
        {
          data: props.predictData,
          type: 'line',
          smooth: true,
          name: '预测值',
          itemStyle: { color: '#fac858' }
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

export default ParameterChart
