/**
 * Created by douglas goodman on 3/7/15.
 */

( function() {
'use strict';
// ----------------------------
// injection
// ----------------------------

angular.module( 'isc.directives' )
  .directive( 'iscDynamicHtml', iscDynamicHtml );
/**
   * @ngdoc directive
   * @memberOf directives
   * @name iscDynamicHtml
   * @param devlog
   * @param $compile
   * @param $templateCache
   * @returns {{restrict: string, replace: boolean, link: link}}
   * @description
   * this directive allows to inject html dynamcally
   */
/* @ngInject */
function iscDynamicHtml( devlog, $compile, $templateCache ) {//jshint ignore:line
  var channel = devlog.channel( 'iscDynamicHtml' );
  channel.debug( 'iscDynamicHtml LOADED' );

  // ----------------------------
  // vars
  // ----------------------------

  // ----------------------------
  // class factory
  // ----------------------------
  var directive = {
    restrict: 'EA',
    replace : true,
    link    : link
  };

  return directive;

  // ----------------------------
  // functions
  // ----------------------------

  function link( scope, elem, attr ) {
    scope.$watch( attr.iscDynamicHtml, function( html ) {
      channel.debug( 'iscDynamicHtml', html );
      elem.html( html );
      $compile( elem.contents() )( scope );
    } );
  }

}//END CLASS

} )();
