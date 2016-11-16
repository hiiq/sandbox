/**
 * Created by douglas goodman on 2/26/15.
 *
 *  @param {Array} radioGroup - a list of objects that form the group of radio buttons
 *  @param {Object} radioItem - the selected item from the radioGroup
 *                    (MUST be a member of the radioGroup array to work properly)
 *
 *  SAMPLE HTML USAGE*
 * <isc-radio radio-item="scope.selectedItem" radio-group="myRadioGroup" ng-click="onRadioSelect( scope.selectedItem )><isc-radio>
 */

( function() {
'use strict';
// ----------------------------
// injection
// ----------------------------

angular.module( 'isc.directives' )
  .directive( 'iscRadio', iscRadio );
/**
   * @ngdoc directive
   * @memberOf directives
   * @name iscRadio
   * @param devlog
   * @param iscRadioGroupHelper
   * @returns {{restrict: string, transclude: boolean, scope: {radioGroup: string, radioItem: string}, link: link, templateUrl: directive.templateUrl}}
   * @example
   * radioGroup {Array} - a list of objects that form the group of radio buttons
   * radioItem  {Object} - the selected item from the radioGroup
   *              (MUST be a member of the radioGroup array to work properly)
   * <isc-radio radio-item="scope.selectedItem"
   *            radio-group="myRadioGroup"
   *            ng-click="onRadioSelect( scope.selectedItem )><isc-radio>
   *
   */
/* @ngInject */
function iscRadio( devlog, iscRadioGroupHelper ) {
  var channel = devlog.channel( 'iscRadio' );
  channel.debug( 'iscRadio LOADED' );

  // ----------------------------
  // vars
  // ----------------------------

  // ----------------------------
  // class factory
  // ----------------------------
  var directive = {
    restrict   : 'EA',
    transclude : false,
    scope      : {
      radioGroup: '=',
      radioItem : '='
    },
    link       : link,
    templateUrl: function( elem, attrs ) {
      return attrs.templateUrl || 'svg/isc-radio.html';
    }
  };

  return directive;

  // ----------------------------
  // functions
  // ----------------------------

  function link( scope, elem, attr ) {//jshint ignore:line

    scope.toggle = function() {
      iscRadioGroupHelper.radioSelect( scope.radioItem, scope.radioGroup );
    };
  }

}//END CLASS

} )();
