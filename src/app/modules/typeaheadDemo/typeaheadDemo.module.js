/**
 * Created by hiiq on 11/15/2016, 3:43:14 PM.
 */

( function() {
  'use strict';

  angular
    .module( 'typeaheadDemo', ['ui.router', 'isc.common'] )
    .config( function( iscStateProvider ) {
      iscStateProvider.state( getStates() );
    } );

  /**
   * @description this is where module specific states are defined.
   *  Be sure not to make any method name or the structural changes; any changes may prevent ```slush isc:page``` from working properly
   *
   * @returns {} -- UI router states
   */
  function getStates() {
    return {
      'unauthenticated.typeaheadDemo': {
        url           : 'typeaheadDemo',
        state         : 'unauthenticated.typeaheadDemo',
        templateUrl   : 'typeaheadDemo/typeaheadDemo.html',
        translationKey: 'Typeahead Demo',
        controller    : 'typeaheadDemoController as typeaheadDemoCtrl',
        roles         : ['*'],
        //landingPageFor: ['*'], //specify only 1 landing page per role
        //layout        : 'layout/tpls/default.html', //uncomment this to specifying alternative layout
        displayOrder  : 10 // remove this property to hide this page from the main navigation
      }
    };
  }
} )();
