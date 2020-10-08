pco2Controllers.factory('refService',['$http',function($http){
  var service = {
    authors: function(authors){
      if (authors.length === 1) {
        return service.author(authors[0]);
      } else if (authors.length === 2) {
        return service.author(authors[0])+' &amp; '+service.author(authors[1]);
      } else if (authors.length > 2) {
        var auFormat = [];
        for (var i = 0; i<authors.length; i++) {
          auFormat.push(service.author(authors[i]));
        }
        auFormat[authors.length-1] = '&amp; ' + auFormat[authors.length-1];
        return auFormat.join(", ");
      }
    },
    author: function(auBlock){
      if (!auBlock.given || !auBlock.family) return '';
      var el = "span";
      var attr = "";
      if (auBlock.ORCID) {
        el = "a";
        attr += ` href="${auBlock.ORCID}"`;
      }
      if (auBlock.affiliation && auBlock.affiliation[0]) {
        attr += ` title="${auBlock.affiliation.map(a => a.name).join('; ')}"`;
      }
      return `<${el}${attr}>${auBlock.family}, ${auBlock.given.split(" ").map((n)=>n[0]).join(". ")}.</${el}>`;
    },
    editors: function(editors){
        var auFormat = [];
        for (var i = 0; i<editors.length; i++) {
          auFormat.push(service.editor(editors[i]));
        }
        return auFormat.join(", ")+" (Eds.)";
    },
    editor: function(auBlock){
      if (!auBlock.given || !auBlock.family) return '';
      var el = "span";
      var attr = "";
      if (auBlock.ORCID) {
        el = "a";
        attr += ` href="${auBlock.ORCID}"`;
      }
      if (auBlock.affiliation && auBlock.affiliation[0]) {
        attr += ` title="${auBlock.affiliation[0].name}"`;
      }
      return `<${el}${attr}>${auBlock.given.split(" ").map((n)=>n[0]).join(".")}. ${auBlock.family}</${el}>`;
    }
  };
  return (service);
}]);
