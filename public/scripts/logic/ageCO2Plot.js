class Dimension_Collection {
  constructor(container) {
    this.container = container
    this.set()
  }
  set() {
    this.setGlobal()
    this.setMainAnchors()
    this.setControlAnchors()
    this.setStaticsAnchors()
    this.setDependents()
  }
  setGlobal() {
    this.global = new Dimensions()
    this.global.width = parseInt(this.container.style("width"));
    this.global.aspectRatio = 2.5/6;
    this.global.height = this.global.width*this.global.aspectRatio
  }
  setMainAnchors() {
    this.main = new Dimensions()

    this.main.margins.bottom = 0
    this.main.margins.left = 58
  }
  setStaticsAnchors() {
    this.statics = new Dimensions()

    this.statics.margins.top = 10
    this.statics.margins.bottom = 0
    this.statics.margins.left = 30
    this.statics.margins.right = 10
  }
  setControlAnchors() {
    this.controls = new Dimensions()

    this.controls.margins.top = 0
    this.controls.margins.bottom = 0
    this.controls.margins.left = 0
    this.controls.margins.right = 0
  }
  setDependents() {
    this.controls.height = this.global.height
    this.controls.width = 0.25*this.global.width

    this.statics.width = this.global.width-(this.statics.margins.left+this.statics.margins.right)-this.controls.width
    this.statics.height = this.global.height-(this.statics.margins.top+this.statics.margins.bottom)
    this.statics.margins.left = this.controls.width+this.statics.margins.left

    this.main.height = 0.5*this.statics.height
    this.main.width = 0.635*this.statics.width
    this.main.margins.top = (0.3*this.statics.height)+this.statics.margins.top
    this.main.margins.left = this.controls.width+this.main.margins.left
  }
}
class Dimensions {
  constructor() {
    this.width = null
    this.height = null

    this.aspectRatio = null

    this.margins = {top:0,bottom:0,left:0,right:0}
  }
  matchLeftRight(input) {
    this.margins.left = input.margins.left
    this.margins.right = input.margins.right
  }
  matchTopBottom(input) {
    this.margins.top = input.margins.top
    this.margins.bottom = input.margins.bottom
  }
  setHeight(height) {
     this.height = height
  }
  setWidth(width) {
      this.width = width
  }
  setAspectRatio(aspectRatio) {
      this.aspectRatio = aspectRatio
  }
  setMargins(marginObject) {
      this.margins.top = marginObject.top
      this.margins.bottom = marginObject.bottom
      this.margins.left = marginObject.left
      this.margins.right = marginObject.right
  }
}

class Container {
    constructor(parent,name) {
        this.parent = parent
        this.dimensions = new Dimensions()
        this.content = this.parent.append("g")
                                        .attr("transform","translate("+this.dimensions.margins.left+","+this.dimensions.margins.top+")")
                                        .attr("width",this.dimensions.width)
                                        .attr("height",this.dimensions.height)
                                         .attr("id",name)
    }
}

