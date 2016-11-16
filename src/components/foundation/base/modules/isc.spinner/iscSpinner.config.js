/**
 * Created by hzou on 1/2/16.
 */

( function() {
'use strict';

angular
  .module( 'isc.spinner' )
  .config( config );

function config( $httpProvider ) {
  //adding the spinner interceptor code handler
  $httpProvider.interceptors.push( 'httpLoaderInterceptor' );
}

} )();

