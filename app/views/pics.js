var pics = Ember.View.extend({
  didInsertElement: function(){
    $('#gallery').nivoGallery();
  }
});

export default pics;
