interface SelectorMap {
	"#sourceEditor": HTMLDivElement;
	"#sourceHTMLTab": HTMLDivElement;
	"#sourceTSTab": HTMLDivElement;
	"#tryEditor": HTMLDivElement;
	".active": HTMLDivElement;
	".btn": HTMLAnchorElement;
	".container": HTMLDivElement;
	".editor": HTMLDivElement;
	".editorElement": HTMLDivElement;
	".editorTabs": HTMLDivElement;
	".editors": HTMLDivElement;
	".main-content": HTMLElement;
	".mainContent": HTMLElement;
	".page-header": HTMLElement;
	".pageName": HTMLDivElement;
	".project-name": HTMLHeadingElement;
	".project-tagline": HTMLHeadingElement;
	".site-footer": HTMLElement;
	".site-footer-credits": HTMLSpanElement;
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
	"btn": HTMLAnchorElement;
	"container": HTMLDivElement;
	"editor": HTMLDivElement;
	"editorElement": HTMLDivElement;
	"editorTabs": HTMLDivElement;
	"editors": HTMLDivElement;
	"main-content": HTMLElement;
	"mainContent": HTMLElement;
	"page-header": HTMLElement;
	"pageName": HTMLDivElement;
	"project-name": HTMLHeadingElement;
	"project-tagline": HTMLHeadingElement;
	"site-footer": HTMLElement;
	"site-footer-credits": HTMLSpanElement;
	"site-footer-owner": HTMLSpanElement;
}

interface ModuleMap {}

interface NodeSelector {
	querySelector<T extends keyof SelectorMap>(selector: T): SelectorMap[T];
	querySelectorAll<T extends keyof SelectorMap>(selector: T): SelectorMap[T][];
}

interface Document {
	getElementById<T extends keyof IDMap>(elementId: T): IDMap[T];
	getElementsByClassName<T extends keyof ClassMap>(classNames: string): HTMLCollectionOf<ClassMap[T]>
}

type ModuleIDs<T extends keyof ModuleMap> = ModuleMap[T];