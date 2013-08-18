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
