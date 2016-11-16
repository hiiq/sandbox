/**
 * Created by hzou on 07/13/15.
 */

( function() {
'use strict';

angular.module( 'isc.table' )
  .controller( 'iscTableRowController', iscTableRowController );

/* @ngInject */
/**
   * @ngdoc controller
   * @memberOf isc.table
   * @param $scope
   */
function iscTableRowController( devlog, $scope ) {
  var channel = devlog.channel( 'iscTableRowController' );

  // ----------------------------
  // vars
  // ----------------------------

  var self          = this;
  self.inEditMode   = false;
  self.editModeData = angular.copy( self.dataItem );

  self.editModeCommands = {};

  self.onCommand = onCommand;

  // ----------------------------
  // functions
  // ----------------------------

  /**
   * @memberOf iscTableRowController
   * @param commandName
   * @param event
   * @param domCallback
   */
  function onCommand( commandName, event, domCallback ) {
    var rest = _.toArray( arguments );
    rest     = _.slice( rest, 3 );
    rest.unshift( self );
    rest.unshift( event );  //end result => event, self, [rest]

    var callback = getCommandCallback( commandName, domCallback );
    switch ( commandName ) {
      case 'create':
        if ( angular.isFunction( callback ) ) {
          callback.apply( self, rest );
        } else {
          defaultCreateCallback.apply( self, rest );
        }

      break;
      case 'edit':
        if ( angular.isFunction( callback ) ) {
          callback.apply( self, rest );
        } else {
          defaultEditCallback.apply( self, rest );
        }
      break;

      case 'remove':
        if ( angular.isFunction( callback ) ) {
          callback.apply( self, rest );
        } else {
          defaultRemoveCallback.apply( self, rest );
        }
      break;

      case 'save':
        if ( angular.isFunction( callback ) ) {
          callback.apply( self, rest );
        } else {
          defaultSaveCallback.apply( self, rest );
        }
      break;

      case 'cancelEdit':
        if ( angular.isFunction( callback ) ) {
          callback.apply( self, rest );
        } else {
          defaultCancelEditCallback.apply( self, rest );
        }
      break;

      default:
        if ( angular.isFunction( callback ) ) {
          callback.apply( self, rest );
        } //else do nothing
    }
    /**
     * @memberOf iscTableRowController
     * @param command
     * @param domCallback
     * @returns {*}
     */
    function getCommandCallback( command, domCallback ) {
      var callback       = domCallback;
      var commandsColumn = _.find( self.iscTblCtrl.tableConfig.columns, { type: 'commands' } );
      if ( _.isNil( callback ) && commandsColumn ) {
        callback = _.get( commandsColumn, 'commands.' + command + '.callback' );

      }
      return callback;
    }
  }

  /**
   * @memberOf iscTableRowController
   * @param event
   * @description
   * This approach is the pessimistic approach, UI/model is only updated/refreshed
   * when api calls are successful. The changes are wrapped in the 'then' blocks.
   */
  function defaultRemoveCallback( event ) {
    var apicall = _.get( self, 'iscTblCtrl.tableConfig.api.remove', angular.noop );
    apicall( self.dataItem ).then( function() {
      self.iscTblCtrl.deleteRow( self.dataItem );
    } );
  }

  /**
   * @memberOf iscTableRowController
   * @param event
   */
  function defaultCancelEditCallback( event ) {
    self.editModeData = {};
    self.inEditMode   = false;
    self.iscTblCtrl.cancelEdit();
  }

  /**
   * @memberOf iscTableRowController
   * @param event
   */
  function defaultCreateCallback( event ) {
    if ( _.isNil( self.iscTblCtrl.dataItem ) ) {
      $scope.dataItem = self.dataItem = self.iscTblCtrl.createRow();
      self.editModeData = angular.copy( self.dataItem );
      self.inEditMode   = self.iscTblCtrl.tableConfig.editable === true ? 'inline' : self.iscTblCtrl.tableConfig.editable;
    }
  }

  /**
   * @memberOf iscTableRowController
   * @param event
   */
  function defaultEditCallback( event ) {
    if ( _.isNil( self.iscTblCtrl.dataItem ) ) {
      self.editModeData = angular.copy( self.dataItem );
      self.inEditMode   = self.iscTblCtrl.tableConfig.editable === true ? 'inline' : self.iscTblCtrl.tableConfig.editable;
      self.iscTblCtrl.editRow( self.dataItem );
    }
  }

  /**
   * @memberOf iscTableRowController
   * @param event
   */
  function defaultSaveCallback( event ) {
    var apicall;

    if ( angular.equals( self.editModeData, self.dataItem ) ) {
      self.editModeData = {};
      self.inEditMode   = false;
      self.iscTblCtrl.cancelEdit();
    }
    else if ( self.dataItem.isNew ) {
      _.set( self, 'editModeData.isNew', false );

      apicall = _.get( self, 'iscTblCtrl.tableConfig.api.create', angular.noop );
      apicall( self.editModeData ).then( function() {
        self.iscTblCtrl.addRow( self.editModeData );

        self.editModeData = {};
        self.inEditMode   = false;
      } );
    }
    else {
      apicall = _.get( self, 'iscTblCtrl.tableConfig.api.update', angular.noop );
      apicall( self.editModeData, self.dataItem ).then( function() {
        self.iscTblCtrl.updateRow( self.editModeData, self.dataItem );

        self.editModeData = {};
        self.inEditMode   = false;
      } );
    }
  }
}

} )();
