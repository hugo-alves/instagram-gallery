$(function() {
  
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
    template : _.template('<% if (nextPhoto) { %><a href="#" class="next">Next</a><% } %><% if (prevPhoto) { %><a href="#" class="prev">Prev</a><% } %><a href="#" class="close">Close</a><% if (location) { %><a href="#" class="view-map">View Map</a><% } %>'),
    events : {
      "click .close"      : "close",
      "click .view-map"   : "openMap",
      "click .next"       : "nextPhoto",
      "click .prev"       : "prevPhoto"
    },
    initialize : function() {
      App.expandedView = this;
      this.model = this.options.model;
      _.bindAll(this, 'openMap', 'close', 'nextPhoto', 'prevPhoto');
    },
    render : function() {
      $( this.el )
        .appendTo('body')
        .css('height', $(document).height())
        .html(this.template({ 
          images : this.model.get('images'), 
          nextPhoto : Photos.nextPhoto(this.model),
          prevPhoto : Photos.prevPhoto(this.model),
          location : this.model.hasLocation()
        }));
      
      this.photo = new PhotoStandardResolutionView({ model : this.model, baseView : this }).render();
              
      $( this.el )
        .find('.photo img')
          .hide()
          .load(function() {
            $(this).fadeIn();
          });
      
      this.scroll();
      $(this.model.view).select();
      $("body").addClass('expanded');
      return this;
    },
    close : function() {
      App.expandedView.remove();
      App.expandedView = null;
      $("body").removeClass('expanded');
      Photos.selected.view.scroll();
    },
    nextPhoto : function(e) {
      this.close();
      App.expandedView = new PhotoExpandedView({ model : Photos.nextPhoto(this.model) });
      App.expandedView.render();
    },
    prevPhoto : function(e) {
      this.close();
      App.expandedView = new PhotoExpandedView({ model : Photos.prevPhoto(this.model) });
      App.expandedView.render();
    },
    scroll : function() {
      var self = this;
      clearInterval(window.scrollDelay);
      window.scrollDelay = setTimeout(function() {
        $("html").stop(true, true).scrollTo( $(self.el), 300 );
      }, 300);
    },
    openMap : function(e) {
      e.preventDefault();
      if( this.model.hasLocation() ) {
        if( this.mapView ) {
          this.mapView.close();
          this.mapView = null;
        } else {
          this.mapView = new PhotoMapView({ view : this, location : this.model.get('location') });
          this.mapView.render();
        }
      }
      return this;
    }
  });
  
  window.PhotoMapView = Backbone.View.extend({
    tagName : 'section',
    className : 'map',
    initialize : function() {
      this.latlng = new google.maps.LatLng(this.options.location.latitude, this.options.location.longitude);
      this.expanedView = this.options.view;
    },
    render : function() {
      var location = this.latlng;
      var el = this.el;
      $(el)
        .appendTo(this.expanedView.el)
        .gmap({ 
          center: location, 
          callback : function () {
            $(el).gmap('addMarker', { 'position' : location, 'title' : 'Hello world!' });
          }
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
    template : _.template('<div class="container"><img src="<%= user.profile_picture %>" alt="<%= user.username %>" class="avatar" /> <div class="profile"><h3><%= user.full_name %></h3> <h4><%= user.username %></h4></div></div>'),
    initialize : function() {
      this.model = this.options.model;
      this.modelView = this.options.modelView;
    },
    render : function() {
      $( this.el )
        .html( this.template(this.model.toJSON()) )
        .appendTo( this.modelView.el );
      return this;
    }
  });
  
  window.FilterView = Backbone.View.extend({
    wrapper : '#filters-list',
    tagName : 'li',
    className : 'filter',
    events : {
      "click" : "togglePhotos"
    },
    template : _.template( '<a href="#" class="toggle-filter" title="View <%= filter_name %> photos"><%= filter_name %></a> <strong><%= length %></strong>' ),
    initialize : function() {
      this.model = this.options.model;
      this.model.view = this;
      if ( ! $(this.wrapper).length ) {
        $("<ul/>").attr('id', 'filters-list').appendTo(App.el);
      }
    },
    render : function() {
      $( this.el )
        .appendTo( this.wrapper )
        .html( this.template({ filter_name : this.model.get('name'), length : this.model.getPhotos().length }) );
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
    }
  });  
  
});