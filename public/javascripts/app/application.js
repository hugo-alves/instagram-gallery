/* DO NOT MODIFY. This file was compiled Fri, 26 Aug 2011 17:42:07 GMT from
 * /Users/jeff/Dropbox/Code/instagram/app/javascripts/application.coffee
 */

(function() {
  $(function() {
    var expandedKeyboardNav, galleryKeyboardNav;
    window.Photos = new PhotoList;
    window.Filters = new FilterList;
    window.Workspace = Backbone.Router.extend({
      routes: {
        "": "resetUI",
        "/filters/:ids": "filters"
      },
      resetUI: function() {
        return App.resetUI();
      },
      filters: function(ids) {
        var filters;
        App.resetUI();
        filters = ids.split(":");
        if (ids && filters) {
          $(App.el).addClass("filtered");
          if (filters.length >= Filters.models.length) {
            window.location.hash = "#/";
            $("html").stop().scrollTo("#nav", 800);
          }
          return _.each(filters, function(filter_name) {
            var filter, photos;
            filter = Filters.getByName(filter_name);
            if (filter) {
              photos = filter.getPhotos();
              if (filter) {
                _.each(photos, function(photo) {
                  return photo.view.highlight();
                });
                _.first(Photos.viewablePhotos()).view.select().scroll();
              }
              return $(filter.view.el).addClass("highlight");
            }
          });
        } else {
          window.location.hash = "#/";
          return $("html").stop().scrollTo("#nav", 800);
        }
      }
    });
    window.App = new ApplicationView;
    galleryKeyboardNav = function(e) {
      var expandPhoto, left, right, thumbnail, viewablePhotos;
      viewablePhotos = Photos.viewablePhotos();
      thumbnail = Photos.selectedThumbnail();
      expandPhoto = function() {
        if (thumbnail) {
          return thumbnail.view.showExpanded();
        }
      };
      right = function() {
        e.preventDefault();
        if (!thumbnail) {
          return _.first(viewablePhotos).view.select();
        } else {
          return Photos.nextPhoto(thumbnail).view.select();
        }
      };
      left = function() {
        e.preventDefault();
        if (!thumbnail) {
          thumbnail = _.last(viewablePhotos).view.select();
        } else {
          thumbnail = Photos.prevPhoto(thumbnail).view.select();
        }
        return thumbnail.select();
      };
      switch (e.which) {
        case keyCodes.RIGHT:
          return right();
        case keyCodes.LEFT:
          return left();
        case keyCodes.UP:
          return left();
        case keyCodes.DOWN:
          return right();
        case keyCodes.ENTER:
          e.preventDefault();
          return expandPhoto();
        case keyCodes.SPACE:
          e.preventDefault();
          return expandPhoto();
      }
    };
    expandedKeyboardNav = function(e) {
      var closeExpanded;
      closeExpanded = function() {
        return App.expandedView.close();
      };
      switch (e.which) {
        case keyCodes.DOWN:
          e.preventDefault();
          return App.expandedView.nextPhoto(e);
        case keyCodes.RIGHT:
          e.preventDefault();
          return App.expandedView.nextPhoto(e);
        case keyCodes.UP:
          e.preventDefault();
          return App.expandedView.prevPhoto(e);
        case keyCodes.LEFT:
          e.preventDefault();
          return App.expandedView.prevPhoto(e);
        case keyCodes.ESCAPE:
          return closeExpanded();
        case keyCodes.SPACE:
          e.preventDefault();
          return closeExpanded();
        case keyCodes.ENTER:
          return closeExpanded();
        case keyCodes.M:
          return App.expandedView.openMap(e);
        case 86:
          return App.expandedView.openExternal(e);
      }
    };
    return $(document).bind("keydown", function(e) {
      if ($(".expanded img").length) {
        return expandedKeyboardNav(e);
      } else {
        return galleryKeyboardNav(e);
      }
    });
  });
}).call(this);
