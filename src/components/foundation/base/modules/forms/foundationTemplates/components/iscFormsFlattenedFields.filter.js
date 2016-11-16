( function() {
'use strict';

/**
   * Flattens a list of fields by compressing fieldGroups down into a single field list
   * This is useful for tabular representation of data
   */
angular.module( 'isc.forms' )
  .filter( 'iscFormsFlattenedFields', iscFormsFlattenedFields );

/**
   * @ngdoc filter
   * @memberOf isc.forms
   * @param $filter
   * @returns {Function}
   */
/* @ngInject */
function iscFormsFlattenedFields( $filter ) {
  return function( fields ) {
    var flattenedFields = flattenFields( fields );
    return flattenedFields;
  };

  /**
   * @memberOf iscFormsFlattenedFields
   * @param fields
   * @returns {Array}
   */
  function flattenFields( fields ) {
    var fieldArray = [];
    _.forEach( fields, function( field ) {
      fieldArray = fieldArray.concat( getFields( field ) );
    } );
    return fieldArray;
  }

  /**
   * @memberOf iscFormsFlattenedFields
   * @param field
   * @returns {*}
   */
  function getFields( field ) {
    if ( field.fieldGroup ) {
      return flattenFields( field.fieldGroup );
    }
    else if ( showInTable( field ) ) {
      return [].concat(
        angular.extend(
          {
            key           : _.get( field, 'data.tableHeaderLabel' ) || _.get( field, 'key', '' ),
            label         : _.get( field, 'data.tableHeaderLabel' ) || _.get( field, 'templateOptions.label', '' ),
            model         : _.get( field, 'key', '' ) + (
              // For data stored as complex objects, get the list field property
              doesFieldStoreObject( field ) ?
                ( '.' + _.get( field, 'data.displayField', 'name' ) )
                : ''
            ),
            templateUrl   : _.get( field, 'data.tableCellTemplateUrl' )
          },
          getCustomDisplayOptions( field )
        )
      );
    }
    else {
      return [];
    }

    function showInTable( field ) {
      return !_.startsWith( field.type, 'embeddedForm' ) &&
        field.type !== 'instructions' &&
        field.type !== 'section' &&
        !_.get( field, 'data.hideInTable' );
    }
  }

  /**
   * @memberOf iscFormsFlattenedFields
   * @param field
   * @returns {*}
   */
  function doesFieldStoreObject( field ) {
    return _.get( field, 'data.isObject' ) || _.get( field, 'data.displayField' );
  }

  /**
   * @memberOf iscFormsFlattenedFields
   * @param field
   * @returns {{}}
   */
  function getCustomDisplayOptions( field ) {
    var options = {},
        data    = _.get( field, 'data', {} );

    if ( data.tableCellType ) {
      options.type = data.tableCellType;
    }

    if ( data.tableCellDisplay ) {
      options.templateUrl = 'forms/foundationTemplates/tableTemplates/data.tableCellDisplay.html';
      options.display     = data.tableCellDisplay;
    }
    return options;
  }

}

} )();
