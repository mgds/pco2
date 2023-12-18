var pco2Controllers = angular.module('pco2Controllers', ['ngSanitize'])
.run([
          "$rootScope","$location","$window",
  function($rootScope,  $location,  $window) { //Google Analytics
    $rootScope.$on('$routeChangeSuccess', function () { $window.ga('send', 'pageview', $location.url() ); });
  }
]);
//allows injection of html
pco2Controllers.filter("trust", [
          '$sce',
  function($sce) {
    return function(htmlCode){ return $sce.trustAsHtml(htmlCode); };
  }
]);
pco2Controllers.filter("authorsFormat", [
          '$sce','refService',
  function($sce,  refService) {
    return function(authors){ return $sce.trustAsHtml(refService.authors(authors)); };
  }
]);
pco2Controllers.filter("editorsFormat", [
          '$sce','refService',
  function($sce,  refService) {
    return function(editors){ return $sce.trustAsHtml(refService.editors(editors)); };
  }
]);
pco2Controllers.filter("personFilter", function() {
  return function(items, search) {
    var filtered = [];
    if (search.proxies || search.steering_committee || search.project_roles) {
      angular.forEach(items, function(item) {
        var match = true;
        if (search.proxies) {
          match = false;
          if (item.proxies.every((d) => search.proxies.includes(d))) {
            match = true;
          }
        }
        if (search.steering_committee && !item.steering_committee) {
          match = false;
        }
        if (search.project_roles && !search.project_roles.includes(item.project_role)) {
          match = false;
        }
        if (match) {
          filtered.push(item);
        }
      });
    }else{
    	filtered=items;
    }
    return filtered;
  }
});

pco2Controllers.run(function($rootScope){
  $rootScope.Utils = {
     keys : Object.keys
  };
});

pco2Controllers.controller('sankeyView', [
          '$scope','$timeout','ModalService',
  function($scope,  $timeout,  ModalService) {
    $timeout(function(){ $(".centralcontent").hide().fadeIn(500); }, 500);
    $scope.sankeyPlot = new PCO2Sankey("#sankey_plot");
  }
]);

