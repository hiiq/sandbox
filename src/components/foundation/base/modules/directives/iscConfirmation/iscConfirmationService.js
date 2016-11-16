/**
 * Created by hzou on 9/16/15.
 */

( function() {
'use strict';

angular.module( 'isc.directives' )
  .provider( 'iscConfirmationService', iscConfirmationService );

// to configure app-wide options in app.config block
// IscConfirmationServiceProvider.setOptions({title: 'from app.js'});
/**
   * @ngdoc provider
   * @memberOf directives
   * @name iscConfirmationService
   * @returns {{setOptions: setOptions, $get: iscConfirmationServiceFactory}}
   */
function iscConfirmationService() {//jshint ignore:line

  var defaultOptions = getDefaultOptions();

  var provider = {
    setOptions: setOptions,
    $get      : iscConfirmationServiceFactory
  };
  return provider;

  // -----------------------
  // funcs
  /**
   * @memberOf iscConfirmationService
   * @param options
   * @returns {Object}
   *
   */
  function setOptions( options ) {
    return _.extend( defaultOptions, options );
  }

  /**
   * @memberOf iscConfirmationService
   * @param $q
   * @returns {{isOpen: boolean, show: show, hide: hide, resolve: resolve, reject: reject}}
   */
  function iscConfirmationServiceFactory( $q ) {

    var deferred;

    var model = {
      isOpen : false,
      show   : show,
      hide   : hide,
      resolve: resolve,
      reject : reject
    };

    return model;

    /**
     * @memberOf iscConfirmationService
     * @param message
     * @returns {*}
     */
    function show( message ) {
      deferred = $q.defer();

      model.options = angular.copy( defaultOptions );
      if ( _.isObject( message ) ) {
        _.extend( model.options, message );
      } else if ( _.isString( message ) ) {
        model.options.message = message;
      }
      if ( model.isOpen ) {
        model.isOpen = false;
      }
      model.isOpen = true;
      return deferred.promise;
    }

    /**
     * @memberOf iscConfirmationService
     */
    function hide() {
      model.isOpen = false;
    }

    /**
     * @memberOf iscConfirmationService
     * @param data
     */
    function resolve( data ) {
      model.isOpen = false;
      deferred.resolve( data || true );
    }

    /**
     * @memberOf iscConfirmationService
     * @param data
     */
    function reject( data ) {
      model.isOpen = false;
      deferred.reject( data || true );
    }
  }

  /**
   * @memberOf iscConfirmationService
   * @returns {{title: string, message: string, btnOkText: string, btnCancelText: string}}
   */
  function getDefaultOptions() {
    return {
      title        : /* i18nextract */'Please confirm your decision',
      message      : /* i18nextract */'Are you sure you want continue?',
      btnOkText    : /* i18nextract */"OK",
      btnCancelText: /* i18nextract */"Cancel"
    };
  }
}//END CLASS

} )();
