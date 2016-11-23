/**
 * Created by Ryan C. Martin on 11/9/2016.
 */

( function() {
'use strict';

angular
  .module( 'isc.typeahead' )
  .provider( 'typeaheadConfiguration', typeaheadConfiguration );

/**
 * @ngdoc provider
 * @memberOf isc.typeahead
 * @description Provider allows for configuring the components structure and behavior
 * @returns {{defaults: defaults, setUserConfiguration: setUserConfiguration, $get: $get}}
 */
function typeaheadConfiguration() {

  var self                = this;
  self.user               = { form: {}, tagsInput: {}, autoComplete: {} };
  self.formConfig         = {};
  self.tagsInputConfig    = {};
  self.autoCompleteConfig = {};

  self.defaults = {
    "form"        : {
      debug : false,
      formId: "tags"
    },
    "tagsInput"   : {
      required               : false,
      template               : "tag-template",
      displayProperty        : "name",
      keyProperty            : "id",
      placeholder            : "Add Tag:",
      tabindex               : 5,
      minLength              : 1,
      maxLength              : 25,
      minTags                : 0,
      maxTags                : 10,
      addOnEnter             : false,
      addOnSpace             : false,
      addOnComma             : false,
      addOnBlur              : false,
      addOnPaste             : false,
      pasteSplitPattern      : ",",
      replaceSpacesWithDashes: false,
      enableEditingLastTag   : false,
      addFromAutocompleteOnly: true,
      noTags                 : false
    },
    "autoComplete": {
      template            : "autocomplete-template",
      displayProperty     : "name",
      minLength           : 2,
      maxResultsToShow    : 10,
      debounceDelay       : 500,
      highlightMatchedText: true,
      loadOnDownArrow     : false,
      loadOnEmpty         : false,
      loadOnFocus         : false,
      selectFirstMatch    : false
    }
  };

  /**
   * @description
   * Checks to see if all of the user specified required fields are set
   * from the calling page within the module config section delivered
   * by the setUserConfiguration function in this provider.
   */
  function validateRequiredFields() {

    var tagsInputs    = self.user.tagsInput;
    var autoCompletes = self.user.autoComplete;

    if ( angular.isUndefined( tagsInputs.keyProperty ) || angular.isUndefined( tagsInputs.displayProperty ) || angular.isUndefined( autoCompletes.displayProperty ) ) {
      console.log( '@@@@@@@@@@@ REQUIRED FIELDS MISSING @@@@@@@@@@@' );
      console.log( '@@@@@@@@@@@ tagsInputs.keyProperty (required) @@@@@@@@@@@' );
      console.log( '@@@@@@@@@@@ tagsInputs.displayProperty (required) @@@@@@@@@@@' );
      console.log( '@@@@@@@@@@@ autoCompletes.displayProperty (required) @@@@@@@@@@@' );

      return false;
    }

    return true;
  }

  //////////////////////////////////

  return {
    defaults            : self.defaults,
    setUserConfiguration: function( user ) {
      self.user = user;
    },
    $get                : function() {
      if ( !validateRequiredFields() )
      {
        return;
      }

      angular.extend( self.formConfig, self.defaults.form, self.user.form );
      angular.extend( self.tagsInputConfig, self.defaults.tagsInput, self.user.tagsInput );
      angular.extend( self.autoCompleteConfig, self.defaults.autoComplete, self.user.autoComplete );

      self.component = {
        "form"        : self.formConfig,
        "tagsInput"   : self.tagsInputConfig,
        "autoComplete": self.autoCompleteConfig
      };

      return {
        user        : self.user,
        defaults    : self.defaults,
        component   : self.component,
        form        : self.formConfig,
        tagsInputs  : self.tagsInputConfig,
        autoComplete: self.autoCompleteConfig
      };
    }
  };
}

} )();
