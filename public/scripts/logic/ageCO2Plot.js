class PCO2Plot { // Overall container class for plots
    constructor(container_id) {
      var self = this;
      this.plot_file = "data/Paleo-CO2_Plot.json";
      this.archive_file = "data/Paleo-CO2_Archive.json";
      this.temp_file = "data/temp.json";
      this.temp_modern_file = "data/tempModern.json";
      this.iceCore_file = "data/co2bereiter.json";
      this.maunaLoa_file = "data/co2MaunaLoa.json";
      this.timeline_file = "data/geologicTime.json";
      this.class_axis = {
        "Phytoplankton":"phytoplankton",
        "Boron Proxies":"boron",
        "Stomatal Frequencies":"stomatal",
        "Leaf Gas Exchange":"leafgas",
        "Liverworts":"liverworts",
        "C3 Plants":"c3plants",
        "Paleosols":"paleosols",
        "Nahcolite":"nahcolite"
      };
      //PLOT DOMAINS
      this.domains = new DomainControl([
        [[70000,0],[0,10000]], //pco2 plot units kiloAnnum and ppm
        [[800,0],[5,30]] //temperature plot 2 units kiloAnnum and degC (other plots based on these dimensions)
      ]);
      //External and inter-plot spacing in pixels
      this.padding = 8;
      //Label spacing in pixels
      this.lbl = {"xAxisH":20,"yAxisW":25,"font":8};
      //Plot sizes in pixels
      this.plotDims = [
        [267,150], //pco2 plot 16:9 aspect
        [100,75], //temperature plot 2 Other plots based on these dims
        [120,10] //row0width and timelineHeight
      ];

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
        self.timeline1.zoomX(false);
        self.tempPlot1.zoomX(false);
        self.iceCorePlot.toggleScaleLinear(self.pco2Plot.linearScale,false);
        self.iceCorePlot.zoomY(true);
      };
      this.pco2Plot.makeBrush();
      this.pco2Plot.addData();
      this.pco2Plot.expandButton();
      //HANSEN TEMP PLOT to 70Ma
      this.tempPlot1 = new LinePlot(this,[this.temp_file,this.temp_modern_file],'tempPlot1', this.dims.tempPlot1);
      this.tempPlot1.yLabelHtml = "<tspan x=\"0\">Surface</tspan><tspan x=\"0\" dy=\"10\">Temperature (&deg;C)</tspan>";
      this.tempPlot1.addData();
      this.tempPlot1.content.append("g")
        .attr("transform",`translate(6,${this.dims.tempPlot1.height-6})`)
        .append("text").attr("class","reference")
        .text("Hansen et al. (2013)")
        .on("click",function(d){
          window.open("https://doi.org/10.1098/rsta.2012.0294","_blank");
        });
      this.tempPlot1.zoomButton();
      this.tempPlot1.zoomCallback = function() {
        self.pco2Plot.zoomX(false);
        self.timeline1.zoomX(false);
        self.tempPlot2.zoomY(false);
      };
      this.timeline1 = new TimeLine(this,[this.timeline_file],'timeline1',this.dims.timeline1);
      this.timeline1.addData();
      this.timeline1.zoomCallback = function() {
        self.pco2Plot.zoomX(false);
        self.tempPlot1.zoomX(false);
      };
      //HANSEN TEMP PLOT to 800ka
      this.tempPlot2 = new LinePlot(this,[this.temp_file,this.temp_modern_file],'tempPlot2', this.dims.tempPlot2);
      this.tempPlot2.addData();
      this.tempPlot2.content.append("g")
        .attr("transform",`translate(${this.dims.tempPlot2.width-6},${this.dims.tempPlot1.height-6})`)
        .append("text").attr("class","reference")
        .attr("text-anchor","end")
        .text("Hansen et al. (2013)")
        .on("click",function(d){
          window.open("https://doi.org/10.1098/rsta.2012.0294","_blank");
        });
      this.tempPlot2.zoomButton();
      this.tempPlot2.zoomCallback = function() {
        self.iceCorePlot.zoomX(false);
        self.timeline2.zoomX(false);
        self.tempPlot1.zoomY(false);
      };
      this.timeline2 = new TimeLine(this,[this.timeline_file],'timeline2',this.dims.timeline2);
      this.timeline2.addData();
      this.timeline2.zoomCallback = function() {
        self.tempPlot2.zoomX(false);
        self.iceCorePlot.zoomX(false);
      };
      //Bereiter CO2 PLOT to 800ka
      this.iceCorePlot = new LinePlot(this,[this.iceCore_file,this.maunaLoa_file],'tempPlot3', this.dims.iceCorePlot);
      this.iceCorePlot.xLabelHtml = "Age (thousands of years ago)";
      this.iceCorePlot.addData();
      this.iceCorePlot.content.append("g")
        .attr("transform",`translate(${this.dims.iceCorePlot.width-6},12)`)
        .append("text").attr("class","reference").attr("text-anchor","end")
        .text("Bereiter et al. (2015)")
        .on("click",function(d){
          window.open("https://doi.org/10.1002/2014GL061957","_blank");
        });
      this.iceCorePlot.content.append("g")
        .attr("transform",`translate(${this.dims.iceCorePlot.width-6},20)`)
        .append("text").attr("class","reference").attr("text-anchor","end")
        .text("Dlugokencky et al. (2020)")
        .on("click",function(d){
          window.open("https://doi.org/10.15138/wkgj-f215","_blank");
        });
      this.iceCorePlot.labelZoom = this.iceCorePlot.content.append("g").attr("class","zoom_label")
        .attr("transform",`translate(${this.dims.iceCorePlot.width-12},${this.dims.iceCorePlot.height-7})`)
        .on("click",function(){
            self.domains.domainX( self.dims.iceCorePlot.d_x, [2,0] );
            self.domains.domainY( self.dims.iceCorePlot.d_y, [0,1000] );
            self.domains.domainY( self.dims.tempPlot2.d_y, [10,20] );
            self.iceCorePlot.zoom(true);
            self.tempPlot2.zoom(true);
        });
      this.iceCorePlot.zoomButton();
      this.iceCorePlot.zoomCallback = function() {
        console.log(self.iceCorePlot.y(500));
        self.iceCorePlot.labelZoom
          .transition().duration(1000)
          .attr("transform",`translate(${self.dims.iceCorePlot.width-12},${self.iceCorePlot.y(450)})`)
        self.tempPlot2.zoomX(false);
        self.timeline2.zoomX(false);
        self.pco2Plot.zoomY(false);
      };
      this.iceCorePlot.labelZoom.append("text")
        .html("<tspan x=\"0\" dy=\"-6\">Mauna Loa</tspan><tspan dy=\"6\" x=\"0\">atmospheric data</dy>");
      var markerSize = 3;
      this.container.append("svg:defs").append("svg:marker").attr("id", "triangle")
          .attr('viewBox', [0, 0, markerSize, markerSize])
          .attr("refX", 1.5).attr("refY", markerSize/2)
          .attr("markerWidth", markerSize).attr("markerHeight", markerSize)
          .attr("orient", "auto-start-reverse")
          .append("path").style("stroke", "#ff4400").style("fill","#ff4400")
          .attr("d", d3.line()([[0, 0], [0, markerSize], [markerSize, markerSize/2]]));
      this.iceCorePlot.labelZoom.append("path")
        .attr('d', d3.line()([[2, -6], [8, -2]]))
        .attr("marker-end", "url(#triangle)");
    }
    showUncertainties() {
      this.pco2Plot.showUncertainties(true);
    }
    hideUncertainties() {
      this.pco2Plot.showUncertainties(false);
    }
    zoomRecent(d_x=[12,0]) {
      this.domains.domainX( this.tempPlot2.dimensions.d_x, d_x );
      this.tempPlot2.zoomX(false);
      this.timeline2.zoomX(false);
      this.iceCorePlot.zoomX(false);
    }
    zoomOutRecent() {
      this.domains.resetDomainX(this.tempPlot2.dimensions.d_x);
      this.tempPlot2.zoomX(false);
      this.timeline2.zoomX(false);
      this.iceCorePlot.zoomX(false);
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
      var col2X = col1X+this.plotDims[0][0]+this.padding;
      var tlY = this.padding;
      var row1Y = tlY+this.plotDims[2][1];
      var row2Y = row1Y+this.plotDims[1][1]+this.padding;
      this.width = col2X+this.plotDims[1][0]+this.lbl.yAxisW+this.padding;
      this.height = row2Y+this.plotDims[0][1]+this.lbl.xAxisH+this.padding;
      this.dims = {
        "pco2Plot"   : {"width":this.plotDims[0][0],"height":this.plotDims[0][1],"margins":{"left":col1X,"top":row2Y},"d_x":0,"d_y":0,
            "axes":{"xBottom":{"format":function(d){return d/1000;}},"yLeft":{"format":d3.format("d"),"formatLog":function(d){return (Number.isInteger(Math.log10(d))||Number.isInteger(Math.log10(d*2)))?d:"";}} }},
        "tempPlot1"  : {"width":this.plotDims[0][0],"height":this.plotDims[1][1],"margins":{"left":col1X,"top":row1Y},"d_x":0,"d_y":1,
            "axes":{"yLeft":{"ticks":6,"format":d3.format("d")},"yRight":{"ticks":6} }},
        "timeline1"  : {"width":this.plotDims[0][0],"height":this.plotDims[2][1],"margins":{"left":col1X,"top":tlY  },"d_x":0,"d_y":0,
            "axes":{"yRight":{"ticks":0},"yLeft":{"ticks":0},"xBottom":{"ticks":0},"xTop":{"ticks":0} }},
        "tempPlot2"  : {"width":this.plotDims[1][0],"height":this.plotDims[1][1],"margins":{"left":col2X,"top":row1Y},"d_x":1,"d_y":1,
            "axes":{"yRight":{"ticks":6,"format":d3.format("d")},"yLeft":{"ticks":6},"xBottom":{"ticks":5},"xTop":{"ticks":5} }},
        "timeline2"  : {"width":this.plotDims[1][0],"height":this.plotDims[2][1],"margins":{"left":col2X,"top":tlY  },"d_x":1,"d_y":0,
            "axes":{"yRight":{"ticks":0},"yLeft":{"ticks":0},"xBottom":{"ticks":0},"xTop":{"ticks":0} }},
        "iceCorePlot": {"width":this.plotDims[1][0],"height":this.plotDims[0][1],"margins":{"left":col2X,"top":row2Y},"d_x":1,"d_y":0,
            "axes":{"xBottom":{"format":function(d){return d;},"ticks":5},"yRight":{"format":d3.format("d"),"formatLog":function(d){return (Number.isInteger(Math.log10(d))||Number.isInteger(Math.log10(d*2)))?d:"";}},"xTop":{"ticks":5} }},
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
      this.container.attr("width",divWidth).attr("height",divHeight);
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
            .attr("width",this.dims.logo.height);
        var img = new Image();
        img.onload = ()=> {
            context.drawImage(img,0,0);
            this.logo.attr("xlink:xlink:href",canvas.toDataURL()); // Add image as data URL so that it exports properly
        };
        img.src = "/images/logo.svg";
    }
    downloadImage(format) {
      var self = this;
      //Redraw the line plots to exclude hidden data and then run download logic
      Promise.all([
        self.tempPlot1.staticDraw(),
        self.tempPlot2.staticDraw(),
        self.iceCorePlot.staticDraw()
      ]).then(function(){
        var svg = self.container.node();
        var copy = svg.cloneNode(true);
        if (format === "svg") {
          PlotUtils.copyStylesInline(copy, svg,['hidden','zoom_button','exp_button','brush','zoom_label']);
          var svg_URL = (new XMLSerializer()).serializeToString(copy);
          var image_url = 'data:image/svg+xml; charset=utf8,'+encodeURIComponent("<?xml version=\"1.0\" encoding=\"UTF-8\" standalone=\"no\"?>\n"+svg_URL);
          self.downloadFunction(image_url,"age_co2_plot.svg");
        } else {
          PlotUtils.copyStylesInline(copy, svg,["zoom_button","hidden",'exp_button','brush','zoom_label']);
          var image = new Image();
          image.onload = function(){
            var canvas = document.createElement("canvas");
            canvas.width = 5*this.width; // Controls the resolution of the exported plot
            canvas.height = 5*this.height; // Controls the resolution of the exported plot
            var context = canvas.getContext("2d");
            context.scale(5,5); // Downscales the plot back to regular size (i.e. draws the SVG at high resolution and then exports at a reasonable raster size)
            context.drawImage(this,0,0);
            self.downloadFunction(canvas.toDataURL("png"),"age_co2_plot.png");
          };
          image.src = 'data:image/svg+xml; charset=utf8, '+encodeURIComponent((new XMLSerializer()).serializeToString(copy));
        }
      })
      .then(function(){
        self.tempPlot1.redraw();
        self.tempPlot2.redraw();
        self.iceCorePlot.redraw();
      });
    }
    downloadFunction(url,file_name) {
      var downloadable_element = document.createElement('a'); // Create a download element
      downloadable_element.href = url;
      downloadable_element.download = file_name;
      document.body.appendChild(downloadable_element);
      downloadable_element.click();
      document.body.removeChild(downloadable_element);
    }
    downloadData(format) {
      var self = this;
      d3.json(this.archive_file)
        .then(function(data){
          var d_x = self.pco2Plot.x.domain();
          var d_y = self.pco2Plot.y.domain();
          var entries = self.pco2Plot.legend.entries;
          var filtered_data = data.filter(function(d){
            console.log(d.proxy);
            return ((d.age!==null && d.co2!==null) &&//age and co2 values are defined
              ( d.age<=d_x[0] && d.age>=d_x[1] && d.co2<=d_y[1] && d.co2>=d_y[0] ) && //age and co2 values are in current dynamic_plot domain
              entries[d.proxy].draw); //data proxy is switched on in the legend
          });
          self.downloadFormatted(filtered_data,format);
        });
    }
    downloadFormatted(data,format){
      if (format === 'csv') {
        var out = [];
        out.push(JSON.stringify(Object.keys(data[0])).replace(/(^\[)|(\]$)/mg, ''));
        data.forEach(function(d){
          console.log(JSON.stringify(Object.values(d)).replace(/(^\[)|(\]$)/mg, ''));
          out.push(JSON.stringify(Object.values(d)).replace(/(^\[)|(\]$)/mg, '').replace(/,null/mg, ',').replace('\\u00a0',''));
        });
        this.downloadFunction("data:text/csv;charset=utf-8,"+encodeURIComponent("\uFEFF"+unescape(out.join("\n"))),"age_co2_plot_data.csv");
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
      $(this).removeClass("btn-info").text("Hide Error Bars");
    } else {
      ageCO2Plot.hideUncertainties();
      $(this).addClass("btn-info").text("Show Error Bars");
    }
  });
  $(document).on('click','#showHideHolocene',function(e){
    if ($(this).hasClass("btn-info")) {
      ageCO2Plot.zoomOutRecent();
      $(this).removeClass("btn-info");
    } else {
      ageCO2Plot.zoomRecent();
      $(this).addClass("btn-info");
    }
  }); //Bind button actions to the document
});
