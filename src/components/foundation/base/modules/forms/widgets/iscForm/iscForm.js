(function () {
  'use strict';

  /* @ngInject */
  function iscForm($window, $stateParams, $q,
                  iscSessionModel, iscNavContainerModel, appConfig,
                  iscFormsModel, iscFormsValidationService, iscNotificationService,
                  iscFormDataApi) {//jshint ignore:line

    // ----------------------------
    // vars
    // ----------------------------

    // ----------------------------
    // class factory
    // ----------------------------
    var directive = {
      restrict        : 'E',
      replace         : true,
      controllerAs    : 'formCtrl',
      scope           : {
        formType           : '@',
        formKey            : '@',
        annotationsApi     : '=',
        mode               : '@',
        id                 : '@',
        additionalModelInit: '=',
        useOriginalFormKey : '='
      },
      bindToController: true,
      controller      : controller,
      templateUrl     : 'forms/widgets/iscForm/iscForm.html'
    };

    return directive;

    // ----------------------------
    // functions
    // ----------------------------
    function controller($scope) {
      var self = this;

      _.merge(self, {
        forms               : [],
        localFormKey        : self.formKey,
        formDefinition      : {},
        validationDefinition: {},
        additionalModels    : {},
        model               : {},
        debugDisplay        : appConfig.debugDisplay.forms,
        options             : {
          formState: {
            _mode       : self.mode,
            _validation : {},
            _annotations: {
              data: []
            }
          }
        },
        childConfig         : {}
      });


      // Empty stubs for annotations, to remove dependency
      function emptyAnnotationData() { return $q.when([]); }
      function emptyFunction() { }

      // Defaults if not provided
      self.annotationsApi = _.extend({
        getFormAnnotations    : emptyAnnotationData,
        closeAnnotationPanel  : emptyFunction,
        initAnnotationQueue   : emptyFunction,
        processAnnotationQueue: emptyFunction
      }, self.annotationsApi);

      init();


      // Object to hold data and structure for temporary form validation
      self.validation = iscFormsValidationService.getValidationObject();

      self.onCancel = function () {
        $window.history.back();
      };

      self.onSubmit = function () {
        self.options.formState._validation.$submitted = true;

        // Check form validity

        // iscFormsValidationService.validateForm parses the outer forms on each page.
        var containingFormIsValid = true,
            $error                = [],
            index                 = 0;
        _.forEach(self.pages, function (page) {
          // Force each form (page) to validate if it is not hidden
          // Forms are generated by formly by index
          var form = self.forms[index++];
          if (!page._isHidden) {
            var formValidation    = iscFormsValidationService.validateForm(form);
            containingFormIsValid = formValidation.isValid && containingFormIsValid;
            $error                = $error.concat(formValidation.$error);
          }
        });

        // Data in subforms (collections) is validated at the point of entry,
        // but if that validation depends on values in the outer form then
        // its validation needs to be re-confirmed before submission.
        iscFormsValidationService.validateCollections(self.model, self.validationDefinition)
          .then(function (result) {
            if (containingFormIsValid && result.isValid) {
              submitForm();
            }
            else {
              showFailedValidation($error, result.errors);
            }
          });
      };


      // Annotations
      self.closeAnnotations = function () {
        self.annotationsApi.closeAnnotationPanel();
      };


      // Private/helper functions
      var originalFormKey;

      function init() {
        // Initialize validation and notification components
        iscFormsValidationService.init(self.options);
        iscNotificationService.init();

        // Resolve default formKey if not provided,
        // and if not using formKey previously persisted with form
        if (!self.localFormKey && !(self.id && self.useOriginalFormKey)) {
          iscFormsModel.getActiveForm(self.formType).then(function (form) {
            self.localFormKey = form.formKey;
            getFormData();
          });
        }
        else {
          getFormData();
        }
      }

      function getFormData() {
        self.annotationsApi.initAnnotationQueue();

        if (self.id) {
          self.annotationsApi.getFormAnnotations(self.id).then(function (annotations) {
            self.options.formState._annotations = {
              index: self.id,
              data : annotations
            };
            iscFormDataApi.get(self.id).then(function (formData) {
              originalFormKey = formData.formKey;

              // Option to force using the formKey saved in the form previously
              if (!self.localFormKey && self.useOriginalFormKey) {
                self.localFormKey = originalFormKey;
              }
              self.model = formData.data;

              getFormDefinition();
            });
          });
        }
        else {
          getFormDefinition();
        }
      }

      function getFormDefinition() {
        iscFormsModel.getFormDefinition(self.localFormKey, self.mode)
          .then(function (formDefinition) {
            self.formDefinition                = formDefinition;
            self.options.formState._validateOn = formDefinition.validateOn;

            reconcileModelWithFormDefinition();

            populateAdditionalModels(self.formDefinition.dataModelInit);
          });
      }

      function populateAdditionalModels(fdnScript) {
        // If provided, call init function/expression to populate additional dynamic data models, such as patients
        evalScript(fdnScript);
        evalScript(self.additionalModelInit);

        getValidationDefinition();

        function evalScript(script) {
          if (script && _.isFunction(script)) {
            script(self.additionalModels, $stateParams);
          }
        }
      }

      function getValidationDefinition() {
        iscFormsModel.getValidationDefinition(self.localFormKey)
          .then(function (validationDefinition) {
            self.validationDefinition = validationDefinition;

            watchPages();

            // Defer to ensure self.pages is populated by filter
            _.defer(function () {
              self.currentPage = _.first(self.pages);
            }, 0);
          });
      }

      // If the original/persisted formKey differs from the formKey of the definition,
      // we need to process the implicit data model of the new formDefinition to ensure
      // it does not contain properties that are not supported by the new definition.
      function reconcileModelWithFormDefinition() {
        if (originalFormKey && originalFormKey != self.localFormKey) {
          var form = self.formDefinition,
              data = self.model;

          self.model = _mergeFormAndData();
        }

        /**
         * Prunes any properties in data that are not keyed by fields in form.
         * @returns {Object}
         * @private
         */
        function _mergeFormAndData() {
          var model = {};

          _.forEach(form.pages, function (page) {
            _processFields(page.fields);
          });

          return model;

          function _processFields(fields, parentPath, isCollection) {
            _.forEach(fields, function (field) {
              // Field groups are just arrays of fields
              if (field.fieldGroup) {
                _processFields(field.fieldGroup, parentPath, isCollection);
              }
              else {
                if (field.key) {
                  var key      = field.key,
                      fullPath = (parentPath ? parentPath + '.' : '') + key;
                  // templateOptions.fields is populated with subform fields for embedded forms
                  var embeddedFields = _.get(field, 'templateOptions.fields'),
                      isEfCollection = field.type === 'embeddedFormCollection' || field.extends === 'embeddedFormCollection';

                  if (embeddedFields) {
                    // If a collection, initialize the size of the new array to match data's size of this collection
                    if (isEfCollection) {
                      var sourceCollectionSize = _.get(data, fullPath, []).length;
                      if (sourceCollectionSize) {
                        _.set(model, fullPath, Array(sourceCollectionSize));
                        _.fill(model[fullPath], {});
                      }
                    }
                    _processFields(embeddedFields, fullPath, isEfCollection);
                  }
                  else {
                    // If saving a collection, iterate all items in data and save this verified property
                    if (isCollection) {
                      var sourceData = _.get(data, parentPath, []);

                      _.forEach(sourceData, function (item, index) {
                        var indexedKey = [parentPath, '[', index, ']', '.', key].join(''),
                            value      = _.get(data, indexedKey);
                        if (value != undefined) {
                          _.set(model, indexedKey, value);
                        }
                      });
                    }
                    else {
                      var value = _.get(data, key);

                      if (value != undefined) {
                        _.set(model, key, value);
                      }
                    }
                  }
                }
              }
            })
          }
        }

      }

      function submitForm() {
        // Wrap data with additional information and metadata
        var formWrapper = {
          formDefinition  : self.formDefinition,
          additionalModels: self.additionalModels,
          formData        : {
            formKey    : self.localFormKey,
            formName   : self.formDefinition.name,
            formType   : self.formDefinition.formType,
            id         : self.id ? parseInt(self.id) : undefined,
            author     : iscSessionModel.getCurrentUser(),
            completedOn: moment().toISOString(),
            data       : self.model
          }
        };

        // Save form and return to dashboard
        // If an existing form, PUT; otherwise POST
        var saveCall;
        if (self.id) {
          saveCall = iscFormDataApi.put(parseInt(self.id), formWrapper).then(updateAnnotations);
        }
        else {
          saveCall = iscFormDataApi.post(formWrapper).then(updateAnnotations);
        }
        saveCall.then(function () {
          iscNavContainerModel.navigateToUserLandingPage();
        });
      }

      function updateAnnotations(form) {
        self.annotationsApi.processAnnotationQueue(form.id);
      }

      function showFailedValidation(mainFormErrors, subformErrors) {
        mainFormErrors = _.compact(mainFormErrors);

        // Main form alerts
        // Limit error reporting to one per control; this needs to be done manually because notifications
        // can use ng-messages, but each notification has its own ng-messages collection.
        var alerts = {};

        _.forEach(mainFormErrors, function (error) {
          _.forEach(error, function (errorType) {
            _.forEach(errorType, function (errorInstance) {
              var fieldScope        = iscNotificationService.getFieldScope(errorInstance.$name);
              alerts[fieldScope.id] = {
                $error  : error,
                options : fieldScope.options,
                scrollTo: fieldScope.id
              };
            });
          })
        });

        _.forEach(alerts, function (alert) {
          iscNotificationService.showAlert(alert);
        });

        // Cascaded subform alerts
        _.forEach(subformErrors, function (error, id) {
          var alert = {
            scrollTo: id,
            content : makeError(error)
          };
          iscNotificationService.showAlert(alert);
        });

        function makeError(error) {
          return '<label class="error-message">In ' + error.label + ': ' + pluralize('record', error.records.length) + ' invalid.</label>';
        }

        function pluralize(text, count) {
          return count + ' ' + text + (count > 1 ? 's are' : ' is');
        }
      }


      // Sets up watches on pages having a hideExpression property
      function watchPages() {
        // Throttle for initial load or large model changes
        var throttledFilter = _.throttle(filterPages, 100);
        _.forEach(self.formDefinition.pages, function (page) {
          var hideExp = page.hideExpression;
          if (hideExp) {
            $scope.$watch(
              function () {
                return $scope.$eval(hideExp, self);
              },
              function (hidePage) {
                page._isHidden = hidePage;
                throttledFilter();
              });
          }
        });

        self.pages       = self.formDefinition.pages;
        self.multiConfig = {
          pages          : self.pages,
          layout         : self.formDefinition.pageLayout,
          currentPage    : self.currentPage,
          selectablePages: [],
          forms          : self.forms,
          onCancel       : self.onCancel
        };

        throttledFilter();
      }

      function filterPages() {
        self.multiConfig.selectablePages = _.filter(self.formDefinition.pages, function (page) {
          return !page._isHidden;
        });
      }
    }

  }//END CLASS

  // ----------------------------
  // injection
  // ----------------------------

  angular.module('isc.forms')
    .directive('iscForm', iscForm);

})();
