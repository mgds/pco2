class Dimensions {
  constructor(container) {
    this.container = container
    this.set()
  }
  set() {
    this.margins = {top: 10, right: 200, bottom: 40, left: 60};
    this.aspectRatio = 3/6;
    this.outerWidth = parseInt(this.container.style("width"));
    this.outerHeight = this.outerWidth*this.aspectRatio;
    this.innerWidth = this.outerWidth-this.margins.left-this.margins.right;
    this.innerHeight = this.outerHeight-this.margins.bottom-this.margins.top;

    //this.outerHeight = parseInt(this.container.style("height"));
    //this.aspectRatio = parseInt(this.containerDiv.style("height"))/this.outerWidth
  }
}

class Legend {
  constructor(container,plot,box_boolean=false) {
    this.plot = plot
    this.container = container
    this.entries = {}
    this.box_boolean = box_boolean
    this.position = [(plot.dimensions.outerWidth-plot.dimensions.margins.right+20),plot.dimensions.margins.top]
    this.spacing = 20
    this.hide = false
    //this.relative_position = [90,10]
  }
  addEntry(entry) {
    name = entry.name
    this.entries[name] = (entry)
  }
  draw() {
    var x_start = this.position[0]
    var y_start = this.position[1]
    var i = 0

    this.legend_group = this.container.append("g")
                                      .attr("transform","translate("+x_start+","+y_start+")")

    var entry_array = []
    for (var name in this.entries) {
        var item = this.entries[name]
        entry_array.push(item)
        item.position = [0,y_start+(i*this.spacing)]
        i++
      }

        this.legend_group.selectAll("circle")
                          .data(entry_array)
                          .enter()
                          .append("circle")
                            .attr("cx",function(d){return d.position[0]})
                            .attr("cy",function(d){return d.position[1]})
                            .attr("r",5)
                            .style("fill",function(d){return d.color})
                            .on("click",(d)=>this.itemClicked(d))
        this.legend_group.selectAll("text")
                          .data(entry_array)
                          .enter()
                          .append("text")
                            .text(function(d){return d.name})
                            .attr("x",function(d){return d.position[0]+10})
                            .attr("y",function(d){return d.position[1]+5})
                            .attr("class","h4")
                            //.attr("font-size", "16px")
                            .on("click",(d)=>this.itemClicked(d))

                            //.attr("transform","translate("+(item.position[0]+10)+","+(item.position[1]+5)+")")
                            //.style("text-anchor","start")
                            .style("fill","#396aa8")
  }
  redraw() {
    var x_start = this.position[0]
    var y_start = this.position[1]
    var i = 0

    //this.legend_group = this.innerSvg.append("g")
    //                                  .attr("transform","translate("+x_start+","+y_start+")")

    var entry_array = []
    for (var name in this.entries) {
      var item = this.entries[name]
      if (!this.hide) {
        entry_array.push(item)
        item.position = [0,y_start+(i*this.spacing)]
        i++
      }
      else {
        if (item.draw) {
          entry_array.push(item)
          item.position = [0,y_start+(i*this.spacing)]
          i++
        }
      }
      }

        var legend_circles = this.legend_group.selectAll("circle")
                          .data(entry_array)

            legend_circles.exit().remove()
            legend_circles.enter().append("circle")
                            .attr("cx",function(d){return d.position[0]})
                            .attr("cy",function(d){return d.position[1]})
                            .attr("r",5)
                            .style("fill",function(d){return d.color})
                            .style("opacity",function(d){
                              if (d.draw) {return 1}
                              else {return 0.3}
                            })
                            .on("click",(d)=>this.itemClicked(d))
            legend_circles.attr("cx",function(d){return d.position[0]})
                            .attr("cy",function(d){return d.position[1]})
                            .attr("r",5)
                            .style("fill",function(d){return d.color})
                            .style("opacity",function(d){
                              if (d.draw) {return 1}
                              else {return 0.3}
                            })
                            .on("click",(d)=>this.itemClicked(d))


        var legend_text = this.legend_group.selectAll("text")
                          .data(entry_array)

                          legend_text.exit().remove()
                          legend_text.enter().append("text")
                            .text(function(d){return d.name})
                            .attr("x",function(d){return d.position[0]+10})
                            .attr("y",function(d){return d.position[1]+5})
                            .attr("font-size", "16px")
                            .attr("class","h4")
                            .style("fill",function(d){
                            if (d.draw) {
                              return "#396aa8"
                            }
                            else {
                              return "#b4cae5"
                            }
                          })
                            .on("click",(d)=>this.itemClicked(d))

                          legend_text.text(function(d){return d.name})
                            .attr("x",function(d){return d.position[0]+10})
                            .attr("y",function(d){return d.position[1]+5})
                            .attr("font-size", "16px")
                            .attr("class","h4")
                            .style("fill",function(d){
                            if (d.draw) {
                              return "#396aa8"
                            }
                            else {
                              return "#b4cae5"
                            }
                          })
                            .on("click",(d)=>this.itemClicked(d))

  }
  itemClicked(item) {
      item.drawFlip()
      this.redraw()
      this.plot.redrawPoints(false,this)
  }
  move() {
    this.legend_group.raise()
  }
}
class LegendEntry {
  constructor(name="",symbol=null,color="#ffffff") {
    this.name = name
    this.symbol = symbol
    this.color = color
    this.draw = true
  }
  drawFlip() {
    this.draw = !this.draw
  }
}

