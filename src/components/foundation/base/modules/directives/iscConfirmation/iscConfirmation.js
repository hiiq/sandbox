/**
 * Created by hzou on 9/16/15.
 */

( function() {
'use strict';
// ----------------------------
// injection
// ----------------------------

angular.module( 'isc.directives' )
  .directive( 'iscConfirmation', iscConfirmation );

/**
   * @ngdoc directive
   * @memberOf directives
   * @name iscConfirmation
   * @restrict 'E'
   * @returns {{restrict: string, link: link, controller: controller, controllerAs: string, templateUrl: directive.templateUrl}}
   */
function iscConfirmation() {//jshint ignore:line

  // ----------------------------
  // vars
  // ----------------------------

  // ----------------------------
  // class factory
  // ----------------------------
  var directive = {
    restrict    : 'E',
    scope       : {},
    link        : link,
    controller  : controller,
    controllerAs: 'iscConfirmCtrl',
    templateUrl : function( elem, attrs ) {
      return attrs.templateUrl || 'directives/iscConfirmation/iscConfirmation.html';
    }
  };

  return directive;

  // ----------------------------
  // link
  function link( $scope, elem, attrs, iscConfirmCtrl ) {
    var modalScope = elem.find( '[zf-modal]' ).scope();
    $scope.$watch( 'iscConfirmCtrl.service.isOpen', function( newVal, oldVal ) {
      if ( newVal !== oldVal ) {
        if ( newVal === true ) {
          modalScope.show();
        } else {
          modalScope.hide();
        }
      }
    } );
  }

  // ----------------------------
  // controller
  /* @ngInject */
  function controller( iscConfirmationService ) {
    var self     = this;
    self.service = iscConfirmationService;
  }

}//END CLASS

} )();
