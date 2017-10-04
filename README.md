[![Build Status](https://travis-ci.org/SanderRonde/html-typings.svg?branch=master)](https://travis-ci.org/SanderRonde/html-typings)

# HTML Typings

Generates typings for HTML selectors based on your HTML files

## Installing

For the latest version:
```bash
npm install -g html-typings
```

## Typings usage

First reference the typings file, wherever you outputted it, then
simply use querySelectors etc like you would normally, but with typings.

```typescript
///<reference path="../typings/html-typings.d.ts"/>

// Type will be HTMLInputElement
const input = document.getElementById('someInput');

// Type will be NodeListOf<HTMLDivElement|HTMLSpanElement>
const fancyElements = document.getElementsByClassName('fancy');

// Type will also be HTMLInputElement
const sameInput = document.querySelector('#someInput');

// Type will also be NodeListOf<HTMLDivElement|HTMLSpanElement>
const fancyElements = document.querySelectorAll('.fancy');

// Some custom element libraries allow for element-specific ID selectors
// for example polymer https://www.polymer-project.org/1.0/docs/devguide/local-dom#work-with-local-dom 
type CustomElement<T extends string> = HTMLElement & {
	$: ModuleMap[T]
};

const myElement: CustomElement<'my-element'> = document.getElementsByTagName('my-element');

// Type will be HTMLHeaderElement
const header = myElement.$.header;

```

```html
<html>
	<head>
		<title>title</title>
	</head>
	<body>
		<input id="someInput">
		<div class="fancy"></div>
		<span class="fancy"></div>
		<dom-module id="my-element">
			<h1 id="header">{{header}}</h1>
		</dom-module>
	</body>
</html>
```

Sometimes you have elements that contain more properties than regular html elements, for this you can use the ```data-element-type``` property. Setting this to a type and then declaring that type ensures that element will always have the special type you assigned to it. This also becomes very useful when using libraries that map their properties onto containing HTML elements such as CodeMirror.

```typescript
///<reference path="../typings/html-typings.d.ts"/>

interface MySpecialType extends HTMLElement {
	func(): void;
	color: string;
}

// Type will be MySpecialType
const specialElement = document.getElementById('specialEl');

// Instead of this for every occurrence
const specialElement = document.getElementById('specialEl') as HTMLElement & {
	func(): void;
	color: string;
}
```

```html
<html>
	<head>
		<title>title</title>
	</head>
	<body>
		<div id="specialEl" data-element-type="MySpecialType"></div>
	</body>
</html>
```

## Command-line usage

```bash
html-typings [-h] -i INPUT -o OUT_FILE
```

Where INPUT can be either a glob pattern, the path to a file or the path to a folder. The contents of the folder will be scanned recursively for HTML files to use.

## Module usage

Require the module
```javascript
const htmlTypings = require('html-typings')
```

Convert a string
```javascript
const result = htmlTypings.extractStringTypes(input);
```

Convert a file
```javascript
const result = await htmlTypings.extractFileTypes(path);
```
Or the ES5 equivalent
```javascript
htmlTypings.extractFileTypes(path).then((result) => {
	//Do something
});
```