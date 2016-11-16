/**
 * Created by hzou on 07/13/15.
 */

/**
 * When using rowTemplate, DO NOT put html comments in it.
 * this will cause duplicate renderers when used together with ng-repeat
 */

/**
 * if custom rowTemplate is defined in tabeConfig, it will use rowTemplate instead of default template
 *** if rowType === 'data'
 *
 * if custom addTemplate is defined in tabeConfig, it will use rowTemplate instead of default template
 *** if rowType === 'add'
 */
( function() {
'use strict';

angular.module( 'isc.table' )
  .directive( 'iscTableRow', iscTableRow );

/* @ngInject */
/**
   * @ngdoc directive
   * @memberOf isc.table
   * @param devlog
   * @param $state
   * @param $templateCache
   * @param $compile
   * @returns {{scope: boolean, restrict: string, priority: number, controllerAs: string, controller: string, compile: compile}}
   */
function iscTableRow( devlog, $state, $templateCache, $compile ) {
  var channel = devlog.channel( 'iscTableRow' );

  channel.debug( 'iscTableRow.LOADED' );

  // ----------------------------
  // vars
  // ----------------------------

  // ----------------------------
  // class factory
  // ----------------------------

  var directive = {
    scope       : true, //prototypal inheritance
    restrict    : 'A',
    //needs to be -1 in order to have access to dataItem, which is populated by the dir-pagination directive
    priority    : -1,
    controllerAs: 'iscRowCtrl',
    controller  : 'iscTableRowController',
    compile     : compile
  };

  return directive;

  function compile() {

    return {
      pre : pre,
      post: post
    };

    function pre( scope, trElem, attrs, iscRowCtrl ) { //jshint ignore:line
      var defaultTemplate = scope.iscTblCtrl.tableConfig.editable === 'popup' ? 'table/popup/iscTablePopupRow.html' : 'table/iscTableRow.html';

      var rowTemplate = _.get( scope, 'iscTblCtrl.tableConfig.rowTemplate', defaultTemplate );

      //in the case of creating a new item, fetch dataItem from iscTblCtrl
      if ( scope.dataItem === null && _.get( scope, 'iscTblCtrl.dataItem.isNew' ) ) {
        iscRowCtrl.dataItem = scope.dataItem = _.get( scope, 'iscTblCtrl.dataItem' );
        iscRowCtrl.editModeData = angular.copy( scope.dataItem );
        iscRowCtrl.inEditMode = true;
      }

      if ( rowTemplate ) {
        //for some reason the template doesn't like spaces or comments
        var template = removeTemplateSpaces( $templateCache.get( rowTemplate ) );
        trElem.html( template );
        $compile( trElem.contents() )( scope );
      }
    }

    function post( scope, elem, attr, iscRowCtrl ) { //jshint ignore:line
      iscRowCtrl.iscTblCtrl = scope.iscTblCtrl;
      scope.$watch( 'dataItem', function( value ) {
        iscRowCtrl.dataItem = value;
      } );
    }

    /**
     * @memberOf iscTableRow
     * @param templateStr
     * @returns {*}
     */
    function removeTemplateSpaces( templateStr ) {
      if ( !templateStr ) {
        return '';
      }

      return templateStr
        .replace( /\r?\n|\r/g, ' ' )  //replace newline with space
        //jshint ignore:start
        .replace( /\>[ \t]+\</g, '\>\<' )// remove space between elements/tags
        //jshint ignore:end
        .replace( /\s{2,}/g, ' ' ); //replace 2+ spaces with 1 space
    }

  }
}

} )();
