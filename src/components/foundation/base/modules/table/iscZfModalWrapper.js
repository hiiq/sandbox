/**
 * Created by paul robbins on 10/05/2015
 * Wrapper element for zf-modals:
 * wrapper-name and wrapper-offset
 * - set the distance from the top of the page
 * inner-wrapper-name
 * - specifies the element name of an inside wrapper, if needed for styling
 * scrollable-modal
 * - if truthy, enables scrolling within the modal

 SAMPLE HTML USAGE
 <isc-zf-modal-wrapper
 wrapper-name="cmcCarePlan"
 wrapper-offset="-4"
 inner-wrapper-name="iscZfModalInnerWrapper"
 scrollable-modal="true">
 <div zf-modal>
 <!-- optional inner wrapper -->
 <div name="iscZfModalInnerWrapper">
 ...
 </div>
 </div>
 </isc-zf-modal-wrapper>

 */

( function() {
'use strict';

angular.module( 'isc.table' )
  .directive( 'iscZfModalWrapper', iscZfModalWrapper );

/**
   * @ngdoc directive
   * @memberOf isc.table
   * @description
   * Created by paul robbins on 10/05/2015
   * Wrapper element for zf-modals:
   * wrapper-name and wrapper-offset
   * - set the distance from the top of the page
   * inner-wrapper-name
   * - specifies the element name of an inside wrapper, if needed for styling
   * scrollable-modal
   * - if truthy, enables scrolling within the modal
   * @example
   * SAMPLE HTML USAGE
   * <isc-zf-modal-wrapper
   *   wrapper-name="cmcCarePlan"
   *   wrapper-offset="-4"
   *   inner-wrapper-name="iscZfModalInnerWrapper"
   *    scrollable-modal="true">
   *   <div zf-modal>
   *   <!-- optional inner wrapper -->
   *      <div name="iscZfModalInnerWrapper">
   *   ...
   *     </div>
   *  </div>
   * </isc-zf-modal-wrapper>
   * @returns {{restrict: string, link: link}}
   */
function iscZfModalWrapper() {//jshint ignore:line

  // ----------------------------
  // vars
  // ----------------------------

  // ----------------------------
  // class factory
  // ----------------------------
  var directive = {
    restrict: 'E',
    link    : link
  };

  return directive;

  // ----------------------------
  // functions
  // ----------------------------
  function link( scope, element, attrs ) {
    _.defer( function() {
      // If a wrapper element was specified,
      var wrapperName = attrs.wrapperName;
      if ( wrapperName ) {
        // get the offset of that wrapper from the top,
        var offset = attrs.wrapperOffset;
        var top    = $( '[name="' + wrapperName + '"]' ).offset().top + ( +offset );
        // and set it on the zf-modal.
        element.find( '[zf-modal]' ).css( { 'top': top } );
      }

      // If the modal should be scrollable, adjust the modal's aside element to scroll.
      if ( attrs.scrollableModal ) {
        var aside = element.find( 'aside' ).first();

        var currentOverflow = aside.css( 'overflow-y' );
        aside.css( { 'overflow-y': 'auto' } );

        // Some classes, including .grid-block, inherit overflow-y.
        // So set the inner wrapper (if it exists) back to the way
        // the aside was set to overflow, before we changed it.
        element.find( '[name="' + attrs.innerWrapperName + '"]' ).css( { 'overflow-y': currentOverflow } );

        aside.focus();
      }
    } );
  }

}//END CLASS

} )();
