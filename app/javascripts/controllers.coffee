$ ->
  window.PhotoList = Backbone.Collection.extend(
    model: Photo
    url: "/feed"
    initialize: ->
      _.bindAll this, "viewablePhotos", "getUsername"
    
    getUsername: ->
      $("meta[name='username']").attr "content"
    
    nextPhoto: (photo) ->
      viewablePhotos = @viewablePhotos()
      if photo.collectionIndex() == (viewablePhotos.length - 1)
        _.first viewablePhotos
      else
        viewablePhotos[photo.collectionIndex() + 1]
    
    prevPhoto: (photo) ->
      viewablePhotos = @viewablePhotos()
      if photo.collectionIndex() == 0
        _.last viewablePhotos
      else
        viewablePhotos[photo.collectionIndex() - 1]
    
    getAllByFilter: (filter_name) ->
      _.select @models, (model) ->
        model.get("filter") == filter_name
    
    selectedThumbnail: ->
      @selected
    
    viewablePhotos: ->
      _.select @models, (model) ->
        $(model.view.el).find("img").is ":visible"
  )
  window.FilterList = Backbone.Collection.extend(
    model: Filter
    getByName: (name) ->
      _.select(@models, (filter) ->
        filter.get("name") == name
      )[0]
    
    addPhoto: (options) ->
      photo = options.photo
      filter = @getByName(photo.get("filter"))
      unless filter
        filter = new Filter(name: photo.get("filter"))
        @add filter
      filter
  )
