/**
 * Modified by douglas goodman on 5/6/15.
 *
 * The MIT License (MIT)
 *
 * Copyright (c) 2013 Thom Seddon
 * Copyright (c) 2010 Google
 *
 * Permission is hereby granted, free of charge, to any person obtaining a copy
 * of this software and associated documentation files (the "Software"), to deal
 * in the Software without restriction, including without limitation the rights
 * to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
 * copies of the Software, and to permit persons to whom the Software is
 * furnished to do so, subject to the following conditions:
 *
 * The above copyright notice and this permission notice shall be included in
 * all copies or substantial portions of the Software.
 *
 * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
 * IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
 * FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
 * AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
 * LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
 * OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN
 * THE SOFTWARE.

 * Adapted from: http://code.google.com/p/gaequery/source/browse/trunk/src/static/scripts/jquery.autogrow-textarea.js
 *
 * Works nicely with the following styles:
 * textarea {
 *  resize: none;
 *  word-wrap: break-word;
 *  transition: 0.05s;
 *  -moz-transition: 0.05s;
 *  -webkit-transition: 0.05s;
 *  -o-transition: 0.05s;
 * }
 *
 * Usage: <textarea isc-text-area-autoExpand ng-model="someValue"></textarea>
 **/

( function() {
'use strict';
// ----------------------------
// injection
// ----------------------------

angular.module( 'isc.directives' )
  .directive( 'iscTextAreaAutoExpand', iscTextAreaAutoExpand );
/**
   * @ngdoc directive
   * @memberOf directives
   * @name iscTextAreaAutoExpand
   * @restrict 'EA'
   * @param devlog
   * @returns {{restrict: string, require: string, link: link}}
   * @description
   * * Modified by douglas goodman on 5/6/15.
   *
   * The MIT License (MIT)
   *
   * Copyright (c) 2013 Thom Seddon
   * Copyright (c) 2010 Google
   *
   * Permission is hereby granted, free of charge, to any person obtaining a copy
   * of this software and associated documentation files (the "Software"), to deal
   * in the Software without restriction, including without limitation the rights
   * to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
   * copies of the Software, and to permit persons to whom the Software is
   * furnished to do so, subject to the following conditions:
   *
   * The above copyright notice and this permission notice shall be included in
   * all copies or substantial portions of the Software.
   *
   * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
   * IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
   * FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
   * AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
   * LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
   * OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN
   * THE SOFTWARE.

   * Adapted from: http://code.google.com/p/gaequery/source/browse/trunk/src/static/scripts/jquery.autogrow-textarea.js
   *
   * Works nicely with the following styles:
   * textarea {
 *  resize: none;
 *  word-wrap: break-word;
 *  transition: 0.05s;
 *  -moz-transition: 0.05s;
 *  -webkit-transition: 0.05s;
 *  -o-transition: 0.05s;
 * }
   *@example
   * <textarea isc-text-area-autoExpand ng-model="someValue"></textarea>
   *
   */
/* @ngInject */
function iscTextAreaAutoExpand( devlog ) { //jshint ignore: line
  var channel = devlog.channel( 'iscTextAreaAutoExpand' );
  channel.debug( 'iscTextAreaAutoExpand LOADED' );

  // ----------------------------
  // vars
  // ----------------------------
  var MIN_HEIGHT = 45;

  // ----------------------------
  // class factory
  // ----------------------------
  var directive = {
    restrict: 'EA',
    require : 'ngModel',
    link    : link
  };

  return directive;

  // ----------------------------
  // functions
  // ----------------------------

  function link( scope, element, attr, ngModelCtrl ) {

    var minHeight    = MIN_HEIGHT;
    var paddingLeft  = element.css( 'paddingLeft' );
    var paddingRight = element.css( 'paddingRight' );
    var threshold    = Math.max( parseInt( element.css( 'paddingTop' ) || 0 ), 20 );

    var $shadow = angular.element( '<div></div>' ).css( {
      position  : 'absolute',
      top       : -10000,
      left      : -10000,
      width     : element[0].offsetWidth - parseInt( paddingLeft || 0 ) - parseInt( paddingRight || 0 ),
      fontSize  : element.css( 'fontSize' ),
      fontFamily: element.css( 'fontFamily' ),
      lineHeight: element.css( 'lineHeight' ),
      resize    : 'none'
    } );

    angular.element( document.body ).append( $shadow ); // jshint ignore:line

    var update = function() {
      var times = function( string, number ) {
        for ( var i = 0, r = ''; i < number; i++ ) {
          r += string;
        }
        return r;
      };

      var val = element.val().replace( /</g, '&lt;' )
        .replace( />/g, '&gt;' )
        .replace( /&/g, '&amp;' )
        .replace( /\n$/, '<br/>&nbsp;' )
        .replace( /\n/g, '<br/>' )
        .replace( /\s{2,}/g, function( space ) {
          return times( '&nbsp;', space.length - 1 ) + ' ';
        } );

      $shadow.html( val );

      var height = Math.max( $shadow[0].offsetHeight + threshold, minHeight );
      channel.debug( '...$shadow[0].offsetHeight', $shadow[0].offsetHeight );
      channel.debug( '...threshold', threshold );
      channel.debug( '...minHeight', minHeight );
      channel.debug( '...height', height );

      element.css( 'height', height + 'px' );
    };

    element.bind( 'keyup keydown keypress change', update );
    update();

    scope.$watch( 'ngModelCtrl.$modelValue', function( oldval, newVal ) { // jshint ignore:line
      channel.debug( '...ngModelCtrl.$viewValue', ngModelCtrl.$viewValue );
      channel.debug( '...ngModelCtrl.$modelValue', ngModelCtrl.$modelValue );
      if ( !!ngModelCtrl.$modelValue ) {
        update();
      }
    } );

    scope.$on( '$destroy', function() {
      channel.debug( '...$destroy' );
      $shadow.remove();
    } );

  }//END LINK

}//END CLASS

} )();
