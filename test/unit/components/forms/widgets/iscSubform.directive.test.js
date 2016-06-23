(function() {
  'use strict';

  //--------------------
  describe( 'iscSubform', function() {
    var suiteForm,
        suiteInternal,
        suiteSubform;

    beforeEach( module(
      'formly', 'foundation',
      'isc.http', 'isc.forms', 'iscNavContainer', 'isc.authorization', 'isc.notification', 'isc.directives',
      'isc.templates', 'isc.fauxTable', 'isc.filters',
      function( $provide, devlogProvider ) {
        $provide.value( '$log', console );
        $provide.value( 'apiHelper', mockApiHelper );
        $provide.value( 'iscCustomConfigService', mockCustomConfigService );
        devlogProvider.loadConfig( mockCustomConfigService.getConfig() );
      } )
    );

    beforeEach( inject( function( $rootScope, $compile, $window, $httpBackend, $timeout,
                                  formlyApiCheck, formlyConfig,
                                  iscFormDataApi, iscNotificationService, iscFormsValidationService ) {
      formlyConfig.disableWarnings   = true;
      formlyApiCheck.config.disabled = true;

      suiteMain = window.createSuite( {
        $window     : $window,
        $compile    : $compile,
        $httpBackend: $httpBackend,
        $timeout    : $timeout,
        $rootScope  : $rootScope,

        formDataApi        : iscFormDataApi,
        notificationService: iscNotificationService,
        validationService  : iscFormsValidationService
      } );
      mockFormResponses( suiteMain.$httpBackend );
    } ) );

    describe( 'iscSubform - cancel', function() {
      beforeEach( function() {
        createDirectives( getConfiguredForm() );
      } );

      //--------------------
      it( 'should close a subform when cancel is clicked', function() {
        // Open a subform of each editAs type, enter a field, and click cancel
        test( 'test.SubformPage', true );
        test( 'test.SubformInline' );
        test( 'test.SubformModal' );

        function test( subformName, isFullPage ) {
          var suite        = suiteSubform,
              subform      = getControlByName( suite, subformName ).filter( '.subform' ),
              addButton    = subform.find( 'button.embedded-form-add' ),
              model        = _.get( suite.controller.model, subformName ),
              cancelButton = null,
              shownForm    = null,
              inputField   = null;

          expect( addButton.length ).toBe( 1 );
          expect( subform.length ).toBe( 1 );
          expect( model ).toBeUndefined(); // no mock data exists

          // Open the subform
          addButton.click();
          digest( suite );

          selectElements();

          // Verify it opened, change a field
          if ( isFullPage ) {
            spyOn( suite.controller.childConfig, 'onCancel' ).and.callThrough();
          }
          else {
            expect( shownForm.length ).toBe( 1 );
          }
          expect( cancelButton.length ).toBe( 1 );
          expect( inputField.length ).toBe( 1 );

          // Change a field and click cancel to close it
          inputField.val( 'some value' ).trigger( 'change' );
          cancelButton.click();
          digest( suite );
          selectElements();

          expect( cancelButton.length ).toBe( 0 );
          expect( inputField.length ).toBe( 0 );
          expect( model ).toBeUndefined(); // still no mock data

          if ( isFullPage ) {
            expect( suite.controller.childConfig.onCancel ).toHaveBeenCalled();
          }
          else {
            expect( shownForm.length ).toBe( 0 );
          }

          function selectElements() {
            cancelButton = suite.element.find( '.embedded-form-cancel' );
            shownForm    = subform.find( '.formly' );
            inputField   = getControlByName( suite, 'aField' );
          }
        }
      } );
    } );


    //--------------------
    describe( 'iscSubform - CRUD', function() {
      beforeEach( function() {
        createDirectives( getFormWithData() );
      } );

      //--------------------
      it( 'should allow entering of data in a subform', function() {
        // Open a subform of each editAs type, enter a field, save, then edit
        test( 'test.SubformPage', true );
        test( 'test.SubformInline' );
        test( 'test.SubformModal' );

        function test( subformName, isFullPage ) {
          var suite      = suiteSubform,
              subform    = getControlByName( suite, subformName ).filter( '.subform' ),
              addButton  = subform.find( 'button.embedded-form-add' ),
              model      = _.get( suite.controller.model, subformName ),
              saveButton = null,
              shownForm  = null,
              inputField = null;

          expect( addButton.length ).toBe( 1 );
          expect( subform.length ).toBe( 1 );
          expect( model.length ).toBe( 1 ); // 1 mock record exists

          // Open the subform
          addButton.click();
          digest( suite );
          selectElements();

          // Verify it opened, change a field
          if ( isFullPage ) {
            spyOn( suite.controller.childConfig, 'onSubmit' ).and.callThrough();
          }
          else {
            expect( shownForm.length ).toBe( 1 );
          }
          expect( saveButton.length ).toBe( 1 );
          expect( inputField.length ).toBe( 1 );

          // Change a field and click submit to save it
          inputField.val( 'some value' ).trigger( 'change' );
          saveButton.click();
          digest( suite );
          selectElements();

          expect( saveButton.length ).toBe( 0 );
          expect( inputField.length ).toBe( 0 );

          if ( isFullPage ) {
            expect( suite.controller.childConfig.onSubmit ).toHaveBeenCalled();
          }
          else {
            expect( shownForm.length ).toBe( 0 );
          }
          expect( model.length ).toBe( 2 ); // should now be 2 mock records

          function selectElements() {
            saveButton = suite.element.find( '.embedded-form-save' );
            shownForm  = subform.find( '.formly' );
            inputField = getControlByName( suite, 'aField' );
          }
        }
      } );

      //--------------------
      it( 'should allow editing of data in a subform', function() {
        // Open a subform of each editAs type, enter a field, save, then edit
        test( 'test.SubformPage', true );
        test( 'test.SubformInline' );
        test( 'test.SubformModal' );

        function test( subformName, isFullPage ) {
          var suite      = suiteSubform,
              subform    = getControlByName( suite, subformName ).filter( '.subform' ),
              editButton = subform.find( 'button.embedded-form-edit' ),
              model      = _.get( suite.controller.model, subformName ),
              saveButton = null,
              shownForm  = null,
              inputField = null;

          expect( editButton.length ).toBe( 1 );
          expect( subform.length ).toBe( 1 );
          expect( model.length ).toBe( 1 ); // 1 mock record exists

          // Open the subform
          editButton.click();
          digest( suite );
          selectElements();

          // Verify it opened, change a field
          if ( isFullPage ) {
            spyOn( suite.controller.childConfig, 'onSubmit' ).and.callThrough();
          }
          else {
            expect( shownForm.length ).toBe( 1 );
          }
          expect( saveButton.length ).toBe( 1 );
          expect( inputField.length ).toBe( 1 );

          // Change a field and click submit to save it
          inputField.val( 'some different value' ).trigger( 'change' );
          saveButton.click();
          digest( suite );
          selectElements();

          expect( saveButton.length ).toBe( 0 );
          expect( inputField.length ).toBe( 0 );

          if ( isFullPage ) {
            expect( suite.controller.childConfig.onSubmit ).toHaveBeenCalled();
          }
          else {
            expect( shownForm.length ).toBe( 0 );
          }
          expect( model.length ).toBe( 1 ); // still the 1 mock record

          function selectElements() {
            saveButton = suite.element.find( '.embedded-form-save' );
            shownForm  = subform.find( '.formly' );
            inputField = getControlByName( suite, 'aField' );
          }
        }
      } );

      //--------------------
      it( 'should allow deletion of data in a subform', function() {
        test( 'test.SubformPage' );
        test( 'test.SubformInline' );
        test( 'test.SubformModal' );

        function test( subformName ) {
          var suite        = suiteSubform,
              subform      = getControlByName( suite, subformName ).filter( '.subform' ),
              deleteButton = subform.find( 'button.embedded-form-delete' ),
              model        = _.get( suite.controller.model, subformName ),
              saveButton   = null,
              shownForm    = null,
              inputField   = null;

          expect( deleteButton.length ).toBe( 1 );
          expect( subform.length ).toBe( 1 );
          expect( model.length ).toBe( 1 ); // 1 mock record exists

          // Delete the record
          deleteButton.click();
          digest( suite );
          selectElements();

          expect( model.length ).toBe( 0 ); // model should be empty now

          function selectElements() {
            saveButton = suite.element.find( '.embedded-form-save' );
            shownForm  = subform.find( '.formly' );
            inputField = getControlByName( suite, 'aField' );
          }
        }
      } );

      //--------------------
      it( 'should update the data in built-in components', function() {
        var suite       = suiteSubform,
            subformName = 'form.components',
            subform     = getControlByName( suite, subformName ).filter( '.subform' ),
            formModel   = _.get( suite.controller.model, subformName );

        testInput( 'templates.input.text' );
        testInput( 'templates.input.date' );

        testCheckbox( 'templates.checkbox' );

        testMultiCheckbox( 'templates.multiCheckbox.primitiveValue' );
        testMultiCheckbox( 'templates.multiCheckbox.objectValue' );

        testRadio( 'templates.radio.primitiveValue' );
        testRadio( 'templates.radio.objectValue' );

        testSelect( 'templates.select.primitiveValue' );
        testSelect( 'templates.select.objectValue' );

        testInput( 'templates.textarea' );

        testTypeahead( 'templates.typeahead.primitiveValue' );
        testTypeahead( 'templates.typeahead.objectValue' );

        function testInput( controlName ) {
          var control = getControlByName( suite, controlName ),
              model   = _.get( formModel, controlName ),
              newText = 'changing the text';

          expect( control.length ).toBe( 1 );
          expect( control.val() ).toEqual( model );
          expect( model ).not.toEqual( newText );

          control.val( newText ).trigger( 'change' );
          digest( suite );

          model = _.get( formModel, controlName );
          expect( model ).toEqual( newText );
        }

        function testCheckbox( controlName ) {
          var control = getControlByName( suite, controlName ),
              model   = _.get( formModel, controlName );

          expect( control.length ).toBe( 1 );
          expect( control.is( ':checked' ) ).toEqual( true );
          expect( model ).toEqual( true );

          control.click();
          digest( suite );

          model = _.get( formModel, controlName );
          expect( model ).toEqual( false );
        }

        function testMultiCheckbox( controlName ) {
          var control      = getControlByName( suite, controlName ).filter( 'input[type="checkbox"]' ),
              firstControl = control.first(),
              model        = _.get( formModel, controlName );

          // 3 options on mock multi checkboxes;
          // 2 are checked, one of which is the first one
          expect( control.length ).toBe( 3 );
          expect( firstControl.is( ':checked' ) ).toBe( true );
          expect( control.filter( ':checked' ).length ).toEqual( 2 );
          expect( model.length ).toEqual( 2 );

          firstControl.click();
          digest( suite );

          model = _.get( formModel, controlName );
          expect( firstControl.is( ':checked' ) ).toBe( false );
          expect( control.filter( ':checked' ).length ).toEqual( 1 );
          expect( model.length ).toEqual( 1 );
        }

        function testRadio( controlName ) {
          var control      = getControlByName( suite, controlName ).filter( 'input[type="radio"]' ),
              firstControl = control.first(),
              lastControl  = control.last(),
              model        = _.get( formModel, controlName );

          // 3 options on mock radios;
          // 1 of these is already selected, which is not the first one
          expect( control.length ).toBe( 3 );
          expect( firstControl.is( ':checked' ) ).toBe( false );
          expect( control.is( ':checked' ) ).toBe( true );
          expect( model ).toBeDefined();

          firstControl.click();
          digest( suite );

          var previousModel = model;
          model             = _.get( formModel, controlName );
          expect( firstControl.is( ':checked' ) ).toBe( true );
          expect( control.is( ':checked' ) ).toBe( true );
          expect( model ).not.toEqual( previousModel );

          // Verify that the first control becomes deselected
          // when the last one is selected
          lastControl.click();
          digest( suite );

          previousModel = model;
          model         = _.get( formModel, controlName );
          expect( firstControl.is( ':checked' ) ).toBe( false );
          expect( lastControl.is( ':checked' ) ).toBe( true );
          expect( control.is( ':checked' ) ).toBe( true );
          expect( model ).not.toEqual( previousModel );
        }

        function testSelect( controlName ) {
          var control        = getControlByName( suite, controlName ).filter( 'select' ),
              controlOptions = control.find( 'option' ),
              firstControl   = controlOptions.first(),
              model          = _.get( formModel, controlName );

          // 3 options on mock radios;
          // 1 of these is already selected, which is not the first one
          expect( control.length ).toBe( 1 );
          expect( controlOptions.length ).toBe( 3 );
          expect( firstControl.is( ':checked' ) ).toBe( false );
          expect( model ).toBeDefined();

          firstControl.click();
          control.val( firstControl.attr( 'value' ) ).trigger( 'change' );
          digest( suite );

          var previousModel = model;
          model             = _.get( formModel, controlName );
          expect( firstControl.is( ':checked' ) ).toBe( true );
          expect( model ).not.toEqual( previousModel );
        }

        function testTypeahead( controlName ) {
          var control      = getControlByName( suite, controlName ).filter( 'input' ),
              model        = _.get( formModel, controlName ),
              modelDisplay = _.isObject( model ) ? model.name : model,
              newText      = 'Typea';

          expect( control.length ).toBe( 1 );
          expect( control.val() ).toEqual( modelDisplay );
          expect( model ).not.toEqual( newText );

          control.triggerHandler( 'focus' );
          control.val( newText ).trigger( 'input' ).trigger( 'change' );
          suite.$scope.$digest();

          // The input is a DOM sibling to the list that appears,
          // so we have to walk up a bit before finding the list.
          var list        = control.parentsUntil( '[list-data]' ).parent().find( '.isc-typeahead-list' ),
              listItems   = list.find( 'li' ),
              firstItem   = listItems.first(),
              itemDisplay = firstItem.html().trim();

          expect( listItems.length ).toBe( 3 );

          // Use down arrow two times and up arrow once to select the second item
          sendDownArrow(control);
          sendDownArrow(firstItem);
          sendUpArrow(firstItem.next());

          firstItem.click();
          digest( suite );

          model        = _.get( formModel, controlName );
          modelDisplay = _.isObject( model ) ? model.name : model;
          expect( modelDisplay ).toEqual( itemDisplay );
          expect( control.val() ).toEqual( itemDisplay );

          // Change the value in the control's input then leave the control;
          // the model should not change.
          control.val( newText ).trigger( 'input' ).trigger( 'blur' );
          digest( suite );

          model        = _.get( formModel, controlName );
          modelDisplay = _.isObject( model ) ? model.name : model;
          expect( modelDisplay ).toEqual( itemDisplay );
          expect( control.val() ).toEqual( itemDisplay );

          // Clear the content and blur and the value should be cleared.
          control.val( '' ).trigger( 'input' ).trigger( 'blur' );
          digest( suite );

          model = _.get( formModel, controlName );
          expect( model ).toBeUndefined();
          expect( control.val() ).toEqual( '' );


          function sendDownArrow(control) {
            control.trigger( {
              type : 'keydown',
              which : 40
            } );
          }

          function sendUpArrow(control) {
            control.trigger( {
              type : 'keydown',
              which : 38
            } );
          }
        }
      } );
    } );

    function createDirectives( rootForm ) {
      // Create an isc-form to get what would normally be passed to isc-form-internal
      suiteForm = createDirective( rootForm, {
        localFormConfig  : {},
        localButtonConfig: {}
      } );
      suiteMain.$httpBackend.flush();

      suiteInternal = createDirective( getInternalForm(), {
        formCtrl: suiteForm.controller
      } );

      suiteInternal.controller = suiteInternal.$isolateScope.formInternalCtrl;

      suiteSubform = createDirective( getSubform(), {
        formInternalCtrl: suiteInternal.controller
      } );

      suiteSubform.controller = suiteSubform.$isolateScope.subformCtrl;
    }

  } );
})();