import Resolver from 'resolver';

var App = Ember.Application.create({
  LOG_ACTIVE_GENERATION: false,
  LOG_VIEW_LOOKUPS: false,
  modulePrefix: 'tunebenders', // TODO: loaded via config
  resolver: Resolver
});

import routes from 'tunebenders/routes';
App.Router.map(routes); // TODO: just resolve the router

export default App;
