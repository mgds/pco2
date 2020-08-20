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
