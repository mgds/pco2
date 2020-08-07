class PCO2Plot { // Overall container class for plots

    plot_file = "data/Paleo-CO2_Plot.json"
    archive_file = "data/Paleo-CO2_Archive.json"
    temp_file = "data/temp.json"
    temp_modern_file = "data/tempModern.json"
    iceCore_file = "data/co2bereiter.json"
    maunaLoa_file = "data/co2MaunaLoa.json"
    timeline_file = "data/geologicTime.json"
    class_axis = {
      "Phytoplankton":"phytoplankton",
      "Boron Proxies":"boron",
      "Stomatal Frequencies":"stomatal",
      "Leaf Gas Exchange":"leafgas",
      "Liverworts":"liverworts",
      "C3 Plants":"c3plants",
      "Paleosols":"paleosols",
      "Nahcolite":"nahcolite"
    }
    //PLOT DOMAINS
    domains = new DomainControl([
      [[70000,0],[0,5500]], //pco2 plot units kiloAnnum and ppm
      [[800,0],[5,30]] //temperature plot 2 units kiloAnnum and degC (other plots based on these dimensions)
    ]);
    //External and inter-plot spacing in pixels
    padding = 8;
    //Label spacing in pixels
    lbl = {"xAxisH":20,"yAxisW":25,"font":8};
    //Plot sizes in pixels
    plotDims = [
      [267,150], //pco2 plot 16:9 aspect
      [100,75], //temperature plot 2 Other plots based on these dims
      [130,10] //row0width and timelineHeight
    ];

    constructor(container_id) {
      var self = this;
      this.setAllDimensions(); //sets domains, width, height, plotDims
      this.content = d3.select(container_id);
      this.container = this.content.append("svg")
          .attr("id","container_svg")
          .attr("viewBox",`0 0 ${this.width} ${this.height}`);
      this.container.append("rect").classed("background",true)
          .attr("width",this.width).attr("height",this.height);
      this.setSizeDynamic(); //sets size of plot
      //listens for window resize and updates svg width/height
      window.addEventListener('resize', function(){ self.setSizeDynamic(); });
      this.generatePlot();
    }
    generatePlot() {
      var self = this;
      //LOGO
      this.createLogo();
      //LEGEND
      this.legend = new Legend(this,this.dims.legend);
      //MAIN PLOT
      this.pco2Plot = new ScatterPlot(this,[this.plot_file],'pco2Data', this.dims.pco2Plot,this.legend); // width, height, top, left  Set the final input value to true for product, false for archive
      this.pco2Plot.xLabelHtml = "Age (millions of years ago)";
      this.pco2Plot.yLabelHtml = "Atmospheric CO<tspan class=\"sub\">2</tspan><tspan> (ppm)</tspan>";
      this.pco2Plot.zoomCallback = function() {
        this.content.classed("zoomed",this.zoomed());
        self.timeline1.zoomX();
        self.tempPlot1.zoomX();
        self.iceCorePlot.zoomY();
      }
      this.pco2Plot.makeBrush();
      this.pco2Plot.addData();
      this.pco2Plot.expandButton();
      //HANSEN TEMP PLOT to 70Ma
      this.tempPlot1 = new LinePlot(this,[this.temp_file,this.temp_modern_file],'tempPlot1', this.dims.tempPlot1);
      this.tempPlot1.yLabelHtml = "<tspan x=\"0\">Surface</tspan><tspan x=\"0\" dy=\"10\">Temperature (&deg;C)</tspan>";
      this.tempPlot1.addData();
      this.tempPlot1.content.append("g")
        .attr("transform",`translate(6,${this.dims.tempPlot1.height-6})`)
        .append("a").attr("class","reference").attr("target","_blank")
        .attr("href","https://doi.org/10.1098/rsta.2012.0294")
        .append("text")
        .text("Hansen et al. (2013)");
      this.timeline1 = new TimeLine(this,[this.timeline_file],'timeline1',this.dims.timeline1);
      this.timeline1.addData();
      //HANSEN TEMP PLOT to 800ka
      this.tempPlot2 = new LinePlot(this,[this.temp_file,this.temp_modern_file],'tempPlot2', this.dims.tempPlot2);
      this.tempPlot2.addData();
      this.tempPlot2.content.append("g")
        .attr("transform",`translate(6,${this.dims.tempPlot1.height-6})`)
        .append("a").attr("class","reference").attr("target","_blank")
        .attr("href","https://doi.org/10.1098/rsta.2012.0294")
        .append("text")
        .text("Hansen et al. (2013)");
      this.timeline2 = new TimeLine(this,[this.timeline_file],'timeline2',this.dims.timeline2);
      this.timeline2.addData();
      //Bereiter CO2 PLOT to 800ka
      this.iceCorePlot = new LinePlot(this,[this.iceCore_file,this.maunaLoa_file],'tempPlot3', this.dims.iceCorePlot);
      this.iceCorePlot.xLabelHtml = "Age (thousands of years ago)";
      this.iceCorePlot.addData();
      this.iceCorePlot.content.append("g")
        .attr("transform",`translate(6,12)`)
        .append("a").attr("class","reference").attr("target","_blank")
        .attr("href","https://doi.org/10.1002/2014GL061957")
        .append("text")
        .text("Bereiter et al. (2015)");
    }
    showUncertainties() {
      this.pco2Plot.showUncertainties(true);
    }
    hideUncertainties() {
      this.pco2Plot.showUncertainties(false);
    }
    zoomRecent() {
      var d_x = [12,0];
      this.domains.domainX( this.tempPlot2.dimensions.d_x, d_x );
      this.tempPlot2.zoomX();
      this.timeline2.zoomX();
      this.iceCorePlot.zoomX();
    }
    zoomOutRecent() {
      this.domains.resetDomainX(this.tempPlot2.dimensions.d_x);
      this.tempPlot2.zoomX();
      this.timeline2.zoomX();
      this.iceCorePlot.zoomX();
    }
    expandCallback() {
      this.tempPlot1.content.classed('hidden',true);
      this.tempPlot2.content.classed('hidden',true);
      this.timeline1.content.classed('hidden',true);
      this.timeline2.content.classed('hidden',true);
      this.iceCorePlot.content.classed('hidden',true);
    }
    collapseCallback() {
      this.tempPlot1.content.classed('hidden',false);
      this.tempPlot2.content.classed('hidden',false);
      this.timeline1.content.classed('hidden',false);
      this.timeline2.content.classed('hidden',false);
      this.iceCorePlot.content.classed('hidden',false);
    }
    setAllDimensions() {

      //CALCULATED VALUES
      var col0X = this.padding;
      var col1X = col0X+this.plotDims[2][0]+this.lbl.yAxisW+this.lbl.font;
      var col2X = col1X+this.plotDims[0][0]+this.padding
      var tlY = this.padding;
      var row1Y = tlY+this.plotDims[2][1];
      var row2Y = row1Y+this.plotDims[1][1]+this.padding;
      this.width = col2X+this.plotDims[1][0]+this.lbl.yAxisW+this.padding;
      this.height = row2Y+this.plotDims[0][1]+this.lbl.xAxisH+this.padding;
      this.dims = {
        "pco2Plot"   : {"width":this.plotDims[0][0],"height":this.plotDims[0][1],"margins":{"left":col1X,"top":row2Y},"d_x":0,"d_y":0,
            "axes":{"xBottom":{"format":function(d){return d/1000;}},"yLeft":{"format":d3.format("d")} }},
        "tempPlot1"  : {"width":this.plotDims[0][0],"height":this.plotDims[1][1],"margins":{"left":col1X,"top":row1Y},"d_x":0,"d_y":1,
            "axes":{"yLeft":{"ticks":6,"format":d3.format("d")},"yRight":{"ticks":6} }},
        "timeline1"  : {"width":this.plotDims[0][0],"height":this.plotDims[2][1],"margins":{"left":col1X,"top":tlY  },"d_x":0,"d_y":0},
        "tempPlot2"  : {"width":this.plotDims[1][0],"height":this.plotDims[1][1],"margins":{"left":col2X,"top":row1Y},"d_x":1,"d_y":1,
            "axes":{"yRight":{"ticks":6,"format":d3.format("d")},"yLeft":{"ticks":6},"xBottom":{"ticks":5},"xTop":{"ticks":5} }},
        "timeline2"  : {"width":this.plotDims[1][0],"height":this.plotDims[2][1],"margins":{"left":col2X,"top":tlY  },"d_x":1,"d_y":0},
        "iceCorePlot": {"width":this.plotDims[1][0],"height":this.plotDims[0][1],"margins":{"left":col2X,"top":row2Y},"d_x":1,"d_y":0,
            "axes":{"xBottom":{"format":d3.format("d"),"ticks":5},"yRight":{"format":d3.format("d")},"xTop":{"ticks":5} }},
        "legend"     : {"width":this.plotDims[2][0],"height":this.plotDims[0][1],"margins":{"left":col0X,"top":row2Y}},
        "logo"       : {"width":this.plotDims[2][0],"height":this.plotDims[1][1],"margins":{"left":col0X,"top":row1Y}},
        "expanded"   : {
          "width":this.plotDims[0][0]+this.padding+this.plotDims[1][0],
          "height":this.plotDims[0][1]+this.padding+this.plotDims[2][1]+this.plotDims[1][1],
          "margins":{"left":col1X,"top":tlY}}
      };
    }
    setSizeDynamic() {
      var self = this;
      var divWidth = this.content.style('width').slice(0, -2) - 6;
      var divHeight = Math.round(divWidth/(this.width/this.height));
      this.container.attr("width",divWidth).attr("height",divHeight)
    }
    createLogo() { // Creates the logo as a data URL
        var canvas = document.createElement("canvas");
        canvas.width = 380; // Manually set for required resolution
        canvas.height = 380;
        var context = canvas.getContext("2d");
        this.logo = this.container.append("svg:image")
            .attr("id","logo").attr("class","plot_logo")
            .attr("x",this.dims.logo.margins.left) // Manually determined values - tune as needed
            .attr("y",this.dims.logo.margins.top)
            .attr("height",this.dims.logo.height)
        var img = new Image();
        img.onload = ()=> {
            context.drawImage(img,0,0);
            this.logo.attr("href",canvas.toDataURL()); // Add image as data URL so that it exports properly
        }
        img.src = "/images/logo.svg";
    }
    downloadImage(format) {
      var self = this;
      var svg = this.container.node();
      var copy = svg.cloneNode(true);
      if (format === "svg") {
        PlotUtils.copyStylesInline(copy, svg,['hidden','zoom_button','plot_logo','exp_button']);
        var svg_URL = (new XMLSerializer()).serializeToString(copy);
        var image_url = 'data:image/svg+xml; charset=utf8,'+encodeURIComponent("<?xml version=\"1.0\" encoding=\"UTF-8\" standalone=\"no\"?>\n"+svg_URL);
        this.downloadFunction(image_url,"age_co2_plot.svg");
      } else {
        PlotUtils.copyStylesInline(copy, svg,["zoom_button","hidden",'exp_button']);
        var image = new Image();
        image.onload = function(){
          var canvas = document.createElement("canvas");
          canvas.width = 5*this.width; // Controls the resolution of the exported plot
          canvas.height = 5*this.height; // Controls the resolution of the exported plot
          var context = canvas.getContext("2d");
          context.scale(5,5); // Downscales the plot back to regular size (i.e. draws the SVG at high resolution and then exports at a reasonable raster size)
          context.drawImage(this,0,0);
          self.downloadFunction(canvas.toDataURL("png"),"age_co2_plot.png");
        }
        image.src = 'data:image/svg+xml; charset=utf8, '+encodeURIComponent((new XMLSerializer()).serializeToString(copy));
      }
    }
    downloadFunction(url,file_name) {
      var downloadable_element = document.createElement('a'); // Create a download element
      downloadable_element.href = url;
      downloadable_element.download = file_name;
      document.body.appendChild(downloadable_element)
      downloadable_element.click()
      document.body.removeChild(downloadable_element)
    }
    downloadData(format) {
      var self = this;
      d3.json(this.archive_file)
        .then(function(data){
          var d_x = self.pco2Plot.x.domain();
          var d_y = self.pco2Plot.y.domain();
          var entries = self.pco2Plot.legend.entries;
          var filtered_data = data.filter(function(d){
            return ((d.age!==null && d.co2!==null) //age and co2 values are defined
              && ( d.age<=d_x[0] && d.age>=d_x[1] && d.co2<=d_y[1] && d.co2>=d_y[0] ) //age and co2 values are in current dynamic_plot domain
              && entries[d.proxy].draw) //data proxy is switched on in the legend
          });
          self.downloadFormatted(filtered_data,format);
        });
    }
    downloadFormatted(data,format){
      if (format === 'csv') {
        var out = [];
        out.push(JSON.stringify(Object.keys(data[0])).replace(/(^\[)|(\]$)/mg, ''));
        data.forEach(function(d){
          out.push(JSON.stringify(Object.values(d)).replace(/(^\[)|(\]$)/mg, ''));
        });
        this.downloadFunction("data:text/csv,"+encodeURIComponent(out.join("\n")),"age_co2_plot_data.csv");
      } else {
        this.downloadFunction("data:text/json,"+encodeURIComponent(JSON.stringify(data,null,4)),"age_co2_plot_data.json");
      }
    }
}
var ageCO2Plot = null; //defined in the controller for the index page

$(document).ready(function(){
  $(document).on('click','#showHideErrors',function(e){
    if ($(this).hasClass("btn-info")) {
      ageCO2Plot.showUncertainties();
      $(this).removeClass("btn-info").text("Hide Error Bars")
    } else {
      ageCO2Plot.hideUncertainties();
      $(this).addClass("btn-info").text("Show Error Bars")
    }
  });
  $(document).on('click','#showHideHolocene',function(e){
    if ($(this).hasClass("btn-info")) {
      ageCO2Plot.zoomOutRecent();
      $(this).removeClass("btn-info")
    } else {
      ageCO2Plot.zoomRecent();
      $(this).addClass("btn-info")
    }
  }); //Bind button actions to the document
});
