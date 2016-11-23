# TYPEAHEAD COMPONENT GUIDE

### Basic Example
This example contains the required configuration settings needed to use the component out of the box without any additional configuration.

demo.template.html

``` html
<isc-typeahead-component
    isc-model="demoCtrl.tags"
    isc-source="demoCtrl.load">
</isc-typeahead-component>
```

demo.module.js

``` js
function config( typeaheadConfigurationProvider ) {

    var userConfiguration = {
        "tagsInput"   : {
            keyProperty            : "Id",
            displayProperty        : "name"
        },
        "autoComplete": {
            displayProperty        : "name"
        }
    };

    typeaheadConfigurationProvider.setUserConfiguration( userConfiguration );
}
```

demo.controller.js

``` js
function demoController( iscHttpapi, apiHelper ) {

    var self = this;
    var tags = [];

    _.extend( self, {
      tags: tags,
      load: load
    } );

    function load( query ) {
      var filter = '';
      if ( !angular.isUndefined( query ) ) {
        filter = query.toLowerCase();
      }
      var url = apiHelper.getUrl( '/some-rest-api?filter=' + filter );
      return iscHttpapi.get( url );
    }
}
```

## isc-typeahead-component | HTML
Custom wrapper for 3rd party ngTagsInput directive.

``` html
<isc-typeahead-component
    isc-model="{string}"
    isc-source="{expression}"
    [isc-rules="{object}"]
    [on-add="{expression}"]
    [on-adding="{expression}"]
    [on-remove="{expression}"]
    [on-removing="{expression}"]
    [on-invalid="{expression}"]
    [on-clicked="{expression}"]>
</isc-typeahead-component>
```

### Parameters
| Name                      | Type          | Description                                                                                                                                                                                                                                               |
| ------------------------- | ------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| isc-model (required)      | string        | Assignable Angular expression to data-bind to.                                                                                                                                                                                                            |
| isc-source (required)     | expression    | Expression to evaluate upon changing the input content. The input value is available as $query. The result of the expression must be a promise that eventually resolves to an array of strings.                                                           |
| isc-rule                  | object        | Object that contains all custom business rules to be executed and evaluated on initiation and on update                                                                                                                                                   |
| onAdd                     | expression    | Expression to evaluate upon adding a new tag. The new tag is available as $tag.                                                                                                                                                                           |
| onAdding                  | expression    | Expression to evaluate that will be invoked before adding a new tag. The new tag is available as $tag. This method must return either a boolean value or a promise. If either a false value or a rejected promise is returned, the tag will not be added. |
| onRemove                  | expression    | Expression to evaluate upon removing an existing tag. The removed tag is available as $tag.                                                                                                                                                               |
| onRemoving                | expression    | Expression to evaluate that will be invoked before removing a tag. The tag is available as $tag. This method must return either a boolean value or a promise. If either a false value or a rejected promise is returned, the tag will not be removed.     |
| onInvalid                 | expression    | Expression to evaluate when a tag is invalid. The invalid tag is available as $tag.                                                                                                                                                                       |
| onClicked                 | expression    | Expression to evaluate upon clicking an existing tag. The clicked tag is available as $tag.                                                                                                                                                               |


## typeaheadConfiguration.setUserConfiguration( user ) | JS
Sets user custom configuration settings and global configuration settings for both tagsInput and autoComplete directives.

### Usage

``` js
function config( typeaheadConfigurationProvider ) {

    var requiredUserConfiguration = {
        "tagsInput"            : {
            displayProperty    : "name",
            keyProperty        : "userId"
        },
        "autoComplete"         : {
            displayProperty    : "name"
        }
    };

    typeaheadConfigurationProvider.setUserConfiguration( requiredUserConfiguration );

    var additionalUserConfiguration = {
      "form"                   : {
        debug                  : false,
        formId                 : "tags"
      },
      "tagsInput"              : {
        template               : "user-tag-template",
        displayProperty        : "name",
        keyProperty            : "userId",
        placeholder            : "Search:",
        maxTags                : 3,
        replaceSpacesWithDashes: true,
        enableEditingLastTag   : true,
        noTags                 : false
      },
      "autoComplete"           : {
        template               : "user-autocomplete-template",
        displayProperty        : "name",
        minLength              : 2,
        maxResultsToShow       : 5,
        highlightMatchedText   : true
      }
    };

    typeaheadConfigurationProvider.setUserConfiguration( additionalUserConfiguration );
}
```

