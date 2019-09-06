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
		states: {
			ts: monaco.editor.ICodeEditorViewState;
			html: monaco.editor.ICodeEditorViewState;
		}
		editor: monaco.editor.IStandaloneCodeEditor;
	}
	tryEditor: {
		models: {
			ts: monaco.editor.IModel;
		};
		editor: monaco.editor.IStandaloneCodeEditor;
	};
	defs: {
		update(defs: string): void;
		currentDefsString: string;
		currentDefsDisposable: monaco.IDisposable;
	}
	exports: Object;
	htmlTypings: HTMLTypings;
}

const DEFAULT_CONTENTS = {
	source: {
		ts: `//Import HTML-typings
import * as htmlTypings from 'html-typings';

//Get the HTML source code
const sourceCode = window.sourceEditor.models.html.getValue();

//Generate defs file
const defsFile = htmlTypings.extractStringTypes(sourceCode);

//Write away definitions
require('fs').writeFile('src/defs.d.ts', defsFile, {
	encoding: 'utf-8'
}, (err: Error) => {
	if (err) {
		//Fail
	} else {
		//Done
	}
});`,
		html: `<html>
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
			<my-other-element id="otherElement"></my-other-element>
		</dom-module>
		<dom-module id="my-other-element">
			<h2 id="header">{{header}}</h2>
		</dom-module>
	</body>
</html>`
	},
	try: {
		ts: `// The generated HTML typings file is automatically included,
//  normally you'd use ///<reference path="defs.d.ts" /> for this

// Type will be HTMLInputElement
const input = document.getElementById('someInput');

// Type will be NodeListOf<HTMLDivElement|HTMLSpanElement>
const fancyElements = document.getElementsByClassName('fancy');

// Type will also be HTMLInputElement
const sameInput = document.querySelector('#someInput');

// Type will also be NodeListOf<HTMLDivElement|HTMLSpanElement>
const fancyElementsCopy = document.querySelectorAll('.fancy');

// Some custom element libraries allow for element-specific ID selectors
// for example polymer:
// https://www.polymer-project.org/1.0/docs/devguide/local-dom#work-with-local-dom 
type Modules = keyof ModuleMap;
type CustomElement<T extends Modules> = Element & {
	$: ModuleMap[T]
};

type HTMLMyElementElement = CustomElement<'my-element'>;
type HTMLMyOtherElementElement = CustomElement<'my-other-element'>;

// Will be a custom element
const myElement = document.getElementsByTagName('my-element')[0];

// Type will be HTMLHeaderElement
const header = myElement.$.header;

// Gets the nested element
const nestedHeader = myElement.$.otherElement.$.header;


interface MySpecialType extends HTMLElement {
	func(): void;
	color: string;
}

// Type will be MySpecialType
const specialElement = document.getElementById('specialEl');

// Instead of this for every occurrence
const specialElementManual = document.getElementById('specialEl') as HTMLElement & {
	func(): void;
	color: string;
}`
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
				'vs': '/html-typings/assets/monaco-editor/min/vs'
			}
		});
		//Load the editor
		window.require(['vs/editor/editor.main'], () => {
			editorReady();
		});
	});
})(() => {
	//Make it global so the user can play with it
	const sourceEditor = (() => {
		function changeTab(stateName: 'ts'|'html') {
			const currentState = editor.saveViewState();
			const currentModel = editor.getModel();
			if (currentModel === tsModel) {
				window.sourceEditor.states.ts = currentState;
				window.sourceEditor.editor.updateOptions({
					readOnly: false
				});
			} else if (currentModel === htmlModel) {
				window.sourceEditor.states.html = currentState;
				window.sourceEditor.editor.updateOptions({
					readOnly: true
				});
			}

			editor.setModel(window.sourceEditor.models[stateName]);
			editor.restoreViewState(window.sourceEditor.states[stateName]);
			editor.focus();
		}

		const tsModel = monaco.editor.createModel(DEFAULT_CONTENTS.source.ts, 'typescript');
		const htmlModel = monaco.editor.createModel(DEFAULT_CONTENTS.source.html, 'html');
		const editor = monaco.editor.create(document.getElementById('sourceEditor'), {
			model: htmlModel,
			minimap: {
				enabled: false
			}
		});

		const htmlTab = document.getElementById('sourceHTMLTab');
		const tsTab = document.getElementById('sourceTSTab');
		htmlTab.addEventListener('click', () => {
			if (htmlTab.classList.contains('active')) {
				return;
			}
			htmlTab.classList.add('active');
			tsTab.classList.remove('active');
			changeTab('html');
		});
		tsTab.addEventListener('click', () => {
			if (tsTab.classList.contains('active')) {
				return;
			}
			tsTab.classList.add('active');
			htmlTab.classList.remove('active');
			changeTab('ts');
		});

		window.sourceEditor = {
			editor: editor,
			models: {
				html: htmlModel,
				ts: tsModel
			},
			states: {
				html: null,
				ts: null
			}
		}

		let hasChanged: boolean = false;
		editor.onDidChangeModelContent(() => {
			hasChanged = true;
		});
		const returnVal: {
			onChange: () => void;
		} = {
			onChange: null
		};
		window.setInterval(() => {
			if (hasChanged) {
				returnVal.onChange && returnVal.onChange();		
				hasChanged = false;
			}
		}, 250);
		return returnVal;
	})();

	const tryEditor = (() => {
		const tsModel = monaco.editor.createModel(DEFAULT_CONTENTS.try.ts, 'typescript');
		const editor = monaco.editor.create(document.getElementById('tryEditor'), {
			model: tsModel,
			minimap: {
				enabled: false
			}
		});

		editor.addOverlayWidget

		window.tryEditor = {
			editor: editor,
			models: {
				ts: tsModel
			}
		}

		window.defs = {
			update(defs: string) {
				window.defs.currentDefsString = defs;
			},
			currentDefsString: '',
			currentDefsDisposable: null
		}

		const widgetElement = document.createElement('div') as HTMLDivElement & {
			timer: number;
		};
		widgetElement.innerText = 'Updated ✓';
		widgetElement.classList.add('onUpdateWidget');
		editor.addOverlayWidget({
			getId() {
				return 'on-update-widget'
			},
			getDomNode() {
				return widgetElement;
			},
			getPosition() {
				return {
					preference: monaco.editor.OverlayWidgetPositionPreference.BOTTOM_RIGHT_CORNER
				}
			}
		});


		return {
			updateDefs(showNotification: boolean = true) {
				window.exports = {};
				const htmlFile = window.sourceEditor.models.html.getValue();
				window.require(['./assets/html-typings/app/index.js'], () => {
					const defs = window.htmlTypings.extractStringTypes(htmlFile);
					
					window.defs.update(defs);
					const clearDefs = window.defs.currentDefsDisposable;
					clearDefs && clearDefs.dispose();
	
					window.defs.currentDefsDisposable = 
						monaco.languages.typescript.typescriptDefaults
							.addExtraLib(defs, 'htmlTypings.d.ts');

					if (showNotification) {
						widgetElement.classList.add('active');
						const currentTimer = window.setTimeout(() => {
							if (widgetElement.timer === currentTimer) {
								widgetElement.classList.remove('active');
							}
						}, 2500);
						widgetElement.timer = currentTimer;
					}
				});
			}
		}
	})();

	(() => {
		function loadDefs(path: string, name: string) {
			const xhr = new XMLHttpRequest();
			xhr.open('GET', `${location.origin}/html-typings${path}`);
			xhr.onload = () => {
				if (xhr.readyState === xhr.DONE) {
					if (xhr.status === 200) {
						monaco.languages.typescript.typescriptDefaults
							.addExtraLib(xhr.responseText, name);
					} else {
						console.error(`Failed to load ${name}`);
					}
				}
			}
			xhr.send();
		}

		loadDefs('/assets/monaco-editor/monaco.d.ts', 'monaco.d.ts');
		loadDefs('/assets/html-typings/typings/html-typings.d.ts', 'html-typings.d.ts');
		monaco.languages.typescript.typescriptDefaults.addExtraLib('interface Window {	require: {		(paths: Array<string>, callback: () => void): void;		config(config: {			paths: {				[key: string]: string;			}		}): void;	};	sourceEditor: {		models: {			ts: monaco.editor.IModel;			html: monaco.editor.IModel;		};		states: {			ts: monaco.editor.ICodeEditorViewState;			html: monaco.editor.ICodeEditorViewState;		}		editor: monaco.editor.IStandaloneCodeEditor;	}	tryEditor: {		models: {			ts: monaco.editor.IModel;		};		editor: monaco.editor.IStandaloneCodeEditor;	};	defs: {		update(defs: string): void;		currentDefsString: string;		currentDefsDisposable: monaco.IDisposable;	}}', 'window.d.ts');
		monaco.languages.typescript.typescriptDefaults.addExtraLib('declare const require: (module: string) => any;', 'require.d.ts');
	})();

	sourceEditor.onChange = () => {
		tryEditor.updateDefs();
	}
	tryEditor.updateDefs(false);
});