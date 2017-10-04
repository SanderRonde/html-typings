import { ArgumentParser } from 'argparse';
import path = require('path');
import { Parser } from 'htmlparser2';
import { Glob } from 'glob';
import fs = require('fs');

const parser = new ArgumentParser({
	addHelp: true,
	description: 'Generates typings for your HTML files'
});
parser.addArgument(['-i', '--input'], {
	help: 'The path to a single file, a folder, or a glob pattern',
	required: true
});
parser.addArgument(['-o', '--output'], {
	help: 'The location to output the typings to',
	required: true
});
parser.addArgument(['-d', '--dom-module'], {
	help: 'Splits dom-modules into their own subsection',
	action: 'storeTrue'
});

const args: {
	input: string;
	output: string;
} = parser.parseArgs();

function getFilePath(filePath: string): string {
	if (path.isAbsolute(filePath)) {
		return filePath;
	}
	return path.join(process.cwd().trim(), filePath.trim());
}

function getInputFiles(files: string|string[]): Promise<string[]> {
	return new Promise((resolve, reject) => {
		if (Array.isArray(files)) {
			resolve(files.map(getFilePath));
			return;
		}
		new Glob(getFilePath(files), {
			absolute: true
		}, (err, matches) => {
			if (err) {
				console.error('Error reading input', err);
				process.exit(2);
			} else {
				const nonDirMatches = matches.filter(match => match.lastIndexOf('/') !== match.length - 1);
				const htmlFileMatches = nonDirMatches.filter(match => match.lastIndexOf('.html') === match.length - 5);
				resolve(htmlFileMatches);
			}
		});
	});
}

async function readInputFiles(inputs: string[]): Promise<string[]> {
	return Promise.all(inputs.map((input) => {
		return new Promise<string>((resolve) => {
			fs.readFile(input, 'utf8', (err, data) => {
				if (err) {
					console.error('Error reading input file(s)', err);
					process.exit(2);
				} else {
					resolve(data);
				}
			});
		});
	}));
}

const getFileTemplate = (selectorMap: string, idMap: string, classMap: string, moduleMap: string) => {
	return `interface SelectorMap ${selectorMap}

interface IDMap ${idMap}

interface ClassMap ${classMap}

interface ModuleMap ${moduleMap}

interface NodeSelector {
	querySelector<T extends keyof SelectorMap>(selector: T): SelectorMap[T];
	querySelectorAll<T extends keyof SelectorMap>(selector: T): SelectorMap[T][];
}

interface Document {
	getElementById<T extends keyof IDMap>(elementId: T): IDMap[T];
	getElementsByClassName<T extends keyof ClassMap>(classNames: string): HTMLCollectionOf<ClassMap[T]>
}

type ModuleIDs<T extends keyof ModuleMap> = ModuleMap[T];`;
}

