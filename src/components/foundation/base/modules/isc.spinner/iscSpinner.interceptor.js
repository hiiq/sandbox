/**
 * Created by hzou on 1/2/16.
 */

( function() {
'use strict';

angular
  .module( 'isc.spinner' )
  .factory( 'httpLoaderInterceptor', httpLoaderInterceptor );

/**
   * @ngdoc factory
   * @memberOf isc.spinner
   * @param $q
   * @param iscSpinnerModel
   * @param devlog
   * @returns {{request: request, response: response, responseError: responseError}}
   */
function httpLoaderInterceptor( $q, iscSpinnerModel, devlog ) {
  var channel = devlog.channel( 'httpLoaderInterceptor' );
  var factory = {
    request      : request,
    response     : response,
    responseError: responseError
  };

  return factory;

  /**
   * @memberOf httpLoaderInterceptor
   * @param config
   * @returns {*}
   */
  function request( config ) {
    if ( config.showLoader ) {
      channel.debug( 'adding url to loader ' + config.url );
      iscSpinnerModel.addPendingReq( config.url );
    }
    return config;
  }

  /**
   * @memberOf httpLoaderInterceptor
   * @param res
   * @returns {*}
   */
  function response( res ) {
    if ( res.config.showLoader ) {
      channel.debug( 'moving url from loader ' + res.config.url );
      iscSpinnerModel.subtractPendingReq( res.config.url );
    }
    return res;
  }

  /**
   * @memberOf httpLoaderInterceptor
   * @param res
   * @returns {*}
   */
  function responseError( res ) {
    if ( res.config.showLoader ) {
      channel.debug( 'moving url from loader ' + res.config.url );
      iscSpinnerModel.subtractPendingReq( res.config.url );
    }
    return $q.reject( res );
  }
}
} )();

