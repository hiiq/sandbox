( function() {
'use strict';

/**
   * Created by Trevor Hudson on 1/30/16.

   This directive allows you to evaluate an expression within the scope of whatever element it's on
   by pressing the enter key. It also allows you to specify a service to expose onto the scope so that
   it can be accessed by way of your expression. Use like this:

   <div isc-enter="myService.closeThing()"
   scopeify="myService"></div>

   */

angular.module( 'isc.directives' )
  .directive( 'iscEnter', iscEnter );

/* @ngInject */
function iscEnter( keyCode, $injector ) {
  return {
    restrict: 'A',
    link    : link
  };

  function link( scope, element, attrs ) {
    if ( attrs.scopeify ) {
      scope[attrs.scopeify] = $injector.get( attrs.scopeify );
    }

    element.bind( 'keydown keypress', function( event ) {
      if ( getKey() === keyCode.ENTER ) {
        scope.$eval( attrs.iscEnter );
        event.preventDefault();
      }

      function getKey() {
        return event.charCode || event.keyCode || event.which || 0;
      }
    } );
  }
}
} )();
