class Legend { // A class for the legend, which inherits a container structure
  constructor(parent,dimensions) {
    var self = this;
    this.dimensions = dimensions;
    this.content = parent.container.append("g")
      .attr("id","legend_container")
      .attr("transform",`translate(${dimensions.margins.left},${dimensions.margins.top})`);
    this.entries = {}; this.entry_array = [];
    for (var name in parent.class_axis) {
      this.entry_array.push({"name":name,"class":parent.class_axis[name],"draw":true});
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
