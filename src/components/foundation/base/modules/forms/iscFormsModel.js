( function() {
'use strict';

/* @ngInject */
angular
  .module( 'isc.forms' )
  .factory( 'iscFormsModel', iscFormsModel );

/**
   * @ngdoc factory
   * @memberOf isc.forms
   * @param $q
   * @param $templateCache
   * @param $window
   * @param iscHttpapi
   * @param iscFormsCodeTableApi
   * @param iscFormsTemplateService
   * @param iscFormsApi
   * @returns {{getForms, getActiveForm, getActiveForms, setFormStatus, getFormDefinition, getValidationDefinition}}
   */
function iscFormsModel( $q, $templateCache, $window, $filter,
  iscHttpapi, // needed for user script closures
  iscFormsCodeTableApi, iscFormsTemplateService,
  iscFormsApi, iscFormFieldLayoutService ) {
  var _formsCache         = {};
  var _viewModeFormsCache = {};
  var _validationCache    = {};

  var defaultViewTemplateUrl = 'forms/foundationTemplates/templates/defaultViewMode.html';
  var viewModePrefix         = '__viewMode__';

  var getCacheKey = defaultGetCacheKey;

  return {
    configureCache              : configureCache,
    getFormDefinition           : getFormDefinition,
    getFormMetadata             : getFormMetadata,
    getValidationDefinition     : getValidationDefinition,
    invalidateCache             : invalidateCache,
    unwrapFormDefinitionResponse: unwrapFormDefinitionResponse
  };

  function defaultGetCacheKey( formKey, formVersion ) {
    return [formVersion || 'current', formKey].join( '.' );
  }

  /**
   * @memberOf iscFormsModel
   * @description Configures the caching behavior of FDN.
   * @param {{ getCacheKey : function(formKey, formVersion) }} config
   */
  function configureCache( config ) {
    getCacheKey = config.getCacheKey || defaultGetCacheKey;
  }

  /**
   * @memberOf iscFormsModel
   * @param response
   * @returns {Object | Array}
   */
  function unwrapFormDefinitionResponse( response ) {
    // Assumes the form def is in _Body.FormDefinition,
    // but falls back to a root-level definition if not.
    return _.get( response, '_Body.FormDefinition', response );
  }

  /**
   * @memberOf iscFormsModel
   * @param response
   * @returns {{_Header: {}, _Body: {}}}
   */
  function getFormMetadata( response ) {
    return {
      _Header: _.get( response, '_Header', {} ),
      _Body  : _.omit( _.get( response, '_Body', {} ), 'FormDefinition' )
    };
  }

  /**
   * @memberOf iscFormsModel
   * @description Explicitly invalidates the form definition cache for the given formKey.
   * The next time the definition is needed, it will be requested from the server.
   * @param {String} formKey
   * @param {=String} formVersion
   */
  function invalidateCache( formKey, formVersion ) {
    var cacheKey = getCacheKey( formKey, formVersion );
    _.unset( _formsCache, cacheKey );
    _.unset( _viewModeFormsCache, cacheKey );
    _.unset( _validationCache, cacheKey );
  }

  /**
   * @memberOf iscFormsModel
   * @param {Object} config:
   * {String} formKey,
   * {=String} formVersion
   * @returns {*}
   */
  function getValidationDefinition( config ) {
    var formKey     = config.formKey,
        formVersion = config.formVersion,
        formLiteral = config.formLiteral,
        cacheKey    = getCacheKey( formKey, formVersion );

    var cachedValidation = _.get( _validationCache, cacheKey );
    var validations      = [];

    var deferred = $q.defer();

    if ( cachedValidation ) {
      deferred.resolve( angular.copy( cachedValidation ) );
    }
    else {
      getFormDefinition( {
        formKey    : formKey,
        formLiteral: formLiteral,
        formVersion: formVersion
      } )
        .then( function( formDefinition ) {
          _.forEach( formDefinition.form.sections, function( section ) {
            getEmbeddedForms( section.fields, formDefinition.subforms );
          } );

          _.set( _validationCache, cacheKey, validations );
          deferred.resolve( angular.copy( validations ) );
        } );
    }

    return deferred.promise;

    function getEmbeddedForms( fields, subforms ) {
      _.forEach( fields, function( field ) {
        var registeredType = iscFormsTemplateService.getRegisteredType( field.type ),
            extendsType    = _.get( field, 'extends' ) || _.get( registeredType, 'extends' );

        if ( field.fieldGroup ) {
          getEmbeddedForms( field.fieldGroup, subforms );
        }
        // If a collection, register it with the validation safety net
        else if ( field.type === 'embeddedFormCollection' || extendsType === 'embeddedFormCollection' ) {
          validations.push( {
            key   : field.key,
            fields: iscFormsTemplateService.getFieldsForEmbeddedForm( field, subforms )
          } );
        }
      } );
    }
  }

  /**
   * @memberOf iscFormsModel
   * @description
   * Gets the form with the given formKey name.
   * @param {Object} config:
   * {String} formKey,
   * {=String} mode,
   * {=String} formVersion,
   * {=String} subformDefinitions
   * @returns {Object}
   */
  function getFormDefinition( config ) {
    var formKey            = config.formKey,
        mode               = config.mode,
        formLiteral        = config.formLiteral,
        formVersion        = config.formVersion,
        subformDefinitions = config.subformDefinitions,
        library            = config.library || [],
        omitTransforms     = config.omitTransforms || [],
        cacheKey           = getCacheKey( formKey, formVersion );

    // If form is already cached, return the cached form in a promise
    var cachedForm;
    switch ( mode ) {
      case 'view':
        cachedForm = _viewModeFormsCache[cacheKey];
      break;

      default:
        cachedForm = _formsCache[cacheKey];
    }
    var deferred = $q.defer();

    if ( cachedForm ) {
      deferred.resolve( angular.copy( cachedForm ) );
      return deferred.promise;
    }

    // Otherwise, fetch the form template and resolve the form in a promise
    else {
      var formPromise;
      if ( formLiteral ) {
        formPromise = $q.when( formLiteral );
      }
      else {
        formPromise = iscFormsApi.getFormDefinition( formKey, formVersion );
      }
      formPromise.then( function( responseData ) {
        var primaryPromises   = [],
            secondaryPromises = [],
            form              = unwrapFormDefinitionResponse( responseData ),
            subforms          = subformDefinitions || {},
            metadata          = getFormMetadata( responseData );

        // Subform-only definitions are a bare array
        if ( _.isArray( form ) ) {
          primaryPromises = primaryPromises.concat(
            processFields( form )
          );
        }
        else {
          if ( form.library ) {
            var libraryPromise = iscFormsApi.getUserScript( form.library )
              .then( function( response ) {
                var script = parseScript( response );
                library.push( script );
              } );
            primaryPromises.push( libraryPromise );
          }

          _.forEach( form.sections, function( section ) {
            if ( !_.includes( omitTransforms, 'layout' ) ) {
              iscFormFieldLayoutService.transformContainer( section );
            }
            primaryPromises = primaryPromises.concat(
              processFields( section.fields )
            );
          } );
        }

        // If an FDN-specified additionalModelInit function is indicated, fetch this as a user script
        if ( form.additionalModelInit ) {
          var scriptPromise = iscFormsApi.getUserScript( form.additionalModelInit )
            .then( function( response ) {
              var script               = parseScript( response );
              form.additionalModelInit = ( function( iscHttpapi ) {
                return script;
              } )( iscHttpapi );
              return true;
            } );
          primaryPromises.push( scriptPromise );
        }

        // After all necessary template calls have completed, return the form
        $q.all( primaryPromises ).then( function() {
          $q.all( secondaryPromises ).then( function() {
            form.library = library;

            var editMode = {
              form    : form,
              subforms: subforms,
              metadata: metadata
            };

            // Cache the editable version
            _formsCache[cacheKey] = editMode;

            // Make a deep copy for the view mode version
            var viewMode = {
              form    : angular.merge( {}, form ),
              subforms: subforms,
              metadata: metadata
            };

            // Replace templates in the view mode with readonly versions
            _.forEach( viewMode.form.sections, function( section ) {
              replaceTemplates( section.fields );
            } );

            // Cache it separately
            _viewModeFormsCache[cacheKey] = viewMode;

            // Resolve the requested version
            switch ( mode ) {
              case 'view':
                deferred.resolve( angular.copy( viewMode ) );
              break;

              default:
                deferred.resolve( angular.copy( editMode ) );
            }
          } );
        } );

        /**
         * @memberOf iscFormsModel
         * @description
         * Additional processing for fields to bind to the formly form.
         * @param {Array} fields - The list of fields to process
         * @returns {Array}
         * @private
         */
        function processFields( fields ) {
          var fieldPromises = [];

          _.forEach( fields, function( field ) {
            var expProps       = _.get( field, 'expressionProperties', {} ),
                label          = _.get( field, 'templateOptions.label' ),
                type           = _.get( field, 'type' ),
                comments       = _.get( field, 'comments' ),
                wrappers       = _.get( field, 'wrapper' ),
                fieldGroup     = _.get( field, 'fieldGroup' ),
                data           = _.get( field, 'data', {} ),
                registeredType = iscFormsTemplateService.getRegisteredType( type ),
                extendsType    = _.get( field, 'extends' ) || _.get( registeredType, 'extends' ),
                isForm         = type === 'embeddedForm' || extendsType === 'embeddedForm',
                isCollection   = type === 'embeddedFormCollection' || extendsType === 'embeddedFormCollection';

            // Remove comments (formly's api-check will throw an error otherwise)
            if ( comments ) {
              delete field.comments;
            }

            // A field group does not have its own type, but contains fields in the fieldGroup array
            if ( fieldGroup ) {
              if ( !_.includes( omitTransforms, 'layout' ) ) {
                iscFormFieldLayoutService.transformContainer( field );
              }
              fieldPromises = fieldPromises.concat(
                processFields( fieldGroup )
              );
            }

            // If type has not been specified, this is arbitrary html written into a template tag, so skip it.
            if ( !type ) {
              return true;
            }

            // If this is a nested form, recurse the process for its child fields
            if ( isForm || isCollection ) {
              processEmbeddedForm( data, isCollection );
            }

            else {
              // If a user script is provided, this needs to be loaded and parsed
              if ( data.userScript ) {
                processUserScript( field, data.userScript );
              }

              // Translate the label if no label expression has been set
              var expLabel = expProps['templateOptions.label'];
              if ( label && !expLabel ) {
                _.set( field, 'templateOptions.label', $filter( 'translate' )( label ) );
              }

              // If this field uses a code table, look it up and push it into the field's options
              if ( data.codeTable ) {
                // Include any custom options for this field that have been explicitly entered
                var explicitOptions = _.get( field, 'templateOptions.options', [] );
                _.set( field, 'templateOptions.options',
                  [].concat( explicitOptions ).concat( iscFormsCodeTableApi.get( data.codeTable ) )
                );
              }

              // If data.isObject is not set, infer object/primitive mode based on first option in options list
              var options = _.get( field, 'templateOptions.options', [] );
              if ( data.isObject === undefined && options ) {
                _.set( field, 'data.isObject', _.isObject( _.head( options ) ) );
              }

              // If the type is not already registered, load it and register it with formly
              if ( !iscFormsTemplateService.isTypeRegistered( type ) ) {
                getCustomTemplate( type );
              }
              // If a non-custom form has custom wrappers, load them
              else if ( wrappers ) {
                _.forEach( wrappers, function( wrapperName ) {
                  if ( !iscFormsTemplateService.isWrapperRegistered( wrapperName ) ) {
                    fieldPromises.push( getWrapper( wrapperName ) );
                  }
                } );
              }
            }
          } );

          return fieldPromises;

          function processUserScript( field, scriptName ) {
            var scriptPromise = iscFormsApi.getUserScript( scriptName )
              .then( function( response ) {
                var script = parseScript( response ),
                    getApi = _.get( script, 'api.get' );
                // Expose iscHttpapi to api getter function
                if ( getApi ) {
                  script.api.get = ( function( iscHttpapi ) {
                    return getApi;
                  } )();
                }
                _.set( field, 'data.userModel', script );
                return true;
              } );
            primaryPromises.push( scriptPromise );
          }

          /**
           * Processes an embeddedForm or embeddedFormCollection
           * @private
           */
          function processEmbeddedForm( data, isCollection ) {
            var embeddedType    = data.embeddedType,
                embeddedVersion = data.embeddedVersion;

            // If a linked type, look up that type and import the fields []
            if ( embeddedType && embeddedType !== formKey ) {
              if ( subforms[embeddedType] === undefined ) {
                fieldPromises.push(
                  // Fetch the embedded type
                  getFormDefinition( {
                    formKey           : embeddedType,
                    formVersion       : embeddedVersion,
                    mode              : mode,
                    subformDefinitions: subforms,
                    library           : library
                  } )
                    .then( function( embeddedForm ) {
                      var subform      = embeddedForm.form,
                          childForms   = embeddedForm.subforms,
                          listenerType = {
                            'type': 'embeddedFormListener'
                          };

                      // If this is a bare array of fields (subform-only definition),
                      // then the response form is only the fields [] for this form.
                      // Wrap this in a simple form and section for a consistent interface.
                      // The specific section to use will be looked up in the field controller.
                      if ( _.isArray( subform ) ) {
                        subform = {
                          sections: [
                            { fields: subform }
                          ]
                        };
                      }

                      _.forEach( subform.sections, function( section ) {
                        var fields = section.fields;
                        // Force inheritance of the data property
                        forceDataInheritance( fields );

                        // Push a subform listener into the fields list if there is not already one
                        if ( isCollection && !_.find( fields, listenerType ) ) {
                          fields.push( listenerType );
                        }

                        // Transform layouts on the embedded form
                        if ( !_.includes( omitTransforms, 'layout' ) ) {
                          iscFormFieldLayoutService.transformContainer( section, true );
                        }
                      } );

                      // Update the subforms list
                      subforms[embeddedType] = subform;

                      // For previously cached subforms, merge any subforms of
                      // that cached form into this form's subforms list
                      _.extend( subforms, childForms );
                    } )
                );
              }
            }
          }
        }

        /**
         * @memberOf iscFormsModel
         * @description
         * Loads the template script and other assets for the given custom template name.
         * @param templateName
         * @private
         */
        function getCustomTemplate( templateName ) {
          var scriptPromise = iscFormsApi.getTemplate( "js/" + templateName )
            .then( function( response ) {
              processScript( response );
              return true;
            } );
          primaryPromises.push( scriptPromise );

          /**
           * @memberOf iscFormsModel
           * @description
           * Processes the javascript source for the custom template
           * @returns {Object}
           * @private
           */
          function processScript( response ) {
            var template = parseScript( response );

            injectWrappers( template );
            injectHtml( template );
            injectCss();

            // TODO - load other assets such as images?

            // Register with formly
            iscFormsTemplateService.registerType( template );

            return template;
          }

          /**
           * @memberOf iscFormsModel
           * @description
           * Fetches custom wrappers for the template and registers them.
           * @param template
           * @private
           */
          function injectWrappers( template ) {
            var wrappers = template.wrapper || [];

            _.forEach( wrappers, function( wrapperName ) {
              if ( !iscFormsTemplateService.isWrapperRegistered( wrapperName ) ) {
                secondaryPromises.push( getWrapper( wrapperName ) );
              }
            } );
          }

          /**
           * @memberOf iscFormsModel
           * @description
           * Fetches html for the template and puts it in the $templateCache.
           * @param template
           * @private
           */
          function injectHtml( template ) {
            var templateHtml = template.templateUrl;

            // If a templateUrl is specified in the custom template,
            // and it has not been loaded yet, load and cache it now.
            if ( templateHtml ) {
              if ( !$templateCache.get( templateHtml ) ) {
                secondaryPromises.push( getHtml( templateName, templateHtml ) );
              }
            }
          }

          /**
           * @memberOf iscFormsModel
           * @description
           * Fetches the stylesheet for the template and adds it to the section.
           * Adapted from: https://medium.com/opinionated-angularjs/angular-dynamically-injecting-css-file-using-route-resolve-and-promises-7bfcb8ccd05b#.djlx7z6on
           * but modified to write in a dynamic style tag rather than a static file.
           * @private
           */
          function injectCss() {
            var cssPromise = iscFormsApi.getTemplate( 'css/' + templateName ).then(
              function( stylesheet ) {
                // Stylesheet is optional and not specified by the FDN,
                // so the only way to find out if there is one is to ask for it.
                // Expect the server to send a 204 (not 404) if no stylesheet was found.
                if ( stylesheet ) {
                  stylesheetLoaded( stylesheet );
                }
              }, stylesheetNotFound );

            secondaryPromises.push( cssPromise );

            function stylesheetLoaded( stylesheet ) {
              if ( !angular.element( 'style#' + templateName ).length ) {
                var style = createStyle( templateName, stylesheet );
                angular.element( 'head' ).append( style );
              }
              return true;
            }

            function stylesheetNotFound() {
              // This may happen if there is no custom stylesheet for this template
              // but the server is configured to send a 404.
              return true;
            }

            // Creates the style element
            function createStyle( id, styles ) {
              var style       = $window.document.createElement( 'style' );
              style.id        = id;
              style.innerHTML = styles;
              return style;
            }
          }
        }
      } );

      return deferred.promise;
    }

    function getWrapper( wrapperName ) {
      return iscFormsApi.getTemplate( 'wrappers/' + wrapperName )
        .then( function( wrapperMarkup ) {
          iscFormsTemplateService.registerWrapper(
            {
              "name"    : wrapperName,
              "template": wrapperMarkup
            }
          );
          return true;
        } );
    }

    function getHtml( templateName, templateHtml ) {
      return iscFormsApi.getTemplate( 'html/' + templateName + '/' + templateHtml )
        .then( function( templateMarkup ) {
          $templateCache.put( templateHtml, templateMarkup );
          return true;
        } );
    }
  }

  /**
   * @memberOf iscFormsModel
   * @description
   * Forces the data property on all fields to explicitly inherit data properties from ancestor(s).
   * This is only necessary on any fields inside an embeddedFormCollection, as this is the only template
   * that needs to operate on the raw fields array (for the tabular view of data).
   *
   * @param {Array} fields
   */
  function forceDataInheritance( fields ) {
    _.forEach( fields, function( field ) {
      if ( field.fieldGroup ) {
        forceDataInheritance( field.fieldGroup );
      }
      else if ( field.type ) {
        var data              = _.get( field, 'data', {} );
        var ancestorDataStack = _.compact( getAncestors( field.type ) ),
            ancestorData;

        while ( ( ancestorData = ancestorDataStack.pop() ) !== undefined ) {
          // Prefer the most local data to ancestral data
          _.merge( data, ancestorData, data );
        }

        _.set( field, 'data', data );
      }
    } );

    /**
     * @memberOf iscFormsModel
     * @param type
     * @returns {Array}
     * @private
     */
    function getAncestors( type ) {
      var stack    = [],
          template = iscFormsTemplateService.getRegisteredType( type );
      if ( template ) {
        // If this ancestor has a data property, push it onto the stack
        var data = _.get( template, 'defaultOptions.data' );
        if ( data ) {
          stack.push( data );
        }
        // If this ancestor has more ancestors, recurse through them
        if ( template.extends ) {
          stack = stack.concat( getAncestors( template.extends ) );
        }
      }
      return stack;
    }
  }

  /**
   * @memberOf iscFormsModel
   * @description
   * Replaces the templates for each field in fields with its viewMode version.
   * @param fields
   */
  function replaceTemplates( fields ) {
    _.forEach( fields, function( field ) {
      var registeredType = iscFormsTemplateService.getRegisteredType( field.type ),
          extendsType    = _.get( field, 'extends' ) || _.get( registeredType, 'extends' );

      if ( field.fieldGroup ) {
        replaceTemplates( field.fieldGroup );
      }
      else {
        var data            = _.get( field, 'data.viewMode', {} ),
            viewTemplate    = data.template,
            viewTemplateUrl = data.templateUrl;
        if ( viewTemplate ) {
          field.template = viewTemplate;
        }
        else if ( viewTemplateUrl ) {
          field.templateUrl = viewTemplateUrl;
        }
        else {
          // Collections handle view mode on their own.
          // field.key is the data path into the model, so if this is not present,
          // there is no model (e.g., an "instructions" template or arbitrary html).
          if ( field.type && field.type !== 'embeddedFormCollection' && extendsType !== 'embeddedFormCollection' && field.key ) {
            var viewModeType       = viewModePrefix + field.type;
            var registeredViewType = iscFormsTemplateService.getRegisteredType( viewModeType );
            if ( !registeredViewType ) {
              iscFormsTemplateService.registerType(
                {
                  'name'       : viewModeType,
                  'extends'    : field.type,
                  'templateUrl': defaultViewTemplateUrl
                },
                {
                  excludeFromWidgetLibrary: true
                }
              );
            }
            field.type = viewModeType;
            delete field.template;
            delete field.templateUrl;
          }
        }
      }
    } );
  }

  /**
   * @memberOf iscFormsModel
   * @description
   *  This is only ever evaluated on scripts returned from a trusted backend REST source
   * @param script
   * @returns {Object}
   */
  function parseScript( script ) {
    // Ignoring JSHint for eval()
    //
    return eval( script ); // jshint ignore:line
  }
}
} )();
