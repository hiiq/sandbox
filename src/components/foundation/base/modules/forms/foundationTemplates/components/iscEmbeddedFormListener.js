( function() {
'use strict';

// ----------------------------
// injection
// ----------------------------

angular.module( 'isc.forms' )
  .directive( 'iscEmbeddedFormListener', iscEmbeddedFormListener );

/* @ngInject */
/**
   * @ngdoc directive
   * @memberOf isc.forms
   * @scope
   * @param FORMS_EVENTS
   * @returns {{restrict: string, replace: boolean, require: string, scope: {options: string, form: string}, link: link}}
   */
function iscEmbeddedFormListener( FORMS_EVENTS ) {//jshint ignore:line

  // ----------------------------
  // vars
  // ----------------------------

  // ----------------------------
  // class factory
  // ----------------------------
  var directive = {
    restrict: 'E',
    replace : true,
    require : 'ngModel',
    scope   : {
      options: '=',
      form   : '='
    },
    link    : link
  };

  return directive;

  // ----------------------------
  // functions
  // ----------------------------
  function link( scope, el, attrs, ngModelCtrl ) {
    var ctrl = scope,
        form = ctrl.form;

    scope.$on( FORMS_EVENTS.resetFormModel, function() {
      resetModel();
    } );

    scope.$on( FORMS_EVENTS.setFormModel, function( event, model, resetAfter ) {
      ngModelCtrl.$setViewValue( model );
      if ( resetAfter ) {
        resetModel();
      }
    } );

    function resetModel() {
      form.$setUntouched();
      form.$setPristine();
    }
  }

}//END CLASS

} )();
