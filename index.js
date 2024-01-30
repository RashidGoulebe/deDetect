var PATH_CONFIDENCE_BAND = "./confidence-band.json";
var PATH_ED_DETECT = "./edDetect.json";

var chartDom1 = document.getElementById("main1");
var chartDom2 = document.getElementById("main2");
var chartDom3 = document.getElementById("main3");

var myChart1 = echarts.init(chartDom1);
var myChart2 = echarts.init(chartDom2);
var myChart3 = echarts.init(chartDom3);

var option1;

$.get(PATH_CONFIDENCE_BAND, function (data) {
  myChart1.hideLoading();
  var base = -data.reduce(function (min, val) {
    return Math.floor(Math.min(min, val.l));
  }, Infinity);
  myChart1.setOption(
    (option = {
      title: {
        text: 'Confidence Band',
        subtext: 'Example in MetricsGraphics.js',
        left: 'center'
      },
      tooltip: {
        trigger: 'axis',
        axisPointer: {
          type: 'cross',
          animation: false,
          label: {
            backgroundColor: '#ccc',
            borderColor: '#aaa',
            borderWidth: 1,
            shadowBlur: 0,
            shadowOffsetX: 0,
            shadowOffsetY: 0,
            color: '#222'
          }
        },
        formatter: function (params) {
          return (
            params[2].name +
            '<br />' +
            ((params[2].value - base) * 100).toFixed(1) +
            '%'
          );
        }
      },
      grid: {
        left: '3%',
        right: '4%',
        bottom: '3%',
        containLabel: true
      },
      xAxis: {
        type: 'category',
        data: data.map(function (item) {
          return item.date;
        }),
        axisLabel: {
          formatter: function (value, idx) {
            var date = new Date(value);
            return idx === 0
              ? value
              : [date.getMonth() + 1, date.getDate()].join('-');
          }
        },
        boundaryGap: false
      },
      yAxis: {
        axisLabel: {
          formatter: function (val) {
            return (val - base) * 100 + '%';
          }
        },
        axisPointer: {
          label: {
            formatter: function (params) {
              return ((params.value - base) * 100).toFixed(1) + '%';
            }
          }
        },
        splitNumber: 3
      },
      series: [
        {
          name: 'L',
          type: 'line',
          data: data.map(function (item) {
            return item.l + base;
          }),
          lineStyle: {
            opacity: 0
          },
          stack: 'confidence-band',
          symbol: 'none'
        },
        {
          name: 'U',
          type: 'line',
          data: data.map(function (item) {
            return item.u - item.l;
          }),
          lineStyle: {
            opacity: 0
          },
          areaStyle: {
            color: '#ccc'
          },
          stack: 'confidence-band',
          symbol: 'none'
        },
        {
          type: 'line',
          data: data.map(function (item) {
            return item.value + base;
          }),
          itemStyle: {
            color: '#333'
          },
          showSymbol: false
        }
      ]
    })
  );
});

/** @type EChartsOption */
const option2 = {
  xAxis: {
    type: "category",
    data: ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"],
  },
  yAxis: {
    type: "value",
  },
  series: [
    {
      data: [150, 230, 224, 218, 135, 147, 260],
      type: "line",
    },
  ],
};
myChart2.setOption(option2);

$.get(PATH_ED_DETECT, function (data) {
  var base = -data.reduce(function (min, val) {
    return Math.floor(Math.min(min, val.l));
  }, Infinity);
  myChart3.setOption(
    (option3 = {
      xAxis: {
        type: "category",
        data: data.map(function (item) {
          return item.ds;
        }),
        axisLabel: {
          formatter: function (value, idx) {
            var date = new Date(value);
            return idx === 0
              ? value
              : [date.getMonth() + 1, date.getDate()].join("-");
          },
        },
        boundaryGap: false,
      },
      yAxis: {
        splitNumber: 3
      },

      series: [
          {
              name: "yhat_lower",
              type: "line",
              data: data.map(function (item) {
                  return item.yhat_lower;
                }),
                lineStyle: {
                    opacity: 0,
                },
                symbol: "none",
                stack: "yhat-band",
            },
            {
                name: "yhat_upper",
                type: "line",
                data: data.map(function (item) {
                    return item.yhat_upper - item.yhat_lower;
                }),
                lineStyle: {
                    opacity: 0,
                },
                
                areaStyle: {
                    color: "green",
                },
                stack: "yhat-band",
                stackStrategy: "all",
                symbol: "none",
            },
            
        {
            type: 'line',
            data: data.map(function (item) {
              return item.orig_value;
            }),
            itemStyle: {
              color: '#333'
            },
            showSymbol: false
          },
        {
            type: 'line',
            data: data.map(function (item) {
              return item.yhat;
            }),
            itemStyle: {
              color: 'red'
            },
            showSymbol: false
          }

      ],
    })
  );
});

option3 && myChart3.setOption(option3);
