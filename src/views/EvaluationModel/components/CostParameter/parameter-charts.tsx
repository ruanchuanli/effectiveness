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
  parameterFittingData: {
    type: Array as PropType<Array<number>>,
    default: () => []
  },
  envelopingData: {
    type: Object as PropType<any>,
    default: () => ({})
  },
  columnData: {
    type: Array as PropType<Array<number[]>>,
    default: () => []
  },
  showEnveloping: {
    type: Boolean as PropType<Boolean>,
    default: false
  },
  xName: {
    type: String as PropType<String>,
    default: ''
  },
  yName: {
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
      title: { text: '拟合曲线', left: 200 },
      legend: {
        data: ['拟合曲线', '上包络', '下包络'],
        top: 'center', //距上
        right: '0px', //距右
        orient: 'vertical' //纵向排列
      },
      xAxis: { name: props.xName, nameLocation: 'center', nameGap: 30 },
      yAxis: { name: props.yName, nameLocation: 'center', nameGap: 30 },
      series: [
        {
          data: props.parameterFittingData,
          type: 'line',
          smooth: true,
          name: '拟合曲线',
          itemStyle: { color: '#5470c6' },
          symbol: 'none'
        },
        {
          data: props.envelopingData.upper1,
          type: 'line',
          smooth: true,
          name: '上包络',
          itemStyle: { color: '#fac858' }
        },
        {
          data: props.envelopingData.lower1,
          type: 'line',
          smooth: true,
          name: '下包络',
          itemStyle: { color: '#3ba272' }
        },
        { data: props.columnData, type: 'scatter', symbolSize: 7 }
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
