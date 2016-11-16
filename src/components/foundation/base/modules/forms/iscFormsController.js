( function() {
'use strict';

/* @ngInject */
angular
  .module( 'isc.forms' )
  .controller( 'iscFormsController', function( $stateParams ) {
    this.params     = $stateParams;
    this.formConfig = {};
  } );

} )();
