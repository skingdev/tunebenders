// TODO: load based on params
Ember.keys(define.registry).filter(function(key) {
  return (/\-test/).test(key);
}).forEach(requireModule);