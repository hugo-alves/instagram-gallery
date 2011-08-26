$(function() {
  
  window.Photos = new PhotoList;
  window.Filters = new FilterList;
  window.Workspace = Backbone.Router.extend({
    routes: {
      ''                  : "resetUI",
      '/filters/:ids'     : "filters"
    },
    resetUI : function() {
      App.resetUI();
    },
    filters : function(ids) {
      App.resetUI();
      var filters = ids.split(":");
      if ( (ids) && (filters) ) {        
        $( App.el ).addClass('filtered');
        
        // If the amount of filtered filters is equal to the
        // amount of filters, than just reset the view
        if( filters.length >= Filters.models.length ) {
          window.location.hash = '#/';
          $("html").stop().scrollTo( "#nav", 800 );
        }
        
        // Loop through filters
        _.each(filters, function(filter_name) {
          var filter = Filters.getByName(filter_name);
          if (filter) {
            var photos = filter.getPhotos();
            if( filter ) {
              _.each(photos, function(photo) { 
                photo.view.highlight();
              });
              _.first(Photos.viewablePhotos()).view.select().scroll();
            }
            $( filter.view.el ).addClass('highlight');
          }
        });
      } else {
        window.location.hash = '#/';
        $("html").stop().scrollTo( "#nav", 800 );
      }
    }
  });
  window.App = new ApplicationView;
  
  /* --------------------------------
     BINDINGS
  ----------------------------------- */
  
  var galleryKeyboardNav = function(e) {
    var viewablePhotos = Photos.viewablePhotos();
    var thumbnail = Photos.selectedThumbnail();

    var expandPhoto = function() {
      if( thumbnail ) {
        //thumbnail.view.showExpanded();
      }
    }
        
    var right = function() {
      e.preventDefault();
      if ( !thumbnail ) {
        _.first(viewablePhotos).view.select();
      } else {
        Photos.nextPhoto(thumbnail).view.select();
      }
    }
    
    var left = function() {
      e.preventDefault();
      if ( !thumbnail ) {
        thumbnail = _.last(viewablePhotos).view.select();
      } else {
        thumbnail = Photos.prevPhoto(thumbnail).view.select();
      }
      thumbnail.select();
    }
    
    switch(e.which) {
      case keyCodes.RIGHT:
        right();
        break;
      case keyCodes.LEFT:
        left();
        break;
      case keyCodes.UP:
        left();
        break;
      case keyCodes.DOWN:
        right();
        break;
      case keyCodes.ENTER:
        e.preventDefault();
        expandPhoto();
        break;
      case keyCodes.SPACE:
        e.preventDefault();
        expandPhoto();
        break;
    }
  }
  
  var expandedKeyboardNav = function(e) {
    var closeExpanded = function() {
      App.expandedView.close();
    }    
    switch(e.which) {
      case keyCodes.DOWN:
        e.preventDefault();
        App.expandedView.nextPhoto(e);
        break;
      case keyCodes.RIGHT:
        e.preventDefault();
        App.expandedView.nextPhoto(e);
        break;
      case keyCodes.UP:
        e.preventDefault();
        App.expandedView.prevPhoto(e);
        break;
      case keyCodes.LEFT:
        e.preventDefault();
        App.expandedView.prevPhoto(e);
        break;
      case keyCodes.ESCAPE:
        closeExpanded();
        break;
      case keyCodes.SPACE:
        e.preventDefault();
        closeExpanded();
        break;
      case keyCodes.ENTER:
        closeExpanded();
        break;
      case keyCodes.M:
        App.expandedView.openMap(e);
        break;
      case 86:
        App.expandedView.openExternal(e);
        break;
    }
  }
  
  $(document).bind('keydown', function(e) {
    if( $(".expanded img").length ) {
      expandedKeyboardNav(e);
    } else {
      galleryKeyboardNav(e);
    }
  });
    
});