pco2Controllers.controller('indexView', [
        '$scope','$timeout','ModalService',
  function($scope,  $timeout,  ModalService) {
    $timeout(function(){ $(".centralcontent").hide().fadeIn(500); }, 500);
    $scope.ageCO2Plot = new PCO2Plot({"container_id": "#age_co2_plot", "product_plot": true});
    $scope.categories = {
      1 : $scope.ageCO2Plot.pco2Plot.categories.includes(1),
      2 : $scope.ageCO2Plot.pco2Plot.categories.includes(2),
      3 : $scope.ageCO2Plot.pco2Plot.categories.includes(3),
    };
    $scope.archive = false;
    $scope.toggleErrorBars = function() {
      if ($scope.ageCO2Plot.pco2Plot.showBars) {
        $scope.ageCO2Plot.hideUncertainties();
      } else {
        $scope.ageCO2Plot.showUncertainties();
      }
    };
    var ageCO2Plot=$scope.ageCO2Plot;
    $scope.toggleArchive = function() {
      $scope.archive = $scope.ageCO2Plot.pco2Plot.toggleArchive();
    };
    $scope.toggleCategory = function(category) {
      $scope.categories[category] = $scope.ageCO2Plot.pco2Plot.toggleCategory(category);
    };
    $scope.showDownloadDialog = function(format) {
    ModalService.showModal({
      templateUrl: "/inc/modal_download.html",
      controller: 'downloadController',
      preClose: (modal) => {
          modal.element.modal('hide');
      },
      inputs: {
        title: "Terms of Use",
        format: format,
        ageCO2Plot: ageCO2Plot
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
  }
]);

pco2Controllers.controller('paleoMapView', [
          '$scope','$timeout','ModalService', '$window',
  function($scope,  $timeout,  ModalService, $window) {
    $scope.line = false;
    $timeout(function(){ $(".centralcontent").hide().fadeIn(500); }, 500);
    $scope.timelinePlot = new TimelinePlotGroup(
      "#timeline_plot",
      function(){
        $scope.timelinePlot.timeline1.tl.on("click",function(event, d){
          var xy = d3.mouse(this);
          var age = Math.round($scope.timelinePlot.timeline1.x.invert(xy[0]) / 1000);
          $window.$( "#age" ).slider("value",65-age);
          $window.change_age(age.toString());
          
        });
      }
    );
    $window.updateLine = function(age){
      if ($scope.line) {
        $scope.line.remove();
      }
      if (typeof $scope.timelinePlot.timeline1.x == "undefined") {
        return;
      }
      var x2 = $scope.timelinePlot.timeline1.x(age*1000);
      var xshift = -1;
      var width = $scope.timelinePlot.timelineinfo.dimensions.width;
      var x2mod = (xshift / 2) + (x2/width)*(width - xshift);
      $scope.line = $scope.timelinePlot.timeline1.tl.append("line")
        .style("stroke", "black")
        .style("stroke-width", 1)
        .attr("x1", x2mod)
        .attr("y1", 0)
        .attr("x2", x2mod)
        .attr("y2", 10);
    }
    $window.initMap();
  }
]);

pco2Controllers.controller('downloadController', [
          '$scope','$element','title','format','ageCO2Plot','close',
  function($scope,  $element,  title,  format,  ageCO2Plot,  close) {
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
  }
]);

pco2Controllers.controller('aboutView', [
          '$scope','$timeout','$window',
  function($scope,  $timeout,  $window) {
    $timeout(function(){ $window.scrollTo({top:0}); }, 200);
  }
]);

pco2Controllers.controller('peopleView', [
  '$scope','$timeout','$window','$http', '$q',
  function($scope, $timeout, $window, $http, $q) {
    $timeout(function(){ $window.scrollTo({top:0}); }, 200);
    function removeAccents(value) {
      return value.normalize("NFD").replace(/[\u0300-\u036f]/g, "").replace(/-/)
        .replace(/[æ]/g, 'ae').replace(/ß/g, 'ss')
        .replace(/[₁¹]/g, '1').replace(/[₂²]/g, '2').replace(/[₃³]/g, '3').replace(/[₄⁴]/g, '4')
        .replace(/⁻/g, '-').replace(/-/g, ' ');
    }
    $scope.ignoreAccents = function(item,expected) {
      if (!expected) return true;
      if (angular.isObject(item) || !item) return false;
      item = removeAccents(item.toString().toLowerCase());
      expected = removeAccents(expected.toString().toLowerCase());
      return item.indexOf(expected) > -1;
    };
    $scope.proxyClick = function(evt){
      var obj = $(evt.currentTarget);
      obj.toggleClass('proxybuttonactive');
      obj.toggleClass('active');
      var proxy_val = obj.attr('data-value');
      if ($scope.searchv.proxies.includes(proxy_val)) {
        $scope.searchv.proxies.splice($scope.searchv.proxies.indexOf(proxy_val),1);
      } else {
        $scope.searchv.proxies.push(proxy_val);
      }
    };
    $scope.steeringClick = function(evt){
      var obj = $(evt.currentTarget);
      $(".rolebutton").removeClass('proxybuttonactive active')
      obj.addClass('proxybuttonactive active');
      $scope.searchv.project_roles = [];
      $scope.searchv.steering_committee = true;
    };
    $scope.rolesClick = function(evt){
      var obj = $(evt.currentTarget);
      $(".rolebutton").removeClass('proxybuttonactive active')
      obj.addClass('proxybuttonactive active');
      var role_val = obj.attr('data-value');
      $scope.searchv.steering_committee = false;
      if (!role_val)
        $scope.searchv.project_roles = [];
      else
        $scope.searchv.project_roles = [role_val];
    };
    $scope.proxyFilter = function(v,idx,arr) {
      var match = true;
      if ($scope.searchv.proxies.length>0) {
        if (!($scope.searchv.proxies.every((d) => v.proxies.includes(d)))) {
          return false;
        }
      }
      if ($scope.searchv.steering_committee==true && v.steering_committee==null) {
        return false;
      }
      if ($scope.searchv.project_roles.length>0 && !$scope.searchv.project_roles.includes(v.project_role)) {
        return false;
      }
      return match;
    };
    $scope.searchv = {
      proxies: [],
      steering_committee: false,
      project_roles: []
    };
    $scope.people_req = $http.get('/data/pco2_people.json',{});
    $scope.country_req = $http.get('/data/country.json',{});
    $q.all([$scope.people_req, $scope.country_req])
          .then(function(response) {
            $scope.proxylist = {
              "proxy_pedogenic_carbonate": {"title": "Pedogenic Carbonate", "icon": "/images/paleosolsIcon.svg", "url": "/proxiesPaleosols", "bg": "paleosols_bg"},
              //"proxy_stomatal": {"title": "Stomatal", "icon": "/images/stomatalIcon.svg", "url": "/proxiesStomatal", "bg": "stomatal_bg"},
              "proxy_boron": {"title": "Boron", "icon": "/images/boronIcon.svg", "url": "/proxiesBoron", "bg": "boron_bg"},
              "proxy_phytoplankton": {"title": "Phytoplankton/Biomarker", "icon": "/images/phytoplanktonIcon.svg", "url": "/proxiesPhytoplankton", "bg": "phytoplankton_bg"},
              //"proxy_plant_c3": {"title": "C3 land plant proxy (Leaf δ13C)", "icon": "/images/leafGasIcon.svg", "url": "/proxiesLeafCarbon", "bg": "leafcarbon_bg"}
              "proxy_leaf": {"title": "Leaf proxies (Stomatal and Leaf δ13C)", "icon": "/images/leafGasIcon.svg", "url": "/proxiesLeafCarbon", "bg": "leafproxies_bg"}
            };
            $scope.people = response[0].data;
            $scope.countries = {}
            for (let j = 0; j < response[1].data.length; j++) {
              $scope.countries[response[1].data[j].name] = response[1].data[j].code;
            }
            
            for (let i = 0; i < $scope.people.length; i++) {
              $scope.people[i].proxyvals = [];
              for (let j = 0; j < $scope.people[i].proxies.length; j++) {
                if ($scope.people[i].proxies[j] in $scope.proxylist)
                  $scope.people[i].proxyvals.push($scope.proxylist[$scope.people[i].proxies[j]]);
              }
              $scope.people[i].country_code = $scope.countries[$scope.people[i].country];
            }
          })
          .catch(function(response) { });
  }
]);

pco2Controllers.controller('faqsView', [
          '$scope','$timeout','$window','apiConfig',
  function($scope,  $timeout,  $window,  apiConfig) {
    $scope.faqs = apiConfig.faqPages;
    $timeout(function(){
      $window.scrollTo({top:0});
      $('.collapsible').click(function(e){
        e.preventDefault();
        var target_element= $(this).attr("data-target");
        $(target_element).toggleClass('collapse1');
        $(this).find(".glyphicon").toggleClass('glyphicon-menu-down').toggleClass('glyphicon-menu-right');
        return false;
      });
    }, 1000);
  }
]);

pco2Controllers.controller('faqView', [
          '$scope','$timeout','$window','apiConfig','$routeParams','$location',
  function($scope,  $timeout,  $window,  apiConfig,  $routeParams,  $location) {
    $scope.faqs = apiConfig.faqPages;
    $scope.faq = $scope.faqs[parseInt($routeParams.faqid)-1];
    if (!$scope.faqs[$routeParams.faqid]) {
      $location.path("/faqs");
    }
    $timeout(function(){
      $window.scrollTo({top:0});
    }, 200);
  }
]);



pco2Controllers.controller('refView', [
          '$scope','$timeout','$window','$http','$routeParams','$location',
  function($scope,  $timeout,  $window,  $http,  $routeParams,  $location) {
    $scope.yearSort = function(ref) {
      return `${(10000-ref.issued['date-parts'][0][0])} ${ref.author[0].family} ${ref.author[0].given}`;
    };
    $scope.authorSort = function(ref) {
      var year = ref.issued['date-parts'][0][0];
      var author = ref.author[0];
      return `${author.family} ${author.given} ${(10000-year)}`;
    };
    $scope.sortChange = function() { $scope.sortorder = $scope[$scope.sortFunction]; };
    $scope.sortFunction = 'yearSort';
    $scope.sortorder = $scope[$scope.sortFunction];
    $scope.reverse = false;
    function removeAccents(value) {
      return value.normalize("NFD").replace(/[\u0300-\u036f]/g, "").replace(/-/)
        .replace(/[æ]/g, 'ae').replace(/ß/g, 'ss')
        .replace(/[₁¹]/g, '1').replace(/[₂²]/g, '2').replace(/[₃³]/g, '3').replace(/[₄⁴]/g, '4')
        .replace(/⁻/g, '-').replace(/-/g, ' ');
    }
    $scope.ignoreAccents = function(item,expected) {
      if (!expected) return true;
      if (angular.isObject(item) || !item) return false;
      item = removeAccents(item.toString().toLowerCase());
      expected = removeAccents(expected.toString().toLowerCase());
      return item.indexOf(expected) > -1;
    };

    $http.get('/data/ref.json',{})
      .then(function(response) { $scope.refs = response.data; })
      .catch(function(response) { });
  }
]);
