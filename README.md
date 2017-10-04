[![Build Status](https://travis-ci.org/SanderRonde/html-typings.svg?branch=master)](https://travis-ci.org/SanderRonde/html-typings)

# HTML Typings

Generates typings for HTML selectors based on your HTML files

## Installing

For the latest version:
```bash
npm install -g html-typings
```

## Command-line usage

```bash
html-typings [-h] -i INPUT -o OUT_FILE
```

Where INPUT can be either a glob pattern, the path to a file or the path to a folder. The contents of the folder will be scanned recursively for HTML files to use.

## Usage as a module

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