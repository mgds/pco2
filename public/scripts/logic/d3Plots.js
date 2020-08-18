class PlotUtils {
  static copyStylesInline(destinationNode, sourceNode,removeClass=[]) {
    var styles = ["overflow","stroke","stroke-width","fill","font-family","opacity","font-size","font-weight","text-anchor","baseline-shift"];
     var containerElements = ["svg","g"];
     for (var cd = destinationNode.childNodes.length - 1; cd >= 0; cd--) {
     //for (var cd = 0; destinationNode < destinationNode.childNodes.length; cd++) {
        var child = destinationNode.childNodes[cd];
        if ( removeClass.some(function(r){return ((` ${child.className.baseVal} `).replace(/[\n\t]/g, " ").indexOf(` ${r} `) > -1 );}) ) {
          child.remove();
          continue;
        }
        if (containerElements.indexOf(child.tagName) != -1) {
            this.copyStylesInline(child, sourceNode.childNodes[cd],removeClass);
            continue;
        }
        var style = sourceNode.childNodes[cd].currentStyle || window.getComputedStyle(sourceNode.childNodes[cd]);
        if (style == "undefined" || style == null) continue;
        for (var st = 0; st < style.length; st++){
         if (styles.indexOf(style[st]) != -1)
            child.setAttribute(style[st], style.getPropertyValue(style[st]));
        }
     }
  }
  static deepCopy(inObject) {
    if (typeof inObject !== "object" || inObject === null) {
      return inObject;
    }
    var outObject = Array.isArray(inObject)?[]:{};
    for (var key in inObject) {
      outObject[key] = this.deepCopy(inObject[key]);
    }
    return outObject;
  }
}

class Legend { // A class for the legend, which inherits a container structure
  constructor(parent,dimensions) {
    var self = this;
    this.parent = parent;
    this.dimensions = dimensions;
    this.content = this.parent.container.append("g")
      .attr("id","legend_container")
      .attr("transform",`translate(${dimensions.margins.left},${dimensions.margins.top})`);
    this.entries = {}; this.entry_array = [];
    for (var name in this.parent.class_axis) {
      this.entry_array.push({"name":name,"class":this.parent.class_axis[name],"draw":true});
    }
    this.entry_array.forEach(function(d,i){self.entries[d.name]=self.entry_array[i];});
    this.spacing = 16; // Manually defined
    this.fontSize = 10; //For x,y calculation. Change in CSS too
    this.symbolRadius = 3;
    this.hide = false; // Defines whether to hide unused entries
    this.draw();
  }
  // Display methods
  draw() { // Creates the elements of the legend
    var self = this;
    var radius = 3;
    // Bind the data and create a series of circles
    this.rows = this.content.selectAll("g")
      .data(this.entry_array).enter().append("g").attr("class","legend_row")
      .attr("transform",function(d,i){return `translate(0,${i*self.spacing+self.spacing/2})`;})
      .on("click",(d)=>this.itemClicked(d));
    this.rows.append("circle")
        .attr("cx",this.symbolRadius)
        .attr("cy",0)
        .attr("r",this.symbolRadius) // Manually defined radius
        .attr("class",function(d){return d.class;});
    this.rows.append("text")
        .text(function(d){return d.name;})
        .attr("dx",this.symbolRadius*3)//symbol diameter of spacing
        .attr("dy", this.fontSize/2 - this.symbolRadius/2 ); //11 is font size
  }
  itemClicked(item) {
      item.draw = !item.draw; // Changes the draw flag from on to off or vice versa
      this.rows.classed("inactive",function(d){return !d.draw;});
      this.clickCallback();
  }
  clickCallback() { }
}