class ButtonArray {
  constructor(container,position,global,direction="horizontal") {
    this.container = container
    this.position = position
    this.spacing = 10
    this.entries = {}
    this.constant = false
    this.global = global
    this.direction = direction

    var x_start = this.position[0]
    var y_start = this.position[1]
    this.button_group = this.container.append("g")
                                          .attr("transform","translate("+x_start+","+y_start+")")
  }
  addEntry(entry) {
    name = entry.name
    this.entries[name] = entry
  }
  draw() {
    var x_start = this.position[0]
    var y_start = this.position[1]
    var i = 0

    var entry_array = []
    for (var name in this.entries) {
        var item = this.entries[name]
        entry_array.push(item)
        //item.size = this.size
        console.log(this.direction)
        if (this.direction=="horizontal") {
          item.position = [0+(i*(item.size[0]+this.spacing)),y_start]
        }
        else {
          item.position = [0,y_start+(i*(item.size[1]+this.spacing))]
        }
        i++
      }

        this.button_group.selectAll("rect")
                          .data(entry_array)
                          .enter()
                          .append("rect")
                            .attr("x",function(d){return d.position[0]})
                            .attr("y",function(d){return d.position[1]})
                            .attr("width",function(d){return d.size[0]})
                            .attr("height",function(d){return d.size[1]})
                            .style("fill",function(d){return d.color})
                            .style("stroke","#b19f7e")
                            .style("stroke-width",2)
                            .style("cursor","pointer")
                            .style("opacity",0)
        if (!this.constant) {
          this.button_group.selectAll("rect")
                            .on("mouseenter",(d)=>this.itemMouseEnter(d))
                            .on("mouseleave",(d)=>this.itemMouseLeave(d))
                            .on("click",(d)=>this.itemClicked(d))
                              .transition().duration(500)
                              .style("opacity",function(d){return d.opacity})
                            }
        else {
          this.button_group.selectAll("rect").style("opacity",1)
                            .on("click",(d)=>this.itemClicked(d))
        }
        this.button_group.selectAll("text")
                          .data(entry_array)
                          .enter()
                          .append("text")
                            .text(function(d){return d.name})
                            .attr("x",function(d){return d.position[0] + 0.5*d.size[0]})
                            .attr("y",function(d){return d.position[1] + 0.5*d.size[1] + 8})
                            .attr("class","h3")
                            .style("opacity",0)
                            .attr("font-size", "16px")
                            .style("text-anchor","middle")
                            .style("cursor","pointer")
                            .style("fill","#0c448b")
                            .on("click",(d)=>this.itemClicked(d))
        if (!this.constant) {
                              this.button_group.selectAll("text")
                                                .on("mouseenter",(d)=>this.itemMouseEnter(d))
                                                .on("mouseleave",(d)=>this.itemMouseLeave(d))
                                                  .transition().duration(500)
                                                  .style("opacity",function(d){return d.opacity})
                                                }
        else {
                              this.button_group.selectAll("text").style("opacity",1)
                            }
                            //.on("click",()=>d.inputFunction())
                            // .on("mouseenter",(d)=>this.itemMouseEnter(d))
                            // .on("mouseleave",(d)=>this.itemMouseLeave(d))
                            // .style("opacity",0)
                            // .on("click",(d)=>this.itemClicked(d))
                            //   .transition().duration(1000)
                            //   .style("opacity",function(d){return d.opacity})

  }
  redraw() {
    var x_start = this.position[0]
    var y_start = this.position[1]
    var i = 0

    var entry_array = []

    for (var name in this.entries) {
        var item = this.entries[name]
        entry_array.push(item)
        if (this.direction=="horizontal") {
          item.position = [0+(i*(item.size[0]+this.spacing)),y_start]
        }
        else {
          item.position = [0,y_start+(i*(item.size[1]+this.spacing))]
        }
        i++
      }

        this.button_group.selectAll("rect")
                          .data(entry_array)
                            .transition().duration(200)
                            .style("opacity",function(d){return d.opacity})
                            //.on("click",(d)=>this.itemClicked(d))
        this.button_group.selectAll("text")
                          .data(entry_array)
                            .transition().duration(200)
                            .style("opacity",function(d){return d.opacity})
  }
  itemMouseEnter(data) {
    data.opacity = 1
    this.redraw()
    console.log("Mouse enter")
  }
  itemMouseLeave(data) {
    data.opacity = 0.3
    this.redraw()
  }
  itemClicked(item) {
    item.run(this.global)
  }
  move() {
    this.button_group.raise()
  }
}
class ButtonEntry {
  constructor(name,inputFunction,size=[80,30],color="#e5decf") {
    this.name = name
    this.inputFunction = inputFunction
    this.size = size
    this.color = color
    this.opacity = 0.3
  }
  run(container) {
    return this.inputFunction(container)
  }
}

