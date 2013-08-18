import App from 'tunebenders/app';

module("Acceptances - Index", {
  setup: function(){
    App.reset();
  }
});

test("index renders", function(){
  expect(1);

  visit('/').then(function(){
    ok(exists("h2:contains('Welcome to the Tunebenders band website')"));

  });
});

test("clicking on songs link takes you to songs page", function(){

  click(".nav-primary li:contains('Songs') a ").then(function(){
    ok(exists("th:contains('Song')"));
  });
});

test("clicking on schedule link takes you to schedule page", function(){

  click(".nav-primary li:contains('Schedule') a ").then(function(){
    ok(exists("label:contains('No upcoming shows yet')"));
  });
});
