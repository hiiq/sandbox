( function() {
'use strict';

angular.module( 'isc.core' )
  .directive( 'iscFormsTypeahead', iscFormsTypeahead );

/**
   * @ngdoc directive
   * @memberOf isc.core
   * @param $timeout
   * @returns {{restrict: string, scope: {onSelect: string, apiSelect: string, listData: string, listField: string, limitToList: string, minlength: string, bypassInputFilter: string}, replace: boolean, transclude: boolean, link: link, controller: controller, controllerAs: string, bindToController: boolean, templateUrl: templateUrl}}
   */
function iscFormsTypeahead( $timeout ) {
  var UP_ARROW_KEY_CODE   = 38;
  var DOWN_ARROW_KEY_CODE = 40;
  var ENTER_KEY_CODE      = 13;

  return {
    restrict        : 'E',
    scope           : {
      onSelect         : '&',
      apiSelect        : '&',
      listData         : '=',
      listField        : '@',
      limitToList      : '@', // if truthy, disallows values that are not selected from listData
      minlength        : '=',
      bypassInputFilter: '=' // if truthy, result typeahead list filter is bypassed;
      // useful for dynamic typeahead lists that are produced
      // from an API call
    },
    transclude      : true,
    link            : link,
    controller      : controller,
    controllerAs    : 'typeaheadCtrl',
    bindToController: true,
    templateUrl     : function( elem, attrs ) {
      return attrs.templateUrl || 'forms/widgets/iscFormsTypeahead/iscFormsTypeahead.html';
    }
  };

  function controller( $filter ) {
    var self = this;

    self.controlHasFocus = false;
    self.showList        = true;

    self.select = function( item, omitInputFocus ) {
      callSelect( self.onSelect );
      callSelect( self.apiSelect );

      self.selectedItem = item;
      self.isDirty      = false;
      if ( !omitInputFocus ) {
        self.focusInput();
      }

      function callSelect( fn ) {
        var fnCall = fn();
        if ( fnCall ) {
          fnCall( item );
        }
      }
    };

    self.getFilteredList = function() {
      return self.bypassInputFilter ? self.listData : $filter( 'filter' )( self.listData, self.inputVal );
    };
  }

  function link( scope, elem, attr, ctrl ) {
    var input   = elem.find( 'input' );
    var list    = elem.find( '.isc-typeahead-list' );
    var currVal = "";

    input.on( 'input', updateList );

    input.on( 'keydown', focusFirstListItem );

    list.on( 'keydown', 'li', handleArrowUpDown );

    input.on( 'blur', blurControl );
    list.on( 'blur', 'li', blurControl );

    input.on( 'focus', focusControl );
    list.on( 'focus', 'li', focusControl );

    ctrl.focusInput = function() {
      input.focus();
    };

    list.width( input.outerWidth() );

    // ----------------------------
    // functions
    // ----------------------------

    function blurControl( event ) {
      $timeout( function() {
        ctrl.controlHasFocus = false;
      }, 0 );
      $timeout( function() {
        if ( !ctrl.controlHasFocus ) {
          ctrl.showList = false;
          // The user is clearing the field
          if ( !input.val() ) {
            ctrl.select( undefined, true );
          }
          else {
            // If dirty, this means the input's contents were changed but not selected from the list
            // If the input element has anything in it, reset it
            if ( ctrl.isDirty ) {
              if ( ctrl.limitToList ) {
                input.val( currVal );
              }
              else {
                ctrl.select( input.val(), true );
              }
            }
          }
        }
      }, 250 );
    }

    function focusControl( event ) {
      $timeout( function() {
        ctrl.controlHasFocus = ctrl.showList = true;
        // If no data has been entered, the script parameters for this control may have been set
        // by other controls, so update the list.
        currVal = input.val();
        if ( !currVal ) {
          updateList( event );
        }
      }, 0 );
    }

    function focusFirstListItem( event ) {
      if ( event.which === DOWN_ARROW_KEY_CODE ) {
        list.find( 'li:first' ).focus();
        event.preventDefault();
        event.stopPropagation();
      }
      else if ( event.which === ENTER_KEY_CODE ) {
        var currentList = ctrl.getFilteredList();
        if ( currentList.length ) {
          ctrl.select( currentList[0] );
        }
        event.preventDefault();
        event.stopPropagation();
      }
    }

    function updateList( event ) {//jshint ignore:line
      if ( !ctrl.minlength || input.val().length >= ctrl.minlength ) {
        scope.$apply( function() {
          ctrl.selectedItem = null;
          ctrl.isDirty      = true;
          ctrl.inputVal     = input.val();
        } );
      }
    }

    function handleArrowUpDown( event ) {
      var index = getIndex( event );
      if ( event.which === DOWN_ARROW_KEY_CODE && ( index + 1 ) < ctrl.getFilteredList().length ) {
        $( list.find( 'li' )[index + 1] ).focus();
        event.preventDefault();
      }
      else if ( event.which === UP_ARROW_KEY_CODE ) {
        if ( index === 0 ) {
          input.focus();
        }
        else {
          $( list.find( 'li' )[index - 1] ).focus();
          event.preventDefault();
        }
      }
      else if ( event.which === ENTER_KEY_CODE ) {
        ctrl.select( ctrl.getFilteredList()[index] );
      }
    }

    function getIndex( event ) {
      var target = $( event.target ),
          parent = target.parent();
      var index  = parent.find( 'li' ).index( target );
      return Math.max( index, 0 );
    }
  }
}

} )();