function stringToType(str: string) {
	return str.replace(/":( )?"((\w|#|\.|\|)+)"/g, '": $2');
}

function prettyify(str: string) {
	if (str === '{}') {
		return '{}';
	}
	str = str
		.replace(/"((#|\.)?\w+)": ((\w|\|)+),/g, '"$1": $3,')
		.replace(/"((#|\.)?\w+)": ((\w|\|)+)},/g, '"$1": $3\n},')
		.replace(/"(\w+)":{/g, '"$1":{\n')
		.replace(/\n},"/g, '\n},\n"')
		.replace(/{\n}/g, '{ }')
		.replace(/"(\w+)": (\w+)}}/g, '\t"$1": $2\n}\n}')
		.replace(/{"/g, '{\n"')
		.replace(/:"{ }",/, ':{ },\n')
		.replace(/,/g, ';')
		.replace(/(\s+)\}/g, ';\n}')
	const split = str.split('\n');
	return split.join('\n');
}

function getTagType(name: string) {
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
			return `HTML${name.split('-').map((word) => {
				return word[0].toUpperCase() + word.slice(1);
			}).join('')}Element`;
	}
}

function getTypings(file: string) {
	const map: {
		ids: {
			[key: string]: string;
		}
		classes: [string, string][]
		module?: string;
	} = {
		ids: {},
		classes: []
	};

	let domModuleKey: string = null;
	const parser = new Parser({
		 onopentag(name, attribs) {
			if (name === 'dom-module') {
				domModuleKey = attribs.id;
				return;
			} else if (name === 'template') {
				if (attribs.id) {
					map.ids[`#${attribs.id}`] = attribs['data-element-type'] ||
						getTagType(attribs.is);
				}
			} else {
				if (attribs.id) {
					map.ids[`#${attribs.id}`] = attribs['data-element-type'] ||
						getTagType(name);
				}
			}
			if (attribs.class) {
				map.classes.push([attribs.class, attribs['data-element-type'] || 
					getTagType(name)]);
			}
		 }
	});

	parser.write(file);
	parser.end();

	if (domModuleKey) {
		map.module = domModuleKey;
	}

	return map;
}

interface TypingsObj {
    selectors: {
        [key: string]: string;
    };
    modules: {
        [key: string]: {
            [key: string]: string;
        };
    };
    ids: {
        [key: string]: string;
    };
    classes: {
        [key: string]: string;
    };
}

function formatTypings(typings: {
	[key: string]: string|{
		[key: string]: string;
	};
}) {
	return prettyify(stringToType(JSON.stringify(typings, null, '\t')))
}

function convertToDefsFile(typings: TypingsObj) {
	const { classes, ids, modules, selectors } = typings;
	return getFileTemplate(formatTypings(selectors), 
		formatTypings(ids), formatTypings(classes), formatTypings(modules));
}

function removeKeysFirstChar(obj: {
	[key: string]: string;
}): {
	[key: string]: string;
} {
	const newObj: {
		[key: string]: string;
	} = {};

	for (let key in obj) {
		const oldKey = key;
		if (key.indexOf('#') === 0 || key.indexOf('.') === 0) {
			key = key.slice(1);
		}
		newObj[key] = obj[oldKey];
	}

	return newObj;
}

function mergeTypes(types: {
	ids: {
		[key: string]: string;
	}
	classes: [string, string][]
	module?: string;
}[]) {
	let selectorMap: {
		[key: string]: string
	} = {};

	const moduleMap: {
		[key: string]: {
			[key: string]: string;
		}
	} = {};

	let idMap: {
		[key: string]: string
	} = {};

	const allClassTypes: {
		[key: string]: string[]
	} = {};

	types.forEach((typeMap) => {
		if (typeMap.module) {
			moduleMap[typeMap.module] = removeKeysFirstChar(typeMap.ids);
		}
		idMap = { ...idMap, ...removeKeysFirstChar(typeMap.ids) }
		selectorMap = { ...selectorMap, ...typeMap.ids }

		typeMap.classes.forEach((typeMapClass) => {
			const [className, tagName] = typeMapClass;
			if (className in allClassTypes) {
				if (allClassTypes[className].indexOf(tagName) === -1) {
					allClassTypes[className].push(tagName);
				}
			} else {
				allClassTypes[className] = [tagName];
			}
		});
	});

	const joinedClassNames: {
		[key: string]: string;
	} = {};

	Object.getOwnPropertyNames(allClassTypes).forEach((className: string) => {
		selectorMap[`.${className}`] = allClassTypes[className].join('|');
		joinedClassNames[className] = allClassTypes[className].join('|');
	});

	return {
		selectors: selectorMap,
		modules: moduleMap,
		ids: idMap,
		classes: joinedClassNames
	}
}

async function getTypingsForInput(input: string|string[]) {
	const files = await getInputFiles(input);
	const contents = await readInputFiles(files);
	return mergeTypes(contents.map((fileContent) => {
		return getTypings(fileContent);
	}));
}

function outputExists(): Promise<void> {
	return new Promise((resolve) => {

		const outPath = getFilePath(args.output);
		fs.stat(outPath, (err, stats) => {
			if (err) {
				console.error('Invalid output file');
				process.exit(1);
			} else {
				if (stats.isDirectory()) {
					console.log('Output file is directory');
					process.exit(1);
				} else {
					resolve(null);
				}
			}
		});
	});
}

async function main() {
	await outputExists();
	const typings = await getTypingsForInput(args.input);
	fs.writeFile(getFilePath(args.output), convertToDefsFile(typings), (err) => {
		if (err) {
			console.error('Error writing to file');
			process.exit(1);
		} else {
			process.exit(0);
		}
	});
}

export function extractStringTypes(fileContents: string): string;
export function extractStringTypes(fileContents: string, getTypesObj: boolean): TypingsObj;
export function extractStringTypes(fileContents: string, getTypesObj = false): string|TypingsObj {
	const typings = mergeTypes([getTypings(fileContents)]);
	return getTypesObj ? typings : convertToDefsFile(typings);
}

export async function extractGlobTypes(glob: string): Promise<string>;
export async function extractGlobTypes(glob: string, getTypesObj: boolean): Promise<TypingsObj>;
export async function extractGlobTypes(glob: string, getTypesObj = false): Promise<string|TypingsObj> {
	const typings = await getTypingsForInput(glob);
	return getTypesObj ? typings : convertToDefsFile(typings);
}

export async function extractFileTypes(files: string|string[]): Promise<string>;
export async function extractFileTypes(files: string|string[], getTypesObj: boolean): Promise<TypingsObj>;
export async function extractFileTypes(files: string|string[], getTypesObj = false): Promise<string|TypingsObj> {
	const typings = await getTypingsForInput(files);
	return getTypesObj ? typings : convertToDefsFile(typings);
}

export async function extractFolderTypes(folder: string): Promise<string>;
export async function extractFolderTypes(folder: string, getTypesObj: boolean): Promise<TypingsObj>;
export async function extractFolderTypes(folder: string, getTypesObj = false): Promise<string|TypingsObj> {
	const typings = await getTypingsForInput(folder + '**/*');
	return getTypesObj ? typings : convertToDefsFile(typings);
}

if (require.main === module) {
	//Called via command-line
	main();
}