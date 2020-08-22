export namespace Constants {
	export const getFileTemplate = (
		selectorMap: string,
		idMap: string,
		classMap: string,
		moduleMap: string,
		tagMap: string,
		doExport: boolean
	) => {
		const prefix = doExport ? 'export ' : '';
		return `${prefix}interface SelectorMap ${selectorMap}

${prefix}interface IDMap ${idMap}

${prefix}interface ClassMap ${classMap}

${prefix}interface ModuleMap ${moduleMap}

${prefix}interface TagMap ${tagMap}

${prefix}interface NodeSelector {
	querySelector<T extends keyof SelectorMap>(selector: T): SelectorMap[T];
	querySelectorAll<T extends keyof SelectorMap>(selector: T): SelectorMap[T][];
}

${prefix}interface Document {
	getElementById<T extends keyof IDMap>(elementId: T): IDMap[T];
	getElementsByClassName<T extends keyof ClassMap>(classNames: string): HTMLCollectionOf<ClassMap[T]>
	getElementsByTagName<T extends keyof TagMap>(tagName: T): NodeListOf<TagMap[T]>;
}
${
	doExport
		? `
export type ModuleIDs<T extends keyof ModuleMap> = ModuleMap[T];

export type SelectorMapType = ${selectorMap}

export type IDMapType = ${idMap}

export type ClassMapType = ${classMap}

export type ModuleMapType = ${moduleMap}

export type TagMapType = ${tagMap}`
		: ''
}`;
	};

	export function getTagType(name: string, typeArgs: string[] = []) {
		const base = (() => {
			switch (name) {
				case 'svg':
					return 'SVGElement';
				case 'textarea':
					return 'HTMLTextAreaElement';
				case 'a':
					return 'HTMLAnchorElement';
				case 'h1':
				case 'h2':
				case 'h3':
				case 'h4':
				case 'h5':
				case 'h6':
					return 'HTMLHeadingElement';
				case 'br':
					return 'HTMLBRElement';
				case 'img':
					return 'HTMLImageElement';
				case 'b':
					return 'HTMLElement';
				case undefined:
					return 'HTMLTemplateElement';
				case 'hr':
					return 'HTMLHRElement';
				case 'li':
					return 'HTMLLIElement';
				case 'ol':
					return 'HTMLOListElement';
				case 'p':
					return 'HTMLParagraphElement';
				case 'ul':
					return 'HTMLUListElement';
				case 'tbody':
				case 'thead':
				case 'td':
					return 'HTMLTableDataCellElement';
				case 'tfoot':
					return 'HTMLTableSectionElement';
				case 'th':
					return 'HTMLTableHeaderCellElement';
				case 'tr':
					return 'HTMLTableRowElement';
				case 'datalist':
					return 'HTMLDataListElement';
				case 'fieldset':
					return 'HTMLFieldSetElement';
				case 'optgroup':
					return 'HTMLOptGroupElement';
				case 'frameset':
					return 'HTMLFrameSetElement';
				case 'address':
				case 'article':
				case 'aside':
				case 'footer':
				case 'header':
				case 'hgroup':
				case 'nav':
				case 'section':
				case 'blockquote':
				case 'dd':
				case 'dl':
				case 'dt':
				case 'figcaption':
				case 'figures':
				case 'figure':
				case 'main':
				case 'abbr':
				case 'bdi':
				case 'cite':
				case 'code':
				case 'dfn':
				case 'em':
				case 'i':
				case 'kbd':
				case 'mark':
				case 'q':
				case 'rp':
				case 'rt':
				case 'rtc':
				case 'ruby':
				case 's':
				case 'samp':
				case 'small':
				case 'strong':
				case 'sup':
				case 'var':
				case 'wbr':
				case 'noscript':
				case 'del':
				case 'ins':
				case 'caption':
				case 'col':
				case 'colgroup':
				case 'details':
				case 'dialog':
				case 'menuitem':
				case 'summary':
				case 'content':
				case 'element':
				case 'shadw':
				case 'acronym':
				case 'basefront':
				case 'big':
				case 'blink':
				case 'center':
				case 'command':
				case 'dir':
				case 'isindex':
				case 'key':
				case 'listing':
				case 'multicol':
				case 'nextid':
				case 'noembed':
				case 'plaintext':
				case 'spacer':
				case 'strike':
				case 'tt':
				case 'xmp':
				case 'shadow':
				case 'sub':
				case 'u':
					return 'HTMLElement';
				default:
					return `HTML${name
						.split('-')
						.map((word) => {
							return word[0].toUpperCase() + word.slice(1);
						})
						.join('')}Element`;
			}
		})();
		if (typeArgs && typeArgs.length) {
			return `${base}<${typeArgs.join(',')}>`;
		}
		return base;
	}
}
