/**
 * Created by paul robbins on 7/8/16.
 */

( function() {
  'use strict';

  angular.module( 'isc.authentication' )
    .factory( 'iscAuthStatusService', iscAuthStatusService );

  /* @ngInject */
  function iscAuthStatusService( $rootScope, $window,
    iscCookieManager, iscAuthStatus, iscSessionModel, iscSessionStorageHelper,
    NAV_EVENTS, AUTH_EVENTS ) {
    var thisTabHash,
        authStatusCallFailed = false;

    angular.element( $window ).on( 'focus', authStatusFocus );
    angular.element( $window ).on( 'blur', authStatusBlur );

    return {
      checkAuthStatus: checkAuthStatus
    };

    function checkAuthStatus() {
      var config              = iscAuthStatus.getConfig(),
          storedLoginResponse = iscSessionStorageHelper.getLoginResponse(),
          isBrowserLoggedOut  = iscCookieManager.get( 'browserIsLoggedOut' );

      if ( config.authStatusUrl !== undefined &&
        _.isEmpty( storedLoginResponse ) && // this is checked in isc.authentication.run()
        !config.authStatusHasBeenChecked && !isBrowserLoggedOut ) {

        config.authStatusHasBeenChecked = true;

        config.authResults = callAuthStatus( config.authStatusUrl );

        if ( config.authResults ) {
          $rootScope.$emit( NAV_EVENTS.tabLoaded, config.authResults );

          config.authResults = null;
        }
      }
    }

    function authStatusFocus() {
      var config       = iscAuthStatus.getConfig(),
          shouldLogOut = iscCookieManager.get( 'browserIsLoggedOut' ),
          callback     = config.authStatusFocusCallback || _.noop;

      if ( config.useAuthStatus ) {
        if ( shouldLogOut && iscSessionModel.isAuthenticated() ) {
          $rootScope.$emit( AUTH_EVENTS.logout );
          return;
        }

        var storageHash = iscCookieManager.get( 'hashcode' );

        if ( storageHash && storageHash !== thisTabHash ) {
          var authStatusResult = callAuthStatus( config.authStatusUrl );
          if ( authStatusResult ) {
            thisTabHash = storageHash;
            return callback( authStatusResult );
          }
        }
      }
    }

    function authStatusBlur() {
      // If the last call to auth/status failed, do not update the local hash.
      // This will force auth/status to be retried when this window is focused again.
      if ( !authStatusCallFailed ) {
        thisTabHash = iscCookieManager.get( 'hashcode' );
      }
    }

    function callAuthStatus( url ) {
      var myRet;

      //since this ajax call is synchronous, the return statement won't execute until this ajax call has returned and the callback executed
      $.ajax( {
        method : "GET",
        url    : url,
        async  : false,   //synchronous/blocking call
        success: onSuccess,
        error  : onError
      } );

      return myRet; //will be populated with onSuccess result if successful, else it'll remain as undefined

      function onSuccess( results ) {
        if ( results.LoggedIn ) {
          myRet = results;
        }
        authStatusCallFailed = false;
      }

      function onError() {
        authStatusCallFailed = true;
      }
    }

  }
} )();

