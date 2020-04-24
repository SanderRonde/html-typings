interface SelectorMap {
	"#sourceEditor": HTMLDivElement;
	"#sourceHTMLTab": HTMLDivElement;
	"#sourceTSTab": HTMLDivElement;
	"#tryEditor": HTMLDivElement;
	".active": HTMLDivElement;
	".checkout-package": HTMLSpanElement;
	".container": HTMLDivElement;
	".editor": HTMLDivElement;
	".editorElement": HTMLDivElement;
	".editorHeader": HTMLDivElement;
	".editorName": HTMLDivElement;
	".editorTab": HTMLDivElement;
	".editorTabs": HTMLDivElement;
	".editors": HTMLDivElement;
	".float-right": HTMLDivElement;
	".mainContent": HTMLElement;
	".page-header": HTMLElement;
	".pageName": HTMLDivElement;
	".site-footer": HTMLElement;
	".site-footer-owner": HTMLSpanElement;
}

interface IDMap {
	"sourceEditor": HTMLDivElement;
	"sourceHTMLTab": HTMLDivElement;
	"sourceTSTab": HTMLDivElement;
	"tryEditor": HTMLDivElement;
}

interface ClassMap {
	"active": HTMLDivElement;
	"checkout-package": HTMLSpanElement;
	"container": HTMLDivElement;
	"editor": HTMLDivElement;
	"editorElement": HTMLDivElement;
	"editorHeader": HTMLDivElement;
	"editorName": HTMLDivElement;
	"editorTab": HTMLDivElement;
	"editorTabs": HTMLDivElement;
	"editors": HTMLDivElement;
	"float-right": HTMLDivElement;
	"mainContent": HTMLElement;
	"page-header": HTMLElement;
	"pageName": HTMLDivElement;
	"site-footer": HTMLElement;
	"site-footer-owner": HTMLSpanElement;
}

interface ModuleMap {}

interface TagMap {}

interface NodeSelector {
	querySelector<T extends keyof SelectorMap>(selector: T): SelectorMap[T];
	querySelectorAll<T extends keyof SelectorMap>(selector: T): SelectorMap[T][];
}

interface Document {
	getElementById<T extends keyof IDMap>(elementId: T): IDMap[T];
	getElementsByClassName<T extends keyof ClassMap>(classNames: string): HTMLCollectionOf<ClassMap[T]>
	getElementsByTagName<T extends keyof TagMap>(tagName: T): NodeListOf<TagMap[T]>;
}
