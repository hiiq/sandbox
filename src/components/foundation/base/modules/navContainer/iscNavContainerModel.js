/**
 * Created by dgoodman on 2/3/15.
 */

( function() {
'use strict';

// ----------------------------
// injection
// ----------------------------

angular.module( 'iscNavContainer' )
  .factory( 'iscNavContainerModel', iscNavContainerModel );

/**
   * @ngdoc factory
   * @memberOf iscNavContainer
   * @param devlog
   * @param $state
   * @param iscCustomConfigService
   * @param iscSessionModel
   * @returns {{getTopNav: getTopNav, getVersionInfo: getVersionInfo, setVersionInfo: setVersionInfo, navigateToUserLandingPage: navigateToUserLandingPage}}
   */
function iscNavContainerModel( devlog, $state, iscCustomConfigService, iscSessionModel, $window, $location, iscAuthorizationModel ) {
  var channel = devlog.channel( 'iscNavContainerModel' );
  channel.debug( 'iscNavContainerModel LOADED' );

  // ----------------------------
  // vars
  // ----------------------------
  var topNavArr = {};
  var versionInfo;

  // ----------------------------
  // class factory
  // ----------------------------

  var model = {

    getTopNav                : getTopNav,

    getVersionInfo           : getVersionInfo,
    setVersionInfo           : setVersionInfo,

    navigateToUserLandingPage: navigateToUserLandingPage
  };

  return model;

  // ----------------------------
  // functions
  // ----------------------------
  /**
   * @memberOf iscNavContainerModel
   */
  function navigateToUserLandingPage( reload ) {
    var currentUserRole = iscSessionModel.getCurrentUserRole();
    var landingPage     = iscCustomConfigService.getConfigSection( 'landingPages' )[currentUserRole];
    if ( !_.isNil( landingPage ) ) {
      var currentState = $state.current.state;
      // do a full page reload if `reload` flag is passed in
      // or if user role is anonymous ("*") and is going to the user's landing page
      if ( reload || ( currentState !== landingPage && currentUserRole === "*" ) ) {

        // get the landing page state definition
        // update location.hash to landing page state's url and force reload the page
        // and let app initialization set the $state based on route
        // this ensures the $state change happens only once post window reload

        var landingPageState  = $state.get( landingPage );
        $window.location.hash = '#/' + landingPageState.url;
        $window.location.reload( true );

      } else {
        $state.go( landingPage );
      }
    } else {
      channel.error( 'No landing page found for', _.wrapText( currentUserRole ), 'role' );
    }
  }

  /**
   * @memberOf iscNavContainerModel
   * @returns {*}
   */
  function getTopNav() {
    // "*", "user"
    var currentUserRole = iscSessionModel.getCurrentUserRole();
    // caching
    if ( !topNavArr[currentUserRole] ) {
      //returns a list of state names ['authenticated.home', '!authenticated.secret']
      var topTabStates           = iscCustomConfigService.getConfigSection( 'topTabs', currentUserRole );
      //the actual array of permitted state objects
      topNavArr[currentUserRole] = _.uniq( _.reduce( topTabStates, getUserTabs, [] ) );
    }
    return topNavArr[currentUserRole];

    /**
     * if state has displayOrder and user is authorized to access it.
     * This is used as part of _.reduce()
     * @param returnArray
     * @param stateName
     * @returns {*}
     */
    function getUserTabs( returnArray, stateName ) {
      var stateObj = $state.get( stateName );   //get state from name
      if ( stateObj && stateObj.displayOrder && iscAuthorizationModel.isAuthorized( stateName ) ) {
        returnArray.push( stateObj );
      }
      return returnArray;
    }
  }

  /**
   * @memberOf iscNavContainerModel
   * @returns {*}
   */
  function getVersionInfo() {
    return versionInfo;
  }

  /**
   * @memberOf iscNavContainerModel
   * @param val
   */
  function setVersionInfo( val ) {
    versionInfo = val;
  }
}//END CLASS

} )();

