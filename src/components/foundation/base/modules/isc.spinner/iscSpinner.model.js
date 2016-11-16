/**
 * Created by hzou on 1/2/16.
 */

/**
 * Usage:     $http.get('/api/patient/34561385', { showLoader: true });


 */
( function() {
'use strict';

angular
  .module( 'isc.spinner' )
  .factory( 'iscSpinnerModel', iscSpinnerModel );

/**
   * @ngdoc factory
   * @memberOf isc.spinner
   * @param devlog
   * @returns {{addPendingReq: addPendingReq, subtractPendingReq: subtractPendingReq, getPendingReqs: getPendingReqs}}
   */
function iscSpinnerModel( devlog ) {
  var channel = devlog.channel( 'iscSpinnerModel' );

  channel.debug( 'inside iscSpinnerModel' );
  var pendingReqs = {};
  var factory     = {
    addPendingReq     : addPendingReq,
    subtractPendingReq: subtractPendingReq,
    getPendingReqs    : getPendingReqs
  };
  return factory;

  /**
   * @memberOf iscSpinnerModel
   * @param url
   */
  function addPendingReq( url ) {
    channel.debug( 'adding url', url );
    pendingReqs[url] = true;
  }

  /**
   * @memberOf iscSpinnerModel
   * @param url
   */
  function subtractPendingReq( url ) {
    channel.debug( 'removing url', url );
    delete pendingReqs[url];
  }

  /**
   * @memberOf iscSpinnerModel
   * @returns {Number}
   */
  function getPendingReqs() {
    return _.keys( pendingReqs ).length;
  }
}

} )();

