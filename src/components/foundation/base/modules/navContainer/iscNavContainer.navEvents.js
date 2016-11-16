/**
 * Created by douglasgoodman on 11/24/14.
 */

( function() {
'use strict';

angular.module( 'iscNavContainer' )
  .constant( 'NAV_EVENTS', {
    showSecondaryNav      : 'iscShowSecondaryNav',
    hideSecondaryNav      : 'iscHideSecondaryNav',
    goToBeforeLoginPage   : 'iscGoToBeforeLoginPage',
    modalBackgroundClicked: 'iscModalBackgroundClicked',
    hideSideNavBar        : 'iscHideSideNavBar',
    tabLoaded             : 'iscTabLoaded'
  } );
} )();
