"use strict";
var DEFAULT_CONTENTS = {
    source: {
        ts: "//Import HTML-typings\nimport * as htmlTypings from 'html-typings';\n\n//Get the HTML source code\nconst sourceCode = window.sourceEditor.models.html.getValue();\n\n//Generate defs file\nconst defsFile = htmlTypings.extractStringTypes(sourceCode);\n\n//Write away definitions\nrequire('fs').writeFile('src/defs.d.ts', defsFile, {\n\tencoding: 'utf-8'\n}, (err: Error) => {\n\tif (err) {\n\t\t//Fail\n\t} else {\n\t\t//Done\n\t}\n});",
        html: "<html>\n\t<head>\n\t\t<title>html-typings</title>\n\t</head>\n\t<body>\n\t\t<input id=\"someInput\">\n\t\t<div class=\"fancy\"></div>\n\t\t<span class=\"fancy\"></div>\n\t\t<div id=\"specialEl\" data-element-type=\"MySpecialType\"></div>\n\t\t<dom-module id=\"my-element\">\n\t\t\t<h1 id=\"header\">{{header}}</h1>\n\t\t\t<my-other-element id=\"otherElement\"></my-other-element>\n\t\t</dom-module>\n\t\t<dom-module id=\"my-other-element\">\n\t\t\t<h2 id=\"header\">{{header}}</h2>\n\t\t</dom-module>\n\t</body>\n</html>"
    },
    try: {
        ts: "// The generated HTML typings file is automatically included,\n//  normally you'd use ///<reference path=\"defs.d.ts\" /> for this\n\n// Type will be HTMLInputElement\nconst input = document.getElementById('someInput');\n\n// Type will be NodeListOf<HTMLDivElement|HTMLSpanElement>\nconst fancyElements = document.getElementsByClassName('fancy');\n\n// Type will also be HTMLInputElement\nconst sameInput = document.querySelector('#someInput');\n\n// Type will also be NodeListOf<HTMLDivElement|HTMLSpanElement>\nconst fancyElementsCopy = document.querySelectorAll('.fancy');\n\n// Some custom element libraries allow for element-specific ID selectors\n// for example polymer:\n// https://www.polymer-project.org/1.0/docs/devguide/local-dom#work-with-local-dom \ntype Modules = keyof ModuleMap;\ntype CustomElement<T extends Modules> = Element & {\n\t$: ModuleMap[T]\n};\n\ntype HTMLMyElementElement = CustomElement<'my-element'>;\ntype HTMLMyOtherElementElement = CustomElement<'my-other-element'>;\n\n// Will be a custom element\nconst myElement = document.getElementsByTagName('my-element')[0];\n\n// Type will be HTMLHeaderElement\nconst header = myElement.$.header;\n\n// Gets the nested element\nconst nestedHeader = myElement.$.otherElement.$.header;\n\n\ninterface MySpecialType extends HTMLElement {\n\tfunc(): void;\n\tcolor: string;\n}\n\n// Type will be MySpecialType\nconst specialElement = document.getElementById('specialEl');\n\n// Instead of this for every occurrence\nconst specialElementManual = document.getElementById('specialEl') as HTMLElement & {\n\tfunc(): void;\n\tcolor: string;\n}"
    }
};
(function (editorReady) {
    function waitFor(key, callback) {
        if (key in window) {
            callback();
        }
        else {
            var timer_1 = window.setInterval(function () {
                if (key in window) {
                    window.clearInterval(timer_1);
                    callback();
                }
            }, 50);
        }
    }
    waitFor('require', function () {
        window.require.config({
            paths: {
                'vs': '/html-typings/assets/monaco-editor/min/vs'
            }
        });
        window.require(['vs/editor/editor.main'], function () {
            editorReady();
        });
    });
})(function () {
    var sourceEditor = (function () {
        function changeTab(stateName) {
            var currentState = editor.saveViewState();
            var currentModel = editor.getModel();
            if (currentModel === tsModel) {
                window.sourceEditor.states.ts = currentState;
                window.sourceEditor.editor.updateOptions({
                    readOnly: false
                });
            }
            else if (currentModel === htmlModel) {
                window.sourceEditor.states.html = currentState;
                window.sourceEditor.editor.updateOptions({
                    readOnly: true
                });
            }
            editor.setModel(window.sourceEditor.models[stateName]);
            editor.restoreViewState(window.sourceEditor.states[stateName]);
            editor.focus();
        }
        var tsModel = monaco.editor.createModel(DEFAULT_CONTENTS.source.ts, 'typescript');
        var htmlModel = monaco.editor.createModel(DEFAULT_CONTENTS.source.html, 'html');
        var editor = monaco.editor.create(document.getElementById('sourceEditor'), {
            model: htmlModel,
            minimap: {
                enabled: false
            }
        });
        var htmlTab = document.getElementById('sourceHTMLTab');
        var tsTab = document.getElementById('sourceTSTab');
        htmlTab.addEventListener('click', function () {
            if (htmlTab.classList.contains('active')) {
                return;
            }
            htmlTab.classList.add('active');
            tsTab.classList.remove('active');
            changeTab('html');
        });
        tsTab.addEventListener('click', function () {
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
        };
        var hasChanged = false;
        editor.onDidChangeModelContent(function () {
            hasChanged = true;
        });
        var returnVal = {
            onChange: null
        };
        window.setInterval(function () {
            if (hasChanged) {
                returnVal.onChange && returnVal.onChange();
                hasChanged = false;
            }
        }, 250);
        return returnVal;
    })();
    var tryEditor = (function () {
        var tsModel = monaco.editor.createModel(DEFAULT_CONTENTS.try.ts, 'typescript');
        var editor = monaco.editor.create(document.getElementById('tryEditor'), {
            model: tsModel,
            minimap: {
                enabled: false
            }
        });
        editor.addOverlayWidget;
        window.tryEditor = {
            editor: editor,
            models: {
                ts: tsModel
            }
        };
        window.defs = {
            update: function (defs) {
                window.defs.currentDefsString = defs;
            },
            currentDefsString: '',
            currentDefsDisposable: null
        };
        var widgetElement = document.createElement('div');
        widgetElement.innerText = 'Updated ✓';
        widgetElement.classList.add('onUpdateWidget');
        editor.addOverlayWidget({
            getId: function () {
                return 'on-update-widget';
            },
            getDomNode: function () {
                return widgetElement;
            },
            getPosition: function () {
                return {
                    preference: monaco.editor.OverlayWidgetPositionPreference.BOTTOM_RIGHT_CORNER
                };
            }
        });
        return {
            updateDefs: function (showNotification) {
                if (showNotification === void 0) { showNotification = true; }
                window.exports = {};
                var htmlFile = window.sourceEditor.models.html.getValue();
                window.require(['./assets/html-typings/app/index.js'], function () {
                    var defs = window.htmlTypings.extractStringTypes(htmlFile);
                    window.defs.update(defs);
                    var clearDefs = window.defs.currentDefsDisposable;
                    clearDefs && clearDefs.dispose();
                    window.defs.currentDefsDisposable =
                        monaco.languages.typescript.typescriptDefaults
                            .addExtraLib(defs, 'htmlTypings.d.ts');
                    if (showNotification) {
                        widgetElement.classList.add('active');
                        var currentTimer_1 = window.setTimeout(function () {
                            if (widgetElement.timer === currentTimer_1) {
                                widgetElement.classList.remove('active');
                            }
                        }, 2500);
                        widgetElement.timer = currentTimer_1;
                    }
                });
            }
        };
    })();
    (function () {
        function loadDefs(path, name) {
            var xhr = new XMLHttpRequest();
            xhr.open('GET', "" + location.origin + path);
            xhr.onload = function () {
                if (xhr.readyState === xhr.DONE) {
                    if (xhr.status === 200) {
                        monaco.languages.typescript.typescriptDefaults
                            .addExtraLib(xhr.responseText, name);
                    }
                    else {
                        console.error("Failed to load " + name);
                    }
                }
            };
            xhr.send();
        }
        loadDefs('/assets/monaco-editor/monaco.d.ts', 'monaco.d.ts');
        loadDefs('/assets/html-typings/typings/html-typings.d.ts', 'html-typings.d.ts');
        monaco.languages.typescript.typescriptDefaults.addExtraLib('interface Window {	require: {		(paths: Array<string>, callback: () => void): void;		config(config: {			paths: {				[key: string]: string;			}		}): void;	};	sourceEditor: {		models: {			ts: monaco.editor.IModel;			html: monaco.editor.IModel;		};		states: {			ts: monaco.editor.ICodeEditorViewState;			html: monaco.editor.ICodeEditorViewState;		}		editor: monaco.editor.IStandaloneCodeEditor;	}	tryEditor: {		models: {			ts: monaco.editor.IModel;		};		editor: monaco.editor.IStandaloneCodeEditor;	};	defs: {		update(defs: string): void;		currentDefsString: string;		currentDefsDisposable: monaco.IDisposable;	}}', 'window.d.ts');
        monaco.languages.typescript.typescriptDefaults.addExtraLib('declare const require: (module: string) => any;', 'require.d.ts');
    })();
    sourceEditor.onChange = function () {
        tryEditor.updateDefs();
    };
    tryEditor.updateDefs(false);
});
