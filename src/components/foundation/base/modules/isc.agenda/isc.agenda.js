/**
 * Created by Natan Aviezri on 5/5/2016, 7:43:36 AM.
 */

( function() {
'use strict';

angular
  .module( 'isc.directives' )
  .directive( 'agenda', agenda );

/**
   * usage:
   *   <agenda config="plannerCtrl.config" data="plannerCtrl.vitals"></agenda>
   *
   * config = {
      timeKey: 'datetime', //used to sort
      groupBy: 'date', //used to group. Needs to be a primitive value
      title  : 'Agenda', //used as header title
      itemTemplateUrl: 'path/to/template', //for specifying alternative template
      headerTemplateUrl: 'path/to/template.html'

    };
   * data = [{
      datetime: new Date(), //used to group
      date: "2012-02-02", //used to group. Needs to be a primitive value
      title: "Agenda"  //used as header title
   * }]
   */
/* @ngInject */
function agenda() {//jshint ignore:line

  var directive = {
    restrict        : 'EA',
    scope           : {},
    bindToController: {
      "agenda" : "=data",
      "config" : "=",
      "options": "=?" //can be used to extend functionality when used with custom templateUrl
    },
    controller      : controller,
    controllerAs    : 'agendaCtrl',
    templateUrl     : function( elem, attrs ) {
      return attrs.templateUrl || 'isc.agenda/isc.agenda.html';
    }
  };

  return directive;

  // ----------------------------
  // functions
  // ----------------------------
  function controller() {
    var self = this;
  }

}//END CLASS

} )();
