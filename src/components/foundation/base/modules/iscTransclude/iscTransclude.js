/**
 * Created by Henry Zou on 9/17/15.
 *
 * This is a highly generic multi-transclusion directive. It defaults to 'iscTransclude/iscGridFormItem.html' as template,
 * but the template url is also parametrized. It simply maps the templates' html children node with the actual usage.
 *
 * Any transclusion template content defined in the iscGridFormItem.html are used default values. They will persist if not overriden by transcluded content
 *
 * USAGE --- DEFAULT TEMPLATE - with single control transclusion---
 *
 * INPUT Type:
 <isc-transclude config-item-translation-key='Medication_Medication_Dose'>
 <control-template>
 <input type='text' ng-model='iscRowCtrl.editModeData['DoseAndUnits']'>
 </control-template>
 </isc-transclude>

 * DROPDOWN Type
 <isc-transclude config-item-translation-key='Medication_Medication_Route'>
 <control-template>
 <cmc-dropdown list-data='iscTblCtrl.tableConfig.getColumnDropList('Route')'
 display-field='Description'
 model='iscRowCtrl.editModeData['Route']'
 dropdown-id='selectRoute'>
 </cmc-dropdown>
 </control-template>
 </isc-transclude>

 *TEXTAREA Type
 <isc-transclude config-item-translation-key='Medication_Medication_Details'>
 <control-template>
 <textarea ng-model='iscRowCtrl.editModeData['Comments']'></textarea>
 </control-template>
 </isc-transclude>

 * INPUT Type (with custom css classes):
 <isc-transclude config-item-translation-key='Medication_Medication_Dose' config="{'labelWrapperClass':'grid-block medium-4 large-4', 'inputWrapperClass'='grid-block medium-8 large-8'}">
 <control-template>
 <input type='text' ng-model='iscRowCtrl.editModeData['DoseAndUnits']'>
 </control-template>
 </isc-transclude>

 * CALLBACK FUNCTION
 * Any attribute prefixed with 'config-item-fn' will be treated as a function parameter
 * SEE: src/app/modules/iscTransclude/iscGridFormItemFilter.html
 <isc-transclude config-item-fn-clearfn='iscRowCtrl.editModeData.DoseAndUnits = null'">
 <control-template>
 <input type='text' ng-model='iscRowCtrl.editModeData['DoseAndUnits']'>
 </control-template>
 </isc-transclude>

 * USAGE --- DEFAULT TEMPLATE - with label and control transclusions ---
 <isc-transclude config-item-translation-key='Medication_Medication_Details'>
 <label-template ng-transclude isc-transclude>
 <span class='some-custom-css'> i am using a span instead of a label</span>
 </label-template>
 <control-template>
 <textarea ng-model='iscRowCtrl.editModeData['Comments']'></textarea>
 </control-template>
 </isc-transclude>
 *
 *
 * USAGE --- EXTERNAL TEMPLATE URL ----
 *
 * TEMPLATE: iscTransclude/iscGridFormItem2.html content

 I am a template file with 3 transclusion templates
 $$
 <div ng-transclude isc-transclude="label-template"></div>
 ||
 <div ng-transclude isc-transclude="control-template"></div>
 &&
 <div ng-transclude isc-transclude="custom-template"></div>
 **

 *
 * Transclusion all 3 portions
 <isc-transclude template-url='iscTransclude/iscGridFormItem2.html'>
 <label-template>i am a label</label-template>
 <control-template>i am a control</control-template>
 <custom-template>i am a custom ...</custom-template>
 </isc-transclude>

 * TRANSCLUSION OUTPUT:
 <isc-transclude template-url='iscTransclude/iscGridFormItem2.html' class='ng-isolate-scope'>
 I am a template file with 3 transclusion templates
 $$
 <div ng-transclude isc-transclude="label-template">
 <label-template class='ng-scope'>
 i am a label
 </label-template>
 </div>
 ||
 <div ng-transclude isc-transclude="control-template">
 <control-template class='ng-scope'>
 i am a control
 </control-template>
 </div>
 &&
 <div ng-transclude isc-transclude="custom-template">
 <custom-template class='ng-scope'>
 i am a custom ...
 </custom-template>
 </div>
 **
 </isc-transclude>
 */

