( function() {
'use strict';

/**
   * Wraps the formlyConfig service:
   * registerBaseType should be called (once), then registerType may be used to register any other types.
   *
   * The base type provides common functionality for all formly templates and their controllers. This includes:
   *
   * _                  : makes lodash available in FDN expressions
   * moment             : makes moment available in FDN expressions
   * formModel          : a reference to the root formly model. This is useful for expressions that may need to modify
   *                      model values outside their own control or section scope
   * hasCustomValidator : a function that takes a custom validator name and returns whether that validator is used on
   *                      this control. This is useful for making custom validators reusable by defining them once on
   *                      the control template and then including them by name in controls that should use them.
   * getDefaultViewValue: a function that returns the display for a view mode field which uses the default view template.
   *
   */

/* @ngInject */
angular
  .module( 'isc.forms' )
  .factory( 'iscFormsTemplateService', iscFormsTemplateService );

/**
   * @ngdoc factory
   * @memberOf isc.forms
   * @name iscFormsTemplateService
   * @param $filter
   * @param $window
   * @param $sce
   * @param iscCustomConfigService
   * @param formlyConfig
   * @param hsModelUtils
   * @returns {{isTypeRegistered: isTypeRegistered, getRegisteredType: getRegisteredType, registerWrapper: *, registerBaseType: registerBaseType, registerType: registerType, appendWrapper: appendWrapper}}
   * @description
   * Wraps the formlyConfig service:
   * registerBaseType should be called (once), then registerType may be used to register any other types.
   *
   * The base type provides common functionality for all formly templates and their controllers. This includes:
   *
   * _                  : makes lodash available in FDN expressions
   * moment             : makes moment available in FDN expressions
   * formModel          : a reference to the root formly model. This is useful for expressions that may need to modify
   *                      model values outside their own control or section scope
   * hasCustomValidator : a function that takes a custom validator name and returns whether that validator is used on
   *                      this control. This is useful for making custom validators reusable by defining them once on
   *                      the control template and then including them by name in controls that should use them.
   * getDefaultViewValue: a function that returns the display for a view mode field which uses the default view template.
   *
   */
/* @ngInject */
function iscFormsTemplateService( $filter, $window, $sce, $q, $translate,
  iscNavContainerModel, iscCustomConfigService, iscSessionModel,
  formlyConfig, iscFormDataApi, iscFormsSectionLayoutService, hsModelUtils ) {
  var baseType = '__iscFormsBase__';

  var config           = iscCustomConfigService.getConfig(),
      formsConfig      = _.get( config, 'forms', {} ),
      updateOnExcluded = formsConfig.updateOnExcluded,
      widgetLibrary    = [],
      functionLibrary  = {
        _     : _,
        moment: moment
      },
      customButtonDefaults,
      customFormDefaults;

  // YYYY-MM-DDThh:mm:ss.xxxZ   or
  // YYYY-MM-DD hh:mm:ss
  var isoRE = /^\d{4}[-\/]{1}\d{2}[-\/]{1}\d{2}[T ]{1}\d{2}:{1}\d{2}:{1}\d{2}(.{1}\d{3}Z{1})?$/;

  formlyConfig.extras.fieldTransform.push( addDataModelDependencies );
  formlyConfig.extras.fieldTransform.push( addInheritedClassNames );
  formlyConfig.extras.fieldTransform.push( fixWatchers );
  formlyConfig.extras.fieldTransform.push( addQdTag );

  var service = {
    appendWrapper            : appendWrapper,
    getButtonDefaults        : getButtonDefaults,
    getFieldsForEmbeddedForm : getFieldsForEmbeddedForm,
    getFormDefaults          : getFormDefaults,
    getGlobalFunctionLibrary : getGlobalFunctionLibrary,
    getSectionForEmbeddedForm: getSectionForEmbeddedForm,
    getRegisteredType        : getRegisteredType,
    getWidgetList            : getWidgetList,
    isTypeRegistered         : isTypeRegistered,
    isWrapperRegistered      : isWrapperRegistered,
    overrideWidgetList       : overrideWidgetList,
    registerBaseType         : registerBaseType,
    registerButtonDefaults   : registerButtonDefaults,
    registerFormDefaults     : registerFormDefaults,
    registerGlobalLibrary    : registerGlobalLibrary,
    registerType             : registerType,
    registerWrapper          : formlyConfig.setWrapper
  };

  return service;

  /**
   * @description Registers default buttons for all forms using this service. These will automatically be
   * retrieved by instances of iscForm, or may be programmatically retrieved with getButtonDefaults and extended.
   * @param {Object|Function} defaults - default options for buttons. If a function, takes arguments for
   * the form mode (edit or view) and the sectionLayout, and it should return a buttonConfig object.
   * If an object, it should be a buttonConfig object.
   */
  function registerButtonDefaults( defaults ) {
    customButtonDefaults = defaults;
  }

  /**
   * @memberOf iscFormsTemplateService
   * @description Gets the default configuration for form buttons. If no custom configuration is registered
   * with registerButtonDefaults, this will return an object with a cancel button that navigates back one
   * history section, and a submit button which calls the configured formDataApi.submit function.
   * @param {String} mode - The edit/view mode of the containing form
   * @param {String} sectionLayout - The sectionLayout setting of the containing form
   * @returns {{cancel: {onClick: function, afterClick: function, cssClass: string, text: string}, submit: {onClick: function, afterClick: function, cssClass: string, text: string}}}
   */
  function getButtonDefaults( mode, sectionLayout ) {
    var customDefaults,
        sectionLayoutDefaults = {},
        defaultButtonConfig   = {
          cancel: {
            onClick   : _.noop,
            afterClick: afterCancel,
            cssClass  : 'cancel button large float-left',
            text      : mode === 'view' ? $translate.instant( 'Back' ) : $translate.instant( 'Cancel' ),
            order     : 1
          },
          submit: {
            onClick   : onSubmit,
            afterClick: afterSubmit,
            cssClass  : 'button large float-right',
            text      : $translate.instant( 'Submit' ),
            hide      : mode === 'view',
            order     : 2
          }
        };

    // Handle custom service-level defaults
    if ( customButtonDefaults ) {
      if ( _.isFunction( customButtonDefaults ) ) {
        customDefaults = customButtonDefaults.call( this, mode, sectionLayout );
      }
      else if ( _.isObject( customButtonDefaults ) ) {
        customDefaults = customButtonDefaults;
      }
    }

    // Additional defaults by section layout type
    switch ( sectionLayout ) {
      case 'wizard' :
        sectionLayoutDefaults = iscFormsSectionLayoutService.getWizardButtonConfig();
      break;
    }

    // Custom defaults override all system defaults, including sectionLayout-specific buttons
    return customDefaults || _.defaultsDeep( {}, sectionLayoutDefaults, defaultButtonConfig );

    function onSubmit( context ) {
      var configuredDataApi = context.formConfig.formDataApi;

      // Default api for submitting a form is to submit to iscFormDataApi
      var wrappedData = configuredDataApi.wrap( context );
      return configuredDataApi.submit( wrappedData, context.options.formState._id, context );
    }

    function afterSubmit() {
      iscNavContainerModel.navigateToUserLandingPage();
    }

    function afterCancel() {
      $window.history.back();
    }
  }

  /**
   * @memberOf iscFormsTemplateService
   * @description Registers default form configuration for all forms using this service. This configuration will
   * automatically be retrieved by instances of iscForm, or may be programmatically retrieved with getFormDefaults
   * and extended.
   * @param {Object} defaults
   */
  function registerFormDefaults( defaults ) {
    customFormDefaults = defaults;
  }

  /**
   * @memberOf iscFormsTemplateService
   * @description Gets the default configuration for form options. If no custom configuration is registered
   * with registerFormDefaults, this will return an object with default endpoints for the formDataApi (based on
   * the app's configuration) and an empty additionalModels object.
   * @returns {{formDataApi: { wrap : function, unwrap: function, load: function, save: function, submit: function }, additionalModels: {}}}
   */
  function getFormDefaults() {
    // Defaults for formDataApi property -- use iscFormDataApi
    var formDataApi = {
      wrap  : wrapDefault,
      unwrap: unwrapDefault,
      load  : loadDefault,
      save  : saveDefault,
      submit: submitDefault
    };

    return customFormDefaults || {
        formDataApi     : formDataApi,
        additionalModels: {}
      };

    function wrapDefault( formScope ) {
      var formData       = formScope.model,
          formState      = formScope.options.formState,
          formDefinition = formScope.formDefinition.form;

      // Wrap data with additional information and metadata
      return {
        formDefinition  : formDefinition,
        additionalModels: formScope.additionalModels,
        formData        : {
          formKey    : formState._formKey,
          formName   : formDefinition.name,
          formVersion: formState._formVersion,
          id         : formState._id,
          author     : iscSessionModel.getCurrentUser(),
          completedOn: moment().toISOString(),
          data       : formData
        }
      };
    }

    function unwrapDefault( responseData ) {
      return _.get( responseData, 'data', {} );
    }

    function loadDefault( id, formConfig ) {
      if ( id !== undefined ) {
        return iscFormDataApi.get( id, getConfiguredUrl( 'get', { formConfig: formConfig } ) );
      }
      else {
        return $q.when( {} );
      }
    }

    function saveDefault( formData, id, formScope ) {
      if ( id !== undefined ) {
        return iscFormDataApi.put( id, formData, getConfiguredUrl( 'put', formScope ) );
      }
      else {
        return iscFormDataApi.post( formData, getConfiguredUrl( 'post', formScope ) )
          .then( function( form ) {
            formScope.options.formState._id = form.id;
            return form;
          } );
      }
    }

    function submitDefault( formData, id, formScope ) {
      return iscFormDataApi.submit( id, formData, getConfiguredUrl( 'submit', formScope ) )
        .then( function( form ) {
          formScope.options.formState._id = form.id;
          return form;
        } );
    }

    function getConfiguredUrl( verb, formScope ) {
      return _.get( formScope.formConfig, 'formDataApi.urls.' + verb );
    }
  }

  /**
   * Gets the list of fields that an embeddedForm(Collection) should use
   * @param field - The field definition
   * @param subforms - The list of subforms
   * @returns {Array}
   */
  function getFieldsForEmbeddedForm( field, subforms ) {
    var section = getSectionForEmbeddedForm( field, subforms );
    return _.get( section, 'fields', [] );
  }

  /**
   * Returns the section that an embeddedForm(Collection) refers to.
   * @param field - The field definition
   * @param subforms - The list of subforms
   * @returns {Object}
   */
  function getSectionForEmbeddedForm( field, subforms ) {
    var embeddedSection = _.get( field, 'data.embeddedSection' ),
        embeddedType    = _.get( field, 'data.embeddedType' ),
        subform         = subforms[embeddedType],
        sections        = _.get( subform, 'sections', [] ),
        section;

    // Section lookup can be either a 0-based index or a section name
    if ( embeddedSection !== undefined ) {
      if ( _.isNumber( embeddedSection ) ) {
        section = _.get( sections, embeddedSection );
      }
      else {
        section = _.find( sections, { name: embeddedSection } );
      }
    }
    // If no section was provided, use the first one
    else {
      section = _.get( sections, '0' );
    }

    return angular.copy( section ) || {};
  }

  /**
   * @memberOf iscFormsTemplateService
   * @description formly will automatically create a 'formly-field-{type}' class
   * for each field, but it will not inherit those classes from the field's
   * ancestor types. This method explicitly causes those classes to inherit.
   * @param fields
   */
  function addInheritedClassNames( fields ) {
    _.forEach( fields, function( field ) {
      if ( field.fieldGroup ) {
        addInheritedClassNames( field.fieldGroup );
      }
      else {
        inheritClassNames( field );
      }
    } );

    return fields;

    function inheritClassNames( field ) {
      var isControlFlowOnly = field.type === 'controlFlowOnly',
          type              = isControlFlowOnly ? _.get( field, 'data.controlFlowOnly.templateType' ) : field.type,
          className         = isControlFlowOnly ? 'formly-field-' + type : '',
          inheritedClasses  = getInheritedClassName( type );

      field.className = [inheritedClasses, className || '', field.className].join( ' ' );

      function getInheritedClassName( type ) {
        var template    = getRegisteredType( type ),
            extendsType = getAncestorType( template );

        return [
          ( !!extendsType ? getInheritedClassName( extendsType ) : '' ),
          getClassName( template )
        ].join( ' ' );

        function getClassName( field ) {
          var type;
          if ( field.name === 'controlFlowOnly' ) {
            type = _.get( field, 'defaultOptions.data.controlFlowOnly.templateType' );
          }
          else {
            type = field.name;
          }
          return type ? 'formly-field-' + type : '';
        }

        function getAncestorType( type ) {
          return type.extends !== baseType && type.extends;
        }
      }
    }
  }

  /**
   * @memberOf iscFormsTemplateService
   * @description Due to the timing of field initialization and the need to attach
   * field watchers to the $scope of the form (and not of the field), formly does not
   * set up any watchers that are defined on custom templates as defaultOptions.watcher.
   * This method explicitly pushes those default watchers into each instance so that the
   * watchers are set up during formly's form initialization.
   *
   * This also corrects the issue that formly allows watcher listeners to be expressions,
   * while Angular does not.
   *
   * @param fields
   */
  function fixWatchers( fields ) {
    var typesWithDefaultWatchers  = _.pickBy( formlyConfig.getTypes(), 'defaultOptions.watcher' ),
        typeKeys                  = _.keys( typesWithDefaultWatchers ),
        fieldsWithDefaultWatchers = _.filter( fields, function( field ) {
          return _.includes( typeKeys, field.type );
        } );

    _.forEach( fieldsWithDefaultWatchers, function( field ) {
      var watcher = _.concat(
        _.get( field, 'watcher' ),
        _.get( typesWithDefaultWatchers[field.type], 'defaultOptions.watcher' )
      );
      _.set( field, 'watcher', _.compact( watcher ) );
    } );

    _.forEach( fields, function( field ) {
      _.forEach( field.watcher, function( watch ) {
        // Angular does not support $watch listeners as expressions, but formly thinks it does.
        // So we need to wrap any watch listener that is an expression in a function.
        if ( watch.listener && !_.isFunction( watch.listener ) ) {
          var watchListener = watch.listener;
          // The formly watcher signature takes additional args of field and the watch's deregistration function.
          watch.listener    = function( field, newVal, oldVal, scope, stop ) {
            scope.$eval( watchListener, {
              field : field,
              newVal: newVal,
              oldVal: oldVal,
              stop  : stop
            } );
          };
        }
      } );
    } );

    return fields;
  }

  /**
   * @description Wires up the "templateOptions.qdTag" property in the FDN using formly's
   * ngModelAttrs feature.
   * @memberOf iscFormsTemplateService
   * @param fields
   * @returns {*}
   */
  function addQdTag( fields ) {
    _.forEach( fields, function( field ) {
      if ( field.fieldGroup ) {
        addQdTag( field.fieldGroup );
      }
      else {
        if ( _.get( field, 'templateOptions.qdTag' ) ) {
          _.set( field, 'ngModelAttrs.qdTag', {
            bound    : 'ng-qd-tag',
            attribute: 'qd-tag'
          } );
        }
      }
    } );
    return fields;
  }

  /**
   * @memberOf iscFormsTemplateService
   * @description Applies form configuration to each formly field, including
   * external validation systems.
   * @param fields
   * @returns {*}
   */
  function addDataModelDependencies( fields ) {
    _.forEach( fields, function( field ) {
      if ( field.fieldGroup ) {
        addDataModelDependencies( field.fieldGroup );
      }
      else if ( field.key ) {
        field.modelOptions = {
          // Set ng-model-options.updateOn:blur to limit excessive validation
          updateOn    : excludeUpdateOn( field.type ) ? undefined : formsConfig.updateOn,
          // Debounce for UI responsiveness if updating on change
          debounce    : formsConfig.debounce,
          // Allow invalid so external validations can use the form model for evaluation
          allowInvalid: formsConfig.allowInvalid
        };

        if ( formsConfig.useExternalValidation ) {
          var validators          = field.validators || ( field.validators = {} );
          // Executes external/HS validation api
          validators.hsValidation = {
            expression: 'hsValidation.getError(options.key)',
            message   : 'hsValidation.$error.text'
          };
        }
      }
    } );
    return fields;
  }

  /**
   * @memberOf iscFormsTemplateService
   * @param type - The formly type to check
   * @returns {boolean} - Whether the given type should always use the default updateOn behavior
   */
  function excludeUpdateOn( type ) {
    if ( _.includes( updateOnExcluded, type ) ) {
      return true;
    }
    // If no match, check the type hierarchy above this type
    var baseType = _.get( getRegisteredType( type ), 'extends' );
    return !!baseType && excludeUpdateOn( baseType );
  }

  /**
   * @memberOf iscFormsTemplateService
   * @param type
   * @returns {boolean}
   */
  function isTypeRegistered( type ) {
    return !!getRegisteredType( type );
  }

  /**
   * @memberOf iscFormsTemplateService
   * @param wrapper
   * @returns {boolean}
   */
  function isWrapperRegistered( wrapper ) {
    return !!formlyConfig.getWrapper( wrapper );
  }

  /**
   * @memberOf iscFormsTemplateService
   * @param type
   * @returns {*}
   */
  function getRegisteredType( type ) {
    return formlyConfig.getType( type );
  }

  /**
   * @memberOf iscFormsTemplateService
   */
  function registerBaseType() {
    // Base type overrides
    formlyConfig.setType( {
      name      : baseType,
      controller: /* @ngInject */ function( $scope, iscNotificationService ) {
        iscNotificationService.registerFieldScope( $scope );

        var formlyRootCtrl = getFormlyRoot( $scope );

        // Validation for external/HS api
        var removeWatch = $scope.$watch(
          // Wait for formControl to be populated
          function() {
            return $scope.options.formControl;
          },
          // Configure a listener for that ngModel and drop the watch
          function( ngModelController ) {
            if ( ngModelController ) {
              removeWatch();
              var formDef    = formlyRootCtrl.formDefinition,
                  // Pull the hsValidation params from the form level
                  // This may need to support field-level modules and recordNames in the future
                  moduleName = formDef.hsValidationModule,
                  recordName = formDef.hsValidationRecordName;

              _.extend( hsValidation, {
                module    : $window[moduleName],
                recordName: recordName
              } );

              if ( hsValidation.module && hsValidation.recordName && ngModelController.$viewChangeListeners ) {
                ngModelController.$viewChangeListeners.push(
                  function() {
                    hsModelUtils.validateRecord(
                      hsValidation.module,
                      // Currently passing the root form model
                      // this may need to be scoped to subforms or sections
                      $scope.formModel,
                      hsValidation.recordName
                    );
                  }
                );
              }
            }
          }
        );

        // Validation show condition
        switch ( $scope.formOptions.formState._validateOn ) {
          case 'blur':
            $scope.validationShowCondition = '$touched';
          break;

          case 'submit':
            $scope.validationShowCondition = '$submitted';
          break;

          // Default is to validate on $dirty
          default:
            $scope.validationShowCondition = '$dirty';
          break;
        }

        // External/HS validation
        var hsValidation = {
          getError: function( spec ) {
            if ( hsValidation.module ) {
              hsValidation.$error = hsModelUtils.getError(
                hsValidation.module,
                // hsModelUtils.getError expects the root of the spec to be the recordName
                [hsValidation.recordName, spec].join( '.' )
              );
              return !hsValidation.$error;
            }
            return true;
          },
          $error  : ''
        };

        // Inject utilities so they are available in FDN expressions
        _.extend( $scope, {
          // Libraries
          _     : _,
          moment: moment,

          // Utility properties
          formModel       : formlyRootCtrl.model,
          additionalModels: formlyRootCtrl.additionalModels,
          mode            : formlyRootCtrl.mode,

          // Utility functions
          hasCustomValidator : hasCustomValidator,
          getDefaultViewValue: getDefaultViewValue,

          // HS validation
          hsValidation: hsValidation
        } );

        // Helper functions
        function getFormlyRoot( scope ) {
          if ( scope.formInternalCtrl ) {
            return scope.formInternalCtrl;
          }
          var parent = scope.$parent;
          if ( parent ) {
            return getFormlyRoot( parent );
          }
          return {};
        }

        function hasCustomValidator( validatorName ) {
          var customValidators = _.get( $scope, 'options.data.validators' );
          return customValidators && !!_.includes( customValidators, validatorName );
        }

        function getDefaultViewValue() {
          var value = _.get( $scope.model, $scope.options.key );

          if ( _.isObject( value ) ) {
            var displayField = _.get( $scope.options, 'data.displayField', 'name' );
            return wrap( value[displayField] );
          }
          else {
            if ( value && isoRE.test( value ) ) {
              var mValue = moment( value );
              if ( mValue.isValid() ) {
                return wrap( $filter( 'iscDate' )( mValue, _.get( config, 'formats.date.shortDate', 'date' ) ) );
              }
            }
            return wrap( value );
          }

          function wrap( value ) {
            if ( value === undefined ) {
              return $sce.trustAsHtml( '<p class="not-specified">Not specified</p>' );
            }
            else {
              return $sce.trustAsHtml( '<p>' + value + '</p>' );
            }
          }
        }
      },

      link: function( scope, element, attrs ) {
        // If the field's data.hideIfGroupEmpty property is truthy,
        // this field will be hidden if all of its sibling fields are hidden.
        // This is useful for section headers within a fieldGroup,
        // where all members of that section have different hideExpressions.
        if ( _.get( scope, 'options.data.hideIfGroupEmpty' ) ) {
          var unregisterModelWatch = scope.$watch(
            'model',
            onModelChange,
            true
          );
          scope.$on( '$destroy', unregisterModelWatch );
        }

        function onModelChange() {
          // $applyAsync to allow slightly more time for other fields' hideExpressions to be evaluated
          // The other fields are the ones checked as element.siblings()
          scope.$applyAsync( function() {
            element.css( 'display', element.siblings( '[formly-field]' ).length ? 'block' : 'none' );
          } );
        }
      }
    } );
  }

  /**
   * @memberOf iscFormsTemplateService
   * @param type
   */
  function registerType( type, options ) {
    // Ensure all templates extend the base type for functionality
    type.extends     = type.extends || baseType;
    type.overwriteOk = true;
    options          = options || {};

    widgetLibrary.push( {
        name      : type.name,
        showInList: !options.excludeFromWidgetLibrary
      }
    );
    formlyConfig.setType( type );
  }

  /**
   * @memberOf iscFormsTemplateService
   */
  function getWidgetList() {
    var list = _.compact(
      _.map( widgetLibrary, function( widget ) {
        return widget.showInList ? widget.name : undefined;
      } )
    );

    return _.sortBy( list, function( name ) {
      return name;
    } );
  }

  /**
   * @memberOf iscFormsTemplateService
   * @description Overrides the setting for a widget as to whether it is returned by getWidgetList().
   * @param name
   * @param showInList
   */
  function overrideWidgetList( name, showInList ) {
    var widget = _.find( widgetLibrary, { name: name } );
    if ( widget ) {
      widget.showInList = showInList;
    }
  }

  /**
   * @memberOf iscFormsTemplateService
   * @param {Object} library - Properties are functions that should be available to FDN expressions.
   * @description Registers the functions in the given library with the forms module.
   * Subsequent calls to this function will override any library members of the same name.
   * Functions in this library will be available to all forms in the application via formState.lib.{functionName}.
   */
  function registerGlobalLibrary( library ) {
    _.extend( functionLibrary, library );
  }

  /**
   * @memberOf iscFormsTemplateService
   * @return {Object}
   * @description Returns the library of functions registered with the service.
   */
  function getGlobalFunctionLibrary() {
    return functionLibrary;
  }

  /**
   * @memberOf iscFormsTemplateService
   * @param wrapperName
   * @param templateName
   */
  function appendWrapper( wrapperName, templateName ) {
    var template = getRegisteredType( templateName ),
        wrappers = _.get( template, 'wrapper', [] );
    if ( !_.includes( wrappers, wrapperName ) ) {
      wrappers.push( wrapperName );
      _.set( template, 'wrapper', wrappers );
      registerType( template );
    }
  }

}
} )();
