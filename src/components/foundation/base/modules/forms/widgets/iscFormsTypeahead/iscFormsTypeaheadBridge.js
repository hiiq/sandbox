( function() {
'use strict';

angular.module( 'isc.core' )
  .directive( 'iscFormsTypeaheadBridge', iscFormsTypeaheadBridge );

/**
   * @ngdoc directive
   * @memberOf isc.core
   * @returns {{restrict: string, controllerAs: string, controller: controller}}
   */
/* @ngInject */
function iscFormsTypeaheadBridge() {//jshint ignore:line
  return {
    restrict    : 'E',
    controllerAs: 'taBridgeCtrl',
    controller  : controller
  };

  // ----------------------------
  // functions
  // ----------------------------
  function controller() {
    var self = this;

    self.apiResults = [];

    self.invokeApi = function( model, input, api ) {
      if ( api.threshold ) {
        if ( api.threshold( model, input ) ) {
          api.get( model, input ).then( function( results ) {
            self.apiResults = api.resultsFilter( results );
          } );
        }
      }
      else {
        if ( !api.minlength || _.get( input, 'length', 0 ) >= api.minlength ) {
          api.get( model, input ).then( function( results ) {
            self.apiResults = api.resultsFilter( results );
          } );
        }
      }
    };

    self.invokeSelect = function( model, onSelectFn ) {
      return function bridgeSelect( item ) {
        onSelectFn( model, item );
      };
    };
  }

}// END CLASS

} )();
