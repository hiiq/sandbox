/**
 * Created by Ryan C. Martin on 11/9/2016.
 */

( function() {
'use strict';

angular
  .module( 'isc.typeahead' )
  .provider( 'typeaheadConfiguration', typeaheadConfiguration );

/**
   *
   * @returns {{defaults: *, setUserConfiguration: setUserConfiguration, $get: $get}}
   */
function typeaheadConfiguration() {

  var self                = this;
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
      displayProperty        : "text",
      keyProperty            : "text",
      placeholder            : "Add Tag:",
      tabindex               : 10,
      minLength              : 2,
      maxLength              : 25,
      minTags                : 0,
      maxTags                : 5,
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
      displayProperty     : "text",
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

  //////////////////////////////////

  return {
    defaults            : self.defaults,
    setUserConfiguration: function( user ) {
      self.user = user;
    },
    $get                : function() {
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
