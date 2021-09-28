var pco2App = angular.module('pco2App', [
  'ngRoute',
  'pco2Controllers',
  'ngAnimate',
  'angularModalService'
]);
pco2App.constant('apiConfig',apiConfig);
pco2App.constant('routes',routes);
pco2App.config(function($routeProvider,$locationProvider,routes) {
  for (var path in routes) {
    $routeProvider.when(path, routes[path]);
  }
  $routeProvider.otherwise({ redirectTo: '/' });
    // use the HTML5 History API
  $locationProvider.html5Mode(true);
});
