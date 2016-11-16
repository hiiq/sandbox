( function() {
'use strict';

angular.module( 'isc.forms' )
  .directive( 'iscForm', iscForm );

/* @ngInject */
function iscForm( $stateParams, $q,
  iscFormsModel, iscFormsValidationService, iscFormsTemplateService ) {//jshint ignore:line
  var directive = {
    restrict        : 'E',
    replace         : true,
    controllerAs    : 'formCtrl',
    scope           : {
      buttonConfig: '=?',
      formConfig  : '=?',
      formDataId  : '@?',
      formKey     : '@?',
      formVersion : '@?',
      mode        : '@',
      model       : '=?'
    },
    bindToController: true,
    controller      : controller,
    templateUrl     : function( elem, attrs ) {
      return attrs.templateUrl || 'forms/widgets/iscForm/iscForm.html';
    }
  };

  return directive;

  /**
   * @memberOf iscForm
   */
  function controller() {
    var self = this;

    var defaultFormConfig   = iscFormsTemplateService.getFormDefaults();
    self.internalFormConfig = _.defaultsDeep( self.formConfig || {}, defaultFormConfig );

    // Ensure id is either numeric or undefined (if passed directly from a route param, it could be a string)
    var parsedId          = parseInt( self.formDataId );
    self.parsedFormDataId = _.isNaN( parsedId ) ? undefined : parsedId;

    _.merge( self, {
      formDefinition        : {},
      internalFormDefinition: {},
      validationDefinition  : [],
      internalModel         : self.model || {},
      options               : {
        formState: {
          _mode       : self.mode,
          _id         : self.parsedFormDataId,
          _formKey    : self.formKey,
          _formVersion: self.formVersion,
          // lib is populated during init()
          lib         : {}
        }
      }
    } );

    self.validateFormApi = function() {
      return iscFormsValidationService.validateCollections( self.internalModel, self.validationDefinition );
    };

    init();

    /**
     * @memberOf iscForm
     */
    function init() {
      getFormData();
    }

    /**
     * @memberOf iscForm
     */
    function getFormData() {
      var config      = self.internalFormConfig,
          formDataApi = config.formDataApi;

      if ( _.isEmpty( self.internalModel ) ) {
        formDataApi.load( self.parsedFormDataId, config )
          .then( function( formData ) {
            self.internalModel = formDataApi.unwrap( formData ) || {};
            getFormDefinition();
          } );
      }
      else {
        getFormDefinition();
      }
    }

    /**
     * @memberOf iscForm
     */
    function getFormDefinition() {
      iscFormsModel.getFormDefinition( {
        formKey    : self.formKey,
        mode       : self.mode,
        formLiteral: self.internalFormConfig.formLiteral,
        formVersion: self.formVersion
      } )
        .then( function( formDefinition ) {
          self.formDefinition                = formDefinition;
          self.options.formState._validateOn = formDefinition.form.validateOn;

          populateAdditionalModels( self.formDefinition.form.additionalModelInit );
          initializeUserLibrary( self.formDefinition.form.library );

          getValidationDefinition();
        } );
    }

    /**
     * @memberOf iscForm
     * @param fdnScript
     * @description
     * If provided, call init function to populate additional dynamic data models
     */
    function populateAdditionalModels( fdnScript ) {
      var args = [self.internalFormConfig.additionalModels, $stateParams, self.internalModel];
      evalScript( fdnScript, args );
      evalScript( self.internalFormConfig.additionalModelInit, args );

      function evalScript( script, args ) {
        if ( script && _.isFunction( script ) ) {
          script.apply( null, args );
        }
      }
    }

    /**
     * @memberOf iscForm
     * @param fdnLibraries
     * @description
     * If provided, populate user library of reusable functions from FDN and/or controller definition
     */
    function initializeUserLibrary( fdnLibraries ) {
      // First the global library
      mergeLibrary( iscFormsTemplateService.getGlobalFunctionLibrary() );

      // Apply libraries in reverse order to ensure that the library defined on the form itself takes precedence
      // over those in subforms.
      var fdnLibrary = fdnLibraries.pop();
      while ( fdnLibrary ) {
        mergeLibrary( fdnLibrary );
        fdnLibrary = fdnLibraries.pop();
      }

      // Finally, apply any library defined in client code
      mergeLibrary( self.internalFormConfig.library );

      function mergeLibrary( library ) {
        _.extend( self.options.formState.lib, library );
      }
    }

    /**
     * @memberOf iscForm
     */
    function getValidationDefinition() {
      iscFormsModel.getValidationDefinition( {
        formKey    : self.formKey,
        formVersion: self.formVersion,
        formLiteral: self.internalFormConfig.formLiteral
      } )
        .then( function( validationDefinition ) {
          var defaultButtonConfig   = iscFormsTemplateService.getButtonDefaults( self.mode, self.formDefinition.form.sectionLayout );
          self.internalButtonConfig = _.defaultsDeep( self.buttonConfig || {}, defaultButtonConfig );

          self.validationDefinition = validationDefinition;
          self.showInternal         = true;
        } );
    }
  }
}
} )();
