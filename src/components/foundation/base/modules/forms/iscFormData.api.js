( function() {
'use strict';

angular.module( 'isc.forms' )
  .factory( 'iscFormDataApi', iscFormDataApi );

/**
   * @ngdoc factory
   * @memberOf isc.forms
   * @param devlog
   * @param apiHelper
   * @param iscCustomConfigService
   * @param iscHttpapi
   * @returns {{get: get, put: put, post: post, delete: deleteApi, list: list}}
   */
/* @ngInject */
function iscFormDataApi( devlog, apiHelper, iscCustomConfigService, iscHttpapi ) {
  var channel = devlog.channel( 'iscFormDataApi' );

  var config       = iscCustomConfigService.getConfig(),
      moduleConfig = _.get( config, 'moduleApi', {} );

  var formDataUrl = apiHelper.getConfigUrl( moduleConfig.formData );

  var api = {
    get   : get,
    put   : put,
    post  : post,
    submit: submit,
    delete: deleteApi,
    list  : list
  };

  return api;

  /**
   * @memberOf iscFormDataApi
   * @param {Number} id
   * @param {=String} url - optional override for api endpoint
   * @returns {*}
   */
  function get( id, url ) {
    channel.debug( 'iscFormDataApi.get' );
    return iscHttpapi.get( [url || formDataUrl, id].join( '/' ) );
  }

  /**
   * @memberOf iscFormDataApi
   * @param {Number} id
   * @param {Object} form
   * @param {=String} url - optional override for api endpoint
   * @returns {*}
   */
  function put( id, form, url ) {
    channel.debug( 'iscFormDataApi.put' );
    return iscHttpapi.put( [url || formDataUrl, id].join( '/' ), form );
  }

  /**
   * @memberOf iscFormDataApi
   * @param {Object} form
   * @param {=String} url - optional override for api endpoint
   * @returns {*}
   */
  function post( form, url ) {
    channel.debug( 'iscFormDataApi.post' );
    return iscHttpapi.post( url || formDataUrl, form );
  }

  /**
   * Submits the form data to the API. If the form has not been saved yet, id will be undefined
   * and the form will be POSTed to /_submit instead of /:id.
   * @memberOf iscFormDataApi
   * @param {=Number} id
   * @param {Object} form
   * @param {=String} url - optional override for api endpoint
   * @returns {*}
   */
  function submit( id, form, url ) {
    channel.debug( 'iscFormDataApi.submit' );
    if ( id === undefined ) {
      id = '_submit';
    }
    return iscHttpapi.post( [url || formDataUrl, id].join( '/' ), form );
  }

  /**
   * @memberOf iscFormDataApi
   * @param {Number} id
   * @param {=String} url - optional override for api endpoint
   * @returns {*}
   */
  function deleteApi( id, url ) {
    channel.debug( 'iscFormDataApi.delete' );
    return iscHttpapi.delete( [url || formDataUrl, id].join( '/' ) );
  }

  /**
   * @memberOf iscFormDataApi
   * @param {=String} url - optional override for api endpoint
   * @returns {*}
   */
  function list( url ) {
    channel.debug( 'iscFormDataApi.list' );
    return iscHttpapi.get( url || formDataUrl );
  }

}
} )();
