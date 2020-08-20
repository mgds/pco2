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
