/**
 * Created by paul robbins on 10/17/16
 *
 */

( function() {
'use strict';

angular.module( 'isc.forms' )
  .directive( 'iscFormsHelp', iscFormsHelp );

/* @ngInject */
function iscFormsHelp( $sce ) {//jshint ignore:line

  var directive = {
    restrict        : 'E',
    transclude      : true,
    replace         : true,
    bindToController: true,
    scope           : {
      helpContent: '='
    },
    controllerAs    : 'helpCtrl',
    controller      : controller,
    templateUrl     : function( elem, attrs ) {
      return attrs.templateUrl || 'forms/widgets/iscFormsHelp/iscFormsHelp.html';
    }
  };

  return directive;

  function controller() {
    var self = this;

    _.extend( self, {
      showHelp      : false,
      toggleHelp    : toggleHelp,
      getHelpContent: getHelpContent
    } );

    function toggleHelp() {
      self.showHelp = !self.showHelp;
    }

    function getHelpContent() {
      return $sce.trustAsHtml( self.helpContent );
    }
  }
}
} )();
