/**
 * Created by hzou on 12/8/15.
 */

( function() {
  'use strict';

  var _appConfig;

  angular
    .module( 'devtools', ['httpbackup'] )
    .config( config )
    .run( run );

  function config( $httpProvider, httpBackupCacheProvider, appConfig ) {
    _appConfig = appConfig;
    if ( _appConfig.useCachedHttpResponses ) {
      $httpProvider.interceptors.push( 'httpBackupInterceptor' );
      httpBackupCacheProvider.setCachingRules( [
        new RegExp( "^(?!.*[.]html$).*$" )  //ignore file ending with "*.html"
      ] );
    }
  }

  function run( $rootScope, AUTH_EVENTS, iscNotificationService, httpBackupCache ) {

    if ( _appConfig.useCachedHttpResponses ) {
      $rootScope.$on( 'HttpBackup_activated', function( response, data ) {
        if ( !data.url.endsWith( "auth/status" ) ) {  //ignoring status urls because it gets fired for each api call
          iscNotificationService.showAlert( {
            content: "Using Cached for: " + data.url
          } );
        }
      } );

      $rootScope.$on( 'HttpBackup_cached', function( response, data ) {
        if ( data.url.endsWith( "auth/login" ) ) {
          //automatically setCache for 'auth/status' when 'auth/login' is called.
          //this is needed because auth/login response with 303 to redirects to auth/status
          var statusUrl = data.url.replace( 'auth/login', 'auth/status' );
          httpBackupCache.setItem( statusUrl, data.response );
        }
      } );

      // ------------------------
      // sessionTimeout event
      $rootScope.$on( AUTH_EVENTS.logout, function() {
        httpBackupCache.clear();
      } );
    }
  }

} )();