class DynamicPlot {
  constructor() {
    this.containerDiv = d3.select("#age_co2_plot");
    this.dimensions = new Dimensions(this.containerDiv);
    this.dataFile = "data/data.json";

    this.beginPlot()
  }

  // Starting plot
  beginPlot() {
    this.makeSvg()
    this.makeBrush()
    this.makeDoubleClick()

    this.addData()
    this.addOverlayButtons()
    this.addRightButtons()
  }
  makeSvg() {
     var elementExists = document.getElementById("plot_svg");
     if (elementExists==null) {
         }
     else {
       d3.select("#plot_svg").remove();
     }

     this.outerSvg = this.containerDiv.append("svg")
                                            .attr("id","plot_svg")
                                            .attr("width",this.dimensions.outerWidth)
                                            .attr("height",this.dimensions.outerHeight)
                                            .on("mouseenter",()=>this.mouseEnterEvent())
                                            .on("mouseleave",()=>this.mouseLeaveEvent())

     this.makeBackground()

     this.innerSvg = this.outerSvg.append("g")
                                        .attr("transform","translate("+this.dimensions.margins.left+", "+this.dimensions.margins.top+")")
                                        .attr("width",this.dimensions.innerWidth)
                                        .attr("height",this.dimensions.innerHeight)
                                        .call(d3.zoom()
                                          //.scaleExtent([1,50])
                                          .translateExtent([[0,0],[this.dimensions.outerWidth,this.dimensions.outerHeight]]))
                                          //.on("zoom",()=>this.zoomFunction())
                                          .on("dblclick.zoom",null)
      }
  makeBackground() {
  this.background = this.outerSvg.append("rect")
                                      .attr("width",this.dimensions.outerWidth)
                                      .attr("height",this.dimensions.outerHeight)
                                      .attr("fill","white")
    }
  makePlot(data) {
      this.makeXAxis();
      this.makeYAxis();
      this.makeColorAxis();

      this.drawPoints();
      this.addLegend();

      this.rightButtons.draw()

      this.redrawPoints(this.legend);
    }

