var PATH_CONFIDENCE_BAND = "./confidence-band.json";
var PATH_ED_DETECT = "./edDetect.json";

var chartDom1 = document.getElementById("main1");
var chartDom2 = document.getElementById("main2");

var myChart1 = echarts.init(chartDom1);
var myChart2 = echarts.init(chartDom2);

var option1;

$.get(PATH_CONFIDENCE_BAND, function (data) {
  myChart1.hideLoading();
  var base = -data.reduce(function (min, val) {
    return Math.floor(Math.min(min, val.l));
  }, Infinity);
  myChart1.setOption(
    (option = {
      title: {
        text: "Confidence Band",
        subtext: "Example in MetricsGraphics.js",
        left: "center",
      },
      tooltip: {
        trigger: "axis",
        axisPointer: {
          type: "cross",
          animation: false,
          label: {
            backgroundColor: "#ccc",
            borderColor: "#aaa",
            borderWidth: 1,
            shadowBlur: 0,
            shadowOffsetX: 0,
            shadowOffsetY: 0,
            color: "#222",
          },
        },
        formatter: function (params) {
          return (
            params[2].name +
            "<br />" +
            ((params[2].value - base) * 100).toFixed(1) +
            "%"
          );
        },
      },
      grid: {
        left: "3%",
        right: "4%",
        bottom: "3%",
        containLabel: true,
      },
      xAxis: {
        type: "category",
        data: data.map(function (item) {
          return item.date;
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
        axisLabel: {
          formatter: function (val) {
            return (val - base) * 100 + "%";
          },
        },
        axisPointer: {
          label: {
            formatter: function (params) {
              return ((params.value - base) * 100).toFixed(1) + "%";
            },
          },
        },
        splitNumber: 3,
      },
      series: [
        {
          name: "L",
          type: "line",
          data: data.map(function (item) {
            return item.l + base;
          }),
          lineStyle: {
            opacity: 0,
          },
          stack: "confidence-band",
          symbol: "none",
        },
        {
          name: "U",
          type: "line",
          data: data.map(function (item) {
            return item.u - item.l;
          }),
          lineStyle: {
            opacity: 0,
          },
          areaStyle: {
            color: "#ccc",
          },
          stack: "confidence-band",
          symbol: "none",
        },
        {
          type: "line",
          data: data.map(function (item) {
            return item.value + base;
          }),
          itemStyle: {
            color: "#333",
          },
          showSymbol: false,
        },
      ],
    })
  );
});

$.get(PATH_ED_DETECT, function (data) {
  myChart2.setOption(
    (option2 = {
      
      dataZoom: [
        {
          id: "dataZoomX",
          type: "slider",
          xAxisIndex: [0],
          filterMode: "filter",
        },
        {
          id: "dataZoomY",
          type: "slider",
          yAxisIndex: [0],
          filterMode: "empty",
        },
      ],
      legend: {},
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
              : [date.getDate(), date.getMonth() + 1].join("-");
          },
        },
        boundaryGap: false,
      },
      yAxis: {},

      series: [
        // Schlauch
        {
          name: "yhat_schlauch",
          type: "line",
          data: data.map(function (item) {
            return item.yhat_lower;
          }),
          lineStyle: {
            opacity: 0,
          },
          symbol: "none",
          stackStrategy: "all",
          stack: "yhat-band",
        },
        {
          name: "yhat_schlauch",
          type: "line",
          data: data.map(function (item) {
            // Schlauchbreite!
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

        // Obere Punkte
        {
          name: "much_upper_scatter",
          type: "effectScatter",
          data: data.map(function (item) {
            if (item.orig_value - item.yhat_upper > 1500) {
              return item.orig_value;
            }
          }),
          symbolSize: 5,
          itemStyle: {
            color: "red",
          },
          symbol: "circle",
        },
        {
          name: "upper_scatter",
          type: "effectScatter",
          data: data.map(function (item) {
            if (
              item.orig_value - item.yhat_upper > 0 &&
              item.orig_value - item.yhat_upper < 1500
            ) {
              return item.orig_value;
            }
          }),
          symbolSize: 4,
          itemStyle: {
            color: "orange",
          },
        },
        // Untere Punkte
        {
          name: "much_lower_scatter",
          type: "scatter",
          data: data.map(function (item) {
            if (item.yhat_lower - item.orig_value > 1000) {
              return item.orig_value;
            }
          }),
          symbolSize: 5,
          itemStyle: {
            color: "purple",
          },
          symbol: "circle",
        },
        {
          name: "lower_scatter",
          type: "scatter",
          data: data.map(function (item) {
            if (
              ((item.yhat_lower - item.orig_value) > 0) &&
              ((item.yhat_lower - item.orig_value) < 1000)
            ) {
              return item.orig_value;
            }
          }),
          symbolSize: 3,
          itemStyle: {
            color: "blue",
          },
        },

        // Mittlere Punkte
        {
          name: "mid_scatter",
          type: "scatter",
          data: data.map(function (item) {
            if ((item.yhat_lower < item.orig_value) && (item.orig_value < item.yhat_upper)) {
              return item.orig_value;
            }
          }),
          symbolSize: 2,
          itemStyle: {
            color: "black",
          },
          symbol: "circle",
        },

        // Mittelwert
        {
          name: "yhat",
          type: "line",
          data: data.map(function (item) {
            return item.yhat;
          }),
          itemStyle: {
            color: "black",
          },
          showSymbol: false,
        },
      ],
    })
  );
});

option2 && myChart2.setOption(option2);
