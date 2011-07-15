$(function() {
  
  /* --------------------------------
     COLLECTIONS:
      - PhotoList
      - FilteredPhotosList
      - FilterList
  ----------------------------------- */
  
  window.PhotoList = Backbone.Collection.extend({
    model : Photo,
    url : function() {
      if( this.getUsername() ) {
        return '/feeds/user';
      } else {
        return '/feeds/popular';
      }
    },
    initialize : function() {
      _.bindAll(this, 'viewablePhotos', 'getUsername');
    },
    getUsername : function() {
      return $("meta[name='username']").attr('content');
    },
    nextPhoto : function(photo) {
      var viewablePhotos = this.viewablePhotos();
      if( photo.collectionIndex() == (viewablePhotos.length-1) ) {
        return _.first(viewablePhotos);
      } else {
        return viewablePhotos[photo.collectionIndex()+1];
      }
    },
    prevPhoto : function(photo) {
      var viewablePhotos = this.viewablePhotos();
      if( photo.collectionIndex() == 0 ) {
        return _.last(viewablePhotos);
      } else {
        return viewablePhotos[photo.collectionIndex()-1];
      }      
    },
    getAllByFilter : function(filter_name) {
      return _.select(this.models, function(model) {
        return model.get('filter') == filter_name;
      });
    },
    selectedThumbnail : function() {
      return this.selected;
    },
    viewablePhotos : function() {
      return _.select(this.models, function(model) {
        return $( model.view.el ).is(":visible");
      });
    }
  });

  
  window.FilterList = Backbone.Collection.extend({
    model : Filter,
    getByName : function(name) {
      // This sucks.
      return _.select(this.models, function(filter) {
        return filter.get('name') == name;
      })[0];
    },
    addPhoto : function(options) {
      var photo = options.photo;
      var filter = this.getByName(photo.get('filter'));
      if ( ! filter ) {
        var filter = new Filter({ name : photo.get('filter') });
        this.add(filter);
      }
      return filter;
    }
  });
    
});