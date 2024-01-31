import { defineComponent, ref, PropType, toRefs } from 'vue'
import type { Ref } from 'vue'
import initChart from '@/components/chart'

const props = {
  height: {
    type: [String, Number] as PropType<string | number>,
    default: '100%'
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
    type: Array as PropType<Array<any>>,
    default: []
  }
}

const DagWeightChart = defineComponent({
  name: 'DagWeightChart',
  props,
  setup(props) {
    const graphChartRef: Ref<HTMLDivElement | null> = ref(null)
    console.log(props)
    const { indexList, weight } = toRefs(props)
    // 根据数据处理图例 纵坐标 横坐标
    const option = {
      width: 300,
      title: { text: '专家估算轮次变化', left: 100 },
      tooltip: {
        trigger: 'axis'
      },
      legend: {
        // data: weight.value.map((item: any) => {
        //   return item.round
        // })
        data: ['低1/4分位数', '估值', '高1/4分位数'],
        top: 'center', //距上
        right: '0px', //距右
        orient: 'vertical' //纵向排列
      },
      grid: {
        left: '3%',
        right: '4%',
        bottom: '3%',
        containLabel: true
      },
      toolbox: {
        feature: {
          saveAsImage: {}
        }
      },
      xAxis: {
        name: '轮次',
        nameLocation: 'center',
        nameGap: 30,
        interval: 1,
        min: 1,
        max: () => {
          let max = weight.value[0].round

          weight.value.forEach((item) => {
            if (item.round > max) {
              max = item.round
            }
          })

          return max + 1
        }
      },
      // xAxis: {
      //   type: 'category',
      //   boundaryGap: false,
      //   data: indexList.value
      //     .filter((item: any, index: number) => {
      //       return index < indexList.value.length - 1
      //     })
      //     .map((item: any) => {
      //       return item.title
      //     })
      // },
      yAxis: {
        type: 'value'
      },
      series: [
        {
          data: weight.value.map((item: any) => {
            return [item.round, item.lowEstimate]
          }),
          type: 'line',
          smooth: true,
          name: '低1/4分位数',
          itemStyle: { color: '#5470c6' },
          symbol: 'none'
        },
        {
          data: weight.value.map((item: any) => {
            return [item.round, item.midEstimate]
          }),
          type: 'line',
          smooth: true,
          name: '估值',
          itemStyle: { color: '#fac858' }
        },
        {
          data: weight.value.map((item: any) => {
            return [item.round, item.highEstimate]
          }),
          type: 'line',
          smooth: true,
          name: '高1/4分位数',
          itemStyle: { color: '#3ba272' }
        }
      ]

      //   [
      // {
      //   name: 'Email',
      //   type: 'line',
      //   stack: 'Total',
      //   data: [120, 132, 101, 134, 90, 230, 210]
      // },
      //   {
      //     name: 'Union Ads',
      //     type: 'line',
      //     stack: 'Total',
      //     data: [220, 182, 191, 234, 290, 330, 310]
      //   },
      //   {
      //     name: 'Video Ads',
      //     type: 'line',
      //     stack: 'Total',
      //     data: [150, 232, 201, 154, 190, 330, 410]
      //   },
      //   {
      //     name: 'Direct',
      //     type: 'line',
      //     stack: 'Total',
      //     data: [320, 332, 301, 334, 390, 330, 320]
      //   },
      //   {
      //     name: 'Search Engine',
      //     type: 'line',
      //     stack: 'Total',
      //     data: [820, 932, 901, 934, 1290, 1330, 1320]
      //   }
      // ]
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
