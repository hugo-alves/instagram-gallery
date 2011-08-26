$ ->
  window.Photos = new PhotoList
  window.Filters = new FilterList
  window.Workspace = Backbone.Router.extend(
    routes: 
      "": "resetUI"
      "/filters/:ids": "filters"
    
    resetUI: ->
      App.resetUI()
    
    filters: (ids) ->
      App.resetUI()
      filters = ids.split(":")
      if (ids) and (filters)
        $(App.el).addClass "filtered"
        if filters.length >= Filters.models.length
          window.location.hash = "#/"
          $("html").stop().scrollTo "#nav", 800
        _.each filters, (filter_name) ->
          filter = Filters.getByName(filter_name)
          if filter
            photos = filter.getPhotos()
            if filter
              _.each photos, (photo) ->
                photo.view.highlight()
              
              _.first(Photos.viewablePhotos()).view.select().scroll()
            $(filter.view.el).addClass "highlight"
      else
        window.location.hash = "#/"
        $("html").stop().scrollTo "#nav", 800
  )
  window.App = new ApplicationView
  galleryKeyboardNav = (e) ->
    viewablePhotos = Photos.viewablePhotos()
    thumbnail = Photos.selectedThumbnail()
    expandPhoto = ->
      if thumbnail
        thumbnail.view.showExpanded()
    right = ->
      e.preventDefault()
      unless thumbnail
        _.first(viewablePhotos).view.select()
      else
        Photos.nextPhoto(thumbnail).view.select()
    
    left = ->
      e.preventDefault()
      unless thumbnail
        thumbnail = _.last(viewablePhotos).view.select()
      else
        thumbnail = Photos.prevPhoto(thumbnail).view.select()
      thumbnail.select()
    
    switch e.which
      when keyCodes.RIGHT
        right()
      when keyCodes.LEFT
        left()
      when keyCodes.UP
        left()
      when keyCodes.DOWN
        right()
      when keyCodes.ENTER
        e.preventDefault()
        expandPhoto()
      when keyCodes.SPACE
        e.preventDefault()
        expandPhoto()
  
  expandedKeyboardNav = (e) ->
    closeExpanded = ->
      App.expandedView.close()
    
    switch e.which
      when keyCodes.DOWN
        e.preventDefault()
        App.expandedView.nextPhoto e
      when keyCodes.RIGHT
        e.preventDefault()
        App.expandedView.nextPhoto e
      when keyCodes.UP
        e.preventDefault()
        App.expandedView.prevPhoto e
      when keyCodes.LEFT
        e.preventDefault()
        App.expandedView.prevPhoto e
      when keyCodes.ESCAPE
        closeExpanded()
      when keyCodes.SPACE
        e.preventDefault()
        closeExpanded()
      when keyCodes.ENTER
        closeExpanded()
      when keyCodes.M
        App.expandedView.openMap e
      when 86
        App.expandedView.openExternal e
  
  $(document).bind "keydown", (e) ->
    if $(".expanded img").length
      expandedKeyboardNav e
    else
      galleryKeyboardNav e
