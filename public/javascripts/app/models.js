$(function() {
  
  /* --------------------------------
     MODELS:
      - Filter
      - Photo
  ----------------------------------- */
    
  window.Filter = Backbone.Model.extend({
    initialize : function() {
      _.bindAll(this, 'getPhotos');
    },
    getPhotos : function() {
      return Photos.getAllByFilter(this.get('name'));
    }
  });
  
  window.Photo = Backbone.Model.extend({
    initialize : function() {
      if(this.get('caption') === null) {
        this.set({ caption : { text : 'no caption' } });
      }

      this.filterObj = Filters.addPhoto({ photo : this });
      _.bindAll(this, 'collectionIndex');
    },
    collectionIndex : function() {
      return _.indexOf(this.collection.viewablePhotos(), this);
    },
    hasLocation : function() {
      return this.get('location') && this.get('location').longitude && this.get('location').latitude ? true : false;
    }
  });
  
})