( function() {
'use strict';

/* @ngInject */
angular
  .module( 'isc.forms' )
  .factory( 'iscFormsCodeTableApi', iscFormsCodeTableApi );

/**
   * @ngdoc factory
   * @memberOf isc.forms
   * @param iscHttpapi
   * @param apiHelper
   * @param iscCustomConfigService
   * @returns {{loadAll: loadAll, get: get}}
   */
function iscFormsCodeTableApi( iscHttpapi, apiHelper, iscCustomConfigService ) {
  var config       = iscCustomConfigService.getConfig(),
      moduleConfig = _.get( config, 'moduleApi', {} );

  var codeTableUrl = apiHelper.getConfigUrl( moduleConfig.formCodeTables );

  var codeTableCache = {};

  return {
    loadAll: loadAll,
    get    : get
  };

  /**
   * @memberOf iscFormsCodeTableApi
   * @description
   * Loads all the code tables from the server and caches them locally.
   * @returns {Promise}
   */
  function loadAll() {
    // Server responds with an object containing all code tables, with one property per table.
    // The property key is the code table name, while the property value is the code table.
    return iscHttpapi.get( codeTableUrl ).then( function( codeTables ) {
      codeTableCache = codeTables;
      return codeTables;
    } );
  }

  /**
   * @memberOf iscFormsCodeTableApi
   * @description
   * Synchronously returns a single code table by name.
   * @param {String} name
   * @returns {Array}
   */
  function get( name ) {
    return _.get( codeTableCache, name, [] );
  }
}

} )();
