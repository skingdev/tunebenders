var pics = Ember.View.extend({
  didInsertElement: function(){
    Galleria.loadTheme("vendor/jquery-galleria/src/themes/classic/galleria.classic.js");
    Galleria.run("#galleria");
  }
});

export default pics;
