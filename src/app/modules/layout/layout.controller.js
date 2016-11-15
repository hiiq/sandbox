/**
 * Created by hzou on 2/8/2016, 8:57:49 AM.
 */

( function() {
  'use strict';

  angular.module( 'layout' )
    .controller( 'layoutController', layoutController );

  function layoutController( devlog, $rootScope, $state ) {
    var log = devlog.channel( 'layoutController' );
    log.debug( 'layoutController LOADED' );

    // ----------------------------
    // vars
    // ----------------------------
    var self = this;
    _.merge( self, {
      layout     : $state.next.layout,
      layoutClass: getSecondLevelStateName()
    } );

    /**
     * updates the layout and layoutClass based on the next state
     */
    $rootScope.$on( '$stateChangeStart', function( event, state, params ) {
      self.layout      = state.layout;
      self.layoutClass = getSecondLevelStateName();
    } );

    /**
     * @description
     *  it takes the second level $state name and kebab case the name
     *  e.g. "authenticated.patientInfo.medications" => returns "patient-info"
     */
    function getSecondLevelStateName() {
      return _.kebabCase( $state.next.name.split( '.' )[1] || '' );
    }
  }// END CLASS

} )();
