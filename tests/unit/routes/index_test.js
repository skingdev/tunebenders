import App from 'tunebenders/app';

var route;

module("Unit - IndexRoute", {
  setup: function(){
    route = App.__container__.lookup('route:index');
  }
});

test("it exists", function(){
  expect(1);
  ok(exists(route));
  //ok(route instanceof Ember.Route);
});


1