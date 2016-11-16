( function() {
'use strict';

/* @ngInject */
angular
  .module( 'isc.forms' )
  .factory( 'hsModelUtils', hsModelUtils );

/**
   *
   * @ngdoc factory
   * @memberOf isc.forms
   * @param $window
   * @returns {{validateRecord: validateRecord, getError: getError}}
   */
function hsModelUtils( $window ) {
  return {
    validateRecord: validateRecord,
    getError      : getError
  };

  /**
   * Wrapper for a proposed validation model that is executed on model change
   * @param module
   * @param record
   * @param recordName
   * @description
   *  module will likely be static for the application or form type: e.g., DDP or IntakeForm
   *  The FDN will need to be aware of this value,
   *   at the level of the form if there is only one module per form,
   *   or at the level of the field if there could be more than one module in a form.
   *
   * record is the data model, either the form or the component
   * If subforms need to be submitted as a model independently,
   *   this also needs to be indicated in the FDN, at the form or field level.

   * recordName is a logical component of the data model: e.g., Patient, Address, Name, etc.
   */
  function validateRecord( module, record, recordName ) {

    return $window.hsModelUtils.validateRecord( module, record, recordName ).length;
  }

  /**
   * @description
   * Mock version of a proposed validation model that returns the errors for the specified path
   * module will likely be static for the application or form type: e.g., DDP or IntakeForm
   * The FDN will need to be aware of this value,
   *   at the level of the form if there is only one module per form,
   *   or at the level of the field if there could be more than one module in a form.

   * spec is a model path: e.g., name.first
   * According to the current validation model, the expectation is that this is:
   *   {recordName}.{spec}
   *   So if validation is run for the Name.First path for the Patient recordName,
   *   this needs to be Patient.Name.First.
   * @param module
   * @param spec
   * @memberOf hsModelUtils
   */
  function getError( module, spec ) {

    return $window.hsModelUtils.getError( module, spec );
  }
}
} )();