### Parameter

| Name                                          | Type          | Description                                                                           |
| --------------------------------------------- | ------------- | ------------------------------------------------------------------------------------- |
| user (required)                               | string        | user configuration settings for the form, tagsInput and autoComplete                  |

### Required User Properties

| Name                               | Type          | Description                                                                           |
| -----------------------------------| ------------- | ------------------------------------------------------------------------------------- |
| user.tagsInput.keyProperty         | string        | Read description above for parameter                                                  |
| user.tagsInput.displayProperty     | string        | Read description above for parameter                                                  |
| user.autoComplete.displayProperty  | string        | Read description above for parameter                                                  |


## tags-input | 3rd Party
Renders an input box with tag editing support.

### Usage

``` html
<tags-input
  ng-model="{string}"
  [template="{string}"]
  [template-scope="{string}"]
  [display-property="{string}"]
  [key-property="{string}"]
  [type="{string}"]
  [text="{string}"]
  [tabindex="{number}"]
  [placeholder="{string}"]
  [min-length="{number}"]
  [max-length="{number}"]
  [min-tags="{number}"]
  [max-tags="{number}"]
  [allow-leftover-text="{boolean}"]
  [remove-tag-symbol="{string}"]
  [add-on-enter="{boolean}"]
  [add-on-space="{boolean}"]
  [add-on-comma="{boolean}"]
  [add-on-blur="{boolean}"]
  [add-on-paste="{boolean}"]
  [paste-split-pattern="{string}"]
  [replace-spaces-with-dashes="{boolean}"]
  [allowed-tags-pattern="{string}"]
  [enable-editing-last-tag="{boolean}"]
  [add-from-autocomplete-only="{boolean}"]
  [spellcheck="{boolean}"]
  [tag-class="{expression}"]
  [on-tag-adding="{expression}"]
  [on-tag-added="{expression}"]
  [on-invalid-tag="{expression}"]
  [on-tag-removing="{expression}"]
  [on-tag-removed="{expression}"]
  [on-tag-clicked="{expression}"]>
</tags-input>
```

### Parameters

| Name                      | Type          | Default           | Description                                                                           |
| ------------------------- | ------------- | ----------------- | ------------------------------------------------------------------------------------- |
| ngModel                   | string        | -                 | Assignable Angular expression to data-bind to.                                        |
| template                  | string        | tag-template      | URL or id of a custom template for rendering each tag.                                |
| templateScope             | string        | -                 | Scope to be passed to custom templates - of both tagsInput and autoComplete directives - as $scope. |
| displayProperty           | string        | text              | Property to be rendered as the tag label.                                |
| keyProperty               | string        | text              | Property to be used as a unique identifier for the tag.                                |
| tabindex                  | number        | 10                | Tab order of the control.                                |
| placeholder               | string        | Add Tag:          | Placeholder text for the control.                                |
| minLength                 | number        | 2                 | Minimum length for a new tag.                                |
| maxLength                 | number        | 25                | Maximum length allowed for a new tag.                                |
| minTags                   | number        | 1                 | Sets minTags validation error key if the number of tags added is less than minTags.                                |
| maxTags                   | number        | 25                | Sets maxTags validation error key if the number of tags added is greater than maxTags.                                |
| addOnEnter                | boolean       | true              | Flag indicating that a new tag will be added on pressing the ENTER key.                                |
| addOnSpace                | boolean       | false             | Flag indicating that a new tag will be added on pressing the SPACE key.                                |
| addOnBlur                 | boolean       | false             | Flag indicating that a new tag will be added on pressing the COMMA key.                                |
| addOnComma                | boolean       | false             | Flag indicating that a new tag will be added when the input field loses focus.                                |
| addOnPaste                | boolean       | false             | Flag indicating that the text pasted into the input field will be split into tags.                                |
| pasteSplitPattern         | string        | ,                 | Regular expression used to split the pasted text into tags.                                |
| replaceSpacesWithDashes   | boolean       | true              | Flag indicating that spaces will be replaced with dashes.                                |
| enableEditingLastTag      | boolean       | true              | Flag indicating that the last tag will be moved back into the new tag input box instead of being removed when the backspace key is pressed and the input box is empty.                                |
| addFromAutocompleteOnly   | boolean       | true              | Flag indicating that only tags coming from the autocomplete list will be allowed. When this flag is true, addOnEnter, addOnComma, addOnSpace and addOnBlur values are ignored.                                |
| onTagAdding               | expression    | -                 | Expression to evaluate that will be invoked before adding a new tag. The new tag is available as $tag. This method must return either a boolean value or a promise. If either a false value or a rejected promise is returned, the tag will not be added.                                |
| onTagAdded                | expression    | -                 | Expression to evaluate upon adding a new tag. The new tag is available as $tag.                                |
| onInvalidTag              | expression    | -                 | Expression to evaluate when a tag is invalid. The invalid tag is available as $tag.                                |
| onTagRemoving             | expression    | -                 | Expression to evaluate that will be invoked before removing a tag. The tag is available as $tag. This method must return either a boolean value or a promise. If either a false value or a rejected promise is returned, the tag will not be removed.                                |
| onTagRemoved              | expression    | -                 | Expression to evaluate upon removing an existing tag. The removed tag is available as $tag.                                |
| onTagClicked              | expression    | -                 | Expression to evaluate upon clicking an existing tag. The clicked tag is available as $tag.                                |


