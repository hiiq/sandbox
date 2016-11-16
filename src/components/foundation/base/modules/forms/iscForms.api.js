( function() {
'use strict';

angular.module( 'isc.forms' )
  .factory( 'iscFormsApi', iscFormsApi );

/**
   * @ngdoc factory
   * @memberOf isc.forms
   * @param devlog
   * @param apiHelper
   * @param iscCustomConfigService
   * @param iscHttpapi
   * @returns {{listForms: listForms, getActiveForms: getActiveForms, setFormStatus: setFormStatus, getFormDefinition: getFormDefinition, getUserScript: getUserScript, getTemplate: getTemplate}}
   */
/* @ngInject */
function iscFormsApi( devlog, apiHelper, iscCustomConfigService, iscHttpapi ) {
  var channel = devlog.channel( 'iscFormsApi' );

  var config       = iscCustomConfigService.getConfig(),
      moduleConfig = _.get( config, 'moduleApi', {} );

  var formsUrl     = apiHelper.getConfigUrl( moduleConfig.forms );
  var templatesUrl = apiHelper.getConfigUrl( moduleConfig.formTemplates );

  var scriptsUrl = [templatesUrl, 'userScripts'].join( '/' );

  var api = {
    getFormDefinition: getFormDefinition,
    getTemplate      : getTemplate,
    getUserScript    : getUserScript,
    listForms        : listForms
  };

  return api;

  /**
   * @memberOf iscFormsApi
   * @returns {*}
   */
  function listForms() {
    channel.debug( 'iscFormsApi.listForms' );
    return iscHttpapi.get( formsUrl );
  }

  /**
   * @memberOf iscFormsApi
   * @param {String} formKey
   * @param {=String} formVersion
   * @returns {*}
   */
  function getFormDefinition( formKey, formVersion ) {
    channel.debug( 'iscFormsApi.getFormDefinition' );
    return iscHttpapi.get( _.compact( [formsUrl, formKey, formVersion] ).join( '/' ) );
  }

  /**
   * @memberOf iscFormsApi
   * @param scriptName
   * @returns {*}
   */
  function getUserScript( scriptName ) {
    channel.debug( 'iscFormsApi.getUserScript' );
    return iscHttpapi.get( [scriptsUrl, scriptName].join( '/' ) );
  }

  /**
   * @memberOf iscFormsApi
   * @param templateName
   * @returns {*}
   */
  function getTemplate( templateName ) {
    channel.debug( 'iscFormsApi.getTemplate' );
    return iscHttpapi.get( [templatesUrl, templateName].join( '/' ) );
  }
}
} )();
