class PlotGroup {
  constructor(container_id) {
    if (new.target === PlotGroup) {
      throw new TypeError("Cannot construct abstract PlotGroup instances directly.");
    }
    this.content = d3.select(container_id);
    this.width = 0;
    this.height = 0;
    this.dims = {};
    this.class_axis = {};
  }
  generatePlot() {}
  /**
  * Must be defined for subclasses
  */
  expandCallback() {}
  /**
  * Must be defined for subclasses
  */
  collapseCallback() {}
  setDomains(domains) {
    this.domains = new DomainControl(domains);
  }
  createContainer() {
    this.container = this.content.append("svg")
        .attr("id","container_svg")
        .attr("viewBox",`0 0 ${this.width} ${this.height}`);
    this.container.append("rect").classed("background",true)
        .attr("width",this.width).attr("height",this.height);
    this.setSizeDynamic(); //sets size of plot
    window.addEventListener('resize', function(){ self.setSizeDynamic(); });
  }
  setSizeDynamic() {
    var self = this;
    var divWidth = this.content.style('width').slice(0, -2) - 6;
    var divHeight = Math.round(divWidth/(this.width/this.height));
    this.container.attr("width",divWidth).attr("height",divHeight);
  }
  downloadImageFormat(format,fname_root,promises,callback) {
    var self = this;
    //Redraw the line plots to exclude hidden data and then run download logic
    Promise.all(promises).then(function(){
      var svg = self.container.node();
      var copy = svg.cloneNode(true);
      if (format === "svg") {
        PlotUtils.copyStylesInline(copy, svg,['hidden','zoom_button','exp_button','brush','zoom_label']);
        var svg_URL = (new XMLSerializer()).serializeToString(copy);
        var image_url = 'data:image/svg+xml; charset=utf8,'+encodeURIComponent("<?xml version=\"1.0\" encoding=\"UTF-8\" standalone=\"no\"?>\n"+svg_URL);
        self.downloadFunction(image_url,`${fname_root}.svg`);
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
          self.downloadFunction(canvas.toDataURL("png"),`${fname_root}.png`);
        };
        image.src = 'data:image/svg+xml; charset=utf8, '+encodeURIComponent((new XMLSerializer()).serializeToString(copy));
      }
    })
    .then(callback());
  }
  downloadFunction(url,file_name) {
    var downloadable_element = document.createElement('a'); // Create a download element
    downloadable_element.href = url;
    downloadable_element.download = file_name;
    document.body.appendChild(downloadable_element);
    downloadable_element.click();
    document.body.removeChild(downloadable_element);
  }
}
