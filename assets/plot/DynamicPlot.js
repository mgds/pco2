/**
* The dynamic subplot class
*/
class DynamicPlot { // Container class for the dynamic subplot

  constructor(parent,dataObj,legend) {
    var self = this;
    this.data=[];
    this.brush=null;
    this.xLabelHtml="";
    this.yLabelHtml="";
    this.parent = parent;
    this.domains = parent.domains;
    this.expandCallback = parent.expandCallback;
    this.collapseCallback = parent.collapseCallback;
    this.expanded_dimensions = parent.plt.expanded;
    this.initial_dimensions = dataObj.dimensions;
    this.dimensions = PlotUtils.deepCopy(this.initial_dimensions);
    this.legend = legend;
    this.linearScale = true;
    if (this.legend!==null) {
      this.legend.clickCallback = function(){self.redraw();};
    }
    this.content = parent.container.append("g")
        .attr("id",dataObj.container_id)
        .classed("dynamic_plot",true)
        .attr("transform",`translate(${this.dimensions.margins.left},${this.dimensions.margins.top})`);
    this.content.append("rect").classed("background",true)
        .attr("width",this.dimensions.width).attr("height",this.dimensions.height);
    this.clip_id = `clip_${dataObj.container_id}`;
    this.clip = this.parent.container.append("defs").append("svg:clipPath")
       .attr("id", this.clip_id)
       .append("svg:rect")
       .attr("width", this.dimensions.width )
       .attr("height", this.dimensions.height )
       .attr("x", 0)
       .attr("y", 0);
    this.data_files = dataObj.plotSrc;
  }
  expand() {
    this.dimensions = PlotUtils.deepCopy(this.expanded_dimensions);
    this.expButton.remove();
    this.resizePlot();
    this.collapseButton();
    this.expandCallback();
  }
  collapse() {
    this.dimensions = PlotUtils.deepCopy(this.initial_dimensions);
    this.expButton.remove();
    this.resizePlot();
    this.expandButton();
    this.collapseCallback();
  }
  resizePlot() {
    this.content
      .attr("transform",`translate(${this.dimensions.margins.left},${this.dimensions.margins.top})`)
      .attr("width",this.dimensions.width)
      .attr("height",this.dimensions.height);
    this.clip
      .attr("width", this.dimensions.width )
      .attr("height", this.dimensions.height )
      .attr("x", 0)
      .attr("y", 0);
    this.x.range([0,this.dimensions.width]);
    this.y.range([this.dimensions.height,0]);
    this.x_axis_bottom.attr("transform", `translate(0,${this.dimensions.height})`);
    this.y_axis_right.attr("transform",`translate(${this.dimensions.width},0)`);
    if (this.brush) this.makeBrush();
    if (this.bg) this.zoomButton();
    this.x_label.transition().duration(1000).attr("transform",`translate(${this.dimensions.width/2},${this.dimensions.height+20})`);
    this.y_label.transition().duration(1000).attr("transform",`translate(-25,${this.dimensions.height/2}) rotate(-90)`);
    this.redraw();
  }
  zoomButton(x=5,y=5) {
    var self = this;
    if (this.bg) this.bg.remove();
    var zoomOut = function(){ self.zoomOut(); };
    this.bg = this.content.append("g").classed("zoom_button",true)
        .attr("transform",`translate(${x},${y})`)
        .on("click",zoomOut);
    this.bg.append("rect").attr("width",12).attr("height",12).attr("rx",2);
    this.bg.append("text").attr("x",6).attr("y",10)
        .attr("text-anchor","middle")
        .html("&#xf010;");
  }
  expandButton() {
    var self = this;
    var expand = function(){ self.expand(); };
    this.expButton = this.content.append("svg").classed("exp_button",true)
        .attr("x",this.dimensions.width - 15).attr("y",5).attr("width",10).attr("height",10)
        .on("click",expand);
    this.expButton.append("text").attr("x","50%").attr("y","50%")
        .attr("text-anchor","middle").attr("dominant-baseline","middle")
        .html("&#xf31e;");
  }
  collapseButton() {
    var self = this;
    var collapse = function(){ self.collapse(); };
    this.expButton = this.content.append("svg").classed("exp_button",true)
        .attr("x",this.dimensions.width - 15).attr("y",5).attr("width",10).attr("height",10)
        .on("click",collapse);
    this.expButton.append("text").attr("x","50%").attr("y","50%")
        .attr("text-anchor","middle").attr("dominant-baseline","middle")
        .html("&#xf78c;");
  }
  makePlot() {
    this.draw();
    if (this.brush) this.zoomButton();
  }
  // Data
  addData(callbackf=false) { // Promise to retrieve data and call function to draw plot
    var self = this;
    Promise.all(this.data_files.map(x=>d3.json(x)))
      .then(function(data){self.data = data;})
      .then(function(){self.makePlot();})
      .then(function(){if (callbackf) callbackf()});

  }
  // Brush
  brushFunction() { // The callback for the zoom brush
    var extent = d3.event.selection;
    if (!extent) return; // If there's no extent do nothing
    var d_x = [this.x.invert(extent[0][0]),this.x.invert(extent[1][0])];
    d_x = d_x.sort((a, b) => a - b).reverse();
    var d_y = [this.y.invert(extent[0][1]),this.y.invert(extent[1][1])];
    d_y = d_y.sort((a, b) => a - b);
    this.domains.domainX( this.initial_dimensions.d_x, d_x );
    this.domains.domainY( this.initial_dimensions.d_y, d_y );
    this.content.select(".brush").call(this.brush.move, null);
    this.zoom();
  }
  makeBrush() { // Creates a brush for zooming
    var self = this;
    this.zoomControl = true;
    if (this.brush_container) this.brush_container.remove();
    this.brush_container = null;
    this.brush = null;
    this.brush = d3.brush()
        .extent([[0,0],[this.dimensions.width,this.dimensions.height]])
        .on("end",function(){self.brushFunction();});
    this.brush_container = this.content.append("g").attr("id","brush_container")
        .attr("class", "brush")
        .call(this.brush);
  }
  zoom(runCallback=true) {
    this.x.domain(this.domains.domainX(this.dimensions.d_x));
    this.y.domain(this.yDomainScaled());
    this.zoomFunction(runCallback);
  }
  zoomX(runCallback=true) {
    this.x.domain(this.domains.domainX(this.dimensions.d_x));
    this.zoomFunction(runCallback);
  }
  zoomY(runCallback=true) {
    this.y.domain(this.yDomainScaled());
    this.zoomFunction(runCallback);
  }
  zoomed() { //Current domain not equal to initial domain
    return this.domains.zoomed(this.dimensions.d_x,this.dimensions.d_y,this.linearScale);
  }
  zoomFunction(runCallback){
    var self = this;
    this.redraw();
    Promise.all([self.content.classed("zoomed",self.zoomed())]).then(function(){
      if (runCallback) self.zoomCallback();
    });
  }
  zoomCallback(){//this.content.classed("zoomed",this.zoomed());
  }
  zoomOut(runCallback=true) { // Callback for double click
    this.domains.resetDomainX(this.dimensions.d_x);
    this.domains.resetDomainY(this.dimensions.d_y);
    this.zoom(runCallback);
  }
  draw() {}
  redraw() {}
  createXAxis() { // Creates the upper and lower axes
      this.newXAxis();
      this.x_axis_bottom = this.content.append("g")
        .attr("transform", `translate(0,${this.dimensions.height})`)
        .classed("axis axis_bottom",true)
        .call(this.xAxisBottom());
      this.x_axis_top = this.content.append("g")
          .attr("transform", "translate(0,0)")
          .classed("axis axis_top",true)
          .call(this.xAxisTop());
      this.x_label = this.content.append("text")
          .attr("transform",`translate(${this.dimensions.width/2},${this.dimensions.height+20})`)
          .classed("label_text",true)
          .html(this.xLabelHtml);
  }
  newXAxis() {
    this.x = d3.scaleLinear()
        .domain(this.domains.domainX(this.dimensions.d_x))
        .range([0,this.dimensions.width]);
  }
  createYAxis() { // Creates the left and right axes
      this.newYAxis();
      this.y_axis_left = this.content.append("g")
          .attr("transform", "translate(0,0)")
          .classed("axis_left axis",true)
          .call(this.yAxisLeft());
      this.y_axis_right = this.content.append("g")
          .attr("transform",`translate(${this.dimensions.width},0)`)
          .classed("axis_right axis",true)
          .call(this.yAxisRight());
      this.y_label = this.content.append("text")
        .attr("transform",`translate(-25,${this.dimensions.height/2}) rotate(-90)`)
        .classed("label_text",true)
        .html(this.yLabelHtml);
  }
  newYAxis() {
    this.y = (this.linearScale) ? d3.scaleLinear() : d3.scaleLog();
    this.y
        .domain(this.yDomainScaled())
        .range([this.dimensions.height, 0]);
  }
  yDomainScaled() {
    var domain = this.domains.domainY(this.dimensions.d_y);
    domain[0] = (this.linearScale)?domain[0]:Math.max(domain[0],10);
    return domain;
  }
  toggleScaleLinear(scaleLinear,zoom=true) {
    if (this.linearScale!=scaleLinear) {
      this.linearScale = scaleLinear;
      this.newYAxis();
      if (zoom) this.zoomY(true);
    }
  }
  xAxisBottom() { return this.axisFormat(d3.axisBottom(this.x).tickSize(-3),this.initial_dimensions.axes.xBottom); }
  xAxisTop()    { return this.axisFormat(d3.axisTop(this.x).tickSize(-3),this.initial_dimensions.axes.xTop); }
  yAxisLeft()   { return this.axisFormat(d3.axisLeft(this.y).tickSize(-3), this.initial_dimensions.axes.yLeft); }
  yAxisRight()  { return this.axisFormat(d3.axisRight(this.y).tickSize(-3), this.initial_dimensions.axes.yRight); }
  axisFormat(axis,opt)   {
    var options = {"format":"","ticks":null,"formatLog":null};
    if (typeof opt != 'undefined') Object.entries(opt).forEach((v)=>{ options[v[0]]=v[1]; });
    if (options.ticks) axis.ticks(options.ticks);
    return axis.tickFormat((this.linearScale||options.formatLog == null)?options.format:options.formatLog);
  }
  addLabel(title,url,x,y,textAnchor='start') {
    this.content.append("g")
      .attr("transform",`translate(${x},${y})`)
      .append("text").attr("class","reference").attr("text-anchor",textAnchor)
      .text(title)
      .on("click",function(d){
        window.open(url,"_blank");
      });
  }
}
