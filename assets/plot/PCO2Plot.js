class PCO2Plot extends PlotGroup { // Overall container class for plots
    constructor(container_id) {
      if (typeof container_id === "object") {
        super(container_id.container_id);
        this.container_id = container_id.container_id;
        this.product_plot = container_id.product_plot;
      } else {
        super(container_id);
        this.container_id = container_id;
        this.product_plot = false;
      }
      self = this;
      this.plt = new PCO2PlotData(this.product_plot);
      this.class_axis = this.plt.pco2Plot.classAxis;
      this.product = true;
      //PLOT DOMAINS
      this.setDomains(this.plt.domains);
      this.setAllDimensions(); //sets domains, width, height, plotDims
      this.createContainer();
      this.generatePlot();
    }
    initPlot(obj,data) {
      if (typeof data.xAxisLabel != "undefined")
        obj.xLabelHtml = data.xAxisLabel;
      if (typeof data.yAxisLabel != "undefined")
        obj.yLabelHtml = data.yAxisLabel;
      obj.addData();
      if (typeof data.references != "undefined")
        data.references.forEach(el => obj.addLabel(el.title,el.url,el.pos[0],el.pos[1],el.anchor));
    }
    generatePlot() {
      //LOGO
      this.createLogo();
      //LEGEND
      this.legend = new Legend(this,this.plt.legend);
      //MAIN PLOT
      this.pco2Plot = new ScatterPlot(this,this.plt.pco2Plot,this.legend, this.plt.pco2Plot.showArchive);
      this.pco2Plot.zoomCallback = function() {
        self.timeline1.zoomX(false);
        self.tempPlot1.zoomX(false);
        self.iceCorePlot.toggleScaleLinear(self.pco2Plot.linearScale,false);
        self.iceCorePlot.zoomY(true);
      };
      this.pco2Plot.makeBrush();
      this.initPlot(this.pco2Plot,this.plt.pco2Plot);
      this.pco2Plot.expandButton();
      //HANSEN TEMP PLOT to 70Ma
      this.tempPlot1 = new LinePlot(this,this.plt.tempPlot1);
      this.initPlot(this.tempPlot1,this.plt.tempPlot1);
      this.tempPlot1.zoomButton();
      this.tempPlot1.zoomCallback = function() {
        self.pco2Plot.zoomX(false);
        self.timeline1.zoomX(false);
        self.tempPlot2.zoomY(false);
      };
      this.timeline1 = new TimeLine(this,this.plt.timeline1);
      this.timeline1.addData();
      this.timeline1.zoomCallback = function() {
        self.pco2Plot.zoomX(false);
        self.tempPlot1.zoomX(false);
      };
      //HANSEN TEMP PLOT to 800ka
      this.tempPlot2 = new LinePlot(this,this.plt.tempPlot2);
      this.initPlot(this.tempPlot2,this.plt.tempPlot2);
      this.tempPlot2.zoomCallback = function() {
        self.iceCorePlot.zoomX(false);
        self.timeline2.zoomX(false);
        self.tempPlot1.zoomY(false);
      };
      this.timeline2 = new TimeLine(this,this.plt.timeline2);
      this.timeline2.addData();
      this.timeline2.zoomCallback = function() {
        self.tempPlot2.zoomX(false);
        self.iceCorePlot.zoomX(false);
      };
      //Bereiter CO2 PLOT to 800ka
      this.iceCorePlot = new LinePlot(this,this.plt.iceCorePlot);
      this.initPlot(this.iceCorePlot,this.plt.iceCorePlot);
      this.maunaLoaLabel();
    }
    maunaLoaLabel(){
      var dimensions = self.plt.iceCorePlot.dimensions;
      self.iceCorePlot.labelZoom = self.iceCorePlot.content.append("g").attr("class","zoom_label")
        .attr("transform",`translate(${dimensions.width - 12},${dimensions.height - 7})`)
        .on("click",function(){
            self.domains.domainX( dimensions.d_x, [2,0] );
            self.domains.domainY( dimensions.d_y, [0,1000] );
            self.domains.domainY( self.plt.tempPlot2.dimensions.d_y, [10,20] );
            self.iceCorePlot.zoom(true);
            self.tempPlot2.zoom(true);
        });
      self.iceCorePlot.zoomButton();
      self.iceCorePlot.zoomCallback = function() {
        self.iceCorePlot.labelZoom
          .transition().duration(1000)
          .attr("transform",`translate(${dimensions.width-12},${self.iceCorePlot.y(450)})`);
        self.tempPlot2.zoomX(false);
        self.timeline2.zoomX(false);
        self.pco2Plot.zoomY(false);
      };
      self.iceCorePlot.labelZoom.append("text")
        .html("<tspan x=\"0\" dy=\"-14\">Mauna Loa</tspan><tspan dy=\"6\" x=\"0\">atmospheric data</dy>");
      self.makeAnArrow(self.iceCorePlot.labelZoom,[[2, -14], [8, -10]]);
    }
    makeAnArrow(obj,coords) {
      var markerSize = 3;
      var markerColor = "#ff4400";
      self.container.append("svg:defs").append("svg:marker")
          .attr("id", "triangle")
          .attr('viewBox', [0, 0, markerSize, markerSize])
          .attr("refX", markerSize/2.0)
          .attr("refY", markerSize/2.0)
          .attr("markerWidth", markerSize)
          .attr("markerHeight", markerSize)
          .attr("orient", "auto-start-reverse")
          .append("path")
            .style("stroke", markerColor)
            .style("fill",markerColor)
            .attr("d", d3.line()([[0, 0], [0, markerSize], [markerSize, markerSize/2]]));

      obj.append("path").attr('d', d3.line()(coords)).attr("marker-end", "url(#triangle)");
    }
    showUncertainties() {
      self.pco2Plot.showUncertainties(true);
    }
    hideUncertainties() {
      self.pco2Plot.showUncertainties(false);
    }
    zoomRecent(d_x=[12,0]) {
      self.domains.domainX( self.tempPlot2.dimensions.d_x, d_x );
      self.tempPlot2.zoomX(false);
      self.timeline2.zoomX(false);
      self.iceCorePlot.zoomX(false);
    }
    zoomOutRecent() {
      self.domains.resetDomainX(self.tempPlot2.dimensions.d_x);
      self.tempPlot2.zoomX(false);
      self.timeline2.zoomX(false);
      self.iceCorePlot.zoomX(false);
    }
    expandCallback() {
      self.tempPlot1.content.classed('hidden',true);
      self.tempPlot2.content.classed('hidden',true);
      self.timeline1.content.classed('hidden',true);
      self.timeline2.content.classed('hidden',true);
      self.iceCorePlot.content.classed('hidden',true);
    }
    collapseCallback() {
      self.tempPlot1.content.classed('hidden',false);
      self.tempPlot2.content.classed('hidden',false);
      self.timeline1.content.classed('hidden',false);
      self.timeline2.content.classed('hidden',false);
      self.iceCorePlot.content.classed('hidden',false);
    }
    setAllDimensions() {
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
      this.width = col2X+plotDims[1][0]+lbl.yAxisW+padding;
      this.height = row2Y+plotDims[0][1]+lbl.xAxisH+padding;
      this.dims = {
        "pco2Plot"   : {"width":plotDims[0][0],"height":plotDims[0][1],"margins":{"left":col1X,"top":row2Y},"d_x":0,"d_y":0,
            "axes":{"xBottom":{"format":function(d){return d/1000;}},"yLeft":{"format":d3.format("d"),"formatLog":function(d){return (Number.isInteger(Math.log10(d))||Number.isInteger(Math.log10(d*2)))?d:"";}} }},
        "tempPlot1"  : {"width":plotDims[0][0],"height":plotDims[1][1],"margins":{"left":col1X,"top":row1Y},"d_x":0,"d_y":1,
            "axes":{"yLeft":{"ticks":6,"format":d3.format("d")},"yRight":{"ticks":6} }},
        "timeline1"  : {"width":plotDims[0][0],"height":plotDims[2][1],"margins":{"left":col1X,"top":tlY  },"d_x":0,"d_y":0,
            "axes":{"yRight":{"ticks":0},"yLeft":{"ticks":0},"xBottom":{"ticks":0},"xTop":{"ticks":0} }},
        "tempPlot2"  : {"width":plotDims[1][0],"height":plotDims[1][1],"margins":{"left":col2X,"top":row1Y},"d_x":1,"d_y":1,
            "axes":{"yRight":{"ticks":6,"format":d3.format("d")},"yLeft":{"ticks":6},"xBottom":{"ticks":5},"xTop":{"ticks":5} }},
        "timeline2"  : {"width":plotDims[1][0],"height":plotDims[2][1],"margins":{"left":col2X,"top":tlY  },"d_x":1,"d_y":0,
            "axes":{"yRight":{"ticks":0},"yLeft":{"ticks":0},"xBottom":{"ticks":0},"xTop":{"ticks":0} }},
        "iceCorePlot": {"width":plotDims[1][0],"height":plotDims[0][1],"margins":{"left":col2X,"top":row2Y},"d_x":1,"d_y":0,
            "axes":{"xBottom":{"format":function(d){return d;},"ticks":5},"yRight":{"format":d3.format("d"),"formatLog":function(d){return (Number.isInteger(Math.log10(d))||Number.isInteger(Math.log10(d*2)))?d:"";}},"xTop":{"ticks":5} }},
        "legend"     : {"width":plotDims[2][0],"height":plotDims[0][1],"margins":{"left":col0X,"top":row2Y}},
        "logo"       : {"width":plotDims[2][0],"height":plotDims[1][1],"margins":{"left":col0X,"top":row1Y}},
        "expanded"   : {
          "width":plotDims[0][0]+padding+plotDims[1][0],
          "height":plotDims[0][1]+padding+plotDims[2][1]+plotDims[1][1],
          "margins":{"left":col1X,"top":tlY}}
      };
    }
    createLogo() { // Creates the logo as a data URL
        var canvas = document.createElement("canvas");
        canvas.width = this.plt.logo.imgWidth; // Manually set for required resolution
        canvas.height = this.plt.logo.imgHeight;
        this.logo = this.container.append("svg:image")
            .attr("id","logo").attr("class","plot_logo")
            .attr("x",this.plt.logo.margins.left) // Manually determined values - tune as needed
            .attr("y",this.plt.logo.margins.top)
            .attr("height",this.plt.logo.height)
            .attr("width",this.plt.logo.width);
        var img = new Image();
        img.onload = ()=> {
            canvas.getContext("2d").drawImage(img,0,0);
            this.logo.attr("xlink:xlink:href",canvas.toDataURL()); // Add image as data URL so that it exports properly
        };
        img.src = "/images/logo.svg";
    }
    downloadImage(format) {
      //Redraw the line plots to exclude hidden data and then run download logic
      this.downloadImageFormat(
        format,
        "age_co2_plot",[
          self.tempPlot1.staticDraw(),
          self.tempPlot2.staticDraw(),
          self.iceCorePlot.staticDraw()
        ],
        function(){
          self.tempPlot1.redraw();
          self.tempPlot2.redraw();
          self.iceCorePlot.redraw();
        }
      );
    }
    downloadData(format) {
      var self = this;
      var dataSrc = (self.pco2Plot.showArchive)?self.plt.pco2Plot.dataSrcArchive:self.plt.pco2Plot.dataSrcProduct;
      d3.json(dataSrc)
        .then(function(data){
          var d_x = self.pco2Plot.x.domain();
          var d_y = self.pco2Plot.y.domain();
          var entries = self.pco2Plot.legend.entries;
          var filtered_data = data.filter(function(d){
            return ((d.age!==null && d.co2!==null) && //age and co2 values are defined
              (
                ("proxy_category" in d && !self.pco2Plot.showArchive && self.pco2Plot.categories.includes(parseInt(d.proxy_category))) || 
                (!("proxy_category" in d) && self.pco2Plot.showArchive)
              ) &&
              ( d.age<=d_x[0] && d.age>=d_x[1] && d.co2<=d_y[1] && d.co2>=d_y[0] ) && //age and co2 values are in current dynamic_plot domain
              entries[d.proxy].draw); //data proxy is switched on in the legend
          });
          self.downloadFormatted(filtered_data,format);
        });
    }
    downloadFormatted(data,format){
      if (format === 'csv') {
        var out = [];
        this.downloadFunction("data:text/csv;charset=utf-8,"+encodeURIComponent("\uFEFF"+$.csv.fromObjects(data)),"age_co2_plot_data.csv");
      } else {
        this.downloadFunction("data:text/json,"+encodeURIComponent(JSON.stringify(data,null,4)),"age_co2_plot_data.json");
      }
    }
}
