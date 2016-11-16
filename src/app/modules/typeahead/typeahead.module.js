/**
 * Created by Ryan C. Martin on 11/9/2016.
 */

( function() {
  'use strict';

  angular
    .module( 'typeahead', ['ui.router', 'isc.components'] )
    .config( config );

  /**
   * @ngdoc config
   * @memberOf typeahead
   * @description This function is where the isc.typeahead.component can be configured with user configurations prior to initialization
   * @param iscStateProvider
   * @param typeaheadConfigurationProvider
   */
  /* @ngInject */
  function config( iscStateProvider, typeaheadConfigurationProvider ) {

    iscStateProvider.state( getStates() );

    var userConfiguration = {
      "form"        : {
        debug : false,
        formId: "tags"
      },
      "tagsInput"   : {
        template               : "user-tag-template",
        displayProperty        : "name",
        keyProperty            : "userId",
        placeholder            : "Search:",
        maxTags                : 3,
        replaceSpacesWithDashes: true,
        enableEditingLastTag   : true,
        noTags                 : false
      },
      "autoComplete": {
        template            : "user-autocomplete-template",
        displayProperty     : "name",
        minLength           : 2,
        maxResultsToShow    : 5,
        highlightMatchedText: true
      }
    };

    typeaheadConfigurationProvider.setUserConfiguration( userConfiguration );
  }

  /**
   * @description this is where module specific states are defined.
   *  Be sure not to make any method name or the structural changes; any changes may prevent ```slush hs:page``` from working properly
   *
   * @returns {} -- UI router states
   */
  function getStates() {
    return {
      'unauthenticated.typeahead': {
        url           : 'typeahead',
        state         : 'unauthenticated.typeahead',
        templateUrl   : 'typeahead/typeahead.html',
        translationKey: 'Typeahead Demo',
        controller    : 'typeaheadController as typeCtrl',
        roles         : ['*'],
        landingPageFor: ['*'],
        displayOrder  : 2
      }
    };
  }

} )();
