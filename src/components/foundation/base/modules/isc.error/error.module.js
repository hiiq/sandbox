/**
 * Created by Henry Zou on 3/16/2016, 3:07:35 PM.
 */

( function() {
'use strict';

angular
  .module( 'isc.error', ['ui.router', 'isc.common'] )

  .config( function( $stateProvider, iscStateProvider, $urlRouterProvider ) {
    $urlRouterProvider.otherwise( '/404' );
    iscStateProvider.state( getStates() );
  } );

function getStates() {
  return {
    'error404'            : {
      url           : '/404',
      state         : 'error404',
      templateUrl   : 'isc.error/error404.html',
      translationKey: 'Error 404',
      roles         : ['*']
    },
    'errorNoNetwork'      : {
      url           : '/noNetwork',
      state         : 'errorNoNetwork',
      templateUrl   : 'isc.error/errorNoNetwork.html',
      translationKey: 'No Network',
      roles         : ['*']
    },
    'errorUnsupportedMode': {
      url           : '/unsupportedMode',
      state         : 'errorUnsupportedMode',
      templateUrl   : 'isc.error/errorUnsupportedMode.html',
      translationKey: 'Unsupported Browswer Mode',
      roles         : ['*']
    }
  };
}
} )();
