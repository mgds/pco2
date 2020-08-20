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
