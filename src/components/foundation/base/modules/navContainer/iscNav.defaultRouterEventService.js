/**
 * Created by douglasgoodman on 11/24/14.
 */

( function() {
'use strict';

angular
  .module( 'iscNavContainer' )
  .factory( 'iscRouterDefaultEventService', iscRouterDefaultEventService );

function iscRouterDefaultEventService( devlog,
  $rootScope,
  iscAuthorizationModel,
  iscSessionModel,
  AUTH_EVENTS,
  NAV_EVENTS ) {
  var channel = devlog.channel( 'iscRouterDefaultEventService' );

  var service = {
    registerDefaultEvents      : registerDefaultEvents,
    registerStateChangeStart   : registerStateChangeStart,
    registerStateChangeSuccess : registerStateChangeSuccess,
    registerStateChangeError   : registerStateChangeError,
    registerStateChangeRejected: registerStateChangeRejected
  };
  return service;

  // ------------------------
  // functions
  // ------------------------
  function registerDefaultEvents() {
    service.registerStateChangeStart();
    service.registerStateChangeError();
    service.registerStateChangeRejected();
    service.registerStateChangeSuccess();
  }

  function registerStateChangeStart() {
    // ------------------------
    // stateChange start
    $rootScope.$on( '$stateChangeStart',
      function( event, toState, toParams, fromState, fromParams ) {
        channel.debug( 'ischNavContainer.$stateChangeStart' );
        channel.debug( '...from: ', fromState.name );
        channel.debug( '.....to: ', toState.name );

        channel.debug( 'State change request received' );
        channel.debug( 'Beginning state change from \'%s\' to \'%s\'', _.wrapText( fromState.name ), _.wrapText( toState.name ) );

        handleStateChangeStart( event, toState, toParams, fromState, fromParams );
      } );
  }

  function registerStateChangeSuccess() {
    // ------------------------
    // stateChange success
    $rootScope.$on( '$stateChangeSuccess',
      function( event, toState, toParams, fromState, fromParams ) {//jshint ignore:line
        channel.debug( 'ischNavContainer.$stateChangeSuccess', _.wrapText( toState.name ) );
      } );
  }

  function registerStateChangeError() {
    channel.debug( 'registering $stateChangeError' );
    // ------------------------
    // stateChange error
    $rootScope.$on( '$stateChangeError',
      function( event, toState, toParams, fromState, fromParams, error ) {//jshint ignore:line
        channel.error( 'ischNavContainer.$stateChangeError', error );
      } );
  }

  function registerStateChangeRejected() {

    channel.debug( 'registering $stateChangeRejected' );
    // ------------------------
    // stateChange $stateChangeRejected
    $rootScope.$on( '$stateChangeRejected',
      function( event, toState, toParams, fromState, fromParams, error ) {//jshint ignore:line
        channel.error( 'ischNavContainer.$stateChangeRejected' );
        channel.error( '.... to state', _.wrapText( toState.state, '==' ) );
      } );
  }

  function handleStateChangeStart( event, toState, toParams, fromState, fromParams ) {//jshint ignore:line
    channel.debug( 'iscNavContainer.handleStateChangeStart' );

    // get the permissions for this state
    var isAuthorized    = iscAuthorizationModel.isAuthorized( toState.name ); // either your role is permitted or the state is whitelisted
    var isAuthenticated = iscSessionModel.isAuthenticated(); // you are logged in

    channel.debug( '...isAuthorized', isAuthorized );
    channel.debug( '...isAuthenticated', isAuthenticated );

    if ( !isAuthorized ) {
      channel.debug( toState.name + ' is not authorized' );
      preventDefault( event, toState.name, {
        source: "iscRouterDefaultEventService.handleStateChangeStart",
        error : "User is not authorized to access " + _.wrapText( toState.name )
      } );

      if ( !isAuthenticated ) {
        channel.debug( '...not authenticated' );
        $rootScope.$emit( NAV_EVENTS.goToBeforeLoginPage );
        $rootScope.$emit( AUTH_EVENTS.notAuthenticated );
      } else {
        channel.debug( '... logged in, but not authorized' );
        $rootScope.$emit( AUTH_EVENTS.notAuthorized );
      }
    }
  }

  function preventDefault( event, toStateName, error ) {
    channel.debug( '...preventDefault to', toStateName );
    channel.error( '... ' + _.wrapText( toStateName ) + ' is unauthorized. ', error );
    event.preventDefault();
  }
}
} )();
