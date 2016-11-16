( function() {
'use strict';

angular
  .module( 'iscNavContainer' )
  .factory( 'iscScrollContainerService', iscScrollContainerService );

/* @ngInject */
/**
   * @ngdoc factory
   * @memberOf iscNavContainer
   * @returns {{registerScrollingContent: registerScrollingContent, getCurrentScrollPosition: iscScrollContainerService.getCurrentScrollPosition, setCurrentScrollPosition: setCurrentScrollPosition}}
   */
function iscScrollContainerService() {
  var scrollingContent = [];

  var service = {
    registerScrollingContent: registerScrollingContent,
    getCurrentScrollPosition: getCurrentScrollPosition,
    setCurrentScrollPosition: setCurrentScrollPosition
  };

  return service;

  /**
   * Registers the given jq element as a scroll container which can be manipulated by this service.
   * @param {jQueryElement} $element
   */
  function registerScrollingContent( $element ) {
    if ( !_.includes( scrollingContent, $element ) ) {
      scrollingContent.push( $element );
    }
  }

  /**
   * @memberOf iscScrollContainerService
   * @description
   * Gets the scroll position of the given scrollingContent index.
   * @param {number|String=} index
   * @returns {*}
   */
  function getCurrentScrollPosition( index ) {
    var contentIndex = getContentIndex( index );

    if ( contentIndex !== undefined ) {
      return scrollingContent[contentIndex].scrollTop();
    }
    else {
      return 0;
    }
  }

  /**
   * @memberOf iscScrollContainerService
   * @description
   * Sets the scroll position of the given scrollingContent index.
   * @param {number} position - The position to scroll to
   * @param {number=} duration - The animation duration in millis
   * @param {number|String=} index
   */
  function setCurrentScrollPosition( position, duration, index ) {
    var contentIndex   = getContentIndex( index ),
        scrollPosition = parseInt( position || 0 );

    if ( contentIndex !== undefined && !isNaN( scrollPosition ) ) {
      if ( duration ) {
        scrollingContent[contentIndex].animate( {
          scrollTop: position
        }, duration );
      }
      else {
        scrollingContent[contentIndex].scrollTop( position );
      }
    }
  }

  // Private/helper functions
  function getContentIndex( index ) {
    var contentLength = scrollingContent.length;
    if ( contentLength ) {
      var maxLength = contentLength - 1;
      if ( index === undefined || index === 'first' ) {
        return 0;
      }
      else if ( index === 'last' ) {
        return maxLength;
      }
      else {
        var parsedIndex = parseInt( index );
        if ( !isNaN( parsedIndex ) && parsedIndex >= 0 && parsedIndex <= maxLength ) {
          return parsedIndex;
        }
      }
    }
    return undefined;
  }
}

} )();
