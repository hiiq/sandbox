( function() {
'use strict';

angular.module( 'isc.notification' )
  .directive( 'iscNotificationSet', iscNotificationSet );

/**
   * @ngdoc directive
   * @memberOf isc.notification
   * @returns {{restrict: string, replace: boolean, templateUrl: directive.templateUrl}}
   */
/* @ngInject */
function iscNotificationSet() {//jshint ignore:line
  // ----------------------------
  // vars
  // ----------------------------

  // ----------------------------
  // class factory
  // ----------------------------
  var directive = {
    restrict   : 'E',
    replace    : true,
    templateUrl: function( elem, attrs ) {
      return attrs.templateUrl || 'iscNotification/iscNotificationSet.html';
    }
  };

  return directive;

  // ----------------------------
  // functions
  // ----------------------------

}//END CLASS

} )();
