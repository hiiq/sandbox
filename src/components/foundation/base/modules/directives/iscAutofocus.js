/**
 *
 * courtesy of mlynch
 * https://gist.github.com/mlynch/dd407b93ed288d499778
 *
 * the HTML5 iscAutofocus property can be finicky when it comes to dynamically loaded
 * templates and such with AngularJS. Use this simple directive to
 * tame this beast once and for all.
 *
 * Usage:
 * <input type="text" iscAutofocus>
 *
 * License: MIT
 */

( function() {
'use strict';
// ----------------------------
// injection
// ----------------------------

angular.module( 'isc.directives' )
  .directive( 'iscAutofocus', iscAutofocus );

/**
   * @ngdoc directive
   * @memberOf directives
   * @name AutoFocus
   * @restrict 'A'
   * @element ANY
   * @param devlog {object} logging plugin with filtering controls over the logged text
   * @param $timeout {object= } angular wrapper for setTimeout
   * @returns {{restrict: string, link: link}}
   * @description
   * This directive for auto-focus on the elements which its attached to.
   */
/* @ngInject */
function iscAutofocus( devlog, $timeout ) {
  var channel = devlog.channel( 'iscAutofocus' );

  channel.debug( 'iscAutofocus LOADED' );

  // ----------------------------
  // class factory
  // ----------------------------
  var directive = {
    restrict: 'A',
    link    : link
  };

  return directive;

  // ----------------------------
  // functions
  // ----------------------------
  /**
   *
   * @param scope
   * @param elem
   * @param attr
   * @description
   * The method is the link method for the directive
   */
  function link( scope, elem, attr ) {
    $timeout( function() {
      elem[0].focus();
    } );

  }//END LINK

}//END CLASS

} )();
