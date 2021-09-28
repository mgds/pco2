/**
* Setters and getters for domains of plots
*/
class DomainControl {
  /**
  * Create a DomainControl object with initial state.
  * @param {Array} domains - An array of x/y domains of the form [[[xmin,xmax],[ymin,ymax]],...]
  */
  constructor(domains) {
    //Create an initial domains object.
    //THIS OBJECT IS NOT MODIFIED and stores the initial state of the plot
    this.domains = domains;
    //Create a current domains object. THIS OBJECT CHANGES
    this.current_domains = PlotUtils.deepCopy(domains);
  }
  /**
  * Return the x domain at index idx, optionally setting it to domain_x first, if specified
  * @param {integer} idx - The index of the x/y domain
  * @param {Array} [domain_x] - the x domain to set at this index, if desired
  * @returns {Array} The current x domain of the form [xmin, xmax]
  */
  domainX(idx,domain_x=null) {
    if (domain_x!==null) this.current_domains[idx][0] = domain_x;
    return this.current_domains[idx][0];
  }
  /**
  * Return the y domain at index idx, optionally setting it to domain_y first, if specified
  * @param {integer} idx - The index of the x/y domain
  * @param {Array} [domain_y] - the y domain to set at this index, if desired
  * @returns {Array} The current y domain of the form [ymin, ymax]
  */
  domainY(idx,domain_y=null) {
    if (domain_y!==null) this.current_domains[idx][1] = domain_y;
    return this.current_domains[idx][1];
  }
  /**
  * Return the initial x domain at index idx when this object was created
  * @returns {Array} The initial x domain of the form [xmin, xmax]
  */
  initialDomainX(idx) {
    return this.domains[idx][0];
  }
  /**
  * Return the initial y domain at index idx when this object was created
  * @returns {Array} The initial y domain of the form [ymin, ymax]
  */
  initialDomainY(idx) {
    return this.domains[idx][1];
  }
  /**
  * Set the x domain at index idx to its initial state
  * @returns {object} The initial x domain of the form [xmin, xmax]
  */
  resetDomainX(idx) {
    return this.domainX(idx,this.domains[idx][0]);
  }
  /**
  * Set the y domain at index idx to its initial state
  * @returns {object} The initial y domain of the form [ymin, ymax]
  */
  resetDomainY(idx) {
    return this.domainY(idx,this.domains[idx][1]);
  }
  /**
  * Compares the x and y domains to their initial state to determine if they are equal
  * and returns true if the plot domains are not equal (i.e. the plot is zoomed in)
  * @param {integer} x_idx - The index of the x domain to check
  * @param {integer} y_idx - The index of the y domain to check
  * @param {boolean} [scaleLinear=true] - (unused) true if plot is linear scale; false if plot is log scale
  * @returns {boolean} true if initial and current domains are not equal, otherwise false
  */
  zoomed(x_idx,y_idx,scaleLinear=true) { //Current domain not equal to initial domain
    //var iy = this.initialDomainY(y_idx);
    //iy[0]=scaleLinear?iy[0]:Math.max(iy[0],10);
    return (
      (JSON.stringify(this.initialDomainX(x_idx)) !== JSON.stringify(this.domainX(x_idx))) ||
      (JSON.stringify(this.initialDomainY(y_idx))!==JSON.stringify(this.domainY(y_idx)))
    );
  }
  /**
  * Compares the x domain to its initial state to determine if it is equal
  * and returns true if it is not equal (i.e. the plot is zoomed in the x dimension)
  * @param {integer} x_idx - The index of the x domain to check
  * @param {integer} y_idx - The index of the y domain to check
  * @param {boolean} [scaleLinear=true] - true if plot is linear scale; false if plot is log scale
  * @returns {boolean} true if initial and current domains are not equal, otherwise false
  */
  zoomedX(x_idx) { //Current domain not equal to initial domain
    return (
      (this.initialDomainX(x_idx)[0] !== this.domainX(x_idx)[0] || this.initialDomainX(x_idx)[1] !== this.domainX(x_idx)[1])
    );
  }
}
