var pco2Controllers = angular.module('pco2Controllers', ['ngSanitize'])
.run(["$rootScope","$location","$window",function($rootScope, $location, $window) {
  $rootScope.$on('$routeChangeSuccess', function () {
    //console.log("hit: "+$location.url());
    //$window.ga('send', 'pageview', $location.url() ); 
  });
}]);

pco2Controllers.run(function($rootScope){
  $rootScope.Utils = {
     keys : Object.keys
  };

});
pco2Controllers.filter("trust", ['$sce', function($sce) {
  return function(htmlCode){
    return $sce.trustAsHtml(htmlCode);
  };
}]);

pco2Controllers.controller('indexView',['$scope','$timeout',function($scope,$timeout) {
    $timeout(function(){ $(".centralcontent").hide().fadeIn(500); }, 500);
}]);

pco2Controllers.controller('aboutView',['$scope','$timeout','$window',function($scope,$timeout,$window) {
    //$window.scrollTo({ top: 0, behavior: 'smooth' });
    $timeout(function(){ $window.scrollTo({top:0}); }, 200);
}]);