( function() {
'use strict';
// ----------------------------
// injection
// ----------------------------

angular.module( 'isc.directives' )
  .directive( 'iscTransclude', iscTransclude );

/* @ngInject */
/**
   * @ngdoc directive
   * @memberOf isc.directives
   * @description
   * * This is a highly generic multi-transclusion directive. It defaults to 'iscTransclude/iscGridFormItem.html' as template,
   * but the template url is also parametrized. It simply maps the templates' html children node with the actual usage.
   *
   * Any transclusion template content defined in the iscGridFormItem.html are used default values. They will persist if not overriden by transcluded content
   *
   * USAGE --- DEFAULT TEMPLATE - with single control transclusion---
   *
   * INPUT Type:
   * <isc-transclude config-item-translation-key='Medication_Medication_Dose'>
   *  <control-template>
   *  <input type='text' ng-model='iscRowCtrl.editModeData['DoseAndUnits']'>
   *    </control-template>
   * </isc-transclude>
   *
   * DROPDOWN Type
   * <isc-transclude config-item-translation-key='Medication_Medication_Route'>
   *  <control-template>
   *    <cmc-dropdown list-data='iscTblCtrl.tableConfig.getColumnDropList('Route')'
   *       display-field='Description'
   *       model='iscRowCtrl.editModeData['Route']'
   *       dropdown-id='selectRoute'>
   *    </cmc-dropdown>
   *  </control-template>
   * </isc-transclude>
   *
   *TEXTAREA Type
   *<isc-transclude config-item-translation-key='Medication_Medication_Details'>
   * <control-template>
   *  <textarea ng-model='iscRowCtrl.editModeData['Comments']'></textarea>
   * </control-template>
   *</isc-transclude>
   *
   * INPUT Type (with custom css classes):
   *  <isc-transclude config-item-translation-key='Medication_Medication_Dose' config="{'labelWrapperClass':'grid-block medium-4 large-4', 'inputWrapperClass'='grid-block medium-8 large-8'}">
   *   <control-template>
   *     <input type='text' ng-model='iscRowCtrl.editModeData['DoseAndUnits']'>
   *   </control-template>
   * </isc-transclude>
   *
   * CALLBACK FUNCTION
   * Any attribute prefixed with 'config-item-fn' will be treated as a function parameter
   * SEE: src/app/modules/iscTransclude/iscGridFormItemFilter.html
   *<isc-transclude config-item-fn-clearfn='iscRowCtrl.editModeData.DoseAndUnits = null'">
   *  <control-template>
   *    <input type='text' ng-model='iscRowCtrl.editModeData['DoseAndUnits']'>
   *  </control-template>
   *</isc-transclude>
   *
   * USAGE --- DEFAULT TEMPLATE - with label and control transclusions ---
   *<isc-transclude config-item-translation-key='Medication_Medication_Details'>
   *  <label-template ng-transclude isc-transclude>
   *   <span class='some-custom-css'> i am using a span instead of a label</span>
   * </label-template>
   * <control-template>
   *  <textarea ng-model='iscRowCtrl.editModeData['Comments']'></textarea>
   * </control-template>
   *</isc-transclude>
   *
   *
   * USAGE --- EXTERNAL TEMPLATE URL ----
   *
   * TEMPLATE: iscTransclude/iscGridFormItem2.html content
   *
   * I am a template file with 3 transclusion templates
   * $$
   *  <div ng-transclude isc-transclude="label-template"></div>
   *  ||
   *  <div ng-transclude isc-transclude="control-template"></div>
   *  &&
   *  <div ng-transclude isc-transclude="custom-template"></div>
   **
   *
   *
   * Transclusion all 3 portions
   *<isc-transclude template-url='iscTransclude/iscGridFormItem2.html'>
   * <label-template>i am a label</label-template>
   *  <control-template>i am a control</control-template>
   *  <custom-template>i am a custom ...</custom-template>
   *</isc-transclude>
   *
   * TRANSCLUSION OUTPUT:
   *<isc-transclude template-url='iscTransclude/iscGridFormItem2.html' class='ng-isolate-scope'>
   *  I am a template file with 3 transclusion templates
   *  $$
   * <div ng-transclude isc-transclude="label-template">
   *  <label-template class='ng-scope'>
   *    i am a label
   *  </label-template>
   * </div>
   *   ||
   * <div ng-transclude isc-transclude="control-template">
   *   <control-template class='ng-scope'>
   *     i am a control
   *   </control-template>
   * </div>
   * &&
   *  <div ng-transclude isc-transclude="custom-template">
   *    <custom-template class='ng-scope'>
   *     i am a custom ...
   *    </custom-template>
   *   </div>
   *
   *</isc-transclude>
   *
   * @param $parse
   * @returns {{restrict: string, transclude: boolean, scope: boolean, compile: compile, controller: directive.controller, controllerAs: string, templateUrl: directive.templateUrl}}
   */
function iscTransclude( $parse ) {

  // ----------------------------
  // vars
  // ----------------------------

  // ----------------------------
  // class factory
  // ----------------------------
  var directive = {
    restrict    : 'E',
    transclude  : true,
    scope       : true,
    compile     : compile,
    controller  : function() {
    },
    controllerAs: 'iscTranscludeCtrl',
    templateUrl : function( element, attrs ) {
      return attrs.templateUrl || 'iscTransclude/iscGridFormItem.html';
    }
  };

  return directive;

  // ----------------------------
  // functions
  // ----------------------------

  function compile() {
    return {
      pre: pre
    };
  }

  function pre( scope, element, attrs, iscTranscludeCtrl ) {
    var configItemKey = 'configItem';
    scope.$watch( attrs.config, updateConfig, true );

    function updateConfig( config, oldConfig ) {

      if ( _.isString( config ) ) {
        iscTranscludeCtrl.config = angular.copy( scope.$eval( config ) || {} );
      } else {
        iscTranscludeCtrl.config = angular.copy( config || {} );
      }

      config = iscTranscludeCtrl.config;

      var attrOverrides = getAttributeOverrides( attrs );
      _.extend( config, attrOverrides );

    }

    function getAttributeOverrides( attrs ) {
      var propKey,
          firstChar,
          retOverrides = {};
      _.forOwn( attrs, function( propValue, propName ) {
        if ( _.startsWith( propName, configItemKey ) ) {

          propKey = _.camelCase( propName.substr( configItemKey.length ) );

          firstChar = _.first( propValue );
          //remove parameter type indicator
          if ( _.includes( ['@', '=', '&'], firstChar ) ) {
            propValue = propValue.substring( 1 );
          }

          // function
          if ( firstChar === '&' ) {
            propValue = $parse( propValue );
          }
          // expression
          else if ( firstChar === '=' ) {
            propValue = scope.$parent.$eval( propValue );
          }

          // treat else the same as '@', just without the need to remove '@' char
          retOverrides[propKey] = propValue;
        }
      } );

      return retOverrides;
    }

  }

}//END CLASS

} )();
