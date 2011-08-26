/* DO NOT MODIFY. This file was compiled Fri, 26 Aug 2011 17:03:51 GMT from
 * /Users/jeff/Dropbox/Code/instagram/app/javascripts/controllers.coffee
 */

(function() {
  $(function() {
    window.PhotoList = Backbone.Collection.extend({
      model: Photo,
      url: "/feed",
      initialize: function() {
        return _.bindAll(this, "viewablePhotos", "getUsername");
      },
      getUsername: function() {
        return $("meta[name='username']").attr("content");
      },
      nextPhoto: function(photo) {
        var viewablePhotos;
        viewablePhotos = this.viewablePhotos();
        if (photo.collectionIndex() === (viewablePhotos.length - 1)) {
          return _.first(viewablePhotos);
        } else {
          return viewablePhotos[photo.collectionIndex() + 1];
        }
      },
      prevPhoto: function(photo) {
        var viewablePhotos;
        viewablePhotos = this.viewablePhotos();
        if (photo.collectionIndex() === 0) {
          return _.last(viewablePhotos);
        } else {
          return viewablePhotos[photo.collectionIndex() - 1];
        }
      },
      getAllByFilter: function(filter_name) {
        return _.select(this.models, function(model) {
          return model.get("filter") === filter_name;
        });
      },
      selectedThumbnail: function() {
        return this.selected;
      },
      viewablePhotos: function() {
        return _.select(this.models, function(model) {
          return $(model.view.el).find("img").is(":visible");
        });
      }
    });
    return window.FilterList = Backbone.Collection.extend({
      model: Filter,
      getByName: function(name) {
        return _.select(this.models, function(filter) {
          return filter.get("name") === name;
        })[0];
      },
      addPhoto: function(options) {
        var filter, photo;
        photo = options.photo;
        filter = this.getByName(photo.get("filter"));
        if (!filter) {
          filter = new Filter({
            name: photo.get("filter")
          });
          this.add(filter);
        }
        return filter;
      }
    });
  });
}).call(this);
