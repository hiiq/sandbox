/**
 * Created by hiiq on 11/15/2016, 3:43:14 PM.
 */

( function() {
  'use strict';

  angular
      .module( 'typeahead' )
      .controller( 'typeaheadController', typeaheadController );

  /**
   * @ngdoc controller
   * @memberOf typeahead
   * @description Demo page for isc.typeahead.component
   * @param devlog
   * @param iscHttpapi
   * @param appConfig
   * @param typeaheadConfiguration
   */
  /* @ngInject */
  function typeaheadController( devlog, iscHttpapi, apiHelper, typeaheadConfiguration ) {

    var log = devlog.channel( 'typeaheadController' );
    log.info( 'typeaheadController LOADED' );

    var self = this;

    _.extend( self, {
        load                  : load,
        onAdd                 : onAdd,
        onAdding              : onAdding,
        onRemove              : onRemove,
        onRemoving            : onRemoving,
        onInvalid             : onInvalid,
        onClicked             : onClicked,
        updateDebugMode       : updateDebugMode,
        updateSingleSelectMode: updateSingleSelectMode
      } );

    activate();

    //////////////////////////////////

    // ****************************************
    // Typeahead Demo Page Functions
    // ****************************************
    function activate() {

      log.info( 'activate' );

      self.tags = [];
      self.tagList = [];
      self.rules = {
          singleSelectMode: false
        };

      getComponentConfiguration();
    }

    function updateDebugMode( $event ) {
      typeaheadConfiguration.component.form.debug = $event;
    }

    function updateSingleSelectMode( $event ) {
      self.rules = {
          singleSelectMode: $event
        };
    }

    function getComponentConfiguration() {
      self.typeaheadConfiguration = typeaheadConfiguration;
    }

    // ****************************************
    // ISC Typeahead Component Functions
    // ****************************************
    function onAdd( event ) {
      self.tagList = event.collection;
    }

    function onAdding( event ) {
      log.debug( 'onAdding:', event.model );
    }

    function onRemove( event ) {
      self.tagList = event.collection;
    }

    function onRemoving( event ) {
      log.debug( 'onRemoving:', event.model );
    }

    function onInvalid( event ) {
      log.debug( 'onInvalid:', event.model );
    }

    function onClicked( event ) {
      log.debug( 'onClicked:', event.model );
    }

    function load( query ) {
      var filter = '';
      if ( !angular.isUndefined( query ) ) {
        filter = query.toLowerCase();
      }
      var url = apiHelper.getUrl( '/lookahead?filter=' + filter );
      return iscHttpapi.get( url );
    }
  }

} )();