class DomainControl {
  constructor(domains) {
    this.domains = domains;
    this.current_domains = PlotUtils.deepCopy(domains);
  }
  domainX(idx,domain_x=null) {
    if (domain_x!==null) this.current_domains[idx][0] = domain_x;
    return this.current_domains[idx][0];
  }
  domainY(idx,domain_y=null) {
    if (domain_y!==null) this.current_domains[idx][1] = domain_y;
    return this.current_domains[idx][1];
  }
  initialDomainX(idx) {
    return this.domains[idx][0];
  }
  initialDomainY(idx) {
    return this.domains[idx][1];
  }
  resetDomainX(idx) {
    return this.domainX(idx,this.domains[idx][0]);
  }
  resetDomainY(idx) {
    return this.domainY(idx,this.domains[idx][1]);
  }
  zoomed(x_idx,y_idx,scaleLinear=true) { //Current domain not equal to initial domain
    var iy = this.initialDomainY(y_idx);
    iy[0]=scaleLinear?iy[0]:Math.max(iy[0],10);
    return (
      (JSON.stringify(this.initialDomainX(x_idx)) !== JSON.stringify(this.domainX(x_idx))) ||
      (JSON.stringify(this.initialDomainY(y_idx))!==JSON.stringify(this.domainY(y_idx)))
    );
  }
  zoomedX(x_idx) { //Current domain not equal to initial domain
    var ix = this.initialDomainX(x_idx);
    var x = this.domainX(x_idx);
    return (
      (this.initialDomainX(x_idx)[0] !== this.domainX(x_idx)[0] || this.initialDomainX(x_idx)[1] !== this.domainX(x_idx)[1])
    );
  }
}

class DynamicPlot { // Container class for the dynamic subplot

