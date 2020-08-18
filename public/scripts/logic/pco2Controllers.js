var pco2Controllers = angular.module('pco2Controllers', ['ngSanitize'])
.run(["$rootScope","$location","$window",function($rootScope, $location, $window) {
  $rootScope.$on('$routeChangeSuccess', function () {
    //console.log("hit: "+$location.url());
    $window.ga('send', 'pageview', $location.url() );
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

pco2Controllers.controller('indexView',['$scope','$timeout','ModalService',function($scope,$timeout,ModalService) {
    $timeout(function(){ $(".centralcontent").hide().fadeIn(500); }, 500);
    ageCO2Plot = new PCO2Plot("#age_co2_plot");
    $scope.ageCO2Plot = ageCO2Plot;
    $scope.showDownloadDialog = function(format) {
        ModalService.showModal({
          templateUrl: "/inc/modal_download.html",
          controller: 'downloadController',
          preClose: (modal) => {
              modal.element.modal('hide');
          },
          inputs: {
            title: "Terms of Use",
            format: format
          }
        }).then(function(modal) {
          modal.element.on('hidden.bs.modal', function () {
              if (!modal.closed) {
                modal.close.then(function(){});
              }
          });
          modal.element.modal();
          modal.close.then(function() {});
        });
    };
}]);

pco2Controllers.controller('downloadController', [
  '$scope', '$element', 'title','format','close',
function($scope, $element, title, format, close) {
  $scope.title = title;
  $scope.format = format;
  //  This close function doesn't need to use jQuery or bootstrap, because
  //  the button has the 'data-dismiss' attribute.
  $scope.close = function() {
    ageCO2Plot.downloadData(format);
 	  close(false, 500);
  };

  //  This cancel function must use the bootstrap, 'modal' function because
  //  the doesn't have the 'data-dismiss' attribute.
  $scope.cancel = function() {
    $element.modal('hide');
    close(false, 500);
  };
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
        $(target_element).toggleClass('collapse1');
        $(this).find(".glyphicon").toggleClass('glyphicon-menu-down').toggleClass('glyphicon-menu-right');
        return false;
      });
    }, 1000);
}]);

pco2Controllers.controller('faqView',['$scope','$timeout','$window','apiConfig','$routeParams','$location',function($scope,$timeout,$window,apiConfig,$routeParams,$location) {
    //$window.scrollTo({ top: 0, behavior: 'smooth' });
    console.log("Route params FAQ ID")
    console.log(parseInt($routeParams.faqid)-1)
    $scope.faqs = apiConfig.faqPages;
    $scope.faq = $scope.faqs[parseInt($routeParams.faqid)-1];
    if (!$scope.faqs[$routeParams.faqid]) {
      $location.path("/faqs");
    }
    $timeout(function(){
      $window.scrollTo({top:0});
    }, 200);
}]);
