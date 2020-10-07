var routes = {
  '/': { templateUrl: 'inc/index_inc.html', controller: 'indexView' },
  '/about': { templateUrl: 'inc/about_inc.html', controller: 'aboutView' },
  '/dataProxies': { templateUrl: 'inc/dataProxies_inc.html', controller: 'aboutView' },
  '/proxiesPhytoplankton': { templateUrl: 'inc/phytoplankton_inc.html', controller: 'aboutView' },
  '/proxiesPaleosols': { templateUrl: 'inc/paleosols_inc.html', controller: 'aboutView' },
  '/proxiesLiverworts': { templateUrl: 'inc/liverworts_inc.html', controller: 'aboutView' },
  '/proxiesLeafCarbon': { templateUrl: 'inc/landplantproxy_inc.html', controller: 'aboutView' },
  '/proxiesBoron': { templateUrl: 'inc/boron_inc.html', controller: 'aboutView' },
  '/proxiesNahcolite': { templateUrl: 'inc/nahcolite_inc.html', controller: 'aboutView' },
  '/proxiesStomatal': { templateUrl: 'inc/stomatal_inc.html', controller: 'aboutView' },
  '/proxiesLeafGas': { templateUrl: 'inc/leafgas_inc.html', controller: 'aboutView' },
  '/privacy': { templateUrl: 'inc/privacy_inc.html', controller: 'aboutView' },
  '/experts': { templateUrl: 'inc/expert_inc.html', controller: 'aboutView' },
  '/references': { templateUrl: 'inc/references_inc.html', controller: 'refView' },
  '/contribute': { templateUrl: 'inc/contribute_inc.html', controller: 'aboutView' },
  '/faqs': { templateUrl: 'inc/faqs/faq_inc.html', controller: 'faqsView' },
  '/faq/:faqid': { templateUrl: 'inc/faqs/faqContainer.html', controller: 'faqView' }
};
