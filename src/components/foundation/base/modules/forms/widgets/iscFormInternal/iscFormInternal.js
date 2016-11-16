( function() {
'use strict';

angular.module( 'isc.forms' )
  .directive( 'iscFormInternal', iscFormInternal );

/* @ngInject */
/**
   * @ngdoc directive
   * @memberOf isc.forms
   * @param $q
   * @param iscCustomConfigService
   * @param iscNotificationService
   * @param iscFormsValidationService
   * @returns {{restrict: string, replace: boolean, controllerAs: string, scope: {formDefinition: string, model: string, options: string, formConfig: string, validateFormApi: string, buttonConfig: string}, bindToController: boolean, controller: controller, templateUrl: directive.templateUrl}}
   */
function iscFormInternal( $q,
  iscCustomConfigService,
  iscNotificationService,
  iscFormsValidationService ) {
  var directive = {
    restrict        : 'E',
    replace         : true,
    controllerAs    : 'formInternalCtrl',
    scope           : {
      buttonConfig   : '=?',
      formConfig     : '=?',
      formDefinition : '=',
      model          : '=',
      options        : '=',
      validateFormApi: '=?'
    },
    bindToController: true,
    controller      : controller,
    templateUrl     : function( elem, attrs ) {
      return attrs.templateUrl || 'forms/widgets/iscFormInternal/iscFormInternal.html';
    }
  };

  return directive;

  /* @ngInject */
  function controller( $scope ) {
    var self = this;

    _.merge( self, {
      forms        : [],
      debugDisplay : _.get( iscCustomConfigService.getConfig(), 'debugDisplay.forms', {} ),
      options      : {
        formState: {
          _validation                : {},
          _disableSubmitIfFormInvalid: _.get( self, 'formConfig.disableSubmitIfFormInvalid', false ),
          _subforms                  : self.formDefinition.subforms,
          _model                     : {
            isDirty: false
          }
        }
      },
      childConfig  : {},
      formConfig   : {},
      buttonConfig : {},
      selectSection: selectSection
    }, self );

    initScopedLibrary( self.options.formState.lib );

    // Option for forcing any form-level settings for a particular form instance
    _.merge( self.formDefinition.form, _.get( self.formConfig, 'forceFdn', {} ) );

    self.additionalModels = _.get( self.formConfig, 'additionalModels', {} );

    // Submit button from buttonConfig is handled separately here, to work with $validation pipeline
    self.onSubmit = onSubmit;

    init();

    // Private/helper functions
    /**
     * @memberOf iscFormInternal
     *
     */
    function init() {
      // Initialize validation and notification components
      iscFormsValidationService.init( self.options );

      // Object to hold data and structure for temporary form validation
      self.validation = iscFormsValidationService.getValidationObject();

      iscNotificationService.init();
      initAutosaveConfig();
      watchSections();
    }

    /**
     * @memberOf iscFormInternal
     */
    function initAutosaveConfig() {
      var saveConfig  = _.get( self.formDefinition.form, 'autosave', {} ),
          formDataApi = _.get( self.formConfig, 'formDataApi', {} ),
          saveApi     = formDataApi.save || function() {
            },
          wrapApi     = formDataApi.wrap || function( data ) {
              return data;
            };

      var callSaveApi = _.throttle( wrapAndSaveData, 500, { trailing: true } );

      // Set save trigger
      switch ( saveConfig.trigger ) {
        case 'modelChange':
          watchModel( callSaveApi );
        break;

        case 'sectionChange':
          watchModel( dirtify );
          watchSection();
        break;

        // default behavior is to only save when the form is submitted (post validation)
      }

      function dirtify() {
        self.options.formState._model.isDirty = true;
      }

      function cleanify() {
        self.options.formState._model.isDirty = false;
      }

      function wrapAndSaveData() {
        var wrappedData = wrapApi( self );
        return saveApi( wrappedData, self.options.formState._id, self );
      }

      function watchModel( action ) {
        $scope.$watch(
          "formInternalCtrl.model",
          function( newVal, oldVal ) {
            if ( !angular.equals( newVal, oldVal ) ) { // avoids trigger during initial watch setup
              action();
            }
          },
          true
        );
      }

      function watchSection() {
        $scope.$watch(
          "formInternalCtrl.mainFormConfig.currentSection",
          function() {
            if ( self.options.formState._model.isDirty ) {
              callSaveApi();
              cleanify();
            }
          }
        );
      }
    }

    /**
     * @memberOf iscFormInternal
     * @param mainFormErrors
     * @param subformErrors
     */
    function showFailedValidation( mainFormErrors, subformErrors ) {
      mainFormErrors = _.compact( mainFormErrors );

      // Main form alerts
      // Limit error reporting to one per control; this needs to be done manually because notifications
      // can use ng-messages, but each notification has its own ng-messages collection.
      var alerts = {};

      createMainAlerts( mainFormErrors );

      function createMainAlerts( $error ) {
        _.forEach( $error, function( error ) {
          _.forEach( error, function( errorType ) {
            _.forEach( errorType, function( errorInstance ) {
              var fieldScope = iscNotificationService.getFieldScope( errorInstance.$name );
              if ( !_.isEmpty( fieldScope ) ) {
                alerts[fieldScope.id] = {
                  $error  : error,
                  options : fieldScope.options,
                  scrollTo: fieldScope.id
                };
              }
              else {
                // Recurse for embedded forms
                if ( _.some( errorInstance.$error, function( errorType ) {
                    return _.isArray( errorType );
                  } )
                ) {
                  createMainAlerts( {
                    embeddedForm: errorInstance.$error
                  } );
                }
              }
            } );
          } );
        } );
      }

      _.forEach( alerts, function( alert ) {
        iscNotificationService.showAlert( alert );
      } );

      // Cascaded subform alerts
      _.forEach( subformErrors, function( error, id ) {
        var alert = {
          scrollTo: id,
          content : makeError( error )
        };
        iscNotificationService.showAlert( alert );
      } );

      /**
       * @memberOf iscFormInternal
       * @param error
       * @returns {string}
       */
      function makeError( error ) {
        return '<label class="error-message">In ' + error.label + ': ' + pluralize( 'record', error.records.length ) + ' invalid.</label>';
      }

      /**
       * @memberOf iscFormInternal
       * @param text
       * @param count
       * @returns {string}
       */
      function pluralize( text, count ) {
        return count + ' ' + text + ( count > 1 ? 's are' : ' is' );
      }
    }

    //
    /**
     * @memberOf iscFormInternal
     * @description
     * Sets up watches on sections having a hideExpression property
     */
    function watchSections() {
      // Throttle for initial load or large model changes
      var throttledFilter = _.throttle( filterSections, 100 );
      _.forEach( self.formDefinition.form.sections, function( section ) {
        var hideExp = section.hideExpression;
        if ( hideExp ) {
          $scope.$watch(
            function() {
              return $scope.$eval( hideExp, self );
            },
            function( hideSection ) {
              section._isHidden = hideSection;
              throttledFilter();
            } );
        }
      } );

      self.sections       = self.formDefinition.form.sections;
      self.currentSection = _.head( self.sections );
      self.mainFormConfig = {
        sections          : self.sections,
        layout            : self.formDefinition.form.sectionLayout,
        currentSection    : self.currentSection,
        selectableSections: [],
        forms             : self.forms,
        buttonConfig      : self.buttonConfig || {},
        buttonContext     : self,
        selectSection     : selectSection,
        isSubmitDisabled  : isSubmitDisabled
      };

      throttledFilter();
    }

    /**
     * @memberOf iscFormInternal
     * @param index - The index of the section to select/go to. Indexed from selectableSections, not all sections.
     */
    function selectSection( index ) {
      self.currentSection                = self.mainFormConfig.selectableSections[index];
      self.mainFormConfig.currentSection = self.currentSection;
    }

    /**
     * @memberOf iscFormInternal
     */
    function filterSections() {
      self.mainFormConfig.selectableSections = _.filter( self.formDefinition.form.sections, function( section ) {
        return !section._isHidden;
      } );
    }

    function isSubmitDisabled() {
      return self.options.formState._disableSubmitIfFormInvalid && _.some( self.forms, '$invalid' );
    }

    /**
     * @memberOf iscFormInternal
     */
    function onSubmit() {
      self.options.formState._validation.$submitted = true;

      // iscFormsValidationService.validateForm parses the outer forms on each section.
      var containingFormIsValid = true,
          $error                = [],
          index                 = 0;
      _.forEach( self.sections, function( section ) {
        // Force each form (section) to validate if it is not hidden
        // Forms are generated by formly by index
        var form = self.forms[index++];
        if ( !section._isHidden ) {
          var formValidation    = iscFormsValidationService.validateForm( form );
          containingFormIsValid = formValidation.isValid && containingFormIsValid;
          $error                = $error.concat( formValidation.$error );
        }
      } );

      // Additional validation via api attribute
      if ( self.validateFormApi ) {
        self.validateFormApi().then( function( result ) {
          if ( containingFormIsValid && result.isValid ) {
            submitForm();
          }
          else {
            showFailedValidation( $error, result.errors );
          }
        } );
      }
      else {
        if ( containingFormIsValid ) {
          submitForm();
        }
      }
    }

    /**
     * @memberOf iscFormInternal
     */
    function submitForm() {
      var submitConfig  = _.get( self.buttonConfig, 'submit', {} ),
          onSubmit      = submitConfig.onClick || _.noop,
          afterSubmit   = submitConfig.afterClick || _.noop,
          onSubmitError = submitConfig.onError || onError;

      $q.when( onSubmit( self ), afterSubmit, onSubmitError );

      function onError( error ) {
        iscNotificationService.showAlert( {
          content: '<label class="error-message">' + error + '</label>'
        } );
      }
    }

    /**
     * @private
     * @description Ensures default library functions that need this scope are initialized
     */
    function initScopedLibrary() {
      _.defaults( self.options.formState.lib, {
        _goToSection: self.selectSection
      } );
    }
  }
}
} )
();