  // Data
  addData() {
    d3.json(this.dataFile).then((data)=>this.assignData(data)).then(()=>this.makePlot())
  }
  assignData(data) {
    console.log("Data loaded")
    this.data = data
  }

  // Mouse events
  mouseEnterEvent() {
    console.log("Mouse over plot")
    this.buttonArray.draw()
  }
  mouseLeaveEvent() {
    console.log("Mouse out plot")
    this.buttonArray.button_group.selectAll("rect")
                                  .transition().duration(1000)
                                  .style("opacity",0)
                                  .remove()
    this.buttonArray.button_group.selectAll("text")
                                  .transition().duration(500)
                                  .style("opacity",0)
                                  .remove()
  }
  boxMouseOver() {
    console.log("Mouse over button")
    this.button.attr("opacity",1)
  }
  boxMouseOut() {
    console.log("Mouse out button")
    this.button.attr("opacity",0.3)
  }

  // Brush
  brushFunction() {
    var extent = d3.event.selection
    if (!extent) return

    var xExtent1 = this.x.invert(extent[0][0])
    var yExtent1 = this.y.invert(extent[0][1])

    var xExtent2 = this.x.invert(extent[1][0])
    var yExtent2 = this.y.invert(extent[1][1])

    if (yExtent1>yExtent2)
    {
      var y1Temp = yExtent1
      yExtent1 = yExtent2
      yExtent2 = y1Temp
    }

    this.brushContainer.remove();
    this.makeBrush()

    this.x.domain([xExtent1,xExtent2])
    this.y.domain([yExtent1,yExtent2])

    this.xAxis.transition().duration(1000).call(d3.axisBottom(this.x))
    this.yAxis.transition().duration(1000).call(d3.axisLeft(this.y))

    this.redrawPoints(true,this.legend)

  }
  makeBrush() {
    this.brush = d3.brush()
             .extent([[0,0],[this.dimensions.innerWidth,this.dimensions.innerHeight]])
             .on("end",()=>this.brushFunction())
    this.brushContainer = this.innerSvg.append("g")
                                         .attr("class", "brush")
                                         .call(this.brush)
                                         .on("dblclick",()=>this.doubleClickFunction())
     }
  makeDoubleClick() {
    this.clickContainer = this.innerSvg.append("g")
                                       .attr("class","click")
                                       .on("dblclick",()=>this.doubleClickFunction())
  }
  doubleClickFunction() {
    console.log("Double click")
    this.x.domain([70,0])
    this.y.domain([0,8000])

    this.xAxis.transition().duration(1000).call(d3.axisBottom(this.x))
    this.yAxis.transition().duration(1000).call(d3.axisLeft(this.y))

    this.redrawPoints(false,this.legend)
  }

  // Zooming
  zoomFunction() {
        console.log("Zoom function")
        var newX = d3.event.transform.rescaleX(this.x)
        var newY = d3.event.transform.rescaleY(this.y)

        this.xAxis.call(d3.axisBottom(newX))
        this.yAxis.call(d3.axisLeft(newY))

        this.x = newX
        this.y = newY


        this.redrawPoints(true)
  }

