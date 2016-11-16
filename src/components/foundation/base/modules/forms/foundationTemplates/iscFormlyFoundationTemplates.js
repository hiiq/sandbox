( function() {
'use strict';

/** Templates adapted from angular-formly-templates-foundation 1.0.0-beta.1
   *  The foundation templates project itself does not work ootb with formly due to changes to api-check.
   *  All api-check calls are omitted from the implementation below.
   *
   *  Templates adapted from formlyFoundation are:
   *    input
   *    checkbox
   *    multiCheckbox
   *    radio
   *    select
   *    textarea
   *
   *  Wrappers adapted are:
   *    templateLabel
   *    templateHasError
   */

/* @ngInject */
angular
  .module( 'isc.forms' )
  .factory( 'iscFormlyFoundationTemplates', iscFormlyFoundationTemplates );

/**
   * @ngdoc factory
   * @memberOf isc.forms
   * @param $filter
   * @param iscCustomConfigService
   * @param iscFormsTemplateService
   * @returns {{init: init}}
   * @description
   * Templates adapted from angular-formly-templates-foundation 1.0.0-beta.1
   *  The foundation templates project itself does not work ootb with formly due to changes to api-check.
   *  All api-check calls are omitted from the implementation below.
   *
   *  Templates adapted from formlyFoundation are:<br />
   *    input<br />
   *    checkbox<br />
   *    multiCheckbox<br />
   *    radio<br />
   *    select<br />
   *    textarea<br />
   *
   *  Wrappers adapted are:<br />
   *    templateLabel<br />
   *    templateHasError
   */
function iscFormlyFoundationTemplates( $filter, iscCustomConfigService, iscFormsTemplateService ) {
  var service = {
    init: init
  };

  return service;

  function init() {
    // Wrappers
    iscFormsTemplateService.registerWrapper( [
      {
        name       : 'templateLabel',
        templateUrl: 'forms/foundationTemplates/wrappers/label.html'
      },
      {
        name       : 'templateConditionalLabel',
        templateUrl: 'forms/foundationTemplates/wrappers/conditional-label.html'
      },
      {
        name       : 'templateHasError',
        templateUrl: 'forms/foundationTemplates/wrappers/has-error.html'
      }
    ] );

    // Templates
    // Base type overrides
    iscFormsTemplateService.registerBaseType();

    // Section (static text)
    iscFormsTemplateService.registerType( {
      name       : 'section',
      templateUrl: 'forms/foundationTemplates/templates/section.html'
    } );

    // Instructions (static text)
    iscFormsTemplateService.registerType( {
      name       : 'instructions',
      templateUrl: 'forms/foundationTemplates/templates/instructions.html'
    } );

    // Divider (line / hr)
    iscFormsTemplateService.registerType( {
      name       : 'divider',
      templateUrl: 'forms/foundationTemplates/templates/divider.html'
    } );

    // Button (supports templateOptions.onClick and data.userScript)
    iscFormsTemplateService.registerType( {
      name       : 'button',
      templateUrl: 'forms/foundationTemplates/templates/button.html',
      /* @ngInject */
      controller : function( $scope ) {
        $scope._qdTagSelector = 'button';

        // data.userModel is the parsed and evaled data.userScript
        var userScript   = _.get( $scope.options, 'data.userModel', {} ),
            fdnOnClick   = userScript.onClick,
            fieldOnClick = _.get( $scope.options, 'templateOptions.onClick' ),
            cssClass     = _.get( $scope.options, 'className' );

        $scope.onClick = function() {
          invoke( fieldOnClick );
          invoke( fdnOnClick );
        };

        $scope.getClass = function() {
          var classes = [];
          classes.push( cssClass || 'button' );

          if ( $scope.to.disabled ) {
            classes.push( 'disabled' );
          }

          return classes;
        };

        function invoke( handler ) {
          if ( _.isFunction( handler ) ) {
            handler( $scope );
          }
          else if ( _.isString( handler ) ) {
            $scope.$eval( handler );
          }
        }
      },
      link       : setQdTagManually
    } );

    // Input
    iscFormsTemplateService.registerType( {
      name          : 'input',
      templateUrl   : 'forms/foundationTemplates/templates/input.html',
      wrapper       : ['templateLabel', 'templateHasError'],
      defaultOptions: {
        templateOptions: { type: 'text' }
      }
    } );

    // Checkbox
    iscFormsTemplateService.registerType( {
      name       : 'checkbox',
      templateUrl: 'forms/foundationTemplates/templates/checkbox.html',
      wrapper    : ['templateHasError']
    } );

    // Multi-select checkboxes
    iscFormsTemplateService.registerType( {
      name          : 'multiCheckbox',
      templateUrl   : 'forms/foundationTemplates/templates/multiCheckbox.html',
      wrapper       : ['templateLabel', 'templateHasError'],
      defaultOptions: {
        noFormControl: false
      },
      /*@ngInject*/
      controller    : function( $scope ) {
        // When using a template that has an ng-model attribute which is not part of the form model
        // and which is dotted (i.e., "some.dotted.property"), angular-formly will automatically
        // change the ng-model attribute to the model of the formly field.
        // Setting skipNgModelAttrsManipulator to true prevents this and allows a local model
        // to be used for more complex components.
        $scope.options.extras.skipNgModelAttrsManipulator = true;
        $scope._qdTagSelector                             = '.check-list';

        var templateOptions = $scope.to,
            opts            = $scope.options,
            data            = opts.data;

        angular.extend( $scope, {
          displayField : data.displayField,
          isObjectModel: data.isObject
        } );

        $scope.multiCheckbox = {
          checked: [],
          change : setModel
        };

        $scope.isHorizontal = _.get( opts, 'data.layout.orientation' ) === 'horizontal';

        // initialize the checkboxes check property
        var modelValue = _.get( $scope.model, opts.key );
        if ( angular.isArray( modelValue ) ) {
          angular.forEach( templateOptions.options, function( option, index ) {
            if ( $scope.isObjectModel ) {
              $scope.multiCheckbox.checked[index] = !!_.find( modelValue, function( value ) {
                return angular.equals( value, option );
              } );
            }
            else {
              $scope.multiCheckbox.checked[index] = _.includes( modelValue, option );
            }
          } );
        }

        function setModel() {
          var array = [];
          _.set( $scope.model, opts.key, array );
          angular.forEach( $scope.multiCheckbox.checked, function( checkbox, index ) {
            if ( checkbox ) {
              array.push( templateOptions.options[index] );
            }
          } );
        }
      },
      link          : setQdTagManually
    } );

    // Radio button
    iscFormsTemplateService.registerType( {
      name       : 'radio',
      templateUrl: 'forms/foundationTemplates/templates/radio.html',
      wrapper    : ['templateLabel', 'templateHasError'],
      /*@ngInject*/
      controller : function( $scope ) {
        var data = _.get( $scope, 'options.data', {} );

        $scope.isObjectModel = _.get( data, 'isObject' );
      }
    } );

    // Select/dropdown
    iscFormsTemplateService.registerType( {
      name       : 'select',
      templateUrl: 'forms/foundationTemplates/templates/select.html',
      wrapper    : ['templateLabel', 'templateHasError'],
      /*@ngInject*/
      controller : function( $scope ) {
        var data             = _.get( $scope, 'options.data', {} );
        $scope.displayProp   = _.get( data, 'displayField', 'name' );
        $scope.groupProp     = _.get( data, 'groupField', 'group' );
        $scope.isObjectModel = _.get( data, 'isObject' );
        $scope.stringify     = JSON.stringify;
      }
    } );

    // Textarea
    iscFormsTemplateService.registerType( {
      name          : 'textarea',
      templateUrl   : 'forms/foundationTemplates/templates/textarea.html',
      wrapper       : ['templateLabel', 'templateHasError'],
      defaultOptions: {
        ngModelAttrs: {
          rows: { attribute: 'rows' },
          cols: { attribute: 'cols' }
        }
      }
    } );

    // Date components [ DD / MM / YYYY ]
    iscFormsTemplateService.registerType( {
      name          : 'dateComponents',
      templateUrl   : 'forms/foundationTemplates/templates/dateComponents.html',
      wrapper       : ['templateLabel', 'templateHasError'],
      defaultOptions: {
        data: {
          tableCellTemplateUrl: 'forms/foundationTemplates/tableTemplates/cell.date.html'
        }
      }
    } );

    // Date components [ DD / MM / YYYY ]
    iscFormsTemplateService.registerType( {
      name          : 'dateComponentsPartial',
      templateUrl   : 'forms/foundationTemplates/templates/dateComponentsPartial.html',
      wrapper       : ['templateLabel', 'templateHasError'],
      defaultOptions: {
        validators: {
          partialDate: {
            expression: function( $viewValue, $modelValue, scope ) {
              // Validator expression must return true or false
              return !!(
                // Define a partial date as:
                // nothing,
                _.isEmpty( $viewValue ) ||
                ( !$viewValue.year && !$viewValue.month && !$viewValue.day ) ||
                // a year,
                ( $viewValue.year && !$viewValue.month && !$viewValue.day ) ||
                // a year and a month,
                ( $viewValue.year && $viewValue.month && !$viewValue.day ) ||
                // or a full year, month, and day
                ( $viewValue.year && $viewValue.month && $viewValue.day )
              );
            },
            message   : '"A partial date must be: a year, a year and month, or a complete date."'
          }
        },
        data      : {
          tableCellDisplay: function( row, model ) {
            // partialDate validator ensures we only have a day if we have a month,
            // and only have a month if we have a year
            var obj   = _.get( row, model, {} ),
                year  = parseInt( obj.year ),
                month = parseInt( obj.month ) - 1, // months are 0-indexed in js dates and moment()
                day   = parseInt( obj.day );

            if ( !isNaN( day ) && !isNaN( month ) && !isNaN( year ) ) {
              return $filter( 'iscDate' )( new Date( year, month, day ), _.get( iscCustomConfigService.getConfig(), 'formats.date.shortDate', 'date' ) );
            }
            else if ( !isNaN( month ) && !isNaN( year ) ) {
              return ( month + 1 ) + '-' + year;
            }
            else if ( !isNaN( year ) ) {
              return year.toString();
            }
            else {
              return '';
            }
          }
        }
      }
    } );

    // Typeahead (text input with lookup)
    iscFormsTemplateService.registerType( {
      name       : 'typeahead',
      templateUrl: 'forms/foundationTemplates/templates/typeahead.html',
      wrapper    : ['templateLabel', 'templateHasError'],
      controller : typeaheadController,
      link       : setQdTagManually
    } );

    // Typeahead with third-party user script support
    iscFormsTemplateService.registerType( {
      name       : 'typeaheadWithScript',
      templateUrl: 'forms/foundationTemplates/templates/typeaheadWithScript.html',
      wrapper    : ['templateLabel', 'templateHasError'],
      controller : typeaheadController,
      link       : setQdTagManually
    } );

    // Embedded form
    iscFormsTemplateService.registerType( {
        name       : 'embeddedForm',
        templateUrl: 'forms/foundationTemplates/templates/embeddedForm.html',
        wrapper    : ['templateLabel', 'templateHasError'],
        /*@ngInject*/
        controller : function( $scope ) {
          var opts     = $scope.options,
              subforms = $scope.formState._subforms;

          $scope.efModel = _.get( $scope.model, opts.key );
          if ( !$scope.efModel ) {
            $scope.efModel = {};
            _.set( $scope.model, opts.key, $scope.efModel );
          }

          $scope.efFields = iscFormsTemplateService.getFieldsForEmbeddedForm( opts, subforms );

          $scope.efOptions = _.extend( {}, $scope.formOptions, {
            formState: $scope.formState
          } );
        }
      },
      {
        excludeFromWidgetLibrary: true
      } );

    // Embedded form collection
    iscFormsTemplateService.registerType( {
        name       : 'embeddedFormCollection',
        templateUrl: 'forms/foundationTemplates/templates/embeddedFormCollection.html',
        wrapper    : ['templateLabel', 'templateHasError'],
        /*@ngInject*/
        controller : function( $scope, iscFormsValidationService ) {
          iscFormsValidationService.registerCollection(
            $scope.options.key, {
              id   : $scope.id,
              label: $scope.to.label
            } );
        }
      },
      {
        excludeFromWidgetLibrary: true
      } );

    // Embedded collection of primitive values
    iscFormsTemplateService.registerType( {
        name          : 'primitiveCollection',
        extends       : 'embeddedFormCollection',
        defaultOptions: {
          data: {
            collections: {
              editAs: 'inline'
            }
          }
        }
      },
      {
        excludeFromWidgetLibrary: true
      } );

    // Embedded Form Listener
    // This field will not be rendered in the DOM, but will listen for FORMS_EVENTS
    // This is useful for communication in embedded subforms
    iscFormsTemplateService.registerType( {
        name       : 'embeddedFormListener',
        templateUrl: 'forms/foundationTemplates/templates/embeddedFormListener.html'
      },
      {
        excludeFromWidgetLibrary: true
      }
    );

    // Control-flow-only widget
    // Useful for UI widgets that are needed to have an effect on control flow,
    // but whose data models should not be persisted in the form's data model.
    //
    // The template type used for the widget is data.controlFlowOnly.templateType;
    // its initial state may be specified with an expression in data.controlFlowOnly.stateInit.
    //
    // Sample usage in FDN:
    // {
    //   "key"            : "chooseBranch",
    //   "type"           : "controlFlowOnly",
    //   "templateOptions": {
    //     "label"  : "This field is for control flow only",
    //     "options": [
    //       "opt 1",
    //       "opt 2"
    //     ]
    //   },
    //   "data"           : {
    //     "controlFlowOnly" : {
    //       "templateType": "radio",
    //       "stateInit"   : "model.someProperty ? 'opt 1' : 'opt 2'"
    //     }
    //   }
    // }

    iscFormsTemplateService.registerType( {
      name       : 'controlFlowOnly',
      templateUrl: 'forms/foundationTemplates/templates/controlFlowOnly.html',
      /* @ngInject */
      controller : function( $scope ) {
        var stateKey  = 'controlFlowOnly',
            key       = $scope.options.key,
            data      = _.get( $scope.options, 'data.controlFlowOnly', {} ),
            stateInit = data.stateInit;

        // Eval the initial state based on the data property
        var initialValue = $scope.$eval( stateInit, $scope );

        // Persist it in formState under the stateKey
        var stateModel = _.get( $scope.formState, stateKey );
        if ( _.isEmpty( stateModel ) ) {
          _.set( $scope.formState, stateKey, {} );
          stateModel = _.get( $scope.formState, stateKey );
        }
        _.set( stateModel, key, initialValue );

        // We will shadow its $scope.model with this $scope.localModel.
        $scope.localModel   = stateModel;
        $scope.localOptions = _.merge( {}, $scope.options, {
          type: data.templateType,
          data: {
            _originalModel: $scope.model
          }
        } );
      }
    } );

    /*@ngInject*/
    function typeaheadController( $scope ) {
      // When using a template that has an ng-model attribute which is not part of the form model
      // and which is dotted (i.e., "some.dotted.property"), angular-formly will automatically
      // change the ng-model attribute to the model of the formly field.
      // Setting skipNgModelAttrsManipulator to true prevents this and allows a local model
      // to be used for more complex components.
      $scope.options.extras.skipNgModelAttrsManipulator = true;
      $scope._qdTagSelector                             = 'isc-forms-typeahead';

      var key  = $scope.options.key,
          data = _.get( $scope.options, 'data', {} );

      $scope.displayField   = data.displayField || '';
      $scope.localModel     = {};
      $scope.limitToList    = data.limitToList;
      $scope.minInputLength = parseInt( data.minInputLength );
      if ( _.isNaN( $scope.minInputLength ) ) {
        $scope.minInputLength = 3;
      }

      $scope.onSelect = function( item ) {
        if ( _.isObject( item ) ) {
          var copiedItem = angular.copy( item );
          _.set( $scope.model, key, copiedItem );
          $scope.localModel.input = $scope.displayField ? copiedItem[$scope.displayField] : copiedItem;
        }
        else {
          _.set( $scope.model, key, item );
          $scope.localModel.input = item;
        }
      };

      var initialModel = _.get( $scope.model, $scope.options.key, '' );
      if ( initialModel ) {
        $scope.onSelect( initialModel );
      }
    }

    function setQdTagManually( scope, elt ) {
      var selector = scope._qdTagSelector,
          qdTag    = _.get( scope, 'to.qdTag' );

      if ( selector && qdTag ) {
        elt.find( selector ).attr( 'qd-tag', qdTag );
      }
    }
  }

}
} )();
