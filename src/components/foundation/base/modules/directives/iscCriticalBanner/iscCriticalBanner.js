/**
 * Created by hzou on 12/12/15.
 */

( function() {
'use strict';
// ----------------------------
// injection
// ----------------------------

angular.module( 'isc.directives' )
  .directive( 'iscCriticalBanner', iscCriticalBanner );

/* @ngInject */
/**
   * @ngdoc directive
   * @memberOf directives
   * @name iscCriticalBanner
   * @scope
   * @restrict 'EA'
   * @returns {{restrict: string, scope: {message: string, cssClass: string}, controller: controller, controllerAs: string, bindToController: boolean, templateUrl: directive.templateUrl}}
   * @description
   * directive that creates a critical banner - provides a default implementation as well as hook to provide your own implementation
   * injected thru attributes
   * @example
   * <div iscCriticalBanner ></div>
   * <div iscCriticalBanner templateUrl="myCriticalBanner.html" ></div>
   *
   */
function iscCriticalBanner() {//jshint ignore:line

  // ----------------------------
  // vars
  // ----------------------------

  // ----------------------------
  // class factory
  // ----------------------------
  var directive = {
    restrict        : 'EA',
    scope           : {
      message : '@',
      cssClass: '@'
    },
    controller      : controller,
    controllerAs    : 'iscBannerCtrl',
    bindToController: true,
    templateUrl     : function( elem, attrs ) {
      return attrs.templateUrl || 'directives/iscCriticalBanner/iscCriticalBanner.html';
    }
  };

  return directive;

  // ----------------------------
  // functions
  // ----------------------------
  function controller() {
    var self = this;
  }

}//END CLASS

} )();