  // Plotting
  // Axes
  makeXAxis() {
    // Add X axis
    this.x = d3.scaleLinear()
          .domain([70,0])
          .range([0,this.dimensions.innerWidth]);

    this.xAxis = this.innerSvg.append("g")
                        .attr("transform", "translate(" + 0 + "," + (this.dimensions.innerHeight) + ")")
                        .classed("axis_text","true")
                        .call(d3.axisBottom(this.x));

    console.log("X axis drawn");

    this.innerSvg.append("text")
                .attr("transform","translate(" + (this.dimensions.innerWidth/2) + "," + (this.dimensions.innerHeight + this.dimensions.margins.top + 20) + ")")
                .style("text-anchor","middle")
                .text("Age")
                .classed("axis_text","true")
                .style("font-family","sans-serif")
                .style("font-weight","bold")
                .style("fill","#0c448b")

    console.log("X axis labelled");
  }
  makeYAxis() {
      // Add Y axis
      this.y = d3.scaleLinear()
        .domain([0, 8000])
        .range([this.dimensions.innerHeight, 0]);

      this.yAxis = this.innerSvg.append("g")
        .attr("transform", "translate(" + 0 + "," + 0 + ")")
        .classed("axis_text","true")
        .call(d3.axisLeft(this.y));

      console.log("Y axis drawn");

      this.innerSvg.append("text")
         .style("transform","translate(" + -40 + "px," + (this.dimensions.innerHeight/2 + 50) + "px) rotate(-90deg)")
         .text("Atmospheric CO")
         .classed("axis_text","true")
         .style("font-family","sans-serif")
         .style("font-weight","bold")
         .style("fill","#0c448b")
         .append('tspan')
          .text('2')
          .style('font-size', '1rem')
          .attr('dx', '.1em')
          .attr('dy', '.2em');

        console.log("Y Label added");
  }
  makeColorAxis() {
      this.colorAxis = d3.scaleOrdinal()
                         .domain(["Algae ","Boron ","Stomata Frequency","Stomata Gas Exchange","Liverwort ","C3 ","Paleosol ","Nahcolite "])
                         .range(["#890903","#CC5304","#D38F08","#3B9001","#028492","#394B9F","#7424A7","#3D0F5A"])
      console.log("Color axes created")
    }

  // Drawing
  drawPoints() {
    var x = this.x
    var y = this.y
    var colorAxis = this.colorAxis
    this.innerSvg.append('g')
                     .attr("transform", "translate(" + 0 + "," + 0 + ")")
                     .selectAll("dot")
                     .data(this.data)
                     .enter()
                     .append("circle")
                      .attr("cx", function (data) {return x(data.age/1000);} )
                      .attr("cy", function (d) { return y(d.co2); } )
                      .attr("r", 3)
                      .style("fill", function (data) {return colorAxis(data.method.concat(" ".concat(data.submethod)))})
                      // .on("mouseover", function(d) {
                      //   div.transition()
                      //   .duration(100)
                      //   .style("opacity", .9);
                      // div	.html(d.firstAuthor + ", " + d.year + "</br>" + "<a href=" + d.DOI + ">DOI</a>")
                      //   .style("left", (d3.event.pageX) + "px")
                      //   .style("top", (d3.event.pageY - 28) + "px")
                    // });
    }
  redrawPoints(zoom_in,legend=null) {
    var x = this.x
    var y = this.y
    var colorAxis = this.colorAxis
    var data

    if (!legend) {
      data = this.data
    }
    else {
      data = this.data.filter(function(d){
        return (legend.entries[d.method.concat(" ".concat(d.submethod))].draw)
      })
    }

    var smallX = x.domain()[1]
    var bigX = x.domain()[0]
    var smallY = y.domain()[0]
    var bigY = y.domain()[1]


    var points = this.innerSvg.selectAll("circle").data(data)

    if (zoom_in)
    {
      points.exit().remove()
      points.enter().append("circle")
             .call(enter => enter.transition(this.innerSvg.transition().duration(1000)).style("opacity",1))
             .merge(points)
                         .attr("cx", function (data) {return x(data.age/1000);})
                         .attr("cy", function (data) {return y(data.co2);})
                         .attr("r",3)
                         .style("fill", function (data) {return colorAxis(data.method.concat(" ".concat(data.submethod)))})
                       .style("opacity", function (data) { if (data.age/1000<=bigX && data.age/1000>=smallX && data.co2<=bigY && data.co2>=smallY){return 1} else {return 0}} )
    }
    else {
      points.exit().remove()
      points.enter().append("circle")
      .call(enter => enter.transition(this.innerSvg.transition().duration(1000)).style("opacity",1))
            .merge(points)
            .attr("cx", function (data) {return x(data.age/1000);})
            .attr("cy", function (data) {return y(data.co2);})
            .attr("r",3)
            .style("fill", function (data) {return colorAxis(data.method.concat(" ".concat(data.submethod)))})
            .style("opacity", function (data) { if (data.age/1000<=bigX && data.age/1000>=smallX && data.co2<=bigY && data.co2>=smallY){return 1} else {return 0}} )
            //.transition().duration(500)
            //.style("opacity", function (data) { if (data.age/1000<=bigX && data.age/1000>=smallX && data.co2<=bigY && data.co2>=smallY){return 1} else {return 0}} )
    }
    this.legend.move()
    this.buttonArray.move()
  }

