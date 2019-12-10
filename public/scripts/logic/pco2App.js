'use strict';
var pco2App = angular.module('pco2App', [
  'ngRoute',
  'pco2Controllers',
  'ngAnimate',
  'toastr',
  'angularModalService'
]);

pco2App.constant('apiConfig',{
    //apiKey: 'APIKEY'
});

pco2App.config(function(toastrConfig) {
  angular.extend(toastrConfig, {
    timeOut: 3000
  });
});


pco2App.config(
  function($routeProvider,$locationProvider) {
      
    $routeProvider.
      when('/', {
        templateUrl: 'inc/index_inc.html',
        controller: 'indexView'
      }).
      when('/about', {
        templateUrl: 'inc/about_inc.html',
        controller: 'aboutView'
      }).
      when('/dataProxies', {
        templateUrl: 'inc/dataProxies_inc.html',
        controller: 'aboutView'
      }).
      when('/proxiesPhytoplankton', {
        templateUrl: 'inc/phytoplankton_inc.html',
        controller: 'aboutView'
      }).
      when('/proxiesPaleosols', {
        templateUrl: 'inc/paleosols_inc.html',
        controller: 'aboutView'
      }).
      when('/proxiesLiverworts', {
        templateUrl: 'inc/liverworts_inc.html',
        controller: 'aboutView'
      }).
      when('/proxiesLeafCarbon', {
        templateUrl: 'inc/landplantproxy_inc.html',
        controller: 'aboutView'
      }).
      when('/proxiesBoron', {
        templateUrl: 'inc/boron_inc.html',
        controller: 'aboutView'
      }).
      when('/proxiesNahcolite', {
        templateUrl: 'inc/nahcolite_inc.html',
        controller: 'aboutView'
      }).
      when('/proxiesStomatal', {
        templateUrl: 'inc/stomatal_inc.html',
        controller: 'aboutView'
      }).
      when('/proxiesLeafGas', {
        templateUrl: 'inc/leafgas_inc.html',
        controller: 'aboutView'
      }).
      when('/privacy', {
        templateUrl: 'inc/privacy_inc.html',
        controller: 'aboutView'
      }).
      otherwise({
        redirectTo: '/'
      });
      // use the HTML5 History API
        $locationProvider.html5Mode(true);
  });
