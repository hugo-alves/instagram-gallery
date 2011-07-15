$(function() {
  
  window.Photos = new PhotoList;
  window.Filters = new FilterList;

  /* --------------------------------
     APPLICATION:
      - Workspace (Routes)
      - ApplicationView
  ----------------------------------- */
  
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
        _.each(filters, function(filter_name) {
          var filter = Filters.getByName(filter_name);
          if( filter ) {
            _.each(filter.getPhotos(), function(photo) { 
              photo.view.highlight();
            });
          }
          $( filter.view.el ).addClass('highlight');
        });
      }
    }
  });
  
  window.ApplicationView = Backbone.View.extend({
    tagName : 'section',
    initialize : function() {
      _.bindAll(this, 'resetUI');
      this.routes = new Workspace;
      Photos.fetch({
        success : function() {
          App.render();
          Backbone.history.start({ pushState : true, root : '#/' });
        }
      });
    },
    render : function() {
      $(this.el).appendTo('body').attr('id', 'gallery').empty();
      
      if( $("body").hasClass('venti') ) {
        _.each(Photos.models, function(model) { 
          new PhotoStandardResolutionView({ model : model }).render();
        });
      } else {
        _.each(Photos.models, function(model) { 
          new PhotoThumbnailView({ model : model }).render();
        });
      }
      _.each(Filters.models, function(filter) {
        new FilterView({ model : filter }).render();
      });      
      return this;
    },
    resetUI : function() {
      if( App.expandedView ) {
        App.expandedView.remove();
      }
      $( App.el ).removeClass('filtered');
      $(".thumbnail.highlight, .filter.highlight").removeClass("highlight");
      return this;
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
        thumbnail.view.showExpanded();
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
    }
  }
  
  $(document).bind('keydown', function(e) {
    if( $(".expanded img").length ) {
      expandedKeyboardNav(e);
    } else {
      galleryKeyboardNav(e);
    }
  });
  
  
  var dynamicLayout = _.throttle(function(e) {
    var width = $(window).width();

    var resetBody = function() {
      return $("body")
        .removeClass('grande')
        .removeClass('tall')
        .removeClass('venti');
    }

    if ( width >= 1225 ) {
      if( !$("body").hasClass('grande') ) {
        App.render();
      }
      return;
    } else if ( width >= 900 ) {
      if ( !$("body").hasClass('tall') ) {
        resetBody().addClass('tall');
        App.render();
        return;
      }
    } else if ( width <= 500 ) {
      if ( !$("body").hasClass('venti') ) {
        resetBody().addClass('venti');
        App.render();
        return;
      }
    }
    
  }, 100);
  
  dynamicLayout();
  $(window).resize(dynamicLayout);

});