class PhanerozoicPlot extends PlotGroup { // Overall container class for plots
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
      this.plt = new PhanerozoicPlotData(this.product_plot);
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
      };
      this.pco2Plot.makeBrush();
      this.initPlot(this.pco2Plot,this.plt.pco2Plot);
      this.timeline1 = new TimeLine(this,this.plt.timeline1);
      this.timeline1.addData();
      this.timeline1.zoomCallback = function() {
        self.pco2Plot.zoomX(false);
      };
    }
    showUncertainties() {
      self.pco2Plot.showUncertainties(true);
    }
    hideUncertainties() {
      self.pco2Plot.showUncertainties(false);
    }
    setAllDimensions() {
      this.width = self.plt.plotWidth;
      this.height = self.plt.plotHeight;
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
        img.src = "/images/co2pip_logo_full.png";
    }
    downloadImage(format) {
      //Redraw the line plots to exclude hidden data and then run download logic
      this.downloadImageFormat(
        format,
        "age_co2_plot",[],
        function(){}
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
