( function() {
'use strict';

/* @ngInject */
angular
  .module( 'isc.forms' )
  .factory( 'iscFormsValidationService', iscFormsValidationService );

/**
   * @ngdoc factory
   * @memberOf isc.forms
   * @param $q
   * @param $timeout
   * @returns {{init: init, getValidationObject: getValidationObject, registerCollection: registerCollection, validateForm: validateForm, validateCollections: validateCollections}}
   */
function iscFormsValidationService( $q, $timeout ) {
  var options;
  var validation = {};
  var keyMap     = {};

  return {
    init               : init,
    getValidationObject: getValidationObject,
    registerCollection : registerCollection,
    validateForm       : validateForm,
    validateCollections: validateCollections
  };

  /**
   * @memberOf iscFormsValidationService
   * @param formOptions
   */
  function init( formOptions ) {
    options    = formOptions;
    validation = {
      options: formOptions
    };
    keyMap     = {};
  }

  /**
   * @memberOf iscFormsValidationService
   * @returns {{}}
   */
  function getValidationObject() {
    return validation;
  }

  /**
   * @memberOf iscFormsValidationService
   * @param key
   * @param value
   */
  function registerCollection( key, value ) {
    keyMap[key] = value;
  }

  /**
   * @description
   * Synchronously returns true iff the given form is valid.
   * If invalid, all invalid controls are touched to trigger their UI validation.
   * @memberOf iscFormsValidationService
   * @param form - the ngFormController for the form to validate
   * @returns {Object} - isValid: whether the form passed validation; $error: the $error list
   */
  function validateForm( form ) {
    if ( form.$invalid ) {
      _.forEach( form.$error, function( errorType ) {
        _.forEach( errorType, function( control ) {
          if ( control.$setTouched ) {
            control.$setTouched();
          }
        } );
      } );
      return {
        isValid: false,
        $error : form.$error
      };
    }
    return {
      isValid: true
    };
  }

  /**
   * @description
   * Asycnhronously returns true iff all collections in the given (root-level) model are valid.
   * While entering data into a subform (part of a collection), validateForm should be used
   * on that subform to determine validity.
   *
   * Since this is asynchronous and more expensive than validateForm, it is mainly useful
   * as a final validity check just before submitting a form for completion.
   *
   * This operation mutates the form's formState._validation object with its results.
   *
   * @param {Object} model - The root-level model for the form
   * @param {Array} collectionConfigs - The configuration objects for the collections in this form
   * @returns {Promise}
   * @memberOf iscFormsValidationService
   */
  function validateCollections( model, collectionConfigs ) {
    var sleepLengthInMillis = 50,
        maxWaitInMillis     = 1000;

    var deferred = $q.defer();

    var collectionItems  = [],
        validationErrors = {};

    // Populate collectionItems with each row that needs to be validated
    _.forEach( collectionConfigs, function( collectionConfig ) {
      var collection = _.get( model, collectionConfig.key, [] );
      _.forEach( collection, function( item ) {
        collectionItems.push(
          {
            key   : collectionConfig.key,
            model : item,
            fields: collectionConfig.fields
          }
        );
      } );
    } );

    // Destroy any existing formly-form
    delete validation.form;
    validation.renderForm = false;

    processForm();

    return deferred.promise;

    /**
     * @memberOf iscFormsValidationService
     * @returns {boolean}
     */
    function formIsPopulated() {
      return !!validation.form;
    }

    /**
     * @memberOf iscFormsValidationService
     * @returns {boolean}
     */
    function formIsDestroyed() {
      return !validation.form;
    }

    /**
     * @description
     * Waits until sleepTest evaluates to truthy, then resolves.
     * Short-circuits and returns false if the maxWaitInMillis time is exceeded.
     *
     * Useful for waiting for longer-running third-party synchronous functions (such as form building) to complete.
     * @memberOf iscFormsValidationService
     * @param sleepTest {Function}
     * @param maxWait {=Number}
     * @returns {promise}
     */
    function sleepUntil( sleepTest, maxWait ) {
      if ( maxWait === undefined ) {
        maxWait = maxWaitInMillis;
      }
      return $timeout( function() {
        if ( sleepTest() ) {
          return true;
        }
        else if ( maxWait < 0 ) {
          return false;
        }
        return sleepUntil( sleepTest, maxWait - sleepLengthInMillis );
      }, sleepLengthInMillis );
    }

    /**
     * @memberOf iscFormsValidationService
     * @description
     * Processes each collection item that needs to be validated.
     */
    function processForm() {
      // The formly-form has been destroyed,
      if ( validation.form === undefined ) {
        // so move on to the collection row to validate, if there is one.
        if ( collectionItems.length ) {
          _.extend( validation, collectionItems.pop() );
          // Flag the form to be rendered, which will regenerate the validation.form object
          validation.renderForm = true;
          // Then wait for the formly-form to finish
          sleepUntil( formIsPopulated ).then( processForm );
        }

        // End the iteration and resolve the results if there are no items left to validate.
        else {
          // Update formState._validation
          _.forEach( options.formState._validation, function( existingValidation ) {
            delete options.formState._validation[existingValidation];
          } );
          _.extend( options.formState._validation, validationErrors );

          // Resolve results
          deferred.resolve( {
            isValid: _.isEmpty( validationErrors ),
            errors : validationErrors
          } );
        }
      }

      // The formly-form has been populated
      else {
        // Run validation
        var formValidation = validateForm( validation.form );
        if ( !formValidation.isValid ) {
          var config = keyMap[validation.key];

          // Push a reference to the model that failed validation.
          // This is bound to the tabular view and will flag this row as invalid.
          var collectionKey = validationErrors[config.id];
          if ( !collectionKey ) {
            collectionKey = validationErrors[config.id] = {
              label  : config.label,
              records: []
            };
          }
          collectionKey.records.push( validation.model );
        }

        // Destroy the formly-form
        validation.renderForm = false;
        // Delay until the form has been unrendered
        $timeout( function() {
          delete validation.model;
          delete validation.fields;
          delete validation.form;
        }, 0 );
        // Now wait for the formly-form to be destroyed
        sleepUntil( formIsDestroyed ).then( processForm );
      }
    }
  }
}
} )();
