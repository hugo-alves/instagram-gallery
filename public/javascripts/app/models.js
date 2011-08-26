/* DO NOT MODIFY. This file was compiled Fri, 26 Aug 2011 17:03:51 GMT from
 * /Users/jeff/Dropbox/Code/instagram/app/javascripts/models.coffee
 */

(function() {
  $(function() {
    window.Filter = Backbone.Model.extend({
      initialize: function() {
        return _.bindAll(this, "getPhotos");
      },
      getPhotos: function() {
        return Photos.getAllByFilter(this.get("name"));
      }
    });
    return window.Photo = Backbone.Model.extend({
      initialize: function() {
        this.set({
          caption: {
            text: this.get("caption") === null ? "no caption" : void 0
          }
        });
        this.filterObj = Filters.addPhoto({
          photo: this
        });
        return _.bindAll(this, "collectionIndex");
      },
      collectionIndex: function() {
        return _.indexOf(this.collection.viewablePhotos(), this);
      },
      hasLocation: function() {
        if (this.get("location") && this.get("location").longitude && this.get("location").latitude) {
          return true;
        } else {
          return false;
        }
      }
    });
  });
}).call(this);