  // Legend
  addLegend() {
    this.legend = new Legend(this.outerSvg,this)
    this.colorAxis.domain().forEach((item, i) => {
      this.legend.addEntry(new LegendEntry(item,"circle",this.colorAxis(item)))
    });

    this.legend.draw()
  }

  // Buttons
  addOverlayButtons() {
    this.buttonArray = new ButtonArray(this.innerSvg,[10,0],this)
    this.buttonArray.addEntry(new ButtonEntry("Align",this.alignAxes))
    this.buttonArray.addEntry(new ButtonEntry("Hide",this.hideUnusedLegend))
    this.buttonArray.addEntry(new ButtonEntry("Spare1",this.hideUnusedLegend))
    this.buttonArray.addEntry(new ButtonEntry("Spare2",this.hideUnusedLegend))
    this.buttonArray.addEntry(new ButtonEntry("Spare3",this.hideUnusedLegend))
  }
  addRightButtons() {
    this.rightButtons = new ButtonArray(this.outerSvg,[(this.dimensions.outerWidth-this.dimensions.margins.right+20),90],this)
    this.rightButtons.addEntry(new ButtonEntry("Download",this.alignAxes,[150,30]))
    this.rightButtons.addEntry(new ButtonEntry("Spare1",this.alignAxes,[150,30]))
    this.rightButtons.addEntry(new ButtonEntry("Spare2",this.alignAxes,[150,30]))
    this.rightButtons.addEntry(new ButtonEntry("Spare3",this.alignAxes,[150,30]))

    this.rightButtons.constant = true
    this.rightButtons.direction = "vertical"
  }

  // Button functions
  alignAxes(container) {
    console.log("Align Axes")

    var x_Limits = container.x.domain()
    var x_Limits_clean = []
    x_Limits.forEach((item, i)=>{if (item==0) {item=1e-9} x_Limits_clean.push(item*1e6)})

    var x_order_difference = Math.ceil(Math.log10(Math.abs(x_Limits_clean[0]-x_Limits_clean[1])))

    var x_rounded = []
     x_Limits_clean.forEach((item, i)=>{
       var rounded = Math.round(item/(Math.pow(10,x_order_difference-1)))
       var renormalised = rounded*(Math.pow(10,x_order_difference-1))/1e6
       x_rounded.push(renormalised)
     })

     container.x.domain(x_rounded)
     container.xAxis.transition().duration(1000).call(d3.axisBottom(container.x))

     var y_Limits = container.y.domain()
     var y_Limits_clean = []
     y_Limits.forEach((item, i)=>{if (item==0) {item=1} y_Limits_clean.push(item)})

     var y_order_difference = Math.ceil(Math.log10(Math.abs(y_Limits_clean[0]-y_Limits_clean[1])))

     var y_rounded = []
      y_Limits_clean.forEach((item, i)=>{
        var rounded = Math.round(item/(Math.pow(10,y_order_difference-1)))
        var renormalised = rounded*(Math.pow(10,y_order_difference-1))
        y_rounded.push(renormalised)
      })

      container.y.domain(y_rounded)
      container.yAxis.transition().duration(1000).call(d3.axisLeft(container.y))


     container.redrawPoints(true,container.legend)


    //var log_x_Limits = [Math.floor(Math.log10(x_Limits[0]*1e6)),Math.floor(Math.log10(x_Limits[1]*1e6))]

    //console.log(log_x_Limits)

    //console.log(this.x.domain())
  }
  hideUnusedLegend(global) {
    global.legend.hide = (!global.legend.hide)
    global.legend.redraw()
  }
}

ageCO2Plot = new DynamicPlot();
