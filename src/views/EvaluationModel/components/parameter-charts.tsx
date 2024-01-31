import { defineComponent, ref, PropType } from 'vue'
import type { Ref } from 'vue'
import initChart from '@/components/chart'

const props = {
  height: {
    type: [String, Number] as PropType<number | string>,
    default: '100%'
  },
  width: {
    type: [String, Number] as PropType<number | string>,
    default: '100%'
  },
  parameterFittingData: {
    type: Array as PropType<Array<number>>,
    default: () => []
  },
  envelopingData: {
    type: Object as PropType<any>,
    default: () => ({})
  },
  showEnveloping: {
    type: Boolean as PropType<Boolean>,
    default: false
  }
}

const ParameterChart = defineComponent({
  name: 'ParameterChart',
  props,
  setup(props) {
    const graphChartRef: Ref<HTMLDivElement | null> = ref(null)

    const option = {
      width: '80%',
      title: { text: '拟合曲线', left: 200 },
      tooltip: {
        trigger: 'axis'
      },
      legend: {
        data: ['拟合曲线', '上包络', '下包络'],
        top: 'center', //距上
        left: '85%', //距右
        orient: 'vertical' //纵向排列
      },
      grid: {
        left: '3%',
        right: '4%',
        bottom: '3%',
        containLabel: true
      },
      xAxis: {},
      yAxis: {},
      series: [
        {
          data: props.parameterFittingData,
          type: 'line',
          smooth: true,
          name: '拟合曲线'
        },
        {
          data: props.envelopingData.upper1,
          type: 'line',
          smooth: true,
          name: '上包络'
        },
        {
          data: props.envelopingData.lower1,
          type: 'line',
          smooth: true,
          name: '下包络'
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
