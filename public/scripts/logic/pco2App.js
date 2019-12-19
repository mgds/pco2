'use strict';
var pco2App = angular.module('pco2App', [
  'ngRoute',
  'pco2Controllers',
  'ngAnimate',
  'toastr',
  'angularModalService'
]);

pco2App.constant('apiConfig',{
  faqPages: [
    {
      question: "Is CO<sub>2</sub> bad for the Earth?", 
      prefix: "faq01"
    },
    {
      question: "There is so little CO<sub>2</sub> in the atmosphere, how can it possibly matter?", 
      prefix: "faq02"
    },
    {
      question: "Why does atmospheric CO<sub>2</sub> warm the planet?",
      prefix: "faq03"
    },
    {
      question: "Which other greenhouse gases are there and what do we know about them from the geological record?",
      prefix: "faq04"
    },
    {
      question: "How are atmospheric levels of greenhouse gases reported? The differences between partial pressure and mole fraction.",
      prefix: "faq05"
    },
    {
      question: "What causes atmospheric CO<sub>2</sub> concentrations to change over time?",
      prefix: "faq06"
    },
    {
      question: "How do scientists know CO<sub>2</sub> is rising because of human activity and not because of natural cycles?", 
      prefix: "faq07"
    },
    {
      question: "Why should I care about CO<sub>2</sub> in the past?", 
      prefix: "faq08"
    },
    {
      question: "What do we know about how atmospheric CO<sub>2</sub> and temperature have changed in the past?",
      prefix: "faq09"
    },
    {
      question: "Why is the Cenozoic (i.e. the past 65 million years) a particularly useful interval of time for examining paleo-CO<sub>2</sub> and climate changes?", 
      prefix: "faq10"
    },
    {
      question: "When was the last time atmospheric CO<sub>2</sub> was as high as it is today?",
      prefix: "faq11"
    },
    {
      question: "What is the highest/lowest atmospheric CO<sub>2</sub> concentration that Earth has experienced?",
      prefix: "faq12"
    },
    {
      question: "What are paleo-proxies?", 
      prefix: "faq13"
    },
    {
      question: "How exactly do paleo-CO<sub>2</sub> proxies work?", 
      prefix: "faq14"
    },
    {
      question: "Why are there different proxies? Why can’t you just use one?", 
      prefix: "faq15"
    },
    {
      question: "What do the uncertainties mean? How are uncertainties calculated?", 
      prefix: "faq16"
    },
    {
      question: "Why does the rate of carbon release matter?",
      prefix: "faq17"
    },
    {
      question: "Why should I care about rising CO<sub>2</sub> if current concentrations are near the lowest in geologic time?",
      prefix: "faq18"
    }
  ]
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
      when('/faqs',{
        templateUrl: 'inc/faqs/faq_inc.html',
        controller: 'faqsView'
      }).
      when('/faq/:faqid',{
        templateUrl: 'inc/faqs/faqContainer.html',
        controller: 'faqView'
      }).
      otherwise({
        redirectTo: '/'
      });
      // use the HTML5 History API
        $locationProvider.html5Mode(true);
  });