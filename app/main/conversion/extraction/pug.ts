import parse = require('pug-parser');
import lex = require('pug-lexer');
import path = require('path');
import fs = require('fs');
import { HTML } from './html';

export namespace Pug {

	function stripQuotes(word: any) {
		return typeof word === 'string' ? word.slice(1, -1) : word;
	}


	function objectifyAttributes(
		attribs: {
			name: string;
			val: any;
			mustEscape: boolean;
		}[]
	): {
		[key: string]: string;
	} {
		const obj: {
			[key: string]: string;
		} = {};
		for (let { name, val, mustEscape } of attribs) {
			if (!mustEscape) {
				obj[name] = stripQuotes(val);
			}
		}
		return obj;
	}

	function traverseConditional(
		node: PugParser.ParserConditional,
		fns: {
			onopentag(
				name: string,
				attribs: {
					[key: string]: string;
				}
			): void;
			onclosetag(name: string): void;
		}
	) {
		traversePug(node.consequent, fns);
		if (node.alternate) {
			if (node.alternate.type === 'Block') {
				traversePug(node.alternate, fns);
			} else {
				traverseConditional(node.alternate, fns);
			}
		}
	}

	function traversePug(
		content: PugParser.ParserBlock,
		fns: {
			onopentag(
				name: string,
				attribs: {
					[key: string]: string;
				}
			): void;
			onclosetag(name: string): void;
		}
	) {
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

	function traverseConditionalWithoutReplacement(
		token: PugParser.ParserConditional,
		callback: (node: PugParser.ParserNode) => PugParser.ParserNode
	) {
		traverseBlocks(token.consequent, callback);
		if (token.alternate) {
			if (token.alternate.type === 'Block') {
				traverseBlocks(token.alternate, callback);
			} else {
				traverseConditionalWithoutReplacement(
					token.alternate,
					callback
				);
			}
		}
	}

	function traverseBlocks(
		tokens: PugParser.ParserBlock,
		callback: (node: PugParser.ParserNode) => PugParser.ParserNode
	) {
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

	const included: {
		[file: string]: PugParser.ParserBlock;
	} = {};

	function fillInclude(includePath: string, filePath: string) {
		if (includePath in included) {
			return JSON.parse(JSON.stringify(included[includePath]));
		}

		if (filePath === null) {
			throw new Error(
				'Pug base path not given, please pass it using the options.pugPath setting'
			);
		}
		const includeFinalPath = path.isAbsolute(includePath)
			? includePath
			: path.join(path.dirname(filePath), includePath);
		const includeFile = fs.readFileSync(includeFinalPath, {
			encoding: 'utf8',
		});
		const parsed = fillIncludes(parse(lex(includeFile)), filePath);
		included[includePath] = JSON.parse(JSON.stringify(parsed));
		return parsed;
	}


	function fillIncludes(
		tokens: PugParser.ParserBlock,
		filePath: string
	) {
		traverseBlocks(tokens, (node) => {
			if (node.type === 'Include') {
				return fillInclude(node.file.path, filePath);
			}
			return node;
		});
		return tokens;
	}

	function fillMixins(tokens: PugParser.ParserBlock) {
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
					nodes: [],
				};
			}
			return node;
		});

		//Then replace them
		traverseBlocks(tokens, (node) => {
			if (
				node.type === 'Mixin' &&
				node.call === true &&
				node.name in definedMixins
			) {
				return definedMixins[node.name];
			}
			return node;
		});

		return tokens;
	}

	function lexPug(content: string, filePath: string) {
		return fillMixins(fillIncludes(parse(lex(content)), filePath));
	}

	interface PartialTypingsObj {
		ids: {
			[key: string]: string;
		};
		classes: [string, string][];
		module?: string;
	}

	interface ModuleMappingPartialTypingsObj {
		[moduleName: string]: PartialTypingsObj;
	}

	export function parsePug(
		content: string,
		filePath: string
	): ModuleMappingPartialTypingsObj {
		const handler = new HTML.ParserHandler();
		traversePug(lexPug(content, filePath), handler.genObj());
		return handler.done();
	}
}
