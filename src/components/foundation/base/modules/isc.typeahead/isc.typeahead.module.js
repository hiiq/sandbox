/**
 * Created by Ryan C. Martin on 11/9/2016.
 */

( function() {
'use strict';

angular
  .module( 'isc.typeahead', ['ngTagsInput'] )
  .config( configBlock );

/**
   *
   * @param tagsInputConfigProvider
   * @param typeaheadConfigurationProvider
   */
/* @ngInject */
function configBlock( tagsInputConfigProvider, typeaheadConfigurationProvider ) {

  // If a property is set to true the value can be updated in real-time.
  tagsInputConfigProvider.setActiveInterpolation( 'tagsInput', {
    template               : true,
    displayProperty        : true,
    keyProperty            : true,
    placeholder            : true,
    minLength              : true,
    maxLength              : true,
    minTags                : true,
    maxTags                : true,
    addOnEnter             : false,
    addOnSpace             : false,
    addOnComma             : false,
    addOnBlur              : false,
    addOnPaste             : false,
    pasteSplitPattern      : false,
    replaceSpacesWithDashes: false,
    enableEditingLastTag   : false,
    addFromAutocompleteOnly: true
  } );

  tagsInputConfigProvider.setActiveInterpolation( 'autoComplete', {
    template            : true,
    displayProperty     : true,
    debounceDelay       : false,
    highlightMatchedText: false,
    maxResultsToShow    : true,
    minLength           : true,
    loadOnDownArrow     : false,
    loadOnEmpty         : false,
    loadOnFocus         : false,
    selectFirstMatch    : false
  } );

  //////////////////////////////////

  var formProperties         = {},
      tagsInputProperties    = {},
      autoCompleteProperties = {};

  _.forIn( typeaheadConfigurationProvider.defaults.form, function( value, key ) {
    formProperties[key] = value;
  } );

  _.forIn( typeaheadConfigurationProvider.defaults.tagsInput, function( value, key ) {
    tagsInputProperties[key] = value;
  } );

  _.forIn( typeaheadConfigurationProvider.defaults.autoComplete, function( value, key ) {
    autoCompleteProperties[key] = value;
  } );

  tagsInputConfigProvider.setDefaults( 'tagsInput', tagsInputProperties );
  tagsInputConfigProvider.setDefaults( 'autoComplete', autoCompleteProperties );
}

} )();
