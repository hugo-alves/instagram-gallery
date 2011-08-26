$ ->
  window.Filter = Backbone.Model.extend(
    initialize: ->
      _.bindAll this, "getPhotos"
    
    getPhotos: ->
      Photos.getAllByFilter @get("name")
  )
  window.Photo = Backbone.Model.extend(
    initialize: ->
      @set caption: text: "no caption"  if @get("caption") == null
      @filterObj = Filters.addPhoto(photo: this)
      _.bindAll this, "collectionIndex"
    
    collectionIndex: ->
      _.indexOf @collection.viewablePhotos(), this
    
    hasLocation: ->
      (if @get("location") and @get("location").longitude and @get("location").latitude then true else false)
  )
