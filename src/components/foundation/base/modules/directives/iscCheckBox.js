/**
 * Created by douglas goodman on 2/26/15.
 */

// ******* NOTE: The ng-model you put on this element has to reference a property of a property on scope, not a property on scope **********

( function() {
'use strict';
// ----------------------------
// injection
// ----------------------------

angular.module( 'isc.directives' )
  .directive( 'iscCheckBox', iscCheckBox );

/**
   * @ngdoc directive
   * @memberOf directives
   * @name iscCheckbox
   * @scope
   * @restrict 'EA'
   * @param devlog
   * @returns {{restrict: string, transclude: boolean, require: string, scope: {onToggle: string}, link: link, templateUrl: directive.templateUrl}}
   * @description
   *  This is a wrapper for a checkbox control, by default it will be based upon SVG checkbox. It allow to override the default
   *  by injecting a templateUrl thru a attribute
   *
   * @example
   *  <example iscCheckBox templateUrl="myCheckbox.html" />
   *  <div iscCheckBox ></div>
   */
/* @ngInject */
function iscCheckBox( devlog ) {//jshint ignore:line
  var channel = devlog.channel( 'iscCheckBox' );
  channel.debug( 'iscCheckBox LOADED' );

  // ----------------------------
  // vars
  // ----------------------------

  // ----------------------------
  // class factory
  // ----------------------------
  var directive = {
    restrict   : 'EA',
    require    : '?ngModel',
    scope      : {
      onToggle: '&'
    },
    link       : link,
    templateUrl: function( elem, attrs ) {
      return attrs.templateUrl || 'svg/isc-checkbox.html';
    }
  };

  return directive;

  // ----------------------------
  // functions
  // ----------------------------
  /**
   *
   * @param scope
   * @param elem
   * @param attr
   * @param ngModelCtrl
   * @description
   * This is the link function for the directive, it accepts a ngModel controller
   */
  function link( scope, elem, attr, ngModelCtrl ) {

    scope.selected = false;

    if ( ngModelCtrl ) {
      ngModelCtrl.$render = function() {
        scope.selected = !!ngModelCtrl.$viewValue;
      };
    }

    scope.toggleCheckBox = function() {
      scope.selected = !scope.selected;
      scope.onToggle( { selected: scope.selected } );

      if ( ngModelCtrl ) {
        channel.debug( 'iscCheckBox.$setViewValue' );
        ngModelCtrl.$setViewValue( !ngModelCtrl.$viewValue );
      }
    };
  }

}//END CLASS

} )();
