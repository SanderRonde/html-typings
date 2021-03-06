interface SelectorMap {
	"#test1": HTMLDivElement;
	"#test2": HTMLDivElement;
	"#test3": HTMLDivElement;
	"#test4": HTMLDivElement;
	"#test6": HTMLDivElement;
	"#test7": HTMLDivElement;
	"#test8": HTMLDivElement;
	"#test9": HTMLDivElement;
	".test4": HTMLAudioElement|HTMLDivElement|HTMLElement|HTMLFormElement|HTMLInputElement|HTMLSpanElement;
}

interface IDMap {
	"test1": HTMLDivElement;
	"test2": HTMLDivElement;
	"test3": HTMLDivElement;
	"test4": HTMLDivElement;
	"test6": HTMLDivElement;
	"test7": HTMLDivElement;
	"test8": HTMLDivElement;
	"test9": HTMLDivElement;
}

interface ClassMap {
	"test4": HTMLAudioElement|HTMLDivElement|HTMLElement|HTMLFormElement|HTMLInputElement|HTMLSpanElement;
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
