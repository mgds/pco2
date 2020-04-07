var pco2Controllers = angular.module('pco2Controllers', ['ngSanitize'])
.run(["$rootScope","$location","$window",function($rootScope, $location, $window) {
  $rootScope.$on('$routeChangeSuccess', function () {
    //console.log("hit: "+$location.url());
    //$window.ga('send', 'pageview', $location.url() );
  });
}]);

pco2Controllers.filter("trust", ['$sce', function($sce) {
  return function(htmlCode){
    return $sce.trustAsHtml(htmlCode);
  };
}]);

pco2Controllers.run(function($rootScope){
  $rootScope.Utils = {
     keys : Object.keys
  };

});

pco2Controllers.controller('indexView',['$scope','$timeout',function($scope,$timeout) {
    $timeout(function(){ $(".centralcontent").hide().fadeIn(500); }, 500);
}]);

pco2Controllers.controller('aboutView',['$scope','$timeout','$window',function($scope,$timeout,$window) {
    //$window.scrollTo({ top: 0, behavior: 'smooth' });
    $timeout(function(){ $window.scrollTo({top:0}); }, 200);
}]);

pco2Controllers.controller('faqsView',['$scope','$timeout','$window','apiConfig',function($scope,$timeout,$window,apiConfig) {
    //$window.scrollTo({ top: 0, behavior: 'smooth' });
    $scope.faqs = apiConfig.faqPages;
    $timeout(function(){ $window.scrollTo({top:0});
      $('.collapsible').click(function(e){
        e.preventDefault();
        var target_element= $(this).attr("data-target");
        console.log(target_element);
        $(target_element).toggleClass('collapse1');
        $(this).find(".glyphicon").toggleClass('glyphicon-menu-down').toggleClass('glyphicon-menu-right');
        return false;
      });
    }, 1000);
}]);

pco2Controllers.controller('faqView',['$scope','$timeout','$window','apiConfig','$routeParams','$location',function($scope,$timeout,$window,apiConfig,$routeParams,$location) {
    //$window.scrollTo({ top: 0, behavior: 'smooth' });
    $scope.faqs = apiConfig.faqPages;
    $scope.faq = $scope.faqs[parseInt($routeParams.faqid)-1];
    if (!$scope.faqs[$routeParams.faqid]) {
      $location.path("/faqs");
    }
    $timeout(function(){
      $window.scrollTo({top:0});
    }, 200);
}]);
