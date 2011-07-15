
/* --------------------------------
   HELPERS
----------------------------------- */

window.keyCodes = $.extend({
  M : 77,
  J : 74,
  K : 75,
  L : 76,
  H : 72
}, $.ui.keyCode);

$("a[href='#']").live('click', function(e) {
  e.preventDefault();
});