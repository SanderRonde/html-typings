const acorn = require('acorn-loose') as typeof import('acorn');
import * as acornWalk from 'acorn-walk';
import { Constants } from '../../constants';

export namespace CompiledJSX {
	interface AcornCallExpression extends acorn.Node {
		type: 'CallExpression';
		callee: AcornNode;
		arguments: AcornNode[];
	}

	interface AcornIdentifier extends acorn.Node {
		type: 'Identifier';
		name: string;
	}

	interface AcornMemberExpression extends acorn.Node {
		type: 'MemberExpression';
		arguments?: Array<any>;
		object: AcornNode;
		property: AcornIdentifier;
		computed: boolean;
	}

	interface AcornLiteral extends acorn.Node {
		type: 'Literal';
		value: string;
		raw: string;
	}

	interface AcornObjectExpression extends acorn.Node {
		type: 'ObjectExpression';
		properties: AcornNode[];
	}

	interface AcornProperty extends acorn.Node {
		type: 'Property';
		method: boolean;
		shorthand: boolean;
		computed: boolean;
		key: AcornNode;
		value: AcornNode;
		kind: string;
	}

	type AcornNode =
		| AcornCallExpression
		| AcornIdentifier
		| AcornMemberExpression
		| AcornLiteral
		| AcornObjectExpression
		| AcornProperty;

	function getMemberName(node: AcornMemberExpression): string {
		if (node.computed) return '';
		if (node.object.type === 'Identifier') {
			return `${node.object.name}.${node.property.name}`;
		}
		if (node.object.type !== 'MemberExpression') {
			return '';
		}
		return `${getMemberName(node.object)}.${node.property.name}`;
	}

	function getCallee(node: AcornCallExpression) {
		if (node.callee.type === 'Identifier') {
			return node.callee.name;
		}
		if (node.callee.type === 'MemberExpression') {
			return getMemberName(node.callee);
		}
		return '';
	}

	function getTagName(node: AcornCallExpression) {
		const arg = node.arguments[0];
		if (arg.type === 'Literal') {
			return arg.value;
		}
		if (arg.type === 'Identifier' && /[A-Z]/.test(arg.name[0])) {
			return arg.name;
		}
		return null;
	}

	function getAttrs(
		node: AcornCallExpression
	): {
		id: string | null;
		classNames: string | null;
		elementType: string | null;
	} {
		const result: {
			id: string | null;
			classNames: string | null;
			elementType: string | null;
		} = {
			id: null,
			classNames: null,
			elementType: null,
		};

		const arg = node.arguments[1];
		acornWalk.fullAncestor(arg, (childNode: AcornNode) => {
			if (childNode.type === 'ObjectExpression') {
				for (const prop of childNode.properties) {
					if (prop.type !== 'Property') continue;
					if (
						prop.value.type !== 'Literal' ||
						prop.key.type !== 'Identifier'
					)
						continue;

					if (prop.key.name === 'id') {
						result.id = prop.value.value;
					} else if (
						prop.key.name === 'class' ||
						prop.key.name === 'className'
					) {
						result.classNames = prop.value.value;
					} else if (prop.key.name === 'data-element-type') {
						result.elementType = prop.value.value;
					}
				}
			}
		});

		return result;
	}

	function getDomModule(node: AcornNode, jsxFactory: string) {
		if (node.type !== 'CallExpression') {
			return null;
		}
		// Check if the callee is equal to jsxFactory
		if (getCallee(node as AcornCallExpression) !== jsxFactory) {
			return null;
		}

		// Get the tag name
		const tagName = getTagName(node as AcornCallExpression);
		if (!tagName || tagName !== 'dom-module') return null;

		const { id } = getAttrs(node as AcornCallExpression);

		return id;
	}

	export function parseJSX(content: string, jsxFactory: string) {
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

		const parsed = acorn.parse(content, {
			sourceType: 'module',
		});
		acornWalk.fullAncestor(
			parsed as any,
			(node, _state, ancestors, type) => {
				if (type === 'CallExpression') {
					// Check if the callee is equal to jsxFactory
					if (
						getCallee(node as AcornCallExpression) !==
						jsxFactory
					) {
						return;
					}

					// Get the tag name
					const tagName = getTagName(
						node as AcornCallExpression
					);
					if (!tagName) return;

					const { classNames, id, elementType } = getAttrs(
						node as AcornCallExpression
					);

					let mapKey: string = defaultKey;
					for (const ancestor of [...ancestors].reverse()) {
						const domModule = getDomModule(
							ancestor as AcornNode,
							jsxFactory
						);
						if (domModule) {
							mapKey = domModule;

							if (!maps[mapKey]) {
								maps[mapKey] = {
									ids: {},
									classes: [],
								};
							}
							break;
						}
					}
					if (tagName === 'template' && id) {
						maps[mapKey].ids[`#${id}`] =
							elementType || Constants.getTagType(id);
					} else if (tagName !== 'dom-module' && id) {
						maps[mapKey].ids[`#${id}`] =
							elementType ||
							Constants.getTagType(tagName);
					}
					if (classNames) {
						for (const className of classNames.split(' ')) {
							maps[mapKey].classes.push([
								className,
								elementType ||
									Constants.getTagType(tagName),
							]);
						}
					}
				}
			}
		);
		return maps;
	}
}