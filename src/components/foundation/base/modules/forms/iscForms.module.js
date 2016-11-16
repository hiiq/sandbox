( function() {
'use strict';

angular.module( 'isc.forms', ['ui.router', 'isc.states'] )
  .run( function( iscFormlyFoundationTemplates, iscCustomConfigService, iscStateInit, iscFormsCodeTableApi ) {
    iscFormlyFoundationTemplates.init();

    var config = iscCustomConfigService.getConfig();
    if ( _.get( config, 'forms.initCodeTables' ) ) {
      iscStateInit.config( {
        initFunctions: {
          'codeTableApi': iscFormsCodeTableApi.loadAll
        }
      } );
    }
  } );

} )();