## auto-complete | 3rd Party
Provides autocomplete support for the tagsInput directive.

### Usage

``` html
<auto-complete
  source="{expression}"
  [template="{string}"]
  [display-property="{string}"]
  [debounce-delay="{number}"]
  [min-length="{number}"]
  [highlight-matched-text="{boolean}"]
  [max-results-to-show="{number}"]
  [load-on-down-arrow="{boolean}"]
  [load-on-empty="{boolean}"]
  [load-on-focus="{boolean}"]
  [select-first-match="{boolean}"]
  [match-class="{expression}"]>
</auto-complete>
```


### Parameters

| Name                      | Type          | Default               | Description                                                                           |
| ------------------------- | ------------- | --------------------- | ------------------------------------------------------------------------------------- |
| source                    | expression    | -                     | Expression to evaluate upon changing the input content. The input value is available as $query. The result of the expression must be a promise that eventually resolves to an array of strings.                                        |
| template                  | string        | -                     | URL or id of a custom template for rendering each element of the autocomplete list.                                |
| displayProperty           | string        | tagsInput.displayText | Property to be rendered as the autocomplete label. |
| debounceDelay             | number        | 100                   | Amount of time, in milliseconds, to wait before evaluating the expression in the source option after the last keystroke.                                |
| minLength                 | number        | 2                     | Minimum number of characters that must be entered before evaluating the expression in the source option.                                |
| highlightMatchedText      | boolean       | true                  | Flag indicating that the matched text will be highlighted in the suggestions list.                                |
| maxResultsToShow          | number        | 10                    | Maximum number of results to be displayed at a time.                                |
| loadOnDownArrow           | boolean       | false                 | Flag indicating that the source option will be evaluated when the down arrow key is pressed and the suggestion list is closed. The current input value is available as $query.                                |
| loadOnEmpty               | boolean       | false                 | Flag indicating that the source option will be evaluated when the input content becomes empty. The $query variable will be passed to the expression as an empty string.                                |
| loadOnFocus               | boolean       | false                 | Flag indicating that the source option will be evaluated when the input element gains focus. The current input value is available as $query.                                |
| selectFirstMatch          | boolean       | false                 | Flag indicating that the first match will be automatically selected once the suggestion list is shown.                                |


## CODE SAMPLES

### Use Case: Use component out of the box without any user customization or configuration

``` html
<isc-typeahead-component
    isc-model="lookDemoCtrl.tags"
    isc-source="lookDemoCtrl.load">
</isc-typeahead-component>
```

``` javascript
angular.module('app', ['isc.components']).controller('MainController', function( $http ) {
    self = this;
    self.tags = [
        { id: 1, name: 'Tag 1' },
        { id: 2, name: 'Tag 2' },
        { id: 3, name: 'Tag 3' },
        { id: 4, name: 'Tag 4' }
    ];
    self.load = function(query) {
         return $http.get('/tags?query=' + query);
    };
});
```