class Legend extends Container {
  constructor(container,plot,box_boolean=false) {
      super(container,"legend");
      this.plot = plot
      this.entries = {}
      this.box_boolean = box_boolean
      //this.position = [(plot.dimensions.controls.width/2)-(100/2),0.2*plot.dimensions.global.height]
      this.spacing = 12
      this.hide = false
    //this.relative_position = [90,10]
  }
  addEntry(entry) {
    name = entry.name
    this.entries[name] = (entry)
  }
  draw() {
    var x_start = this.dimensions.margins.left
    var y_start = this.dimensions.margins.top
    var i = 0

    this.legend_group = this.content.append("g")
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
                            .attr("r",4)
                            .style("fill",function(d){return d.color})
                            .on("click",(d)=>this.itemClicked(d))
        this.legend_group.selectAll("text")
                          .data(entry_array)
                          .enter()
                          .append("text")
                            .text(function(d){return d.name})
                            .attr("x",function(d){return d.position[0]+8})
                            .attr("y",function(d){return d.position[1]+5})
                            .attr("class","h6")
                            //.attr("font-size", "16px")
                            .on("click",(d)=>this.itemClicked(d))

                            //.attr("transform","translate("+(item.position[0]+10)+","+(item.position[1]+5)+")")
                            //.style("text-anchor","start")
                            .style("fill","#396aa8")
  }
  redraw() {
    var x_start = this.dimensions.margins.left
    var y_start = this.dimensions.margins.top
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
                            .attr("r",4)
                            .style("fill",function(d){return d.color})
                            .style("opacity",function(d){
                              if (d.draw) {return 1}
                              else {return 0.3}
                            })
                            .on("click",(d)=>this.itemClicked(d))
            legend_circles.attr("cx",function(d){return d.position[0]})
                            .attr("cy",function(d){return d.position[1]})
                            .attr("r",4)
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
                            .attr("x",function(d){return d.position[0]+8})
                            .attr("y",function(d){return d.position[1]+5})
                            .attr("font-size", "16px")
                            .attr("class","h6")
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
                            .attr("x",function(d){return d.position[0]+8})
                            .attr("y",function(d){return d.position[1]+5})
                            .attr("font-size", "16px")
                            .attr("class","h6")
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
      this.dynamicPlot.redrawPoints()
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
                                          .attr("id","control_buttons")
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
        this.move();
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

class CombinedStaticDynamicPlot extends Container {
    constructor(container,aspectRatio) {
        super(container);

        this.aspectRatio = aspectRatio
        this.makeColorAxis();

        //this.containerDiv = d3.select("#age_co2_plot");
        this.beginPlot();

        this.staticPlot = new StaticPlot(this.outerSvg,1000/631,this.dimensions);
        this.dynamicPlot = new DynamicPlot(this.outerSvg,this.staticPlot.dimensions,this.colorAxis);
        this.dynamicPlot.content.on("mouseleave",()=>this.hiderMouseOut())

        this.controlPanel = new Container(this.outerSvg,"control_panel");
        this.controlPanel.dimensions.width = this.staticPlot.dimensions.margins.left
        this.controlPanel.dimensions.height = this.dimensions.height
        this.addControlsContent();

        this.addLegend();

        this.linkContainers();
    }

    beginPlot() {
        this.setDimensions()
        this.makeSvg()
        this.makeBackground()

    }
    setDimensions(aspectRatio) {
        this.dimensions = new Dimensions();
        this.dimensions.aspectRatio = this.aspectRatio
        this.dimensions.width = 500
        this.dimensions.height =this.dimensions.width/this.dimensions.aspectRatio
    }
    makeSvg() {
       var elementExists = document.getElementById("plot_svg");
       if (elementExists==null) {
           }
       else {
         d3.select("#plot_svg").remove();
       }

       this.outerSvg = this.content.append("svg")
                                              .attr("id","plot_svg")
                                              .attr("width",this.dimensions.width)
                                              .attr("height",this.dimensions.height)
                                              .on("mouseenter",()=>this.mouseEnterEvent())
                                              .on("mouseleave",()=>this.mouseLeaveEvent())


        }
    makeBackground() {
        this.background = this.outerSvg.append("rect")
                                            .attr("width",this.dimensions.width)
                                            .attr("height",this.dimensions.height)
                                            .attr("fill","white")
          }
    addControlsContent() {
        var button_width = 100
        var button_height = 30

        this.controlPanelButtons = new ButtonArray(this.controlPanel.content,[(this.controlPanel.dimensions.width/2)-(button_width/2),5],this)
        this.controlPanelButtons.addEntry(new ButtonEntry("Download",this.alignAxes,[button_width,button_height]))
        this.controlPanelButtons.addEntry(new ButtonEntry("Spare1",this.alignAxes,[button_width,button_height]))

        this.controlPanelButtons.constant = true
        this.controlPanelButtons.direction = "vertical"

        this.controlPanelButtons.draw()
      }

    // Legend
    makeColorAxis() {
        this.colorAxis = d3.scaleOrdinal()
                           .domain(["Algae ","Boron ","Stomata Frequency","Stomata Gas Exchange","Liverwort ","C3 ","Paleosol ","Nahcolite "])
                           .range(["#890903","#CC5304","#D38F08","#3B9001","#028492","#394B9F","#7424A7","#3D0F5A"])
        console.log("Color axes created")
      }
    addLegend() {
    this.legend = new Legend(this.controlPanel.content,this)
      this.colorAxis.domain().forEach((item, i) => {
        this.legend.addEntry(new LegendEntry(item,"circle",this.colorAxis(item)))
      });

      //console.log("Control panel buttons")
      //console.log(this.controlPanelButtons.entries["Spare1"].position[1])

      this.legend.dimensions.margins.top = this.controlPanelButtons.entries["Spare1"].position[1]+10;
      this.legend.dimensions.margins.left = this.controlPanelButtons.position[0];
      this.legend.draw();
    }

    // Mouse events
    mouseEnterEvent() {
      console.log("Mouse over plot")
      this.dynamicPlot.buttonArray.draw()
    }
    mouseLeaveEvent() {
      console.log("Mouse out plot")
      this.dynamicPlot.buttonArray.button_group.selectAll("rect")
                                    .transition().duration(1000)
                                    .style("opacity",0)
                                    .remove()
      this.dynamicPlot.buttonArray.button_group.selectAll("text")
                                    .transition().duration(500)
                                    .style("opacity",0)
                                    .remove()
    }

    hiderMouseOut() {

        //this.staticPlot.dimensions.margins.left = this.staticPlot.dimensions.margins.left+100
        //this.staticPlot.dimensions.margins.top = this.staticPlot.dimensions.margins.top-100
        if (this.dynamicPlot.changed) {
            this.staticPlot.content.transition().duration(1000).attr("transform","translate("+(this.staticPlot.dimensions.margins.left+150)+","+(this.staticPlot.dimensions.margins.top-100)+")");
        }
    }

    linkContainers() {
        this.dynamicPlot.legend = this.legend;
        this.legend.dynamicPlot = this.dynamicPlot;

        console.log("Containers linked");
    }
}
class StaticPlot extends Container {
    constructor(container,aspectRatio,containerDimensions) {
        super(container);
        this.setDimensions(aspectRatio,containerDimensions.height,containerDimensions.width);
        this.makeContent();
    }
    setDimensions(aspectRatio,height,containerWidth) {
        this.dimensions = new Dimensions()
        this.dimensions.aspectRatio = aspectRatio;
        this.dimensions.height = height;
        this.dimensions.width = this.dimensions.height*this.dimensions.aspectRatio;
        this.dimensions.margins.left = containerWidth-this.dimensions.width

        this.content.attr("transform","translate("+this.dimensions.margins.left+","+this.dimensions.margins.top+")")
                    .attr("width",this.dimensions.width)
                    .attr("height",this.dimensions.height)
    }
    makeContent() {
        //this.content = this.container.append("g")
        //                                .attr("transform","translate("+this.dimensions.margins.left+","+this.dimensions.margins.top+")")
        //                                .attr("width",this.dimensions.width)
        //                                .attr("height",this.dimensions.height)
        this.image = this.content.append("svg:image")
                    .attr("xlink:href", "images/subplots.svg")
                    .attr("x",0)
                    .attr("width",this.dimensions.width)
        }
}
class DynamicPlot extends Container {
  constructor(container,staticDimensions,colorAxis) {
      super(container);

      this.setDimensions(staticDimensions);

      this.dataFile = "data/data.json";
      this.changed = false;

      this.colorAxis = colorAxis;

      this.beginPlot()
  }

  // Starting plot
  beginPlot() {
    this.makeRight()

    this.makeBrush()
    this.makeDoubleClick()

    this.addData()
    this.addOverlayButtons()
  }
  setDimensions(staticDimensions) {
      this.dimensions = new Dimensions();

      var svgDefaultWidth = 272.214;
      var svgDefaultHeight = 172.656;

      var widthRatio = 173.440/svgDefaultWidth;
      var heightRatio = 99.013/svgDefaultHeight;

      var leftMarginRatio = 21.367/svgDefaultWidth
      var leftMargin = staticDimensions.margins.left+(leftMarginRatio*staticDimensions.width)

      var topMarginRatio = 57.720/svgDefaultHeight
      var topMargin = staticDimensions.margins.top+(topMarginRatio*staticDimensions.height)

      this.dimensions.setWidth(staticDimensions.width*widthRatio);
      this.dimensions.setHeight(staticDimensions.height*heightRatio);
      this.dimensions.setMargins({top:topMargin,bottom:0,right:0,left:leftMargin})

      this.content.attr("transform","translate("+this.dimensions.margins.left+","+this.dimensions.margins.top+")")
                  .attr("width",this.dimensions.width)
                  .attr("height",this.dimensions.height)
  }
  makeRight() {
      this.svg = this.content.append("g")
                                    .attr("transform","translate("+this.dimensions.margins.left+", "+this.dimensions.margins.top+")")
                                    .attr("width",this.dimensions.width)
                                    .attr("height",this.dimensions.height)
                                    .call(d3.zoom())
                                      .on("dblclick.zoom",null)
  }

  makePlot(data) {
      this.makeXAxis();
      this.makeYAxis();

      this.addLogo();

      this.drawPoints();
      this.redrawPoints();
    }

  // Data
  addData() {
    d3.json(this.dataFile).then((data)=>this.assignData(data)).then(()=>this.makePlot())
  }
  assignData(data) {
    console.log("Data loaded")
    this.data = data
  }

  addLogo() {
    //this.imageContainer = this.content.append("g")
    this.content.append("svg:image")
                        .attr("xlink:href", "images/logo.svg")
                        .attr("x",0.7*this.dimensions.width)
                        .attr("y",10)
                        .attr("width",0.25*this.dimensions.width)
                        .style("opacity",0.5)
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

    this.xAxis.transition().duration(1000).call(this.replacementXAxis())
    this.yAxis.transition().duration(1000).call(this.replacementYAxis())

    this.changed = true;
    this.redrawPoints();

  }
  makeBrush() {
    this.brush = d3.brush()
             .extent([[0,0],[this.dimensions.width,this.dimensions.height]])
             .on("end",()=>this.brushFunction())
    this.brushContainer = this.content.append("g")
                                         .attr("class", "brush")
                                         .call(this.brush)
                                         .on("dblclick",()=>this.doubleClickFunction())
     }
  makeDoubleClick() {
    this.clickContainer = this.content.append("g")
                                       .attr("class","click")
                                       .on("dblclick",()=>this.doubleClickFunction())
  }
  doubleClickFunction() {
    console.log("Double click")
    this.x.domain([70,0])
    this.y.domain([0,8000])

    this.xAxis.transition().duration(1000).call(this.replacementXAxis())
    this.yAxis.transition().duration(1000).call(this.replacementYAxis())

    this.changed = false;

    this.redrawPoints();
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


        this.redrawPoints()
  }

  // Plotting
  // Axes
  makeXAxis() {
    // Add X axis
    this.x = d3.scaleLinear()
          .domain([70,0])
          .range([0,this.dimensions.width]);

    this.xAxis = this.content.append("g")
                        .attr("transform", "translate(" + 0 + "," + (this.dimensions.height) + ")")
                        .classed("axis_text","true")
                        .style("font-size","5pt")
                        .style("font-weight","bold")
                        .call(d3.axisTop(this.x).tickPadding(-15));

    this.xAxis2 = this.content.append("g")
                        .attr("transform", "translate("+(0)+","+(0)+")")
                        .call(d3.axisBottom(this.x).tickFormat(""));

    console.log("X axis drawn");

    this.content.append("text")
                .attr("transform","translate(" + (this.dimensions.width/2) + "," + (this.dimensions.height+20) + ")")
                .style("text-anchor","middle")
                .text("Age (millions of years ago)")
                .classed("axis_text","true")
                .style("font-size","6pt")
                .style("font-family","sans-serif")
                .style("font-weight","bold")
                .style("fill","#0c448b")

    console.log("X axis labelled");
  }
  makeYAxis() {
      // Add Y axis
      this.y = d3.scaleLinear()
        .domain([0, 5500])
        .range([this.dimensions.height, 0]);

      this.yAxis = this.content.append("g")
        .attr("transform", "translate(" + 0 + "," + 0 + ")")
        .classed("axis_text","true")
        .style("font-size","5pt")
        .style("font-weight","bold")
        .call(d3.axisRight(this.y).tickPadding(-26).tickFormat(d3.format("d")));

      this.yAxis2 = this.content.append("g")
        .attr("transform","translate("+this.dimensions.width+","+0+")")
        .call(d3.axisLeft(this.y).tickFormat(""));

      console.log("Y axis drawn");

      var axisText = this.content.append("text")
         .style("transform","translate(" + -25 + "px," + ((this.dimensions.height/2)+40) + "px) rotate(-90deg)")
         .text("Atmospheric CO")
         .classed("axis_text","true")
         .style("font-size","6pt")
         .style("font-family","sans-serif")
         .style("font-weight","bold")
         .style("fill","#0c448b")
      axisText.append('tspan')
          .text('2')
          .style('font-size', '0.5rem')
          .attr('dx', '.1em')
          .attr('dy', '.2em')
      axisText.append("tspan")
          .text(" (ppm)")
          .style("font-size","6pt")
          .attr('dx', '0em')
          .attr('dy', '0em')

        console.log("Y Label added");
  }
  replacementXAxis() {
      return d3.axisTop(this.x).tickPadding(-15)
  }
  replacementYAxis() {
      return d3.axisRight(this.y).tickPadding(-26).tickFormat(d3.format("d"));
  }

  // Drawing
  drawPoints() {
    var x = this.x
    var y = this.y
    var colorAxis = this.colorAxis
    this.content.append('g')
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
  redrawPoints(zoom_in=true) {
    var x = this.x
    var y = this.y
    var colorAxis = this.colorAxis
    var data

    legend = this.legend;
    data = this.data.filter(function(d){
        return (legend.entries[d.method.concat(" ".concat(d.submethod))].draw)
    });

    var smallX = x.domain()[1]
    var bigX = x.domain()[0]
    var smallY = y.domain()[0]
    var bigY = y.domain()[1]


    var points = this.content.selectAll("circle").data(data)

    if (zoom_in)
    {
      points.exit().remove()
      points.enter().append("circle")
             .call(enter => enter.transition(this.content.transition().duration(1000)).style("opacity",1))
             .merge(points)
                         .attr("cx", function (data) {return x(data.age/1000);})
                         .attr("cy", function (data) {return y(data.co2);})
                         .attr("r",3)
                         .style("fill", function (data) {return colorAxis(data.method.concat(" ".concat(data.submethod)))})
                       .style("opacity", function (data) { if (data.age/1000<=bigX && data.age/1000>=smallX && data.co2<=bigY && data.co2>=smallY){return 1} else {return 0}} )
    }
    else {
      // points.exit().remove()
      // points.enter().append("circle")
      // .call(enter => enter.transition(this.content.transition().duration(1000)).style("opacity",1))
      //       .merge(points)
      //       .attr("cx", function (data) {return x(data.age/1000);})
      //       .attr("cy", function (data) {return y(data.co2);})
      //       .attr("r",3)
      //       .style("fill", function (data) {return colorAxis(data.method.concat(" ".concat(data.submethod)))})
      //       .style("opacity", function (data) { if (data.age/1000<=bigX && data.age/1000>=smallX && data.co2<=bigY && data.co2>=smallY){return 1} else {return 0}} )
            //.transition().duration(500)
            //.style("opacity", function (data) { if (data.age/1000<=bigX && data.age/1000>=smallX && data.co2<=bigY && data.co2>=smallY){return 1} else {return 0}} )
    }
    //this.legend.move() NEEDS LEGEND
    this.buttonArray.move()
  }

  // Buttons
  addOverlayButtons() {
    this.buttonArray = new ButtonArray(this.content,[5,2],this)
    this.buttonArray.addEntry(new ButtonEntry("Align",this.alignAxes,[60,30]))
    this.buttonArray.addEntry(new ButtonEntry("Hide",this.hideUnusedLegend,[60,30]))
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
     container.xAxis.transition().duration(1000).call(container.replacementXAxis())

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
      container.yAxis.transition().duration(1000).call(container.replacementYAxis())


     container.redrawPoints();


    //var log_x_Limits = [Math.floor(Math.log10(x_Limits[0]*1e6)),Math.floor(Math.log10(x_Limits[1]*1e6))]

    //console.log(log_x_Limits)

    //console.log(this.x.domain())
  }
  hideUnusedLegend(global) {
    global.legend.hide = (!global.legend.hide)
    global.legend.redraw()
  }
}

ageCO2Plot = new CombinedStaticDynamicPlot(d3.select("#age_co2_plot"),1200/550);
