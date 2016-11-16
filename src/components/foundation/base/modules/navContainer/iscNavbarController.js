( function() {
'use strict';

// ------------------------------------------
// module injection
// ------------------------------------------
angular.module( 'iscNavContainer' )
  .controller( 'iscNavbarController', iscNavbarController );

/**
   * @ngdoc controller
   * @memberOf iscNavContainer
   * @param devlog
   * @param $scope
   * @param $state
   * @param $rootScope
   * @param iscNavContainerModel
   * @param iscCustomConfigService
   * @param iscCustomConfigHelper
   * @param iscUiHelper
   * @param iscSessionModel
   * @param AUTH_EVENTS
   */
/* @ngInject */
function iscNavbarController( devlog, $scope, $state, $rootScope, iscNavContainerModel,
  iscCustomConfigService, iscCustomConfigHelper, iscUiHelper, iscSessionModel,
  AUTH_EVENTS ) {
  var channel = devlog.channel( 'iscNavbarController' );

  channel.debug( 'iscNavbarController LOADED' );

  var self = this;

  angular.extend( self, {
    iscUiHelper              : iscUiHelper,
    configService            : iscCustomConfigService,
    sessionModel             : iscSessionModel,

    sectionTranslationKey    : '',
    navigateToUserLandingPage: iscNavContainerModel.navigateToUserLandingPage,

    getTabs                  : iscNavContainerModel.getTopNav,
    userRoles                : [],
    logout                   : logout,

    setPageState             : setPageState,
    setTabActiveState        : setTabActiveState
  } );

  setShowRoles();

  /**
   * @memberOf iscNavbarController
   */
  function logout() {
    channel.debug( 'iscNavbarController.logout' );
    $rootScope.$emit( AUTH_EVENTS.logout );
  }

  /**
   * @memberOf iscNavbarController
   */
  function setShowRoles() {
    channel.debug( 'iscNavbarController.isAuthenticated' );
    self.user      = iscSessionModel.getCurrentUser();
    self.userRoles = _.get( self.user, 'Roles', [self.user.userRole] );
    self.showRoles = self.userRoles.length > 1;
  }

  /**
   * @memberOf iscNavbarController
   * @param name
   */
  function setPageState( name ) {
    self.setTabActiveState( name, self.getTabs() );
    self.sectionTranslationKey = iscCustomConfigHelper.getSectionTranslationKeyFromName( name );
  }

  /**
   * @memberOf iscNavbarController
   * @param state
   */
  function setTabActiveState( state ) {
    channel.debug( 'iscNavbarController.setTabActiveState' );
    self.iscUiHelper.setTabActiveState( state, self.getTabs() );
  }

  // -----------------------------
  // listeners
  // -----------------------------

  //
  $rootScope.$on( AUTH_EVENTS.sessionChange, function() {
    self.isAuthenticated = iscSessionModel.isAuthenticated();
  } );

  $rootScope.$on( AUTH_EVENTS.sessionResumedSuccess, function() {
    self.isAuthenticated = iscSessionModel.isAuthenticated();
  } );

  //
  $rootScope.$on( '$stateChangeSuccess', function( event, toState, toParams, fromState, fromParams ) {
    channel.debug( 'iscNavbarController.$stateChangeSuccess', arguments );
    self.setPageState( toState.name );
    setShowRoles();
  } );

  // when you refresh the page, this will reset the active state of the selected tab
  $scope.$evalAsync( function() {
    channel.debug( 'iscNavbarController setting page name to', $state.$current.name );
    self.setPageState( $state.$current.name );
  } );

} // END CLASS

} )();

