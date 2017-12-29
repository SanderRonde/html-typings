/// <reference path="../typings/gaze.d.ts"/>
import { ArgumentParser } from 'argparse';
import { Parser } from 'htmlparser2';
import parse = require('pug-parser');
import lex = require('pug-lexer');
import path = require('path');
import { Gaze }  from 'gaze';
import { Glob } from 'glob';
import fs = require('fs');

namespace Input {
	const parser = new ArgumentParser({
		addHelp: true,
		description: 'Generates typings for your HTML files',
		debug: !!process.env.DEBUG_HTML_TYPINGS
	} as any);
	parser.addArgument(['-i', '--input'], {
		help: 'The path to a single file, a folder, or a glob pattern',
		required: true
	});
	parser.addArgument(['-o', '--output'], {
		help: 'The location to output the typings to',
		required: true
	});
	parser.addArgument(['-w', '--watch'], {
		help: 'Watch for HTML file changes',
		action: 'storeTrue'
	});

	export function parse(programArgs?: string[]) {
		args = parser.parseArgs(programArgs);
	}

	export let args: {
		input: string;
		output: string;
		watch: boolean;
	};
}

namespace Logging {
	let reroute: boolean = false;
	let listeners: {
		exit(code: number): void;
		error(...args: any[]): void;
		log(...args: any[]): void;
	} = null;

	export function handle(handlers: {
		exit(code: number): void;
		error(...args: any[]): void;
		log(...args: any[]): void;
	}) {
		reroute = true;
		listeners = handlers;
	}

	export function exit(code: number = 0) {
		if (reroute) {
			listeners.exit(code);
		} else {
			process.exit(code);
		}
	}

	export function error(...args: any[]) {
		if (reroute) {
			listeners.error(...args);
		} else {
			console.error(...args);
		}
	}

	export function log(...args: any[]) {
		if (reroute) {
			listeners.log(...args);
		} else {
			console.log(...args);
		}
	}
}

namespace Util {
	export function getFilePath(filePath: string): string {
		if (path.isAbsolute(filePath)) {
			return filePath;
		}
		return path.join(process.cwd().trim(), filePath.trim());
	}
	
	export function endsWith(str: string, end: string): boolean {
		return str.lastIndexOf(end) === str.length - end.length;
	}

	export function isHtmlFile(file: string): boolean {
		return Util.endsWith(file, '.html') || 
			Util.endsWith(file, '.jade') || 
			Util.endsWith(file, '.pug');
	}

	export enum FileTypes {
		HTML,
		PUG,
		UNKNOWN
	}

	export function getFileType(name: string) {
		if (endsWith(name, '.html')) {
			return FileTypes.HTML;
		}
		if (endsWith(name, '.pug') || endsWith(name, '.jade')) {
			return FileTypes.PUG;
		}
		return FileTypes.UNKNOWN;
	}

	export function objectForEach<U, P, O extends {
		[key: string]: U;
	} = {
		[key: string]: U;
	}>(obj: O, map: (value: U, key: keyof O) => P, base: {
		[key: string]: P;
	} = {}): {
		[key: string]: P
	} {
		const newObj: {
			[key: string]: P;
		} = {};
	
		for (let key in obj) {
			if (key in base) {
				newObj[key] = base[key];
			} else {
				newObj[key] = map(obj[key], key);
			}
		}
	
		return newObj;
	}

