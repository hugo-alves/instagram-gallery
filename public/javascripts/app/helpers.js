/* DO NOT MODIFY. This file was compiled Fri, 26 Aug 2011 17:03:51 GMT from
 * /Users/jeff/Dropbox/Code/instagram/app/javascripts/helpers.coffee
 */

(function() {
  window.keyCodes = $.extend({
    M: 77,
    J: 74,
    K: 75,
    L: 76,
    H: 72
  }, $.ui.keyCode);
  $("a[href='#']").live("click", function(e) {
    return e.preventDefault();
  });
}).call(this);
