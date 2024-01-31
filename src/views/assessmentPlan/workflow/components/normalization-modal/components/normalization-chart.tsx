import { defineComponent, ref, PropType, computed, watch, reactive } from 'vue'
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
  lower: {
    type: Number as PropType<number>,
    default: 0
  },
  upper: {
    type: Number as PropType<number>,
    default: 0
  }
}

const DagWeightChart = defineComponent({
  name: 'NormalizationChart',
  props,
  setup(props) {
    const graphChartRef: Ref<HTMLDivElement | null> = ref(null)

    const option = reactive({
      tooltip: {
        trigger: 'axis'
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
          data: Array.from({ length: props.upper + 2 }).map((k, i) => i),
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
          type: 'line',
          data: new Array(props.upper + 2).fill(1).map((k, i) => {
            if (i <= props.lower) {
              return 0
            } else if (i > props.lower && i <= props.upper) {
              return (i - props.lower) / (props.upper - props.lower)
            } else {
              return 1
            }
          }),
          smooth: false
        }
      ]
    })

    initChart(graphChartRef, option)

    watch(
      () => [props.lower, props.upper],
      ([lower, upper]) => {
        option.xAxis[0].data = Array.from({ length: props.upper + 2 }).map(
          (k, i) => i
        )
        option.series[0].data = new Array(props.upper + 2)
          .fill(1)
          .map((k, i) => {
            if (i <= props.lower) {
              return 0
            } else if (i > props.lower && i <= props.upper) {
              return (i - props.lower) / (props.upper - props.lower)
            } else {
              return 1
            }
          })
      }
    )

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
