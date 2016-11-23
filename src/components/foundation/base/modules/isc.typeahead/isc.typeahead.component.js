/**
 * Created by Ryan C. Martin on 11/9/2016.
 */

( function() {
'use strict';

angular
  .module( 'isc.typeahead' )
  .component( 'iscTypeaheadComponent', {
    bindings    : {
      iscModel  : '=',
      iscRules  : '<',
      iscSource : '=',
      onAdd     : '&',
      onAdding  : '&',
      onRemove  : '&',
      onRemoving: '&',
      onInvalid : '&',
      onClicked : '&'
    },
    controller  : typeaheadController,
    controllerAs: '$ctrl',
    templateUrl : ['$element', '$attrs', function( $element, $attrs ) {
      return $attrs.templateUrl || 'isc.typeahead/isc.typeahead.html';
    }]
  } );

/**
 * @ngdoc component
 * @memberOf isc.typeahead
 * @description Tag styled input text box with auto-complete functionality
 * @param devlog
 * @param typeaheadConfiguration
 */
/* @ngInject */
function typeaheadController( devlog, typeaheadConfiguration ) {

  var log = devlog.channel( 'iscTypeaheadComponent' );
  log.info( 'isc.typeahead.js LOADED' );

  var self   = this;
  self.props = {};

  _.extend( self, {
    $onChanges : $onChanges,
    $onInit    : $onInit,
    $postLink  : $postLink,
    $onDestroy : $onDestroy,
    tagAdded   : tagAdded,
    tagAdding  : tagAdding,
    tagRemoved : tagRemoved,
    tagRemoving: tagRemoving,
    invalidTag : invalidTag,
    tagClicked : tagClicked
  } );

  //////////////////////////////////

  // **************************************************
  // COMPONENT LIFECYCLE EVENTS
  // **************************************************
  function $onChanges( changes ) {

    log.info( '$onChanges' );

    if ( changes.iscRules && changes.iscRules.currentValue ) {
      self.iscRules = angular.copy( changes.iscRules.currentValue );

      // **************************************************
      // Note:
      // This check is here because the self.props object
      // must be initialized prior to executing the checkRules
      // function which happens within the $onInit lifecycle
      // event which runs after this, the $onChanges event
      // **************************************************
      if ( !changes.iscRules.isFirstChange() ) {
        checkRules();
      }
    }
  }

  function $onInit() {
    setProps();
    checkRules();
  }

  function $postLink() {
  }

  function $onDestroy() {
  }

  // **************************************************
  // NG-TAGS-INPUT FUNCTIONS
  // **************************************************
  function tagAdded( $tag ) {
    checkRules();
    self.onAdd( { $event: { model: $tag, collection: self.iscModel } } );
  }

  function tagAdding( $tag ) {
    self.onAdding( { $event: { model: $tag } } );
  }

  function tagRemoved( $tag ) {
    checkRules();
    self.onRemove( { $event: { model: $tag, collection: self.iscModel } } );
  }

  function tagRemoving( $tag ) {
    self.onRemoving( { $event: { model: $tag } } );
  }

  function invalidTag( $tag ) {
    self.onInvalid( { $event: { model: $tag } } );
  }

  function tagClicked( $tag ) {
    self.onClicked( { $event: { model: $tag } } );
  }

  // **************************************************
  // COMPONENT FUNCTIONS
  // **************************************************
  function setProps() {
    setComponentProperties();
  }

  function checkRules() {
    checkSingleSelect();
  }

  /**
   * @description
   * Retrieves all of the user and default component properties which
   * provides custom behavior and structure to the component during
   * the $onInit lifecycle event. The properties can be changed and
   * re-executed after initialization has happen.
   */
  function setComponentProperties() {

    var formConfig    = typeaheadConfiguration.form;
    var tagsInputs    = typeaheadConfiguration.tagsInputs;
    var autoCompletes = typeaheadConfiguration.autoComplete;

    var props = { form: {}, tagsInput: {}, autoComplete: {} };

    _.forIn( formConfig, function( value, key ) {
      props.form[key] = value;
    } );

    _.forIn( tagsInputs, function( value, key ) {
      props.tagsInput[key] = value;
    } );

    _.forIn( autoCompletes, function( value, key ) {
      props.autoComplete[key] = value;
    } );

    self.props = props;
  }

  // **************************************************
  // COMPONENT RULES
  // **************************************************

  /**
   * @description
   * Checks to see if only one tag selection is allowed in component,
   * If set to true and 1 selection has been selected, the component
   * sets the max results to show to 0 which prevents any additional
   * results to show up within the auto-complete feature.
   */
  function checkSingleSelect() {
    if ( _.get( self, 'iscRules.singleSelectMode', true ) ) {
      var autoCompletes = typeaheadConfiguration.autoComplete;
      self.props.autoComplete.maxResultsToShow = self.iscModel.length > 0 ? 0 : autoCompletes.maResultsToShow;
    }
  }
}

} )();
