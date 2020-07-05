import { Prettifying } from '../prettifying';
import { Constants } from '../constants';
import { TypingsObj } from '../../main';
import { Input } from '../../input';
import { Util } from '../../util';

export namespace Joining {
	export function mergeModules(types: {
		[fileName: string]: {
			[moduleName: string]: {
				ids: {
					[key: string]: string;
				};
				classes: [string, string][];
				module?: string;
			};
		};
	}) {
		let selectorMap: {
			[fileName: string]: {
				[key: string]: string;
			};
		} = {};

		const moduleMap: {
			[fileName: string]: {
				[moduleName: string]: {
					[key: string]: string;
				};
			};
		} = {};

		let idMap: {
			[fileName: string]: {
				[key: string]: string;
			};
		} = {};

		const allClassTypes: {
			[fileName: string]: {
				[key: string]: string[];
			};
		} = {};

		const tagNameMap: {
			[fileName: string]: {
				[key: string]: string;
			};
		} = {};

		for (let fileName in types) {
			for (let moduleName in types[fileName]) {
				const typeMap = types[fileName][moduleName];
				if (moduleName !== '__default__') {
					moduleMap[fileName][moduleName] = Util.removeKeysFirstChar(
						typeMap.ids
					);
					tagNameMap[fileName][moduleName] = Constants.getTagType(
						moduleName
					);
					selectorMap[fileName][moduleName] =
						tagNameMap[fileName][moduleName];
				}
				idMap[fileName] = {
					...idMap[fileName],
					...Util.removeKeysFirstChar(typeMap.ids),
				};
				selectorMap[fileName] = {
					...selectorMap[fileName],
					...typeMap.ids,
				};

				typeMap.classes.forEach((typeMapClass) => {
					const [className, tagName] = typeMapClass;
					allClassTypes[fileName] = allClassTypes[fileName] || {};
					if (className in allClassTypes[fileName]) {
						if (
							allClassTypes[fileName][className].indexOf(
								tagName
							) === -1
						) {
							allClassTypes[fileName][className].push(tagName);
						}
					} else {
						allClassTypes[fileName][className] = [tagName];
					}
				});
			}
		}

		const joinedClassNames: {
			[fileName: string]: {
				[key: string]: string;
			};
		} = {};

		Object.getOwnPropertyNames(allClassTypes).forEach(
			(fileName: string) => {
				selectorMap[fileName] = selectorMap[fileName] || {};
				joinedClassNames[fileName] = joinedClassNames[fileName] || {};
				Object.getOwnPropertyNames(allClassTypes[fileName]).forEach(
					(className: string) => {
						selectorMap[fileName][`.${className}`] = allClassTypes[
							fileName
						][className]
							.sort()
							.join('|');
						joinedClassNames[fileName][className] = allClassTypes[
							fileName
						][className]
							.sort()
							.join('|');
					}
				);
			}
		);

		const fileNames = [
			...Object.keys(selectorMap),
			...Object.keys(moduleMap),
			...Object.keys(idMap),
			...Object.keys(joinedClassNames),
			...Object.keys(tagNameMap),
		].filter((v, i, a) => a.indexOf(v) === i);

		return Util.arrToObj(
			fileNames.map((fileName) => {
				return [
					fileName,
					{
						selectors: Util.sortObj(selectorMap[fileName] || {}),
						modules: Util.sortObj(moduleMap[fileName] || {}),
						ids: Util.sortObj(idMap[fileName] || {}),
						classes: Util.sortObj(joinedClassNames[fileName] || {}),
						tags: Util.sortObj(tagNameMap[fileName] || {}),
					},
				];
			})
		);
	}

	export function mergeTypes(types: {
		[fileName: string]: {
			[moduleName: string]: {
				ids: {
					[key: string]: string;
				};
				classes: [string, string][];
				module?: string;
			};
		};
	}) {
		let selectorMap: {
			[key: string]: string;
		} = {};

		const moduleMap: {
			[moduleName: string]: {
				[key: string]: string;
			};
		} = {};

		let idMap: {
			[key: string]: string;
		} = {};

		const allClassTypes: {
			[key: string]: string[];
		} = {};

		const tagNameMap: {
			[key: string]: string;
		} = {};

		for (let fileName in types) {
			for (let moduleName in types[fileName]) {
				const typeMap = types[fileName][moduleName];
				if (moduleName !== '__default__') {
					moduleMap[moduleName] = Util.removeKeysFirstChar(
						typeMap.ids
					);
					tagNameMap[moduleName] = Constants.getTagType(moduleName);
					selectorMap[moduleName] = tagNameMap[moduleName];
				}
				idMap = {
					...idMap,
					...Util.removeKeysFirstChar(typeMap.ids),
				};
				selectorMap = { ...selectorMap, ...typeMap.ids };

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

		Object.getOwnPropertyNames(allClassTypes).forEach(
			(className: string) => {
				selectorMap[`.${className}`] = allClassTypes[className]
					.sort()
					.join('|');
				joinedClassNames[className] = allClassTypes[className]
					.sort()
					.join('|');
			}
		);

		return {
			selectors: Util.sortObj(selectorMap),
			modules: Util.sortObj(moduleMap),
			ids: Util.sortObj(idMap),
			classes: Util.sortObj(joinedClassNames),
			tags: Util.sortObj(tagNameMap),
		};
	}

	export function convertToDefsFile(
		typings: TypingsObj,
		exportTypes: boolean = false
	) {
		const { classes, ids, modules, selectors, tags } = typings;
		return Constants.getFileTemplate(
			Prettifying.formatTypings(selectors),
			Prettifying.formatTypings(ids),
			Prettifying.formatTypings(classes),
			Prettifying.formatTypings(modules),
			Prettifying.formatTypings(tags),
			(Input.args && Input.args.export) || exportTypes
		);
	}
}
