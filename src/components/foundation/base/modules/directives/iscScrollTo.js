( function() {
'use strict';

angular.module( 'isc.directives' )
  .directive( 'iscScrollTo', iscScrollTo );
/**
   * @ngdoc directive
   * @memberOf directives
   * @name iscScrollTo
   * @scope
   * @restrict 'A'
   * @param $uiViewScroll
   * @returns {{restrict: string, link: link}}
   */
/* @ngInject */
function iscScrollTo( $uiViewScroll ) {//jshint ignore:line
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

  function link( scope, element, attrs ) {
    var name = _.get( attrs, 'iscScrollTo', '' );
    if ( name ) {
      var target = $( '[name="' + name + '"]' );
      if ( target ) {
        element.on( 'click', function() {
          $uiViewScroll( target );
        } );
      }
    }

  }
}// END CLASS

} )();
