class PCO2PlotData {
  constructor() {
    this.data = { };
    this.domains = [
      [[70000,0],[0,10000]], //pco2 plot units kiloAnnum and ppm
      [[800,0],[5,35]] //temperature plot 2 units kiloAnnum and degC (other plots based on these dimensions)
    ];
    //External and inter-plot spacing in pixels
    var padding = 8;
    //Label spacing in pixels
    var lbl = {"xAxisH":20,"yAxisW":25,"font":8};
    //Plot sizes in pixels
    var plotDims = [
      [267,150], //pco2 plot 16:9 aspect
      [100,75], //temperature plot 2 Other plots based on these dims
      [120,10] //row0width and timelineHeight
    ];
    //CALCULATED VALUES
    var col0X = padding;
    var col1X = col0X+plotDims[2][0]+lbl.yAxisW+lbl.font;
    var col2X = col1X+plotDims[0][0]+padding;
    var tlY = padding;
    var row1Y = tlY+plotDims[2][1];
    var row2Y = row1Y+plotDims[1][1]+padding;
    this.plotWidth = col2X+plotDims[1][0]+lbl.yAxisW+padding;
    this.plotHeight = row2Y+plotDims[0][1]+lbl.xAxisH+padding;

    this.pco2Plot = {
      "plotSrc" : ["data/Paleo-CO2_Plot.json"],
      "dataSrc" : "data/Paleo-CO2_Archive.json",
      "container_id" : "pco2Data",
      "xAxisLabel" : "Age (millions of years ago)",
      "yAxisLabel" : "Atmospheric CO<tspan class=\"sub\">2</tspan><tspan> (ppm)</tspan>",
      "classAxis" : {
        "Phytoplankton":"phytoplankton",
        "Boron Proxies":"boron",
        "Stomatal Frequencies":"stomatal",
        "Leaf Gas Exchange":"leafgas",
        "Liverworts":"liverworts",
        "C3 Plants":"c3plants",
        "Paleosols":"paleosols",
        "Nahcolite":"nahcolite"
      },
      "dimensions" : {
        "width" : plotDims[0][0],
        "height" : plotDims[0][1],
        "margins" : {
          "left" : col1X,
          "top" : row2Y
        },
        "d_x" : 0,
        "d_y" : 0,
        "axes" : {
          "xBottom" : {
            "format" : function(d) { return d/1000; }
          },
          "yLeft" : {
            "format" : d3.format("d"),
            "formatLog" : function(d) { return (Number.isInteger(Math.log10(d))||Number.isInteger(Math.log10(d*2)))?d : ""; }
          }
        }
      }
    };
    this.tempPlot1 = {
      "plotSrc" : [ "data/tempWesterhold.json", "data/tempModern.json" ],
      "container_id" : "tempPlot1",
      "yAxisLabel" : "<tspan x=\"0\">Surface</tspan><tspan x=\"0\" dy=\"10\">Temperature (&deg;C)</tspan>",
      "references" : [
        {
          "title":"Westerhold et al. (2020)",
          "url": "https://doi.org/10.1126/science.aba6853",
          "pos" : [ 6, plotDims[1][1] - 6 ],
          "anchor" : "start"
        }
      ],
      "dimensions" : {
        "width" : plotDims[0][0],
        "height" : plotDims[1][1],
        "margins" : {
          "left" : col1X,
          "top" : row1Y
        },
        "d_x" : 0,
        "d_y" : 1,
        "axes" : {
          "yLeft" : {
            "ticks" : 6,
            "format" : d3.format("d")
          },
          "yRight" : { "ticks" : 6 }
        }
      }
    };
    this.timeline1 = {
      "plotSrc" : [ "data/geologicTime.json" ],
      "container_id" : "timeline1",
      "dimensions" : {
        "width" : plotDims[0][0],
        "height" : plotDims[2][1],
        "margins" : {
          "left" : col1X,
          "top" : tlY
        },
        "d_x" : 0,
        "d_y" : 0,
        "axes" : {
          "yRight" : { "ticks" : 0 },
          "yLeft" : { "ticks" : 0 },
          "xBottom" : { "ticks" : 0 },
          "xTop" : { "ticks" : 0 }
        }
      }
    };
    this.tempPlot2 = {
      "plotSrc" : [ "data/tempWesterholdModern.json", "data/tempModern.json" ],
      "container_id" : "tempPlot2",
      "references" : [
        {
          "title":"Westerhold et al. (2020)",
          "url": "https://doi.org/10.1126/science.aba6853",
          "pos" : [ plotDims[1][0] - 6 , plotDims[1][1] - 6 ],
          "anchor" : "end"
        }
      ],
      "dimensions" : {
        "width" : plotDims[1][0],
        "height" : plotDims[1][1],
        "margins" : {
          "left" : col2X,
          "top" : row1Y
        },
        "d_x" : 1,
        "d_y" : 1,
        "axes" : {
          "yRight" : {
            "ticks" : 6,
            "format" : d3.format("d")
          },
          "yLeft" : { "ticks" : 6 },
          "xBottom" : { "ticks" : 5 },
          "xTop" : { "ticks" : 5 }
        }
      }
    };
    this.timeline2 = {
      "plotSrc" : [ "data/geologicTime.json" ],
      "container_id" : "timeline2",
      "dimensions" : {
        "width" : plotDims[1][0],
        "height" : plotDims[2][1],
        "margins" : {
          "left" : col2X,
          "top" : tlY
        },
        "d_x" : 1,
        "d_y" : 0,
        "axes" : {
          "yRight" : { "ticks" : 0 },
          "yLeft" : { "ticks" : 0 },
          "xBottom" : { "ticks" : 0 },
          "xTop" : { "ticks" : 0 }
        }
      }
    };
    this.iceCorePlot = {
      "plotSrc" : [ "data/co2bereiter.json", "data/co2MaunaLoa.json" ],
      "container_id" : "iceCorePlot",
      "xAxisLabel" : "Age (thousands of years ago)",
      "references" : [
        {
          "title":"Ice Core Compilation",
          "url": "https://doi.org/10.1002/2014GL061957",
          "pos" : [ plotDims[1][0] - 6 , 12 ],
          "anchor" : "end"
        },
        {
          "title":"NOAA ESRL GML (2020)",
          "url": "https://doi.org/10.15138/yaf1-bk21",
          "pos" : [ plotDims[1][0] - 6 , 20 ],
          "anchor" : "end"
        }
      ],
      "dimensions" : {
        "width" : plotDims[1][0],
        "height" : plotDims[0][1],
        "margins" : {
          "left" : col2X,
          "top" : row2Y
        },
        "d_x" : 1,
        "d_y" : 0,
        "axes" : {
          "xBottom" : {
            "format" : function(d) { return d; },
            "ticks" : 5
          },
          "yRight" : {
            "format" : d3.format("d"),
            "formatLog" : function(d) { return (Number.isInteger(Math.log10(d))||Number.isInteger(Math.log10(d*2)))?d : ""; }
          },
          "xTop" : { "ticks" : 5 }
        }
      }
    };
    this.legend = {
      "width" : plotDims[2][0],
      "height" : plotDims[0][1],
      "margins" : {
        "left" : col0X,
        "top" : row2Y
      }
    };
    this.logo = {
      "width" : plotDims[1][1],
      "height" : plotDims[1][1],
      "imgWidth" : 380,
      "imgHeight" : 380,
      "margins" : {
        "left" : col0X,
        "top" : row1Y
      }
    };
    this.expanded = {
      "width" : plotDims[0][0]+padding+plotDims[1][0],
      "height" : plotDims[0][1]+padding+plotDims[2][1]+plotDims[1][1],
      "margins" : {
        "left" : col1X,
        "top" : tlY
      }
    };
  }
}
