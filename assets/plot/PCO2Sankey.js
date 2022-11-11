class PCO2Sankey extends PlotGroup {
  pco2SankeyRow() {
      return {
      "id": null,
      "name": null,
      "doi": null,
      "proxy": null,
      "numSource": 0,
      "numTarget": 0,
      "numQuarantined": 0,
      "numRecalculated": 0,
      "numQualitativeGood": 0,
      "source": {"y1": 0, "y2": 0, "qHeight": 0, "qy": 0},
      "target": {"y1": 0, "y2": 0, "rHeight": 0}
    };
  }
  constructor(container_id) {
    super(container_id);
    self = this;
    this.colors = {
      "Quarantined": {"color": "#808080", "class": "quarantined"},
      "Phytoplankton": {"color": "#890903", "class": "phytoplankton"},
      "Boron Proxies": {"color": "#CC5304", "class": "boron"},
      "Stomatal Frequencies": {"color": "#D38F08", "class": "stomatal"},
      "Leaf Gas Exchange": {"color": "#3B9001", "class": "leafgas"},
      "Liverworts": {"color": "#028492", "class": "liverworts"},
      "Land Plant 𝛿¹³C": {"color": "#394B9F", "class": "c3plants"},
      "Paleosols": {"color": "#7424A7", "class": "paleosols"},
      "Nahcolite": {"color": "#3D0F5A", "class": "nahcolite"}
    };
    this.plt = new PCO2PlotData();
    this.data = {};
    this.rNodes = {};
    this.order = Object.keys(this.colors);
    //Load data
    this.padV = 5;
    this.padH = 1;
    //this.proxy = null;
    this.proxy = null;
    this.width = this.plt.plotWidth;
    this.height = this.plt.plotHeight;
    this.plotWidth = this.plt.expanded.width;
    this.plotHeight = this.plt.expanded.height;
    this.left = this.plt.expanded.margins.left;
    this.top = this.plt.expanded.margins.top;

    this.containerWidth = this.plotWidth*0.15;
    this.spacing = this.plotHeight*0.01;
    this.class_axis = this.plt.pco2Plot.classAxis;

    this.data_files = [ "data/Paleo-CO2_Combined_Summary.json" ];
    this.tooltipDiv = d3.select("body").append("div")
      .classed("tooltip_sankey", true)
      .style("opacity", 0);
    this.createContainer();
    this.generatePlot();
  }
  generatePlot() {
    this.createLogo();
    this.plotcontent = this.container.append("g")
        .attr("id","sankey_plotcontent")
        .classed("dynamic_plot",true)
        .attr("transform",`translate(${this.left},${this.top})`);
    this.plotcontent.append("rect")
      .classed("background",true)
      .attr("width",this.width)
      .attr("height",this.height);
    this.clip_id = `clip_sankey`;
    this.clip = this.container.append("defs")
      .append("svg:clipPath")
        .attr("id", this.clip_id)
        .append("svg:rect")
          .attr("width", this.width )
          .attr("height", this.height )
          .attr("x", 0)
          .attr("y", 0);
    this.addData();
  }
  createLogo() { // Creates the logo as a data URL
      var canvas = document.createElement("canvas");
      canvas.width = this.plt.logo.imgWidth; // Manually set for required resolution
      canvas.height = this.plt.logo.imgHeight;
      this.logo = this.container.append("svg:image")
          .attr("id","logo").attr("class","plot_logo")
          .attr("x",this.plt.logo.margins.left) // Manually determined values - tune as needed
          .attr("y",this.plt.logo.margins.top)
          .attr("height",this.plt.logo.height)
          .attr("width",this.plt.logo.width);
      var img = new Image();
      img.onload = ()=> {
          canvas.getContext("2d").drawImage(img,0,0);
          this.logo.attr("xlink:xlink:href",canvas.toDataURL()); // Add image as data URL so that it exports properly
      };
      img.src = "/images/logo.svg";
  }
  addData() { // Promise to retrieve data and call function to draw plot
    var self = this;
    Promise.all(this.data_files.map(x=>d3.json(x)))
      .then(function(data){self.data = data;})
      .then(function(){self.makePlot();});
  }
  makePlot() {
    this.setData(this.data[0], this.proxy);
    this.draw();
  }
  redrawFunction(runCallback){
    var self = this;
    this.redraw(runCallback);
  }
  redraw() {

  }

  setData(nodes, proxy) {
    var self = this;
    var rNodes = [];
    //nodes will be publication_id, publication_name, proxy numSource, numTarget, numQuarantined, numRecalculated
    //x, y values are calculated from sourceCount, targetCount

    var fields = ["numSource","numTarget","numQuarantined","numRecalculated","numQualitativeGood"];
    if (proxy) {
      rNodes = nodes.filter(d => d.proxy == proxy); // get where proxy == proxy
      rNodes = rNodes.map(d => {d.name = RefFunctions.referenceFormatShort(d); return Object.assign(self.pco2SankeyRow(),d);}); //make sankey fields
    } else {
      //Make array with row for each proxy in order
      self.order.filter(d => d != "Quarantined").forEach(function(d) {
        var rNode = Object.assign(self.pco2SankeyRow(),{"id": self.colors[d]["class"],"name": d, "proxy": d});
        nodes.forEach(function (e) {
          if (e.proxy == d)
            fields.forEach( f => rNode[f] += e[f] );
        });
        rNodes.push(rNode);
      });
    }
    var qData = Object.assign(self.pco2SankeyRow(),{"id": "quarantined", "name": "Quarantined", "proxy": "Quarantined"});
    for (let i=0; i<rNodes.length; i++) {
      qData.numTarget += rNodes[i].numQuarantined;
    }
    rNodes.unshift(qData);
    self.calculateSizes(rNodes);
    self.rNodes = rNodes;
  }
  calculateSizes(rNodes) {
    var padd = self.getPad(rNodes);
    var tQy = padd.rTop;
    var yLeft = this.padV + padd.lTop;
    var yRight = this.padV + padd.rTop;
    for (let i=0; i<rNodes.length; i++) {
      rNodes[i].source.y1 = yLeft;
      rNodes[i].source.y2 = yLeft + rNodes[i].numSource * padd.tUnit;
      if (rNodes[i].numSource > 0) {
        rNodes[i].source.qHeight = (rNodes[i].numSource - rNodes[i].numTarget) * padd.tUnit;
        rNodes[i].source.qy = tQy;
        tQy += rNodes[i].source.qHeight;
        yLeft = rNodes[i].source.y2 + padd.lSpacing;
      }
      rNodes[i].target.y1 = yRight;
      rNodes[i].target.y2 = yRight + rNodes[i].numTarget * padd.tUnit;
      if (rNodes[i].numTarget > 0) {
        rNodes[i].target.rHeight = rNodes[i].numRecalculated * padd.tUnit;
        yRight = rNodes[i].target.y2 + padd.rSpacing;
      }
    }
  }

  getPad(rNodes) {
    var cnt = {"source" : 0, "target" : 0, "total" : 0};
    for (let i=0; i<rNodes.length; i++) {
      cnt.total += rNodes[i].numSource;
      cnt.source += rNodes[i].numSource > 0 ? 1 : 0;
      cnt.target += rNodes[i].numTarget > 0 ? 1 : 0;
    }
    var maxGaps = Math.max(cnt.source, cnt.target) - 1;
    var minGaps = Math.min(cnt.source, cnt.target) - 1;
    var maxSpacing = maxGaps / Math.max(1, minGaps) * this.spacing;
    return {
      "lTop" : ((cnt.source == 1) ? maxSpacing / 2 : 0),
      "rTop" : ((cnt.target == 1) ? maxSpacing / 2 : 0),
      "tUnit" : ((this.plotHeight - 2 * this.padV - maxGaps * this.spacing) / Math.max(1, cnt.total)),
      "lSpacing" : ((cnt.source>cnt.target) ? this.spacing : maxSpacing),
      "rSpacing" : ((cnt.target>cnt.source) ? this.spacing : maxSpacing)
    };
  }

  //{node: uid, name: name, url: url, proxy: proxy, npoints: num, recalculated: num}
  //{proxy: proxy, name: name, npoints: num, recalculated: num}
  //{source_node: uid, source_proxy: proxy target_node: uid, target_proxy: proxy||quarantined value: num }

  //color() {proxy color, for references, scale for each node}
  draw() {
    var self = this;
    var x1Left = this.padH;
    var x2Left = this.padH + this.containerWidth;
    var x1Right = this.plotWidth - this.padH - this.containerWidth;
    //const {nodes, links} = sankey(data);
    this.plotcontent.selectAll("*").remove();
    var pts = this.plotcontent.append("g")
      .attr("id", "sankey_plot_main")
      .selectAll("g")
      .data(self.rNodes)
      .enter()
      .append("g")
      .on("click", function(d) {
        if (self.proxy) {
          self.proxy = null;
        } else {
          self.proxy = d.proxy;
        }
        self.setData(self.data[0], self.proxy);
        self.draw();
      })
      .on("mouseover", function(d) {
        var rect = d3.select(this).select(".source_rect").node().getBoundingClientRect();
        d3.select(this).selectAll(".sankey_rect").transition().duration(400).attr("opacity",1);
        d3.select(this).selectAll(".sankey_link").transition().duration(400).attr("stroke-opacity",0.5);
        self.tooltipDiv.transition().duration(200).style("opacity", 0.9);
        self.tooltipDiv.html(self.tooltipText(d))
          .style("left", (rect.right + 5 + window.scrollX) + "px")
          .style("top", (rect.top + window.scrollY) + "px");
      })
      .on("mouseout", function(d) {
        d3.select(this).selectAll(".sankey_rect").transition().duration(200).attr("opacity",0.8);
        d3.select(this).selectAll(".sankey_link").transition().duration(200).attr("stroke-opacity",0.35);
        self.tooltipDiv.transition().duration(500).style("opacity", 0);
        self.tooltipDiv.html('');
      })
      .on("click", function(d) {
        if (d.numSource > 0) {
          if (self.proxy) {
            self.proxy = null;
          } else {
            self.proxy = d.proxy;
          }
          self.setData(self.data[0], self.proxy);
          self.draw();
        }
      });

    pts.filter(d => d.numSource > 0)
      .append("rect")
      .classed("sankey_rect source_rect", true)
      .attr("x", x1Left)
      .attr("y", d => d.source.y1)
      .attr("height", d => d.source.y2 - d.source.y1)
      .attr("width", self.containerWidth)
      .attr("fill", d => self.colors[d.proxy].color)
      .attr("opacity", "0.8")


    pts.filter(d => d.numSource > 0)
      .append("text")
        .attr("x", x1Left - 4 )
        .attr("y", d => (d.source.y2 + d.source.y1) / 2)
        .attr("dy", "0.35em")
        .attr("text-anchor", "end")
        .text(d => d.name);

    pts.filter(d => d.numTarget > 0)
      .append("rect")
        .classed("sankey_rect", true)
        .attr("x", x1Right)
        .attr("y", d => d.target.y1)
        .attr("height", d => d.target.y2 - d.target.y1)
        .attr("width", self.containerWidth)
        .attr("fill", d => self.colors[d.proxy].color)
        .attr("opacity", "0.8")
      .append("title")
        .text(d => `${d.name}\n`);

    pts.filter(d => d.numSource == 0)
      .append("text")
        .attr("x", x1Right + self.containerWidth / 2 )
        .attr("y", d => d.target.y1 + 8 )
        .attr("dy", "0.35em")
        .attr("text-anchor", "middle")
        .text(d => d.name);

    var linkQ = pts.filter(d => d.source.qHeight > 0)
      .append("g")
        .classed("sankey_link", true)
        .attr("stroke-opacity", 0.35);

    var gradient = linkQ.append("linearGradient")
        .attr("id", d => d.id.replace(" ","_")+"Q")
        .attr("gradientUnits", "userSpaceOnUse")
        .attr("x1", x2Left)
        .attr("x2", x1Right);

    gradient.append("stop")
        .attr("offset", "0%")
        .attr("stop-color", d => self.colors[d.proxy].color);

    gradient.append("stop")
        .attr("offset", "100%")
        .attr("stop-color", d => self.colors.Quarantined.color);

    linkQ.append("path")
        .attr("d", d3.linkHorizontal().source(d => [x2Left, d.source.y1 + d.source.qHeight / 2]).target(d => [x1Right, self.padV + d.source.qy + d.source.qHeight / 2]))
        .attr("stroke", d => `url(#${d.id.replace(" ","_")}Q)`)
        .attr("stroke-width", d => d.source.qHeight == 0 ? 0 : Math.max(0.5, d.source.qHeight));

    const link = pts.filter(d => d.numSource > 0 && d.numTarget > 0)
      .append("g")
        .classed("sankey_link", true)
        .attr("stroke-opacity", 0.35);

    link.append("path")
        .attr("d", d3.linkHorizontal().source(d => [x2Left, (d.source.y2 + d.source.y1 +d.source.qHeight)/2]).target(d => [x1Right, (d.target.y1 + d.target.y2)/2]))
        .attr("stroke", d => self.colors[d.proxy].color)
        .attr("stroke-width", d => d.numTarget == d.numQuarantined ? 0 : Math.max(0.5, d.source.y2 - d.source.y1 - d.source.qHeight));
  }

  tooltipText(dRow) {
    var ref = `<div>`;
    if (this.proxy)
      ref += `<div class="nameval"><div class="name">Citation:</div><div class="val">${RefFunctions.referenceFormatFull(dRow)}</div></div>`;
    else
      ref += `<div class="nameval"><div class="name">Proxy:</div><div class="val">${dRow.name}</div></div>`;
    ref += `<div class="nameval"><div class="name">Total Points:</div><div class="val">${dRow.numSource}</div></div>`;
    ref += `<div class="nameval"><div class="name">Quarantined:</div><div class="val">${dRow.numQuarantined}`;
    if (dRow.numQualitativeGood)
      ref += ` (${dRow.numQualitativeGood} qualitatively good)`;
    ref += `</div></div>`;
    ref += `<div class="nameval"><div class="name">In Product:</div><div class="val">${dRow.numTarget}</div></div>`;
    ref += `<div class="nameval"><div class="name">Recalculated:</div><div class="val">${dRow.numRecalculated}</div></div>`;
    ref += `</div>`;
    return ref;
  }
}
