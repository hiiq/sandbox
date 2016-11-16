( function() {
'use strict';

/**
   * A directive for registering the element with iscScrollContainerService as a scrolling container.
   */
angular
  .module( 'iscNavContainer' )
  .directive( 'iscScrollContainer', iscScrollContainer );

/* @ngInject */
/**
   * @ngdoc directive
   * @memberOf iscNavContainer
   * @param iscScrollContainerService
   * @returns {{restrict: string, link: link}}
   */
function iscScrollContainer( iscScrollContainerService ) {
  var directive = {
    restrict: 'EA',
    link    : link
  };
  return directive;

  function link( scope, element, attrs ) {
    iscScrollContainerService.registerScrollingContent( element );
  }
}
} )();
