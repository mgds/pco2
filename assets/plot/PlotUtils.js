class PlotUtils {
  static copyStylesInline(destinationNode, sourceNode,removeClass=[]) {
    var styles = ["overflow","stroke","stroke-width","fill","font-family","opacity","font-size","font-weight","text-anchor","baseline-shift"];
     var containerElements = ["svg","g"];
     for (var cd = destinationNode.childNodes.length - 1; cd >= 0; cd--) {
     //for (var cd = 0; destinationNode < destinationNode.childNodes.length; cd++) {
        var child = destinationNode.childNodes[cd];
        let test_string = (` ${child.className.baseVal} `).replace(/[\n\t]/g, " ");
        let class_test = false;
        for (let i = 0; i<removeClass.length && !class_test; i++) {
          if (test_string.indexOf(` ${removeClass[i]} `) > -1)
            class_test = true;
        }
        if (class_test) {
          child.remove();
          continue;
        }
        if (containerElements.indexOf(child.tagName) != -1) {
            this.copyStylesInline(child, sourceNode.childNodes[cd],removeClass);
            continue;
        }
        var style = sourceNode.childNodes[cd].currentStyle || window.getComputedStyle(sourceNode.childNodes[cd]);
        if (style == "undefined" || style == null) continue;
        for (var st = 0; st < style.length; st++){
         if (styles.indexOf(style[st]) != -1)
            child.setAttribute(style[st], style.getPropertyValue(style[st]));
        }
     }
  }
  static deepCopy(inObject) {
    if (typeof inObject !== "object" || inObject === null) {
      return inObject;
    }
    var outObject = Array.isArray(inObject)?[]:{};
    for (var key in inObject) {
      outObject[key] = this.deepCopy(inObject[key]);
    }
    return outObject;
  }
}
