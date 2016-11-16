/**
 * Created by hzou on 07/28/2015
 *
 */

// this directive is used for care team's health & social care contacts

( function() {
'use strict';

// ----------------------------
// injection
// ----------------------------
angular.module( 'isc.table' )
  .directive( 'iscTablePopupIndicator', iscTablePopupIndicator );

/* @ngInject */
/**
   * @ngdoc directive
   * @memberOf isc.table
   * @param devlog
   * @returns {{restrict: string, controller: controller, controllerAs: string}}
   */
function iscTablePopupIndicator( devlog ) {
  var channel = devlog.channel( 'iscTablePopupIndicator' );

  channel.debug( 'iscTablePopupIndicator LOADED' );

  // ----------------------------
  // vars
  // ----------------------------

  // ----------------------------
  // class factory
  // ----------------------------
  return {
    restrict    : 'A',
    controller  : controller,
    controllerAs: 'iscTblIndic'
  };

  // ----------------------------
  // functions
  // ----------------------------
  /* @ngInject */
  function controller( $scope ) {
    var self      = this;
    self.inPopup  = true;
    self.commands = ( _.find( $scope.iscTblCtrl.tableConfig.columns, { type: 'commands' } ) || {} ).commands;
  }
}// END CLASS

} )();
