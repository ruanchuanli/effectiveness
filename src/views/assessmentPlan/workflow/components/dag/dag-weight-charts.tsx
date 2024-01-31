import { defineComponent, ref, PropType } from 'vue'
import * as echarts from 'echarts'
import type { Ref } from 'vue'
import initChart from '@/components/chart'

const props = {
  height: {
    type: [String, Number] as PropType<string | number>,
    default: 280
  },
  width: {
    type: [String, Number] as PropType<string | number>,
    default: '100%'
  },
  indexList: {
    type: Array as PropType<Array<any>>,
    default: []
  },
  weight: {
    type: Object as PropType<any>,
    default: []
  }
}

const DagWeightChart = defineComponent({
  name: 'DagWeightChart',
  props,
  setup(props) {
    const graphChartRef: Ref<HTMLDivElement | null> = ref(null)

    const option = {
      tooltip: {
        trigger: 'axis',
        axisPointer: {
          type: 'shadow'
        }
      },
      grid: {
        left: '3%',
        right: '4%',
        bottom: '3%',
        containLabel: true
      },
      xAxis: [
        {
          type: 'category',
          data: props.indexList.map((item: any) => item.name),
          axisTick: {
            alignWithLabel: true
          }
        }
      ],
      yAxis: [
        {
          type: 'value'
        }
      ],
      series: [
        {
          name: '权重',
          type: 'bar',
          barWidth: '60%',
          data: props.indexList.map((item: any, index: number) => {
            console.log(item)
            console.log(props.weight[item.indicatorId] - 0)
            return props.weight[item.indicatorId]
              ? props.weight[item.indicatorId] - 0
              : props.weight[index]
          })
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

export default DagWeightChart
