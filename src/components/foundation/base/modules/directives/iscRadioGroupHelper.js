/**
 * Created by douglasgoodman on 11/18/14.
 *
 * this is for a group of items with a $$selected property
 * the iscRadio directive handles this functionality internally
 * but if you need to call it in an outside function, this can be used
 */

( function() {
'use strict';

// ----------------------------
// injection
// ----------------------------
angular.module( 'isc.directives' )
  .factory( 'iscRadioGroupHelper', iscRadioGroupHelper );

/* @ngInject */
/**
   * @ngdoc factory
   * @memberOf directives
   * @name iscRadioGroupHelper
   * @param devlog
   * @returns {{radioSelect: radioSelect}}
   * @description
   * this is for a group of items with a $$selected property
   * the iscRadio directive handles this functionality internally
   * but if you need to call it in an outside function, this can be used
   */
function iscRadioGroupHelper( devlog ) {//jshint ignore:line
  var channel = devlog.channel( 'iscRadioGroupHelper' );
  channel.debug( 'iscRadioGroupHelper LOADED' );

  // ----------------------------
  // vars
  // ----------------------------

  // ----------------------------
  // class factory
  // ----------------------------
  var service = {
    radioSelect: radioSelect
  };

  return service;

  // ----------------------------
  // functions
  // ----------------------------

  /**
   *
   * @param selectedItem
   * @param radioGroup
   */
  function radioSelect( selectedItem, radioGroup ) {
    channel.debug( 'iscRadioGroupHelper.radioSelect' );
    channel.debug( '...selectedItem', selectedItem );
    channel.debug( '...radioGroup', radioGroup );

    var currentState = !!selectedItem.$$selected;
    radioGroup.forEach( function( item ) {
      item.$$selected = false;
    } );

    selectedItem.$$selected = !currentState;
  }

}// END CLASS

} )();
