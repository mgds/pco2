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
