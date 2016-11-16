( function() {
'use strict';

angular
  .module( 'isc.spinner' )
  .directive( 'iscSpinner', iscSpinner );

/**
   * @ngdoc directive
   * @memberOf isc.spinner
   * @returns {{bindToController: {}, controller: iscSpinnerController, controllerAs: string, restrict: string, templateUrl: directive.templateUrl}}
   */
function iscSpinner() {
  var directive = {
    bindToController: {},
    controller      : iscSpinnerController,
    controllerAs    : 'spinnerCtrl',
    restrict        : 'EA',
    scope           : {},
    templateUrl     : function( elem, attrs ) {
      return attrs.templateUrl || 'isc.spinner/iscSpinner.html';
    }
  };
  return directive;

  /* @ngInject */
  /**
   * @ngdoc controller
   * @memberOf iscSpinner
   * @param devlog
   * @param iscSpinnerModel
   */
  function iscSpinnerController( devlog, iscSpinnerModel ) {
    var channel = devlog.channel( 'iscSpinnerController' );
    channel.debug( 'inside iscSpinnerController' );
    var self       = this;
    self.isLoading = isLoding;

    function isLoding() {
      return iscSpinnerModel.getPendingReqs() > 0;
    }
  }
}

} )();

