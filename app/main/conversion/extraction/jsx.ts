import { Constants } from '../../constants';
import * as typescript from 'typescript';

export namespace JSX {
	function getAST(content: string, isTS: boolean) {
		const host: typescript.CompilerHost = {
			// istanbul ignore next
			fileExists() {
				return true;
			},
			getCanonicalFileName(fileName) {
				return fileName;
			},
			getCurrentDirectory() {
				return '';
			},
			getDefaultLibFileName() {
				return 'lib.d.ts';
			},
			// istanbul ignore next
			getNewLine() {
				return '\n';
			},
			getSourceFile(fileName) {
				return typescript.createSourceFile(
					fileName,
					content,
					typescript.ScriptTarget.Latest,
					true,
					isTS ? typescript.ScriptKind.TSX : typescript.ScriptKind.JSX
				);
			},
			// istanbul ignore next
			readFile() {
				return undefined;
			},
			useCaseSensitiveFileNames() {
				return true;
			},
			// istanbul ignore next
			writeFile() {
				return undefined;
			},
		};

		const fileName = 'sourcefile.ts';
		const program = typescript.createProgram(
			[fileName],
			{
				noResolve: true,
				target: typescript.ScriptTarget.Latest,

				experimentalDecorators: true,
				jsxFactory: 'html.jsx',
				jsx: typescript.JsxEmit.React,
			},
			host
		);

		return program.getSourceFile(fileName);
	}

	function iterateChildren<S>(
		node: typescript.Node,
		onChild: (node: typescript.Node) => boolean
	) {
		node.forEachChild((childNode) => {
			if (!onChild(childNode)) return;

			iterateChildren(childNode, onChild);
		});
	}

	function extractChildren(
		node: typescript.Node,
		mapKey: string,
		maps: {
			[moduleName: string]: {
				ids: {
					[key: string]: string;
				};
				classes: [string, string][];
			};
		}
	) {
		iterateChildren(node, (childNode) => {
			if (
				childNode.kind ===
					typescript.SyntaxKind.JsxSelfClosingElement ||
				childNode.kind === typescript.SyntaxKind.JsxElement
			) {
				const jsxNode =
					childNode.kind === typescript.SyntaxKind.JsxElement
						? (childNode as typescript.JsxElement).openingElement
						: (childNode as typescript.JsxSelfClosingElement);

				const tagName = jsxNode.tagName.getText();

				const result: {
					id: string | null;
					classNames: string[];
					elementType: string | null;
				} = {
					id: null,
					classNames: [],
					elementType: null,
				};

				// Crawl classname, id and element type
				for (const attr of jsxNode.attributes.properties) {
					if (attr.kind === typescript.SyntaxKind.JsxAttribute) {
						// Single attribute
						const attribute = attr as typescript.JsxAttribute;
						const attrName = attribute.name.text;
						if (
							attribute.initializer.kind ===
							typescript.SyntaxKind.StringLiteral
						) {
							if (attrName === 'id') {
								result.id = attribute.initializer.text;
							} else if (
								attrName === 'class' ||
								attrName === 'className'
							) {
								result.classNames.push(
									...attribute.initializer.text.split(' ')
								);
							} else if (attrName === 'data-element-type') {
								result.elementType = attribute.initializer.text;
							}
						}
					} else if (
						attr.kind === typescript.SyntaxKind.JsxSpreadAttribute
					) {
						// Spread attributes
						const attribute = attr as typescript.JsxSpreadAttribute;
						if (
							attribute.expression.kind !==
							typescript.SyntaxKind.ObjectLiteralExpression
						)
							continue;
						for (const objectLiteral of (attribute.expression as typescript.ObjectLiteralExpression)
							.properties) {
							if (
								objectLiteral.kind !==
								typescript.SyntaxKind.PropertyAssignment
							)
								continue;
							const assignment = objectLiteral as typescript.PropertyAssignment;
							const attrName = assignment.name.getText();
							if (attrName === 'id') {
								result.id = assignment.initializer.getText();
							} else if (
								attrName === 'class' ||
								attrName === 'className'
							) {
								result.classNames.push(
									...assignment.initializer
										.getText()
										.split(' ')
								);
							} else if (attrName === 'data-element-type') {
								result.elementType = assignment.initializer.getText();
							}
						}
					}
				}

				if (tagName === 'template' && result.id) {
					maps[mapKey].ids[`#${result.id}`] =
						result.elementType || Constants.getTagType(result.id);
				} else if (tagName === 'dom-module' && result.id) {
					maps[result.id] = maps[result.id] || {
						classes: [],
						ids: {},
					};
					if (childNode.kind === typescript.SyntaxKind.JsxElement) {
						extractChildren(childNode, result.id, maps);
					}
					return false;
				} else if (result.id) {
					maps[mapKey].ids[`#${result.id}`] =
						result.elementType || Constants.getTagType(tagName);
				}
				if (result.classNames) {
					for (const className of result.classNames) {
						maps[mapKey].classes.push([
							className,
							result.elementType || Constants.getTagType(tagName),
						]);
					}
				}

				return true;
			}
			return true;
		});
	}

	export function parseJSX(content: string, isTS: boolean) {
		const maps: {
			[moduleName: string]: {
				ids: {
					[key: string]: string;
				};
				classes: [string, string][];
			};
		} = {
			__default__: {
				ids: {},
				classes: [],
			},
		};
		const defaultKey = '__default__';

		const ast = getAST(content, isTS);
		extractChildren(ast, defaultKey, maps);

		return maps;
	}
}
