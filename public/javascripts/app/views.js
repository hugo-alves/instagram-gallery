$(function() {
  
  window.ApplicationView = Backbone.View.extend({
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
      $(this.el).insertAfter('#nav').attr('id', 'gallery').addClass('fixed').empty();
      _.each(Photos.models, function(model) { 
        new PhotoThumbnailView({ model : model }).render();
      });
      _.each(Filters.models, function(filter) {
        new FilterView({ model : filter }).render();
      });      
      return this;
    },
    resetUI : function() {
      if( App.expandedView ) {
        App.expandedView.close();
      }
      $( App.el ).removeClass('filtered')
      $(".thumbnail.highlight, .filter.highlight").removeClass("highlight");
      return this;
    }
  });
  
  window.PhotoThumbnailView = Backbone.View.extend({
    className : 'thumbnail',
    template : _.template( '<a href="#" title="<%= caption.text %> - view larger"><img src="<%= thumbnail.url %>" width="<%= thumbnail.width %>" height="<%= thumbnail.height %>" alt="<%= caption.text %>"></a>' ),
    events : {
      "click a" : "showExpanded"
    },
    initialize : function() {
      _.bindAll(this, 'showExpanded', 'select', 'highlight');
      this.model = this.options.model;
      this.model.view = this;
      this.scrollOffset = -150;
    },
    render : function() {
      $(this.el).append(this.template({ 
        id : this.model.get('id'), 
        thumbnail : this.model.get('images').thumbnail, 
        filter : this.model.get('filter'),
        caption : this.model.get('caption')
      }))
        .attr('id', 'photo_thumbnail_' + this.model.get('id'))
        .appendTo(App.el);
        
      return this;
    },
    showExpanded : function(e) {
      if( App.expandedView ) {
        App.expandedView.remove();
      }
      App.expandedView = new PhotoExpandedView({ model : this.model });
      App.expandedView.render();
    },
    scroll : function() {
      var self = this;
      clearInterval(window.scrollDelay);
      window.scrollDelay = setTimeout(function() {
        $("html")
          .stop(true, true)
          .scrollTo( $(self.el) , 300, { 
            offset : self.scrollOffset
          });
      }, 300);
      return this;
    },
    select : function() {
      var self = this;
      _.once(function() {
        self.model.collection.selected = self.model;
        Photos.selectedThumbnailView = self;
        $('.' + self.className + '.selected').removeClass('selected');
        $( self.el ).addClass('selected');
        if ( ! App.expandedView ) {
          self.scroll();
        }
      })();
      return this;
    },
    highlight : function() {
      $( this.el ).addClass('highlight');
      return this;
    }
  });
    
  window.PhotoExpandedView = Backbone.View.extend({
    className : 'expanded',
    events : {
      "click .close"      : "close",
    },
    initialize : function() {
      App.expandedView = this;
      this.model = this.options.model;
      _.bindAll(this, 'openMap', 'close', 'nextPhoto', 'prevPhoto');
      return this;
    },
    render : function() {
      $("body").addClass('expanded');
      $( this.el )
        .appendTo('body')
        .css('height', $(document).height())
      this.photo = new PhotoStandardResolutionView({ model : this.model, baseView : this }).render();
      this.navigation = new PhotoExpandedNavigationView().render(); //.openMap();
      $( this.el )
        .find('.photo img')
          .hide()
          .load(function() {
            $(this).fadeIn();
          });
      
      this.scroll();
      $(this.model.view).select();
      return this;
    },
    close : function() {
      App.expandedView.remove();
      App.expandedView = null;
      $("body").removeClass('expanded');
      Photos.selected.view.scroll();
    },
    prevPhoto : function() {
      this.navigation.prevPhoto();
      return this;
    },
    nextPhoto : function() {
      this.navigation.nextPhoto();
      return this;
    },
    openMap : function() {
      this.navigation.openMap();
    },
    scroll : function() {
      var self = this;
      clearInterval(window.scrollDelay);
      window.scrollDelay = setTimeout(function() {
        $("html").stop(true, true).scrollTo( $(self.el), 300 );
      }, 300);
    },

  });
  
  /* <a href="#" class="close">Close</a><a href="#" class="view-map">View Map</a> */
  
  window.PhotoExpandedNavigationView = Backbone.View.extend({
    className : 'navigation',
    template : _.template('<a href="#" id="closePhoto">Close</a><a href="#" id="nextPhoto">Next</a> <a href="#" id="prevPhoto">Prev</a>'),
    events : {
      "click #nextPhoto"       : "nextPhoto",
      "click #prevPhoto"       : "prevPhoto",
      "click #closePhoto"      : "closePhoto"
    },
    initialize : function() {
      this.model = App.expandedView.model;
      _.bindAll(this, 'openMap', 'nextPhoto', 'prevPhoto');
      return this;
    },
    render : function() {
      $( this.el )
        .html( this.template(this.model.toJSON()) )
        .prependTo( App.expandedView.photo.container() );
      return this;
    },
    nextPhoto : function(e) {
      App.expandedView.close();
      App.expandedView = new PhotoExpandedView({ model : Photos.nextPhoto(this.model) });
      App.expandedView.render();
    },
    prevPhoto : function(e) {
      App.expandedView.close();
      App.expandedView = new PhotoExpandedView({ model : Photos.prevPhoto(this.model) });
      App.expandedView.render();
    },
    openMap : function(e) {
      if( this.model.hasLocation() ) {
        if( this.mapView ) {
          this.mapView.close();
          this.mapView = null;
          $('a.map').removeClass("active");
        } else {
          this.mapView = new PhotoMapView({ appendView : App.expandedView.photo, location : this.model.get('location') });
          this.mapView.render();
          $('a.map').addClass("active");
        }
      }
      return this;
    },
    closePhoto : function() {
      App.expandedView.close();
    }
  });
  
  window.PhotoMapView = Backbone.View.extend({
    tagName : 'div',
    className : 'expandedMap',
    initialize : function() {
      this.latlng = new google.maps.LatLng(this.options.location.latitude, this.options.location.longitude);
      this.appendView = this.options.appendView;
    },
    render : function() {
      var location = this.latlng;
      var el = this.el;
      $(el)
        .appendTo(this.appendView.el)
        .gmap({ 
          center: location, 
          callback : function () {
            $(el).gmap('addMarker', { 'position' : location });
          }
        })
        .append( $('<img src="/images/map.arrow.png" width="20" height="20" class="map-arrow" />') )
        .position({
          of : '.map',
          at : 'left top',
          my : 'right bottom',
          offset : '55px -20px',
          collision : 'none'
        });
      return this;
    },
    close : function() {
      $(this.el).remove();
    }
  });
  
  window.PhotoStandardResolutionView = PhotoThumbnailView.extend({
    className : 'standard-resolution',
    template : _.template('<div class="container"><div class="photo"><img src="<%= images.standard_resolution.url %>" alt="<%= caption.text %>" width="<%= images.standard_resolution.width %>"></div></div>'),
    container : function() {
      return $(this.el).find(".container:first");
    },
    initialize : function() {
      this.model = this.options.model;
      this.baseView = this.options.baseView;
      if ( !this.baseView ) {
        this.baseView = App;
        this.model.view = this;
      }
      this.userView = new UserView({ model : this.model, modelView : this });
      this.scrollOffset = 0;
      return this;
    },
    showExpanded : function() {
      return this;
    },
    render : function() {
      $( this.el )
        .html( this.template(this.model.toJSON()) )
        .appendTo( this.baseView.el );
        this.userView.render();
      return this;
    }
  });
  
  window.UserView = Backbone.View.extend({
    className : 'user',
    template : _.template('<div class="container"><img src="<%= user.profile_picture %>" alt="<%= user.username %>" class="avatar" /> <div class="profile"><h3><%= user.full_name || user.username %></h3><% if ( user.full_name ) { %><h4><%= user.username %></h4><% } %></div> <div class="filter"><h6>Filter:</h6><h3><%= filter %></h3> <a href="/#/filters/<%= filter %>">View All</a></div> <div class="links"> <% if ( location ) { %><a href="#" class="map">View on Map</a><% } %><a href="<%= link %>" class="instagram">View on Instagram</a></div></div>'),
    events : {
      'click .map' : 'showMap'
    },
    initialize : function() {
      this.model = this.options.model;
      this.modelView = this.options.modelView;
    },
    render : function() {
      $( this.el )
        .html( this.template( this.model.toJSON()) )
        .appendTo( this.modelView.el );
      return this;
    },
    showMap : function(e) {
      e.preventDefault();
      App.expandedView.navigation.openMap();
    }
  });
  
  window.FilterView = Backbone.View.extend({
    wrapper : '#filters-list',
    tagName : 'li',
    className : 'filter',
    events : {
      "click" : "togglePhotos"
    },
    template : _.template( '<a href="#" class="toggle-filter" title="View <%= filter_name %> photos"><%= filter_name %></a>' ),
    initialize : function() {
      this.model = this.options.model;
      this.model.view = this;
      if ( ! $(this.wrapper).length ) {
        $("<ul/>").attr('id', 'filters-list').appendTo(App.el);
        this.setWaypoint();
      }
      _.bindAll(this, 'setWaypoint');
    },
    render : function() {
      $( this.el )
        .appendTo( this.wrapper )
        .html( this.template({ filter_name : this.model.get('name'), length : this.model.getPhotos().length }) )      
      return this;
    },
    hideFilterPhotos : function(e) {
      $(".thumbnail").removeClass('blur');
      $(".filter").removeClass('blur');
    },
    togglePhotos : function(e) {
      e.preventDefault();      
      var name = this.model.get('name');
      var hash = window.location.hash;

      var strippedHash = '';      
      if( hash.indexOf('#/filters/') != -1 ) {
        strippedHash = hash.replace('#/filters/', '').replace('#/', '');
      }
      var currentHash = _.compact(strippedHash.split(":"));
      // If the current hash has the same name twice, and it actually has something in it
      if( ( _.include(currentHash, name) ) && ( currentHash.length )  ) {
        currentHash = _.without(currentHash, name).join(":");
      } else {
        currentHash.push(name);
        currentHash = currentHash.join(":");
      }
      App.routes.navigate("filters/" + currentHash, true);
    },
    setWaypoint : function() {
      $( '#footer' ).waypoint(function(event, direction) {
     		$( App.el ).toggleClass('fixed', direction === "up");
     	}, {
     		offset: '100%'
     	});
    }
  });  
  
});