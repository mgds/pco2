class TimelinePlotGroup extends PlotGroup { // Overall container class for plots
    constructor(container_id, callbackf=false) {
      super(container_id);
      self = this;
      this.plt = new PCO2PlotData();
      self = this;
      this.domains = [
        [[65000,0],[0,10000]], //pco2 plot units kiloAnnum and ppm
        [[800,0],[5,35]] //temperature plot 2 units kiloAnnum and degC (other plots based on these dimensions)
      ];
      this.timelineinfo = {
        "noclick":true,
        "plotSrc" : [ "data/geologicTime.json" ],
        "container_id" : "timeline1",
        "dimensions" : {
          "width" : 267,
          "height" : 10,
          "margins" : {
            "left" : 0,
            "top" : 0
          },
          "d_x" : 0,
          "d_y" : 0,
          "axes" : {
            "yRight" : { "ticks" : 0 },
            "yLeft" : { "ticks" : 0 },
            "xBottom" : { "ticks" : 0 },
            "xTop" : { "ticks" : 0 }
          }
        }
      };
      this.setDomains(this.domains);
      this.setAllDimensions(); //sets domains, width, height, plotDims
      this.createContainer();
      this.generatePlot(callbackf);
    }
    generatePlot(callbackf) {
      this.timeline1 = new TimeLine(this,this.timelineinfo);
      this.timeline1.addData(callbackf);
    }
    setAllDimensions() {
      //CALCULATED VALUES
      this.width = 267;
      this.height = 10;
      this.div_subtract = 0;
      this.dims = {
        "timeline1"  : {"noclick":true,"width":267,"height":10,"margins":{"left":0,"top":0  },"d_x":0,"d_y":0,
            "axes":{"yRight":{"ticks":0},"yLeft":{"ticks":0},"xBottom":{"ticks":0},"xTop":{"ticks":0} }}
      };
    }
}