	export function removeKeysFirstChar(obj: {
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

	export function sortObj<T extends {
		[key: string]: any;
	}>(obj: T): T {
		const newObj: Partial<T> = {};
		const keys = Object.getOwnPropertyNames(obj).sort();
		keys.forEach((key) => {
			newObj[key] = obj[key];
		});
		return newObj as T;
	}
}

namespace Files {
	export function getInputFiles(files: string|string[]): Promise<string[]> {
		return new Promise((resolve, reject) => {
			if (Array.isArray(files)) {
				resolve(files.map(Util.getFilePath));
				return;
			}
			new Glob(Util.getFilePath(files), {
				absolute: true
			}, (err, matches) => {
				if (err) {
					Logging.error('Error reading input', err);
					Logging.exit(2);
				} else {
					const nonDirMatches = matches.filter(match => !Util.endsWith(match, '/'));
					const htmlFileMatches = nonDirMatches.filter(match => Util.isHtmlFile(match));
					resolve(htmlFileMatches);
				}
			});
		});
	}

	export async function readInputFiles(inputs: string[], skip: string[] = []): Promise<{
		[key: string]: string;
	}> {
		const fileMap: {
			[key: string]: string;
		} = { }
		await Promise.all(inputs.map((input) => {
			return new Promise<string>((resolve) => {
				if (skip.indexOf(input) > -1) {
					resolve('');
				}
				fs.readFile(input, 'utf8', (err, data) => {
					if (err) {
						Logging.error('Error reading input file(s)', err);
						Logging.exit(2);
					} else {
						fileMap[input] = data;
						resolve(data);
					}
				});
			});
		}));
		return fileMap;
	}
}

namespace Main {
	namespace Constants {
		export const getFileTemplate = (selectorMap: string, idMap: string, classMap: string, moduleMap: string, tagMap: string) => {
			return `interface SelectorMap ${selectorMap}

interface IDMap ${idMap}

interface ClassMap ${classMap}

interface ModuleMap ${moduleMap}

interface TagMap ${tagMap}

interface NodeSelector {
	querySelector<T extends keyof SelectorMap>(selector: T): SelectorMap[T];
	querySelectorAll<T extends keyof SelectorMap>(selector: T): SelectorMap[T][];
}

interface Document {
	getElementById<T extends keyof IDMap>(elementId: T): IDMap[T];
	getElementsByClassName<T extends keyof ClassMap>(classNames: string): HTMLCollectionOf<ClassMap[T]>
	getElementsByTagName<T extends keyof TagMap>(tagName: T): NodeListOf<TagMap[T]>;
}

type ModuleIDs<T extends keyof ModuleMap> = ModuleMap[T];`;
		}

		export function getTagType(name: string) {
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
	}

	namespace Prettifying {
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

		export function formatTypings(typings: {
			[key: string]: string|{
				[key: string]: string;
			};
		}) {
			return prettyify(stringToType(JSON.stringify(typings, null, '\t')))
		}
	}

	export namespace Conversion {
		export namespace Extraction {
			export interface PartialTypingsObj {
				ids: {
					[key: string]: string;
				};
				classes: [string, string][];
				module?: string;
			}

			export interface ModuleMappingPartialTypingsObj {
				[moduleName: string]: PartialTypingsObj;
			}

			export function parseHTML(content: string) {
				const handler = new ParserHandler();
				const parser = new Parser(handler.genObj());
		   
			   parser.write(content);
			   parser.end();

			   return handler.done();;
			}
			
			const included: {
				[file: string]: PugParser.ParserBlock
			} = {};

			export function fillInclude(includePath: string, filePath: string) {
				if (includePath in included) {
					return JSON.parse(JSON.stringify(included[includePath]));
				}

				if (filePath === null) {
					throw new Error('Pug base path not given, please pass it using the options.pugPath setting');
				}
				const includeFinalPath = path.isAbsolute(includePath) ?
					includePath : path.join(path.dirname(filePath), 
						includePath);
				const includeFile = fs.readFileSync(includeFinalPath, {
					encoding: 'utf8'
				});
				const parsed = fillIncludes(parse(lex(includeFile)), filePath);
				included[includePath] = JSON.parse(JSON.stringify(parsed));
				return parsed;
			}

			export function traverseConditionalWithoutReplacement(token: PugParser.ParserConditional, 
				callback: (node: PugParser.ParserNode) => PugParser.ParserNode) {
					traverseBlocks(token.consequent, callback);
					if (token.alternate) {
						if (token.alternate.type === 'Block') {
							traverseBlocks(token.alternate, callback);
						} else {
							traverseConditionalWithoutReplacement(token.alternate, callback);
						}
					}
				}

			export function traverseBlocks(tokens: PugParser.ParserBlock, callback: (node: PugParser.ParserNode) => PugParser.ParserNode) {
				for (const index in tokens.nodes) {
					const token = tokens.nodes[index];
					if (token.type === 'Conditional') {
						traverseConditionalWithoutReplacement(token, callback);
					} else if (token.type !== 'Block') {
						tokens.nodes[index] = callback(token);
						if (token.block) {
							traverseBlocks(token.block, callback);
						}
					} else {
						traverseBlocks(token, callback);
					}
				}
			}

			export function fillIncludes(tokens: PugParser.ParserBlock, filePath: string) {
				traverseBlocks(tokens, (node) => {
					if (node.type === 'Include') {
						return fillInclude(node.file.path, filePath);
					}
					return node;
				});
				return tokens;
			}

			export function fillMixins(tokens: PugParser.ParserBlock) {
				const definedMixins: {
					[key: string]: PugParser.ParserBlock;
				} = {};
				
				//First find them
				traverseBlocks(tokens, (node) => {
					if (node.type === 'Mixin' && node.call === false) {
						definedMixins[node.name] = node.block;
						return {
							type: 'Block',
							line: node.line,
							filename: null,
							nodes: []
						}
					}
					return node;
				});

				//Then replace them
				traverseBlocks(tokens, (node) => {
					if (node.type === 'Mixin' && node.call === true && node.name in definedMixins) {
						return definedMixins[node.name];
					}
					return node;
				});

				return tokens;
			}

			export function lexPug(content: string, filePath: string) {
				return fillMixins(fillIncludes(parse(lex(content)), filePath));
			}

			export function objectifyAttributes(attribs: {
				name: string;
				val: any;
				mustEscape: boolean;
			}[]): {
				[key: string]: string;
			} {
				const obj: {
					[key: string]: string;
				} = {};
				for (let {name, val, mustEscape} of attribs) {
					if (!mustEscape) {
						obj[name] = stripQuotes(val);
					}
				}
				return obj;
			}

			export function traverseConditional(node: PugParser.ParserConditional, fns: {
				onopentag(name: string, attribs: {
					[key: string]: string;
				}): void;
				onclosetag(name: string): void;
			}) {
				traversePug(node.consequent, fns);
				if (node.alternate) {
					if (node.alternate.type === 'Block') {
						traversePug(node.alternate, fns);
					} else {
						traverseConditional(node.alternate, fns);
					}
				}
			}

			export function traversePug(content: PugParser.ParserBlock, fns: {
				onopentag(name: string, attribs: {
					[key: string]: string;
				}): void;
				onclosetag(name: string): void;
			}) {
				if (!content || !content.nodes) {
					return;
				}
				for (const node of content.nodes) {
					if (node.type === 'Block') {
						traversePug(node, fns);
					} else if (node.type === 'Tag') {
						fns.onopentag(node.name, objectifyAttributes(node.attrs));
						traversePug(node.block, fns);
						fns.onclosetag(node.name);
					} else if (node.type === 'Conditional') {
						traverseConditional(node, fns);
					} else if (node.block && node.block.nodes.length) {
						traversePug(node.block, fns);
					}
				}
			}

			export function stripQuotes(word: any) {
				return typeof word === 'string' ? 
					word.slice(1, -1) : word;
			}

			export class ParserHandler {
				public maps: {
					[moduleName: string]: {
						ids: {
							[key: string]: string;
						}
						classes: [string, string][]
					}
				} = {
					__default__: {
						ids: {},
						classes: []
					}
				}
				public mapKey: string = '__default__';

				constructor() { }

				public onOpen(name: string, attribs: {
					[key: string]: string;
				}) {
					if (name === 'dom-module') {
						this.mapKey = attribs.id;
						this.maps[this.mapKey] = {
							ids: {},
							classes: []
						}
						return;
					} else if (name === 'template') {
						if (attribs.id) {
							this.maps[this.mapKey].ids[`#${attribs.id}`] = attribs['data-element-type'] ||
								Constants.getTagType(attribs.is);
						}
					} else {
						if (attribs.id) {
							this.maps[this.mapKey].ids[`#${attribs.id}`] = attribs['data-element-type'] ||
								Constants.getTagType(name);
						}
					}
					if (attribs.class) {
						this.maps[this.mapKey].classes.push([attribs.class, attribs['data-element-type'] || 
							Constants.getTagType(name)]);
					}
				}

				public onClose(name: string) {
					if (name === 'dom-module') {
						this.mapKey = '__default__';
					}
				}

				genObj() {
					return {
						onopentag: this.onOpen.bind(this),
						onclosetag: this.onClose.bind(this)
					}
				}

				done() {
					return this.maps;
				}
			}

			export function parsePug(content: string, filePath: string): ModuleMappingPartialTypingsObj {
				const handler = new ParserHandler();
				traversePug(lexPug(content, filePath), handler.genObj());
				return handler.done();
			}

			export function getTypings(file: string, filePath: string, fileType: Util.FileTypes): ModuleMappingPartialTypingsObj {
				switch (fileType) {
					case Util.FileTypes.PUG:
						return parsePug(file, filePath);
					case Util.FileTypes.HTML:
					default:
						return parseHTML(file);
				}
			}
			
			export async function writeToOutput(typings: TypingsObj) {
				return new Promise((resolve, reject) => {
					fs.writeFile(Util.getFilePath(Input.args.output), Joining.convertToDefsFile(typings), (err) => {
						if (err) {
							Logging.error('Error writing to file');
							reject(err);
						} else {
							if (!Input.args.watch) {
								Logging.log('Output to', Util.getFilePath(Input.args.output));
							}
							resolve();
						}
					});
				});
			}

			export async function extractTypes(files?: string[]) {
				const typings = await getTypingsForInput(Input.args.input, files);
				return writeToOutput(typings);
			}

			export async function getSplitTypings(input: string|string[], files?: string[], splitTypings: {
				[key: string]: ModuleMappingPartialTypingsObj;
			} = {}) {
				files = files || await Files.getInputFiles(input)
				files = files.sort();
				const toSkip = Object.getOwnPropertyNames(splitTypings);
				const contentsMap = await Files.readInputFiles(files, toSkip);
				return Util.objectForEach<string, ModuleMappingPartialTypingsObj>(contentsMap, (fileContent, fileName) => {
					return getTypings(fileContent, fileName, Util.getFileType(fileName));
				}, splitTypings);
			}
			
			export async function getTypingsForInput(input: string|string[], files?: string[]) {
				const typingMaps = await getSplitTypings(input, files);
				return Joining.mergeTypes(typingMaps);
			}
		}

		export namespace Joining {
			export function mergeTypes(types: {
				[fileName: string]: {
					[moduleName: string]: {
						ids: {
							[key: string]: string;
						}
						classes: [string, string][]
						module?: string;
					}
				}
			}) {
				let selectorMap: {
					[key: string]: string
				} = {};
			
				const moduleMap: {
					[moduleName: string]: {
						[key: string]: string;
					}
				} = {};
			
				let idMap: {
					[key: string]: string
				} = {};
			
				const allClassTypes: {
					[key: string]: string[]
				} = {};

				const tagNameMap: {
					[key: string]: string;
				} = {};
			
				for (let fileName in types) {
					for (let moduleName in types[fileName]) {
						const typeMap = types[fileName][moduleName];
						if (moduleName !== '__default__') {
							moduleMap[moduleName] = Util.removeKeysFirstChar(typeMap.ids);
							tagNameMap[moduleName] = Constants.getTagType(moduleName);
							selectorMap[moduleName] = tagNameMap[moduleName];
						}
						idMap = { ...idMap, ...Util.removeKeysFirstChar(typeMap.ids) }
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
					}
				}
			
				const joinedClassNames: {
					[key: string]: string;
				} = {};
			
				Object.getOwnPropertyNames(allClassTypes).forEach((className: string) => {
					selectorMap[`.${className}`] = allClassTypes[className].sort().join('|');
					joinedClassNames[className] = allClassTypes[className].sort().join('|');
				});
			
				return {
					selectors: Util.sortObj(selectorMap),
					modules: Util.sortObj(moduleMap),
					ids: Util.sortObj(idMap),
					classes: Util.sortObj(joinedClassNames),
					tags: Util.sortObj(tagNameMap)
				}
			}

			export function convertToDefsFile(typings: TypingsObj) {
				const { classes, ids, modules, selectors, tags } = typings;
				return Constants.getFileTemplate(Prettifying.formatTypings(selectors), 
				Prettifying.formatTypings(ids), Prettifying.formatTypings(classes), 
				Prettifying.formatTypings(modules), Prettifying.formatTypings(tags));
			}			
		}
	}
}

function watchFiles(input: string, callback: (changedFile: string, files: string[]) => void) {
	const gaze = new Gaze(input, {}, (err, watcher) => {
		if (err) {
			Logging.error(err);
			Logging.exit(1);
		}
	});

	gaze.on('all', (event, filePath) => {
		switch (event) {
			case 'added':
			case 'changed':
			case 'deleted':
				callback(filePath, getWatched(gaze));
				break;
		}
	});

	return gaze;
}

async function doWatchCompilation(files: string[], previousTypings: {
	[key: string]: Main.Conversion.Extraction.ModuleMappingPartialTypingsObj;
}) {
	const splitTypings = await Main.Conversion.Extraction.getSplitTypings(Input.args.input, files, previousTypings);
	const joinedTypes = Main.Conversion.Joining.mergeTypes(splitTypings);
	Main.Conversion.Extraction.writeToOutput(joinedTypes).then(() => {
		Logging.log('Generated typings');
	}).catch((err) => {
		Logging.exit(1);
	});
	return splitTypings;
}

function getWatched(watcher: Gaze): string[] {
	const watched = watcher.watched();
	const keys = Object.getOwnPropertyNames(watched);
	let files: string[] = [];
	for (let i = 0; i < keys.length; i++) {
		files = [...files, ...watched[keys[i]]]
	}
	return files.filter((file) => {
		return file && Util.isHtmlFile(file);
	});
}

function main() {
	let close: () => void = null;
	(async () => {
		let watcher: Gaze = null;
		close = () => {
			watcher && watcher.close();
			Logging.exit(0);
		}
		if (Input.args.watch) {
			let splitTypings: {
				[key: string]: Main.Conversion.Extraction.ModuleMappingPartialTypingsObj;
			} = null;
			let input = Input.args.input;
			if (Util.endsWith(Input.args.input, '/') || 
				Util.endsWith(Input.args.input, '\\')) {
					input = input + '**/*.*';
				} else if (Input.args.input.split(/\\\//).slice(-1)[0].indexOf('.') === -1) {
					input = input + '/**/*.*';
				}
			watcher = watchFiles(input, async (changedFile, files) => {
				Logging.log('File(s) changed, re-generating typings for new file(s)');
				delete splitTypings[changedFile];
				splitTypings = await doWatchCompilation(files, splitTypings);
			});	
			splitTypings = await doWatchCompilation(getWatched(watcher), {})
		} else {
			Main.Conversion.Extraction.extractTypes().then(() => {
				Logging.exit(0);
			}).catch(() => {
				Logging.exit(1);
			});
		}
	})();

	return () => {
		close();
	}
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
	tags: {
		[key: string]: string;
	}
}

export function extractStringTypes(fileContents: string): string;
export function extractStringTypes(fileContents: string, options: {
	isPug?: boolean;
	getTypesObj?: null|false;
	pugPath?: string;
}): string;
export function extractStringTypes(fileContents: string, options: {
	isPug?: boolean;
	getTypesObj?: true;
	pugPath?: string;
}): TypingsObj;
export function extractStringTypes(fileContents: string, options: {
	isPug?: boolean;
	getTypesObj?: boolean|null;
	pugPath?: string;
} = {
	isPug: false,
	getTypesObj: false,
	pugPath: null
}): string|TypingsObj {
	const { isPug, getTypesObj, pugPath } = options;

	const typings = Main.Conversion.Joining.mergeTypes({
		'string': Main.Conversion.Extraction.getTypings(fileContents, 
			pugPath, isPug ? Util.FileTypes.PUG : Util.FileTypes.HTML)
	});
	return getTypesObj ? typings : Main.Conversion.Joining.convertToDefsFile(typings);
}

export async function extractGlobTypes(glob: string): Promise<string>;
export async function extractGlobTypes(glob: string, getTypesObj: boolean): Promise<TypingsObj>;
export async function extractGlobTypes(glob: string, getTypesObj = false): Promise<string|TypingsObj> {
	const typings = await Main.Conversion.Extraction.getTypingsForInput(glob);
	return getTypesObj ? typings : Main.Conversion.Joining.convertToDefsFile(typings);
}

export async function extractFileTypes(files: string|string[]): Promise<string>;
export async function extractFileTypes(files: string|string[], getTypesObj: boolean): Promise<TypingsObj>;
export async function extractFileTypes(files: string|string[], getTypesObj = false): Promise<string|TypingsObj> {
	const typings = await Main.Conversion.Extraction.getTypingsForInput(files);
	return getTypesObj ? typings : Main.Conversion.Joining.convertToDefsFile(typings);
}

export async function extractFolderTypes(folder: string): Promise<string>;
export async function extractFolderTypes(folder: string, getTypesObj: boolean): Promise<TypingsObj>;
export async function extractFolderTypes(folder: string, getTypesObj = false): Promise<string|TypingsObj> {
	const typings = await Main.Conversion.Extraction.getTypingsForInput(folder + '**/*');
	return getTypesObj ? typings : Main.Conversion.Joining.convertToDefsFile(typings);
}

function addToHandlers<T extends {
	[key: string]: P[]
}, P>(handlers: T, event: 'exit'|'error'|'log', handler: P) {
	if (event === 'exit' || event === 'error' || event === 'log') {
		if (event === 'exit') {
			handlers[event].push(handler);
		} else {
			handlers[event].push(handler);
		}
	}
}

export function cli(args: string[]): {
	on(event: 'exit', handler: (exitCode: number) => void): void;
	on(event: 'error', handler: (...args: any[]) => void): void;
	on(event: 'log', handler: (...args: any[]) => void): void;
	addEventListener(event: 'exit', handler: (exitCode: number) => void): void;
	addEventListener(event: 'error', handler: (...args: any[]) => void): void;
	addEventListener(event: 'log', handler: (...args: any[]) => void): void;
	quit(): void;
} {
	const handlers: {
		exit: ((code: number) => void)[];
		error: ((...args: any[]) => void)[];
		log: ((...args: any[]) => void)[];
	} = {
		exit: [],
		error: [],
		log: []
	}
	Logging.handle({
		exit(code) {
			handlers.exit.forEach((handler) => {
				handler(code);
			});
		},
		error(...args: any[]) {
			handlers.error.forEach((handler) => {
				handler(...args);
			});
		},
		log(...args: any[]) {
			handlers.log.forEach((handler) => {
				handler(...args);
			});
		}
	});
	Input.parse(args);
	const close = main();
	return {
		on(event: 'exit'|'error'|'log', handler: (...args: any[]) => void) {
			addToHandlers(handlers, event, handler);
		},
		addEventListener(event: 'exit'|'error'|'log', handler: (...args: any[]) => void) {
			addToHandlers(handlers, event, handler);
		},
		quit() {
			close();
		}
	}
}

interface HTMLTypingsWindow extends Window {
	htmlTypings: {
		extractStringTypes: typeof extractStringTypes;
		extractGlobTypes: typeof extractGlobTypes;
		extractFileTypes: typeof extractFileTypes;
		extractFolderTypes: typeof extractFolderTypes;
		cli: typeof cli;
	}
}

if (require.main === module) {
	//Called via command-line
	Input.parse();
	main();
} else if (typeof window !== 'undefined') {
	(<HTMLTypingsWindow>window).htmlTypings = {
		cli: cli,
		extractFileTypes: extractFileTypes,
		extractFolderTypes: extractFolderTypes,
		extractGlobTypes: extractGlobTypes,
		extractStringTypes: extractStringTypes
	}
}