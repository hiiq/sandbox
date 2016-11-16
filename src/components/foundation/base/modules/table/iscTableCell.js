/**
 * Created by Trevor Hudson on 06/02/15.
 */
( function() {
'use strict';

angular.module( 'isc.table' )
  .directive( 'iscTableCell', iscTableCell );

/* @ngInject */
/**
   * @ngdoc directive
   * @memberOf isc.table
   * @param devlog
   * @param $state
   * @param $templateCache
   * @param $compile
   * @returns {{restrict: string, compile: compile}}
   */
function iscTableCell( devlog, $state, $templateCache, $compile ) {
  var channel = devlog.channel( 'iscTableCell' );

  channel.debug( 'iscTableCell.LOADED' );

  // ----------------------------
  // vars
  // ----------------------------

  // ----------------------------
  // class factory
  // ----------------------------

  var directive = {
    scope       : true, //prototypal inheritance
    restrict    : 'EA',
    templateUrl : 'table/iscTableCell.html',
    link        : link,
    controller  : controller,
    controllerAs: 'iscCellCtrl'
  };
  return directive;

  // ----------------------------
  // functions
  // ----------------------------

  /* @ngInject */
  function controller() { //needed to use with controllerAs
  }

  function link( scope, elem, attrs ) {//jshint ignore:line

    // ----------------------------
    // vars
    // ----------------------------
    var cellData    = _.get( scope.dataItem, scope.column.key );
    var defaultText = scope.column.default;

    scope.notThere       = notThere;
    scope.getTrClass     = getTrClass;
    scope.getDisplayText = getDisplayText;
    scope.mobileClass    = scope.$eval( attrs.mobileClass );

    scope.state = $state.current.name;

    scope.displayText = getDisplayText( cellData, defaultText ); //getDisplayText( scope.dataItem[ column.key ], column.default );
    scope.displayUnit = _.get( scope, 'dataItem[scope.column.unit]', '' );
    scope.trClass     = getTrClass( cellData );

    // ----------------------------
    // functions
    // ----------------------------

    function getTrClass( cellData ) {
      if ( scope.column.className ) {
        return scope.column.className;
      }
      else if ( scope.column.classGetter ) {
        return scope.column.classGetter( cellData );
      }
      else {
        return '';
      }
    }

    /**
     * @memberOf iscTableCell
     * @returns {*}
     */
    function getDisplayText() {

      var cellData    = _.get( scope.dataItem, scope.column.key );
      var defaultText = scope.column.default;

      if ( scope.column.textGetter ) {
        return scope.column.textGetter( scope.iscRowCtrl.dataItem );
      }

      var retVal;
      if ( scope.notThere( cellData ) && scope.notThere( defaultText ) ) {
        retVal = '';
      }
      else if ( scope.notThere( cellData ) ) {
        retVal = String( defaultText );
      }
      else {
        retVal = String( cellData );
      }

      return retVal;
    }

    /**
     * @memberOf iscTableCell
     * @param val
     * @returns {boolean}
     */
    function notThere( val ) {
      return !val && val !== 0;
    }

  }
}

} )();
