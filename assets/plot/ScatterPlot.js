class ScatterPlot extends DynamicPlot { // Container class for the dynamic subplot
  constructor(parent,dataObj,legend=null,showArchive=false) {
    super(parent,dataObj,legend);
    this.classAxis = dataObj.classAxis;
    this.categories = dataObj.categories
    this.showBars = true;
    this.showArchive = showArchive;
  }
  showUncertainties(show){
    this.showBars = show;
    this.redraw();
  }
  // Drawing
  //Assign "hidden" class to all items falling outside plottable area
  draw() { // Creates the datapoints on the first passthrough
    var self = this;
    if (this.data[1])
      this.data = [].concat(this.data[0],this.data[1]);
    else
      this.data = this.data[0];
    this.createXAxis();
    this.createYAxis();
    var d_x = self.x.domain();
    var d_y = self.y.domain();
    this.thepoints = this.content.append('g').classed("all_points",true).attr("clip-path", `url(#${this.clip_id})`);
    this.barsGroup = this.thepoints.selectAll("g")
      .data(this.data)
      .enter()
      .append("g")
      .attr("class",function(d){return `data_bars ${self.classAxis[d.pr]}${(self.is_displayed(d, d_x, d_y)?'':" hidden")}`;});
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
      .data(this.data)
      .enter()
      .append("circle")
      .attr("class",function(d){return `${self.classAxis[d.pr]}  ${self.category_class(d)}${((self.is_displayed(d, d_x, d_y))?'':" hidden")}`;})
      .attr("cx", function (d) {return self.x(d.x);} ) // File values are in kiloyears but axis is in millions of years
      .attr("cy", function (d) {return self.y(Math.max(d.y,1));} )
      .attr("r",1.5);
  }
  is_displayed(d,d_x, d_y) {
    return this.legend.entries[d.pr].draw && 
      (
        ("p" in d && !this.showArchive && this.categories.includes(parseInt(d.p))) || 
        (!("p" in d) && this.showArchive)
      ) &&
      d.x<=d_x[0] && d.x>=d_x[1] && d.y<=d_y[1] && d.y>=d_y[0];
  }
  toggleCategory(val) {
    var idx = this.categories.indexOf(val);
    var ret = true;
    if (idx !== -1) {
      this.categories.splice(this.categories.indexOf(val), 1);
      ret = false;
    } else {
      this.categories.push(val);
    }
    this.redraw();
    return ret;
  }
  toggleArchive(val) {
    this.showArchive = !!val;
    this.redraw()
    return this.showArchive;
  }
  category_class(d) {
    if (!"p" in d)
      return "archive";
    if (parseInt(d.p) == 2)
      return "category2";
    if (parseInt(d.p) == 3)
      return "category3";
    return "category1";
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
      .attr("class",function(d){return self.classAxis[d.pr] + ' ' + self.category_class(d) + ' ' + (self.is_displayed(d, d_x, d_y)?"":" hidden");})
      .transition().duration(1000)
      .attr("cx", function (d) { return self.x(d.x); } )
      .attr("cy", function (d) {return self.y(Math.max(d.y,1));} );
    this.barsGroup.attr("class",function(d){return `data_bars ${self.classAxis[d.pr]}${((self.showBars && self.is_displayed(d, d_x, d_y))?"":" hidden")}`;});
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
