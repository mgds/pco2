class PhanerozoicPlotData {
    constructor(product_plot) {
      this.data = { };
      this.domains = [
        [[541000,0],[0,10000]], //pco2 plot units kiloAnnum and ppm
        [[800,0],[5,35]] //temperature plot 2 units kiloAnnum and degC (other plots based on these dimensions)
      ];
      //External and inter-plot spacing in pixels
      var padding = 8;
      //Label spacing in pixels
      var lbl = {"xAxisH":20,"yAxisW":25,"font":8};
      //Plot sizes in pixels
      var plotDims = [
        [375,243], //pco2 plot 16:9 aspect
        [100,75], //temperature plot 2 Other plots based on these dims
        [120,10] //row0width and timelineHeight
      ];
      //CALCULATED VALUES
      var col0X = padding;
      var col1X = col0X+plotDims[2][0]+lbl.yAxisW+lbl.font;
      var col2X = col1X+plotDims[0][0]+padding;
      var tlY = padding;
      var row1Y = tlY+plotDims[2][1];
      var row2Y = row1Y+padding;
      this.plotWidth = col2X+padding;
      this.plotHeight = row2Y+plotDims[0][1]+lbl.xAxisH+padding;
  
      this.pco2Plot = {
        "plotSrc" : ["data/Paleo-CO2_Plot.json"],
        "dataSrc" : "data/Paleo-CO2_Archive.json",
        "dataSrcArchive" : "data/Paleo-CO2_Archive.json",
        "dataSrcProduct" : "data/Paleo-CO2_Product.json",
        "showArchive" : true,
        "categories" : [1],
        "container_id" : "pco2Data",
        "xAxisLabel" : "Age (millions of years ago)",
        "yAxisLabel" : "Atmospheric CO<tspan class=\"sub\">2</tspan><tspan> (ppm)</tspan>",
        "classAxis" : {
          "Phytoplankton":"phytoplankton",
          "Boron Proxies":"boron",
          "Stomatal Frequencies":"stomatal",
          "Leaf Gas Exchange":"leafgas",
          "Liverworts":"liverworts",
          "Land Plant 𝛿¹³C":"c3plants",
          "Paleosols":"paleosols",
          "Nahcolite":"nahcolite"
        },
        "dimensions" : {
          "width" : plotDims[0][0],
          "height" : plotDims[0][1],
          "margins" : {
            "left" : col1X,
            "top" : row1Y
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
      if (product_plot) {
        this.pco2Plot.plotSrc =["data/Paleo-CO2_ProductPlot.json","data/Paleo-CO2_Plot.json"];
        this.pco2Plot.dataSrc = "data/Paleo-CO2_Product.json";
        this.pco2Plot.showArchive = false;
        this.domains = [
          [[541000,0],[0,3500]], //pco2 plot units kiloAnnum and ppm
          [[800,0],[5,35]] //temperature plot 2 units kiloAnnum and degC (other plots based on these dimensions)
        ];
      }
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
      this.legend = {
        "width" : plotDims[2][0],
        "height" : plotDims[0][1],
        "margins" : {
          "left" : col0X,
          "top" : row1Y+plotDims[1][1]+padding
        }
      };
      this.logo = {
        "width" : plotDims[1][1],
        "height" : plotDims[1][1],
        "imgWidth" : 1097,
        "imgHeight" : 1098,
        "margins" : {
          "left" : col0X,
          "top" : row1Y
        }
      };
    }
  }
  