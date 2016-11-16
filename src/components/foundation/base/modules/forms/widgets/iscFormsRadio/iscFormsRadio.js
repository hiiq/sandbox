( function() {
'use strict';

angular.module( 'isc.core' )
  .directive( 'iscFormsRadio', iscFormsRadio );

/**
   * @ngdoc directive
   * @memberOf isc.core
   * @returns {{restrict: string, replace: boolean, require: string, scope: boolean, bindToController: {id: string, model: string, options: string, isObjectModel: string}, controllerAs: string, controller: controller, link: link, templateUrl: directive.templateUrl}}
   */
/* @ngInject */
function iscFormsRadio() {//jshint ignore:line
  // ----------------------------
  // vars
  // ----------------------------

  // ----------------------------
  // class factory
  // ----------------------------
  var directive = {
    restrict        : 'E',
    replace         : true,
    require         : 'ngModel',
    scope           : true,
    bindToController: {
      id           : '=',
      model        : '=',
      options      : '=',
      isObjectModel: '=',
      disabled     : '='
    },
    controllerAs    : 'radioCtrl',
    controller      : _.noop,
    link            : link,
    templateUrl     : function( elem, attrs ) {
      return attrs.templateUrl || 'forms/widgets/iscFormsRadio/iscFormsRadio.html';
    }
  };

  return directive;

  // ----------------------------
  // functions
  // ----------------------------
  /**
   * memberOf iscFormsRadio
   * @param scope
   * @param elem
   * @param attrs
   * @param ngModel
   */
  function link( scope, elem, attrs, ngModel ) {
    var localModel,
        ctrl          = scope.radioCtrl,
        options       = ctrl.options,
        isObjectModel = ctrl.isObjectModel;

    scope.displayProp  = _.get( options, 'data.displayField', 'name' );
    scope.groupProp    = _.get( options, 'data.groupField', 'group' );
    scope.isHorizontal = _.get( options, 'data.layout.orientation' ) === 'horizontal';

    ngModel.$render = function() {
      if ( ngModel.$viewValue ) {
        localModel = ngModel.$viewValue;
      }
    };

    scope.onSelect = function( option ) {
      localModel = option;
      ngModel.$setTouched();
      ngModel.$setViewValue( localModel );
    };

    // Set a watch in case the model value is changed from outside the widget
    scope.$watch( function() {
        return ngModel.$viewValue;
      },
      function( value ) {
        if ( !angular.equals( value, localModel ) ) {
          localModel = value;
        }
      }
    );

    ctrl.isChecked = function( option ) {
      if ( isObjectModel ) {
        return localModel && angular.equals( localModel, option );
      }
      else {
        return localModel === option;
      }
    };
  }

}//END CLASS
} )();
