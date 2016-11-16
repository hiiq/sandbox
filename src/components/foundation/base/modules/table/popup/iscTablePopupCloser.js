/**
 * Created by hzou on 10/13/2015
 *
 */

// closes zf-modal when 'ESCAPE' key is pressed

( function() {
'use strict';

// ----------------------------
// injection
// ----------------------------
angular.module( 'isc.table' )
  .directive( 'iscTablePopupCloser', iscTablePopupCloser );

/* @ngInject */
/**
   * @ngdoc directive
   * @memberOf isc.table
   * @param devlog
   * @param keyCode
   * @returns {{restrict: string, link: link}}
   */
function iscTablePopupCloser( devlog, keyCode ) {
  var channel = devlog.channel( 'iscTablePopupCloser' );

  channel.debug( 'iscTablePopupCloser LOADED' );

  // ----------------------------
  // vars
  // ----------------------------

  // ----------------------------
  // class factory
  // ----------------------------
  return {
    restrict: 'A',
    link    : link
  };

  // ----------------------------
  // functions
  // ----------------------------

  function link( scope, trElem, attrs ) {
    trElem.on( 'keydown', function( event ) {
      if ( event.keyCode === keyCode.ESCAPE ) {
        var $target = $( event.target );
        if ( $target.is( ':input' ) ) {
          trElem.focus();
        } else {
          scope.iscRowCtrl.onCommand( 'cancelEdit' );
        }
      }
    } );
  }
}// END CLASS

} )();
