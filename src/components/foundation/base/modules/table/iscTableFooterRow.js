/**
 * Created by hzou on 08/03/15.
 */

( function() {
'use strict';

angular.module( 'isc.table' )
  .directive( 'iscTableFooterRow', iscTableFooterRow );

/* @ngInject */
/**
   * @memberOf isc.table
   * @ngdoc directive
   * @param devlog
   * @param $state
   * @param $templateCache
   * @param $compile
   * @returns {{scope: boolean, restrict: string, controllerAs: string, compile: compile}}
   */
function iscTableFooterRow( devlog, $state, $templateCache, $compile ) {
  var channel = devlog.channel( 'iscTableFooterRow' );

  channel.debug( 'iscTableFooterRow.LOADED' );

  // ----------------------------
  // vars
  // ----------------------------

  // ----------------------------
  // class factory
  // ----------------------------

  var directive = {
    scope       : true, //prototypal inheritance
    restrict    : 'A',
    controllerAs: 'iscFooterRowCtrl',
    compile     : compile
  };

  return directive;

  // ----------------------------
  // functions
  // ----------------------------
  function compile() {

    return {
      pre: pre
    };

    function pre( scope, trElem, attrs, iscRowCtrl ) { //jshint ignore:line
      var footerRowTemplate = _.get( scope, 'iscTblCtrl.tableConfig.footerRowTemplate' );

      if ( footerRowTemplate ) {
        //for some reason the template doesn't like spaces nor comments
        var template = $templateCache.get( footerRowTemplate );

        trElem.html( template );
        $compile( trElem.contents() )( scope );
      }
    }
  }
}

} )();
