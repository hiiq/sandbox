( function() {
'use strict';

angular
  .module( 'isc.notification' )
  .constant( 'NOTIFICATION', {
    type    : {
      success: 'success',
      warning: 'warning',
      alert  : 'alert',
      dark   : 'dark'
    },
    position: {
      topLeft     : 'top-left',
      topMiddle   : 'top-middle',
      topRight    : 'top-right',
      bottomLeft  : 'bottom-left',
      bottomMiddle: 'bottom-middle',
      bottomRight : 'bottom-right'
    }
  } );
} )();