  constructor(parent,data_files,container_id,dimensions,legend) {
    var self = this;
    this.data=[];
    this.brush=null;
    this.xLabelHtml="";
    this.yLabelHtml="";
    this.parent = parent;
    this.initial_dimensions = dimensions;
    this.dimensions = PlotUtils.deepCopy(this.initial_dimensions);
    this.expanded_dimensions = parent.dims.expanded;
    this.legend = legend;
    this.linearScale = true;
    if (this.legend!==null) {
      this.legend.clickCallback = function(){self.redraw();};
    }
    this.content = parent.container.append("g")
        .attr("id",container_id)
        .classed("dynamic_plot",true)
        .attr("transform",`translate(${this.dimensions.margins.left},${this.dimensions.margins.top})`);
    this.content.append("rect").classed("background",true)
        .attr("width",this.dimensions.width).attr("height",this.dimensions.height);
    this.clip_id = `clip_${container_id}`;
    this.clip = this.parent.container.append("defs").append("svg:clipPath")
       .attr("id", this.clip_id)
       .append("svg:rect")
       .attr("width", this.dimensions.width )
       .attr("height", this.dimensions.height )
       .attr("x", 0)
       .attr("y", 0);
    this.data_files = data_files;
  }
  expand() {
    this.dimensions = PlotUtils.deepCopy(this.expanded_dimensions);
    this.expButton.remove();
    this.resizePlot();
    this.collapseButton();
    this.parent.expandCallback();
  }
  collapse() {
    this.dimensions = PlotUtils.deepCopy(this.initial_dimensions);
    this.expButton.remove();
    this.resizePlot();
    this.expandButton();
    this.parent.collapseCallback();
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
    this.x_label.transition().duration(1000).attr("transform",`translate(${this.dimensions.width/2},${this.dimensions.height+20})`);
    this.y_label.transition().duration(1000).attr("transform",`translate(-25,${this.dimensions.height/2}) rotate(-90)`);
    this.redraw();
  }
  zoomButton(x=5,y=5) {
    var self = this;
    var zoomOut = function(){ self.zoomOut(); };
    var bg = this.content.append("g").classed("zoom_button",true)
        .attr("transform",`translate(${x},${y})`)
        .on("click",zoomOut);
    bg.append("rect").attr("width",12).attr("height",12).attr("rx",2);
    bg.append("text").attr("x",6).attr("y",10)
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
  addData() { // Promise to retrieve data and call function to draw plot
    var self = this;
    Promise.all(this.data_files.map(x=>d3.json(x)))
      .then(function(data){self.data = data;})
      .then(function(){self.makePlot();});
  }
  // Brush
  brushFunction() { // The callback for the zoom brush
    var extent = d3.event.selection;
    if (!extent) return; // If there's no extent do nothing
    var d_x = [this.x.invert(extent[0][0]),this.x.invert(extent[1][0])];
    d_x = d_x.sort((a, b) => a - b).reverse();
    var d_y = [this.y.invert(extent[0][1]),this.y.invert(extent[1][1])];
    d_y = d_y.sort((a, b) => a - b);
    this.parent.domains.domainX( this.initial_dimensions.d_x, d_x );
    this.parent.domains.domainY( this.initial_dimensions.d_y, d_y );
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
    this.x.domain(this.parent.domains.domainX(this.dimensions.d_x));
    this.y.domain(this.yDomainScaled());
    this.zoomFunction(runCallback);
  }
  zoomX(runCallback=true) {
    this.x.domain(this.parent.domains.domainX(this.dimensions.d_x));
    this.zoomFunction(runCallback);
  }
  zoomY(runCallback=true) {
    this.y.domain(this.yDomainScaled());
    this.zoomFunction(runCallback);
  }
  zoomed() { //Current domain not equal to initial domain
    return this.parent.domains.zoomed(this.dimensions.d_x,this.dimensions.d_y,this.linearScale);
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
    this.parent.domains.resetDomainX(this.dimensions.d_x);
    this.parent.domains.resetDomainY(this.dimensions.d_y);
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
        .domain(this.parent.domains.domainX(this.dimensions.d_x))
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
    var domain = this.parent.domains.domainY(this.dimensions.d_y);
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
}
class ScatterPlot extends DynamicPlot { // Container class for the dynamic subplot
  constructor(parent,data_files,container_id,dimensions,legend=null) {
    super(parent,data_files,container_id,dimensions,legend);
    this.showBars = true;
  }
  showUncertainties(show){
    this.showBars = show;
    this.redraw();
  }
  // Drawing
  //Assign "hidden" class to all items falling outside plottable area
  draw() { // Creates the datapoints on the first passthrough
    var self = this;
    this.createXAxis();
    this.createYAxis();
    var d_x = self.x.domain();
    var d_y = self.y.domain();
    this.thepoints = this.content.append('g').classed("all_points",true).attr("clip-path", `url(#${this.clip_id})`);
    this.barsGroup = this.thepoints.selectAll("g")
      .data(this.data[0])
      .enter()
      .append("g")
      .attr("class",function(d){return `data_bars ${self.parent.class_axis[d.pr]}${((d.x<=d_x[0] && d.x>=d_x[1] && d.y<=d_y[1] && d.y>=d_y[0])?'':" hidden")}`;});
    this.barsGroup.append("line").attr("class","xstd") //x_uncertainty
      .attr("x1", function (d) {return self.x((d.x+d.x_sdh),self.x);})
      .attr("x2", function (d) {return self.x((d.x-d.x_sdl),self.x);} )
      .attr("y1", function (d) {return self.y(Math.max(d.y,1));} ) // File values are in kiloyears but axis is in millions of years
      .attr("y2", function (d) {return self.y(Math.max(d.y,1));} );
    this.barsGroup.append("line").attr("class","ystd") //y_uncertainty
      .attr("x1", function (d) {return self.x(d.x);} ) // File values are in kiloyears but axis is in millions of years
      .attr("x2", function (d) {return self.x(d.x);} )
      .attr("y1", function (d) {return self.y(Math.max((d.y-d.y_sdl),1),self.y);} ) // File values are in kiloyears but axis is in millions of years
      .attr("y2", function (d) {return self.y(Math.max((d.y+d.y_sdh),1),self.y);} );
    this.pointGroup = this.thepoints.selectAll("circle")
      .data(this.data[0])
      .enter()
      .append("circle")
      .attr("class",function(d){return `${self.parent.class_axis[d.pr]}${((d.x<=d_x[0] && d.x>=d_x[1] && d.y<=d_y[1] && d.y>=d_y[0])?'':" hidden")}`;})
      .attr("cx", function (d) {return self.x(d.x);} ) // File values are in kiloyears but axis is in millions of years
      .attr("cy", function (d) {return self.y(Math.max(d.y,1));} )
      .attr("r",1.5);
  }
  redraw() {
    var self = this;
    this.x_axis_bottom.transition().duration(1000).call(this.xAxisBottom());
    this.x_axis_top.transition().duration(1000).call(this.xAxisTop());
    this.y_axis_left.transition().duration(1000).call(this.yAxisLeft());
    this.y_axis_right.transition().duration(1000).call(this.yAxisRight());
    var d_x = self.x.domain();
    var d_y = self.y.domain();
    this.pointGroup
      .attr("class",function(d){return `${self.parent.class_axis[d.pr]}${((self.legend.entries[d.pr].draw && (d.x<=d_x[0] && d.x>=d_x[1] && d.y<=d_y[1] && d.y>=d_y[0]))?"":" hidden")}`;})
      .transition().duration(1000)
      .attr("cx", function (d) { return self.x(d.x); } )
      .attr("cy", function (d) {return self.y(Math.max(d.y,1));} );
    this.barsGroup.attr("class",function(d){return `data_bars ${self.parent.class_axis[d.pr]}${((self.showBars && self.legend.entries[d.pr].draw && (d.x<=d_x[0] && d.x>=d_x[1] && d.y<=d_y[1] && d.y>=d_y[0]))?"":" hidden")}`;});
    this.barsGroup.selectAll(".xstd")
      .transition().duration(1000)
      .attr("x1", function (d) {return self.x((d.x+d.x_sdh),self.x);})
      .attr("x2", function (d) {return self.x((d.x-d.x_sdl),self.x);} )
      .attr("y1", function (d) {return self.y(Math.max(d.y,1));} ) // File values are in kiloyears but axis is in millions of years
      .attr("y2", function (d) {return self.y(Math.max(d.y,1));} );
    this.barsGroup.selectAll(".ystd")
      .transition().duration(1000)
      .attr("x1", function (d) {return self.x(d.x);} ) // File values are in kiloyears but axis is in millions of years
      .attr("x2", function (d) {return self.x(d.x);} )
      .attr("y1", function (d) {return self.y(Math.max((d.y-d.y_sdl),1),self.y);} ) // File values are in kiloyears but axis is in millions of years
      .attr("y2", function (d) {return self.y(Math.max((d.y+d.y_sdh),1),self.y);} );
  }
}
class LinePlot extends DynamicPlot {
  constructor(parent,data_files,container_id,dimensions,legend=null) {
    super(parent,data_files,container_id,dimensions,legend);
    this.line = [];
  }
  draw() {
    var self = this;
    this.createXAxis();
    this.createYAxis();
    var d_x = self.x.domain();
    var d_y = self.y.domain();
    Promise.all(this.data.map((lineData,idx)=>{
      self.line[idx] = this.content.append("path").attr("clip-path", `url(#${self.clip_id})`)
        .datum(self.data[idx])
        .attr("fill", "none")
        .attr("stroke", (idx>0)?"red":"black")
        .attr("stroke-width", (idx>0)?1:0.75)
        .attr("d", d3.line()
          .x(function(d) { return self.x(d.x); })
          .y(function(d) { return self.y(d.y); })
        );
    }));

  }
  redraw() {
    var self = this;
    this.x_axis_bottom.transition().duration(1000).call(this.xAxisBottom());
    this.x_axis_top.transition().duration(1000).call(this.xAxisTop());
    this.y_axis_left.transition().duration(1000).call(this.yAxisLeft());
    this.y_axis_right.transition().duration(1000).call(this.yAxisRight());
    var d_x = self.x.domain();
    var d_y = self.y.domain();
    Promise.all(this.data.map((lineData,idx)=>{
      this.line[idx]
        .datum(this.data[idx])
        .transition().duration(1000) //Animate the zoom in, then remove and filter points (for smaller image export)
        .attr("d", d3.line()
          .x(function(d) { return self.x(d.x); })
          .y(function(d) { return self.y(d.y); })
        );
    }));
  }
  staticDraw(){
    var self = this;
    var d_x = self.x.domain();
    var d_y = self.y.domain();
    return Promise.all(this.data.map((lineData,idx)=>{
      self.line[idx]
        .datum(self.data[idx].filter(function(d){return ( d.x<=d_x[0] && d.x>=d_x[1] && d.y<=d_y[1] && d.y>=d_y[0] );}))
        .attr("d", d3.line()
          .x(function(d) { return self.x(d.x); })
          .y(function(d) { return self.y(d.y); })
        );
    }));
  }
}
class TimeLine extends DynamicPlot {
  constructor(parent,data_file,container_id,dimensions,legend=null) {
    super(parent,data_file,container_id,dimensions,legend);
    var self = this;
    this.tooltipDiv = d3.select("body").append("div")
      .attr("class", "tooltip")
      .style("opacity", 0);
    this.wrap = function(width) { return function() {
        var slf = d3.select(this),
            textLength = slf.node().getComputedTextLength(),
            text = slf.text();
        while (textLength > (width) && text.length > 0) {
            text = text.slice(0, -4);
            slf.text(text + '...');
            textLength = slf.node().getComputedTextLength();
        }
    };};
  }
  zoom(runCallback=true) {
    this.x.domain(this.parent.domains.domainX(this.dimensions.d_x));
    this.zoomFunction(runCallback);
  }
  zoomed() { //Current domain not equal to initial domain
    return this.parent.domains.zoomedX(this.dimensions.d_x);
  }
  zoomOut(runCallback=true) { // Callback for double click
    this.parent.domains.resetDomainX(this.dimensions.d_x);
    this.zoom(runCallback);
  }
  draw() {
    var self = this;
    var stroke = 0.7;
    this.x = d3.scaleLinear().domain(this.parent.domains.domainX(this.dimensions.d_x)).range([0,this.dimensions.width]);
    this.y = d3.scaleLinear().domain([0,1]).range([0,this.dimensions.height]);
    this.tl = this.content.append('g').classed("timelineg",true).attr("clip-path", `url(#${this.clip_id})`);
    this.tlGroup = this.tl.selectAll("g")
        .data(this.data[0])
        .enter().append("g").classed("tlobj",true)
        .classed("hidden",function(d){return self.x(d.x1)<0 || self.x(d.x2)>self.dimensions.width;})
        .attr("transform",function (d) {return `translate(${self.x(d.x2)},0)`;})
        .attr("width",function (d) {return self.x(d.x1)-self.x(d.x2);})
        .attr("height",this.dimensions.height)
        .on("click",function(d){
          if (self.parent.domains.domainX(self.dimensions.d_x)[0]==d.x2&&self.parent.domains.domainX(self.dimensions.d_x)[1]==d.x1)
              self.parent.domains.resetDomainX(self.dimensions.d_x);
          else
              self.parent.domains.domainX(self.dimensions.d_x,[d.x2,d.x1] );
          self.zoom();
        })
        .on("mouseover", function(d) {
              d3.select(this).select(".tlcolor").transition().duration(400).attr("opacity",1);
              self.tooltipDiv.transition().duration(200).style("opacity", 0.9);
              self.tooltipDiv.html('click to zoom').style("left", (d3.event.pageX) + "px").style("top", (d3.event.pageY-30) + "px");
        })
        .on("mouseout", function(d) {
            d3.select(this).select(".tlcolor").transition().duration(200).attr("opacity",0);
            self.tooltipDiv.transition().duration(500).style("opacity", 0);
        });
    this.tlGroup.append("rect").attr("class","tlbackground").attr("fill", function (d,i) {return (i%2)?"#dddddd":"#eeeeee";})
        .attr("width",function (d) {return self.x(d.x1)-self.x(d.x2);}).attr("height",self.dimensions.height).attr("x",0).attr("y",0);
    this.tlGroup.append("rect").attr("class","tlcolor")
        .attr("width",function (d) {return Math.max(0,self.x(d.x1)-self.x(d.x2)-stroke);}).attr("height",(self.dimensions.height-stroke)*0.3)
        .attr("x",stroke/2).attr("y",stroke/2).attr("fill", function (d) {return d.color;}).attr("opacity",0);
    this.tlGroup.append("text").attr("class","tltext")
        //centers in the visible part of the timeline
        .attr("x",function(d){return ((self.x(d.x1)-self.x(d.x2)-Math.min(0,self.dimensions.width-self.x(d.x1))-Math.min(0,self.x(d.x2)))/2);})
        .attr("y",9-(stroke/2))
        .text(function(d){return d.name;}).attr("text-anchor","middle")
        .each(function(d,i) {
          var slf = d3.select(this), text = slf.text();
          var cl = slf.node().getComputedTextLength();
          while (cl > (Math.min(self.dimensions.width,self.x(d.x1))-Math.max(0,self.x(d.x2))-1) && text.length) {
              if (typeof d.symbol!=='undefined' && text.length>d.symbol.length)
                text = d.symbol;
              else
                text = text.slice(0, -1);
              slf.text(text);
              cl = slf.node().getComputedTextLength();
          }
        });

    this.y_axis_left = this.content.append("g")
        .attr("transform", "translate(0,0)")
        .classed("axis_left axis",true)
        .call(this.axisFormat(d3.axisLeft(this.y).tickSize(0), this.initial_dimensions.axes.yLeft));
    this.y_axis_right = this.content.append("g")
        .attr("transform",`translate(${this.dimensions.width},0)`)
        .classed("axis_right axis",true)
        .call(this.axisFormat(d3.axisRight(this.y).tickSize(0), this.initial_dimensions.axes.yRight));
    this.x_axis_top = this.content.append("g")
        .attr("transform", "translate(0,0)")
        .classed("axis axis_top",true)
        .call(this.axisFormat(d3.axisTop(this.x).tickSize(0),this.initial_dimensions.axes.xTop));
  }
  redraw() {
    var self = this;
    var stroke = 0.7;
    this.tlGroup
        .transition().duration(1000)
        .attr("width", function (d) {return self.x(d.x1)-self.x(d.x2);})
        .attr("transform",function (d) {return `translate(${self.x(d.x2)},0)`;})
        .on("end",function(){
          d3.select(this).classed("hidden",function(d){return self.x(d.x1)<0 || self.x(d.x2)>self.dimensions.width;});
          d3.select(this).selectAll(".tlbackground")
            .attr("width",function (d) {return self.x(d.x1)-self.x(d.x2);});
          d3.select(this).selectAll(".tlcolor")
              .attr("width",function (d) {return Math.max(0,self.x(d.x1)-self.x(d.x2)-stroke);});
        });
    this.tlGroup.selectAll(".tlbackground")
      .transition().duration(1000)
      .attr("width",function (d) {return self.x(d.x1)-self.x(d.x2);});
    this.tlGroup.selectAll(".tlcolor")
        .transition().duration(1000)
        .attr("width",function (d) {return Math.max(0,self.x(d.x1)-self.x(d.x2)-stroke);});
    this.tlGroup.selectAll("text").transition()
        .on('start',function(){
          d3.select(this).attr("opacity",0).text(function(d){return d.name;});
        })
        .duration(1000)
        .attr("x",function(d){return ((self.x(d.x1)-self.x(d.x2)-Math.min(0,self.dimensions.width-self.x(d.x1))-Math.min(0,self.x(d.x2)))/2);})
        .on('end',function(){
          d3.select(this).each(function(d,i) {
            var slf = d3.select(this), text = slf.text();
            var cl = slf.node().getComputedTextLength();
            while (cl > (Math.min(self.dimensions.width,self.x(d.x1))-Math.max(0,self.x(d.x2))-1) && text.length) {
              if (typeof d.symbol!=='undefined' && text.length>d.symbol.length)
                text = d.symbol;
              else
                text = text.slice(0, -1);
              slf.text(text);
              cl = slf.node().getComputedTextLength();
            }
          });
          d3.select(this).attr('opacity',1);
        });
  }
}
