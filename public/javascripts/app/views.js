/* DO NOT MODIFY. This file was compiled Fri, 26 Aug 2011 17:42:07 GMT from
 * /Users/jeff/Dropbox/Code/instagram/app/javascripts/views.coffee
 */

(function() {
  $(function() {
    window.ApplicationView = Backbone.View.extend({
      initialize: function() {
        _.bindAll(this, "resetUI");
        this.routes = new Workspace;
        this.loading = new LoadingView;
        this.loading.render();
        Photos.fetch({
          success: function() {
            App.render();
            return Backbone.history.start({
              pushState: true,
              root: "#/"
            });
          }
        });
        return this;
      },
      render: function() {
        $(this.el).insertAfter("#nav").attr("id", "gallery").addClass("fixed").empty();
        _.each(Photos.models, function(model) {
          return new PhotoThumbnailView({
            model: model
          }).render();
        });
        _.each(Filters.models, function(filter) {
          return new FilterView({
            model: filter
          }).render();
        });
        this.loading.close();
        return this;
      },
      resetUI: function() {
        if (App.expandedView) {
          App.expandedView.close();
        }
        $(App.el).removeClass("filtered");
        $(".thumbnail.highlight, .filter.highlight").removeClass("highlight");
        return this;
      }
    });
    window.PhotoThumbnailView = Backbone.View.extend({
      className: "thumbnail",
      template: _.template("<a href=\"#\" title=\"<%= caption.text %> - view larger\"><img src=\"<%= thumbnail.url %>\" width=\"<%= thumbnail.width %>\" height=\"<%= thumbnail.height %>\" alt=\"<%= caption.text %>\"></a>"),
      events: {
        "click a": "showExpanded"
      },
      initialize: function() {
        _.bindAll(this, "showExpanded", "select", "highlight");
        this.model = this.options.model;
        this.model.view = this;
        return this.scrollOffset = -150;
      },
      render: function() {
        $(this.el).append(this.template({
          id: this.model.get("id"),
          thumbnail: this.model.get("images").thumbnail,
          filter: this.model.get("filter"),
          caption: this.model.get("caption")
        })).attr("id", "photo_thumbnail_" + this.model.get("id")).appendTo(App.el);
        return this;
      },
      showExpanded: function(e) {
        if (App.expandedView) {
          App.expandedView.remove();
        }
        App.expandedView = new PhotoExpandedView({
          model: this.model
        });
        return App.expandedView.render();
      },
      scroll: function() {
        var self;
        self = this;
        clearInterval(window.scrollDelay);
        window.scrollDelay = setTimeout(function() {
          return $("html").stop(true, true).scrollTo($(self.el), 300, {
            offset: self.scrollOffset
          });
        }, 300);
        return this;
      },
      select: function() {
        var self;
        self = this;
        _.once(function() {
          self.model.collection.selected = self.model;
          Photos.selectedThumbnailView = self;
          $("." + self.className + ".selected").removeClass("selected");
          $(self.el).addClass("selected");
          if (!App.expandedView) {
            return self.scroll();
          }
        })();
        return this;
      },
      highlight: function() {
        $(this.el).addClass("highlight");
        return this;
      }
    });
    window.PhotoExpandedView = Backbone.View.extend({
      className: "expanded",
      events: {
        "click .close": "close"
      },
      initialize: function() {
        App.expandedView = this;
        this.model = this.options.model;
        _.bindAll(this, "openMap", "close", "nextPhoto", "prevPhoto");
        return this;
      },
      render: function() {
        $("body").addClass("expanded");
        $(this.el).appendTo("body").css("height", $(document).height());
        this.photo = new PhotoStandardResolutionView({
          model: this.model,
          baseView: this
        }).render();
        this.navigation = new PhotoExpandedNavigationView().render();
        $(this.el).find(".photo img").hide().load(function() {
          return $(this).fadeIn();
        });
        this.scroll();
        $(this.model.view).select();
        return this;
      },
      close: function() {
        App.expandedView.remove();
        App.expandedView = null;
        $("body").removeClass("expanded");
        return Photos.selected.view.scroll();
      },
      prevPhoto: function() {
        this.navigation.prevPhoto();
        return this;
      },
      nextPhoto: function() {
        this.navigation.nextPhoto();
        return this;
      },
      openMap: function() {
        return this.navigation.openMap();
      },
      openExternal: function(e) {
        return this.photo.userView.openExternal(e);
      },
      scroll: function() {
        var self;
        self = this;
        clearInterval(window.scrollDelay);
        return window.scrollDelay = setTimeout(function() {
          return $("html").stop(true, true).scrollTo($(self.el), 300);
        }, 300);
      }
    });
    window.PhotoExpandedNavigationView = Backbone.View.extend({
      className: "navigation",
      template: _.template("<a href=\"#\" id=\"closePhoto\">Close</a><a href=\"#\" id=\"nextPhoto\">Next</a> <a href=\"#\" id=\"prevPhoto\">Prev</a>"),
      events: {
        "click #nextPhoto": "nextPhoto",
        "click #prevPhoto": "prevPhoto",
        "click #closePhoto": "closePhoto"
      },
      initialize: function() {
        this.model = App.expandedView.model;
        _.bindAll(this, "openMap", "nextPhoto", "prevPhoto");
        return this;
      },
      render: function() {
        $(this.el).html(this.template(this.model.toJSON())).prependTo(App.expandedView.photo.container());
        return this;
      },
      nextPhoto: function(e) {
        App.expandedView.close();
        App.expandedView = new PhotoExpandedView({
          model: Photos.nextPhoto(this.model)
        });
        return App.expandedView.render();
      },
      prevPhoto: function(e) {
        App.expandedView.close();
        App.expandedView = new PhotoExpandedView({
          model: Photos.prevPhoto(this.model)
        });
        return App.expandedView.render();
      },
      openMap: function(e) {
        if (this.model.hasLocation()) {
          if (this.mapView) {
            this.mapView.close();
            this.mapView = null;
            $("a.map").removeClass("active");
          } else {
            this.mapView = new PhotoMapView({
              appendView: App.expandedView.photo,
              location: this.model.get("location")
            });
            this.mapView.render();
            $("a.map").addClass("active");
          }
        }
        return this;
      },
      closePhoto: function() {
        return App.expandedView.close();
      }
    });
    window.PhotoMapView = Backbone.View.extend({
      tagName: "div",
      className: "expandedMap",
      initialize: function() {
        this.latlng = new google.maps.LatLng(this.options.location.latitude, this.options.location.longitude);
        return this.appendView = this.options.appendView;
      },
      render: function() {
        var el, location;
        location = this.latlng;
        el = this.el;
        $(el).appendTo(this.appendView.el).gmap({
          center: location,
          callback: function() {
            return $(el).gmap("addMarker", {
              position: location
            });
          }
        }).append($("<img src=\"/images/map.arrow.png\" width=\"20\" height=\"20\" class=\"map-arrow\" />")).position({
          of: ".map",
          at: "left top",
          my: "right bottom",
          offset: "55px -20px",
          collision: "none"
        });
        return this;
      },
      close: function() {
        return $(this.el).remove();
      }
    });
    window.PhotoStandardResolutionView = PhotoThumbnailView.extend({
      className: "standard-resolution",
      template: _.template("<div class=\"container\"><div class=\"photo\"><img src=\"<%= images.standard_resolution.url %>\" alt=\"<%= caption.text %>\" width=\"<%= images.standard_resolution.width %>\"></div></div>"),
      container: function() {
        return $(this.el).find(".container:first");
      },
      initialize: function() {
        this.model = this.options.model;
        this.baseView = this.options.baseView;
        if (!this.baseView) {
          this.baseView = App;
          this.model.view = this;
        }
        this.userView = new UserView({
          model: this.model,
          modelView: this
        });
        this.scrollOffset = 0;
        return this;
      },
      showExpanded: function() {
        return showExpanded.__super__.constructor.apply(this, arguments);
      },
      render: function() {
        $(this.el).html(this.template(this.model.toJSON())).appendTo(this.baseView.el);
        this.userView.render();
        return this;
      }
    });
    window.UserView = Backbone.View.extend({
      className: "user",
      template: _.template("<div class=\"container\"><img src=\"<%= user.profile_picture %>\" alt=\"<%= user.username %>\" class=\"avatar\" /> <div class=\"profile\"><h3><%= user.full_name || user.username %></h3><% if ( user.full_name ) { %><h4><%= user.username %></h4><% } %></div> <div class=\"filter\"><h6>Filter:</h6><h3><%= filter %></h3> <a href=\"#\" class=\"view-all-filter\">View All</a></div> <div class=\"links\"> <% if ( (location) && (location.latitude) ) { %><a href=\"#\" id=\"viewMap\" class=\"map\">View on Map</a><% } %><a href=\"<%= link %>\" id=\"viewExternal\" class=\"instagram\">View on Instagram</a></div></div>"),
      events: {
        "click #viewMap": "showMap",
        "click .view-all-filter": "viewFilter",
        "click #viewExternal": "openExternal"
      },
      initialize: function() {
        this.model = this.options.model;
        this.modelView = this.options.modelView;
        return _.bindAll(this, "openExternal");
      },
      render: function() {
        $(this.el).html(this.template(this.model.toJSON())).appendTo(this.modelView.el);
        return this;
      },
      showMap: function(e) {
        e.preventDefault();
        App.expandedView.navigation.openMap();
        return this;
      },
      viewFilter: function() {
        App.routes.navigate("filters/" + this.model.get("filter"), true);
        return this;
      },
      openExternal: function(e) {
        e.preventDefault();
        window.open(this.model.get("link"), "instagram");
        return this;
      }
    });
    window.FilterView = Backbone.View.extend({
      wrapper: "#filters-list",
      tagName: "li",
      className: "filter",
      events: {
        "click": "togglePhotos"
      },
      template: _.template("<a href=\"#\" class=\"toggle-filter\" title=\"View <%= filter_name %> photos\"><%= filter_name %></a>"),
      initialize: function() {
        this.model = this.options.model;
        this.model.view = this;
        if (!$(this.wrapper).length) {
          $("<ul/>").attr("id", "filters-list").appendTo(App.el);
          this.setWaypoint();
        }
        return _.bindAll(this, "setWaypoint");
      },
      render: function() {
        $(this.el).appendTo(this.wrapper).html(this.template({
          filter_name: this.model.get("name"),
          length: this.model.getPhotos().length
        }));
        return this;
      },
      hideFilterPhotos: function(e) {
        $(".thumbnail").removeClass("blur");
        return $(".filter").removeClass("blur");
      },
      togglePhotos: function(e) {
        var currentHash, hash, name, strippedHash;
        e.preventDefault();
        name = this.model.get("name");
        hash = window.location.hash;
        strippedHash = "";
        if (hash.indexOf("#/filters/") !== -1) {
          strippedHash = hash.replace("#/filters/", "").replace("#/", "");
        }
        currentHash = _.compact(strippedHash.split(":"));
        if ((_.include(currentHash, name)) && currentHash.length) {
          currentHash = _.without(currentHash, name).join(":");
        } else {
          currentHash.push(name);
          currentHash = currentHash.join(":");
        }
        return App.routes.navigate("filters/" + currentHash, true);
      },
      setWaypoint: function() {
        return $("#footer").waypoint((function(event, direction) {
          return $(App.el).toggleClass("fixed", direction === "up");
        }), {
          offset: "100%"
        });
      }
    });
    return window.LoadingView = Backbone.View.extend({
      className: "loader",
      template: _.template("<img src=\"/images/loader.big.gif\" />"),
      initialize: function() {
        _.bindAll(this, "close", "render");
        return this;
      },
      render: function() {
        $("body").addClass("loading").append($(this.el).html(this.template));
        return this;
      },
      close: function() {
        $(this.el).fadeOut("fast", function() {
          return $(this).remove();
        });
        $("body").removeClass("loading").addClass("loaded");
        return this;
      }
    });
  });
}).call(this);
