var PATH_CONFIDENCE_BAND = "./confidence-band.json";
var PATH_ED_DETECT = "./edDetect.json";
var PATH_ED_DETECT_ADVANCED = "./eddetect_output_advanced.json";

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
      ],
      title: {
        text: "Confidence Band",
        subtext: "Example in MetricsGraphics.js",
        left: "center",
      },
      legend: {
        right: 'auto',
        left: 895,
        bottom: 'center'
      },
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
      yAxis: [{
        type: "value",
        scale: true
      }],

      series: [
        // Schlauch
        {
          name: "Schlauch",
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
          name: "Schlauch",
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
          name: "> 1500",
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
          name: "1500 - 0",
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
          name: "0 - 1000",
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
          {
            name: "< 1000",
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
          
        // Mittlere Punkte
        {
          name: "mid",
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

var minDate = null;
var maxDate = null;
var TimeLine = [];
var getDaysArray = function(start, end) {
  for(var arr=[],dt=new Date(start); dt<=new Date(end); dt.setDate(dt.getDate()+1)){
      arr.push(new Date(dt));
  }
  return arr;
};
$.get(PATH_ED_DETECT_ADVANCED, function (data) {
  data.map(function (item){
    var date = new Date(item.ds.substring(3,5) +"."+item.ds.substring(0,2)+"."+item.ds.substring(6))
    if (date <= minDate || minDate === null){
      minDate = date;
    }
    if (date >= maxDate || maxDate === null){
      maxDate = date;
    }
  });
  TimeLine = getDaysArray(minDate,maxDate);
  myChart3.setOption(
    (option3 = {
      
      dataZoom: [
        {
          id: "dataZoomX",
          type: "slider",
          xAxisIndex: [0],
          filterMode: "filter",
        },
      ],
      title: {
        text: "Confidence Band",
        subtext: "Example in MetricsGraphics.js",
        left: "center",
      },
      legend: {
        right: 'auto',
        left: 895,
        bottom: 'center'
      },
      xAxis: {
        type: "category",
        data: TimeLine,
        axisLabel: {
          formatter: function (value) {
            var date = new Date(value);
            return [date.getDate(), date.getMonth() + 1, date.getFullYear()].join(".");
          },
        },
        boundaryGap: false,
      },
      yAxis: [{
        type: "value",
        scale: true
      }],

      series: [
        // Aachen Schlauch
        {
          name: "Aachen Schlauch",
          type: "line",
          data: data.map(function (item) {
            if(item.city === 'Aachen')
            return item.yhat_lower_pres;
          }),
          lineStyle: {
            opacity: 0,
          },
          symbol: "none",
          stackStrategy: "all",
          stack: "Aachen Schlauch",
        },
        {
          name: "Aachen Schlauch",
          type: "line",
          data: data.map(function (item) {
            // Schlauchbreite!
            if(item.city === 'Aachen')

            return item.yhat_upper_pres - item.yhat_lower_pres;
          }),
          lineStyle: {
            opacity: 0,
          },

          areaStyle: {
            color: "rgba(99, 0, 0, 0.83)"
          },
          stack: "Aachen Schlauch",
          stackStrategy: "all",
          symbol: "none",
        },


        // Berlin Schlauch
        {
          name: "Berlin Schlauch",
          type: "line",
          data: data.map(function (item) {
            if(item.city === 'Berlin')
            return item.yhat_lower_pres;
          }),
          lineStyle: {
            opacity: 0,
          },
          symbol: "none",
          stackStrategy: "all",
          stack: "Berlin Schlauch",
        },
        {
          name: "Berlin Schlauch",
          type: "line",
          data: data.map(function (item) {
            // Schlauchbreite!
            if(item.city === 'Berlin')

            return item.yhat_upper_pres - item.yhat_lower_pres;
          }),
          lineStyle: {
            opacity: 0,
          },

          areaStyle: {
            color: "rgba(0, 99, 0, 0.83)",
          },
          stack: "Berlin Schlauch",
          stackStrategy: "all",
          symbol: "none",
        },
/*
        // Obere Punkte
        {
          name: "> 1500",
          type: "effectScatter",
          data: data.map(function (item) {
            if (item.pres - item.yhat_upper_pres > 1500) {
              return item.pres;
            }
          }),
          symbolSize: 5,
          itemStyle: {
            color: "red",
          },
          symbol: "circle",
        },
        {
          name: "1500 - 0",
          type: "effectScatter",
          data: data.map(function (item) {
            if (
              item.pres - item.yhat_upper_pres > 0 &&
              item.pres - item.yhat_upper_pres < 1500
            ) {
              return item.pres;
            }
          }),
          symbolSize: 4,
          itemStyle: {
            color: "orange",
          },
        },
        // Untere Punkte
        {
          name: "0 - 1000",
          type: "scatter",
          data: data.map(function (item) {
            if (
              ((item.yhat_lower_pres - item.pres) > 0) &&
              ((item.yhat_lower_pres - item.pres) < 1000)
              ) {
                return item.pres;
              }
            }),
            symbolSize: 3,
            itemStyle: {
              color: "blue",
            },
          },
          {
            name: "< 1000",
            type: "scatter",
            data: data.map(function (item) {
              if (item.yhat_lower_pres - item.pres > 1000) {
                return item.pres;
              }
            }),
            symbolSize: 5,
            itemStyle: {
              color: "purple",
            },
            symbol: "circle",
          },
          
        // Mittlere Punkte
        {
          name: "mid",
          type: "scatter",
          data: data.map(function (item) {
            if ((item.yhat_lower_pres < item.pres) && (item.pres < item.yhat_upper_pres)) {
              return item.pres;
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
        */
      ],
    })
  );
});

