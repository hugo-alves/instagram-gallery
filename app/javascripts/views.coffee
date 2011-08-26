$ ->
  window.ApplicationView = Backbone.View.extend(
    initialize: ->
      _.bindAll this, "resetUI"
      @routes = new Workspace
      @loading = new LoadingView
      @loading.render()
      Photos.fetch success: ->
        App.render()
        Backbone.history.start 
          pushState: true
          root: "#/"
      this

    render: ->
      $(@el).insertAfter("#nav").attr("id", "gallery").addClass("fixed").empty()
      _.each Photos.models, (model) ->
        new PhotoThumbnailView(model: model).render()
      _.each Filters.models, (filter) ->
        new FilterView(model: filter).render()
      @loading.close()
      this
    
    resetUI: ->
      App.expandedView.close()  if App.expandedView
      $(App.el).removeClass "filtered"
      $(".thumbnail.highlight, .filter.highlight").removeClass "highlight"
      this
  )
  window.PhotoThumbnailView = Backbone.View.extend(
    className: "thumbnail"
    template: _.template("<a href=\"#\" title=\"<%= caption.text %> - view larger\"><img src=\"<%= thumbnail.url %>\" width=\"<%= thumbnail.width %>\" height=\"<%= thumbnail.height %>\" alt=\"<%= caption.text %>\"></a>")
    events: 
      "click a": "showExpanded"
    initialize: ->
      _.bindAll this, "showExpanded", "select", "highlight"
      @model = @options.model
      @model.view = this
      @scrollOffset = -150
    
    render: ->
      $(@el).append(@template(
        id: @model.get("id")
        thumbnail: @model.get("images").thumbnail
        filter: @model.get("filter")
        caption: @model.get("caption")
      )).attr("id", "photo_thumbnail_" + @model.get("id")).appendTo App.el
      this
    
    showExpanded: (e) ->
      App.expandedView.remove() if App.expandedView
      App.expandedView = new PhotoExpandedView(model: @model)
      App.expandedView.render()
    
    scroll: ->
      self = this
      clearInterval window.scrollDelay
      window.scrollDelay = setTimeout(->
        $("html").stop(true, true).scrollTo $(self.el), 300, offset: self.scrollOffset
      , 300)
      this
    
    select: ->
      self = this
      _.once(->
        self.model.collection.selected = self.model
        Photos.selectedThumbnailView = self
        $("." + self.className + ".selected").removeClass "selected"
        $(self.el).addClass "selected"
        self.scroll()  unless App.expandedView
      )()
      this
    
    highlight: ->
      $(@el).addClass "highlight"
      this
  )
  window.PhotoExpandedView = Backbone.View.extend(
    className: "expanded"
    events: 
      "click .close": "close"
    initialize: ->
      App.expandedView = this
      @model = @options.model
      _.bindAll this, "openMap", "close", "nextPhoto", "prevPhoto"
      this
    
    render: ->
      $("body").addClass "expanded"
      $(@el).appendTo("body").css "height", $(document).height()
      @photo = new PhotoStandardResolutionView(
        model: @model
        baseView: this
      ).render()
      @navigation = new PhotoExpandedNavigationView().render()
      $(@el).find(".photo img").hide().load ->
        $(this).fadeIn()
      
      @scroll()
      $(@model.view).select()
      this
    
    close: ->
      App.expandedView.remove()
      App.expandedView = null
      $("body").removeClass "expanded"
      Photos.selected.view.scroll()
    
    prevPhoto: ->
      @navigation.prevPhoto()
      this
    
    nextPhoto: ->
      @navigation.nextPhoto()
      this
    
    openMap: ->
      @navigation.openMap()
    
    openExternal: (e) ->
      @photo.userView.openExternal e
    
    scroll: ->
      self = this
      clearInterval window.scrollDelay
      window.scrollDelay = setTimeout(->
        $("html").stop(true, true).scrollTo $(self.el), 300
      , 300)
  )
  window.PhotoExpandedNavigationView = Backbone.View.extend(
    className: "navigation"
    template: _.template("<a href=\"#\" id=\"closePhoto\">Close</a><a href=\"#\" id=\"nextPhoto\">Next</a> <a href=\"#\" id=\"prevPhoto\">Prev</a>")
    events: 
      "click #nextPhoto": "nextPhoto"
      "click #prevPhoto": "prevPhoto"
      "click #closePhoto": "closePhoto"
    
    initialize: ->
      @model = App.expandedView.model
      _.bindAll this, "openMap", "nextPhoto", "prevPhoto"
      this
    
    render: ->
      $(@el).html(@template(@model.toJSON())).prependTo App.expandedView.photo.container()
      this
    
    nextPhoto: (e) ->
      App.expandedView.close()
      App.expandedView = new PhotoExpandedView(model: Photos.nextPhoto(@model))
      App.expandedView.render()
    
    prevPhoto: (e) ->
      App.expandedView.close()
      App.expandedView = new PhotoExpandedView(model: Photos.prevPhoto(@model))
      App.expandedView.render()
    
    openMap: (e) ->
      if @model.hasLocation()
        if @mapView
          @mapView.close()
          @mapView = null
          $("a.map").removeClass "active"
        else
          @mapView = new PhotoMapView(
            appendView: App.expandedView.photo
            location: @model.get("location")
          )
          @mapView.render()
          $("a.map").addClass "active"
      this
    
    closePhoto: ->
      App.expandedView.close()
  )
  window.PhotoMapView = Backbone.View.extend(
    tagName: "div"
    className: "expandedMap"
    initialize: ->
      @latlng = new google.maps.LatLng(@options.location.latitude, @options.location.longitude)
      @appendView = @options.appendView
    
    render: ->
      location = @latlng
      el = @el
      $(el).appendTo(@appendView.el).gmap(
        center: location
        callback: ->
          $(el).gmap "addMarker", position: location
      ).append($("<img src=\"/images/map.arrow.png\" width=\"20\" height=\"20\" class=\"map-arrow\" />")).position 
        of: ".map"
        at: "left top"
        my: "right bottom"
        offset: "55px -20px"
        collision: "none"
      
      this
    
    close: ->
      $(@el).remove()
  )
  window.PhotoStandardResolutionView = PhotoThumbnailView.extend(
    className: "standard-resolution"
    template: _.template("<div class=\"container\"><div class=\"photo\"><img src=\"<%= images.standard_resolution.url %>\" alt=\"<%= caption.text %>\" width=\"<%= images.standard_resolution.width %>\"></div></div>")
    container: ->
      $(@el).find ".container:first"
    initialize: ->
      @model = @options.model
      @baseView = @options.baseView
      unless @baseView
        @baseView = App
        @model.view = this
      @userView = new UserView(
        model: @model
        modelView: this
      )
      @scrollOffset = 0
      this
    showExpanded: ->
      super
    render: ->
      $(@el).html(@template(@model.toJSON())).appendTo @baseView.el
      @userView.render()
      this
  )
  window.UserView = Backbone.View.extend(
    className: "user"
    template: _.template("<div class=\"container\"><img src=\"<%= user.profile_picture %>\" alt=\"<%= user.username %>\" class=\"avatar\" /> <div class=\"profile\"><h3><%= user.full_name || user.username %></h3><% if ( user.full_name ) { %><h4><%= user.username %></h4><% } %></div> <div class=\"filter\"><h6>Filter:</h6><h3><%= filter %></h3> <a href=\"#\" class=\"view-all-filter\">View All</a></div> <div class=\"links\"> <% if ( (location) && (location.latitude) ) { %><a href=\"#\" id=\"viewMap\" class=\"map\">View on Map</a><% } %><a href=\"<%= link %>\" id=\"viewExternal\" class=\"instagram\">View on Instagram</a></div></div>")
    events: 
      "click #viewMap": "showMap"
      "click .view-all-filter": "viewFilter"
      "click #viewExternal": "openExternal"
    
    initialize: ->
      @model = @options.model
      @modelView = @options.modelView
      _.bindAll this, "openExternal"
    
    render: ->
      $(@el).html(@template(@model.toJSON())).appendTo @modelView.el
      this
    
    showMap: (e) ->
      e.preventDefault()
      App.expandedView.navigation.openMap()
      this
    
    viewFilter: ->
      App.routes.navigate "filters/" + @model.get("filter"), true
      this
    
    openExternal: (e) ->
      e.preventDefault()
      window.open @model.get("link"), "instagram"
      this
  )
  window.FilterView = Backbone.View.extend(
    wrapper: "#filters-list"
    tagName: "li"
    className: "filter"
    events: 
      "click" : "togglePhotos"
    template: _.template("<a href=\"#\" class=\"toggle-filter\" title=\"View <%= filter_name %> photos\"><%= filter_name %></a>")
    initialize: ->
      @model = @options.model
      @model.view = this
      unless $(@wrapper).length
        $("<ul/>").attr("id", "filters-list").appendTo App.el
        @setWaypoint()
      _.bindAll this, "setWaypoint"
    
    render: ->
      $(@el).appendTo(@wrapper).html @template(
        filter_name: @model.get("name")
        length: @model.getPhotos().length
      )
      this
    
    hideFilterPhotos: (e) ->
      $(".thumbnail").removeClass "blur"
      $(".filter").removeClass "blur"
    
    togglePhotos: (e) ->
      e.preventDefault()
      name = @model.get("name")
      hash = window.location.hash
      strippedHash = ""
      strippedHash = hash.replace("#/filters/", "").replace("#/", "")  unless hash.indexOf("#/filters/") == -1
      currentHash = _.compact(strippedHash.split(":"))
      if (_.include(currentHash, name)) and (currentHash.length)
        currentHash = _.without(currentHash, name).join(":")
      else
        currentHash.push name
        currentHash = currentHash.join(":")
      App.routes.navigate "filters/" + currentHash, true
    
    setWaypoint: ->
      $("#footer").waypoint ((event, direction) ->
        $(App.el).toggleClass "fixed", direction == "up"
      ), offset: "100%"
  )
  window.LoadingView = Backbone.View.extend(
    className: "loader"
    template: _.template("<img src=\"/images/loader.big.gif\" />")
    initialize: ->
      _.bindAll this, "close", "render"
      this
    
    render: ->
      $("body").addClass("loading").append $(@el).html(@template)
      this
    
    close: ->
      $(@el).fadeOut "fast", ->
        $(this).remove()
      
      $("body").removeClass("loading").addClass "loaded"
      this
  )
