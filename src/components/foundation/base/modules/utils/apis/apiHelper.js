/**
 * Created by hzou on 1/7/16.
 */

( function() {
'use strict';

angular
  .module( 'isc.core' )
  .factory( 'apiHelper', apiHelper );

function apiHelper( devlog, iscCustomConfigService ) {

  var log = devlog.channel( 'apiHelper' );

  var service = {
    getUrl      : getUrl,
    getConfigUrl: getConfigUrl,
    getWsUri    : getWsUri
  };
  return service;

  ////////////////

  function getUrl( url ) {
    log.logFn( 'getUrl' );

    var config      = getConfig(),
        relativeUrl = isUrlRelative( config.api );

    log.debug( '...url', url );
    log.debug( '...config.api', config.api );
    log.debug( '...relativeUrl', relativeUrl );

    var finalUrl = '';
    if ( relativeUrl ) {
      finalUrl = [config.api.path, url].join( '/' );
    }
    else {
      var protocol = config.api.protocol + ":/";
      var hostname = config.api.hostname + ( config.api.port ? ":" + config.api.port : '' );
      var path     = config.api.path;

      log.debug( '...protocol', protocol );
      log.debug( '...hostname', hostname );
      log.debug( '...path', path );

      finalUrl = [protocol, hostname, path, url].join( '/' );
    }

    log.debug( '...finalUrl', finalUrl );
    return finalUrl;
  }

  /**
   * @description
   *  Returns an absolute url constructed from the application's configured API properties.
   * @param {Object} configProp - The configuration property to use when constructing the url.
   * @returns {string} The absolute url destination
   */
  function getConfigUrl( configProp ) {
    var config      = getConfig(),
        apiProp     = _.merge( {}, config.api, configProp ),
        relativeUrl = isUrlRelative( apiProp );

    if ( relativeUrl ) {
      return apiProp.path;
    }
    else {
      return [apiProp.protocol + ":/",
        apiProp.hostname + ( apiProp.port ? ":" + apiProp.port : '' ),
        apiProp.path].join( '/' );
    }
  }

  function getWsUri() {
    var config = getConfig();
    return ["ws:/",
      config.api.hostname + ( config.api.port ? ":" + config.api.port : '' )].join( '/' );
  }

  function getConfig() {
    return iscCustomConfigService.getConfig();
  }

  function isUrlRelative( apiProp ) {
    return !apiProp.protocol || !apiProp.hostname;
  }
}

} )();

