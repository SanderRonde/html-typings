/// <reference path="defs.d.ts"/>
/// <reference path="../../../node_modules/monaco-editor/monaco.d.ts" />
/// <reference path="../../../typings/html-typings.d.ts" />

interface Window {
	require: {
		(paths: Array<string>, callback: () => void): void;
		config(config: {
			paths: {
				[key: string]: string;
			}
		}): void;
	};
	sourceEditor: {
		models: {
			ts: monaco.editor.IModel;
			html: monaco.editor.IModel;
		};
		editor: monaco.editor.IStandaloneCodeEditor;
	}
	tryEditor: {
		models: {
			js: monaco.editor.IModel;
		};
		editor: monaco.editor.IStandaloneCodeEditor;
	};
	defs: {
		update(defs: string): void;
		currentDefs: string;
	}
}

const DEFAULT_CONTENTS = {
	source: {
		ts: (() => {
/// <reference path="node_modules/html-typings/typings/html-typings.d.ts"/>
const sourceCode = window.sourceEditor.models.html.getValue();

const htmlTypings: HTMLTypings = require('html-typings');
const defsFile = htmlTypings.extractStringTypes(sourceCode);

//This is where you would normally write it to a .d.ts file or use the CLI instead.
// However, because this is just a browser example, we'll just update the global
// defs instead
window.defs.update(defsFile);

/*
require('fs').writeFile('src/defs.d.ts', defsFile, {
	encoding: 'utf-8'
}, (err: Error) => {
	if (err) {
		//Fail
	} else {
		//Done
	}
});
*/
		}).toString(),
		html: `
<html>
	<head>
		<title>html-typings</title>
	</head>
	<body>
		<input id="someInput">
		<div class="fancy"></div>
		<span class="fancy"></div>
		<div id="specialEl" data-element-type="MySpecialType"></div>
		<dom-module id="my-element">
			<h1 id="header">{{header}}</h1>
		</dom-module>
	</body>
</html>`
	},
	try: {
		ts: ``
	}
};

((editorReady: () => void) => {
	function waitFor<K extends keyof Window>(key: K, callback: () => void) {
		if (key in window) {
			callback();
		} else {
			const timer = window.setInterval(() => {
				if (key in window) {
					window.clearInterval(timer);
					callback();
				}
			}, 50);
		}
	}

	//Wait for require to exist
	waitFor('require', () => {
		window.require.config({
			paths: {
				'vs': '/assets/monaco-editor/src/min/vs'
			}
		});
		//Load the editor
		window.require(['vs/editor/editor.main'], () => {
			editorReady();
		});
	});
})(() => {
	//Make it global so the user can play with it
	(() => {
		const jsModel = monaco.editor.createModel(DEFAULT_CONTENTS.source.ts, 'typescript');
		const htmlModel = monaco.editor.createModel(DEFAULT_CONTENTS.source.html, 'html');
		const editor = monaco.editor.create(document.getElementById('sourceEditor'), {
			model: htmlModel,
			minimap: {
				enabled: false
			}
		});

		window.sourceEditor = {
			editor: editor,
			models: {
				html: htmlModel,
				ts: jsModel
			}
		}
	})();
});