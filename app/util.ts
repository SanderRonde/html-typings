import { FILE_TYPE } from './index';
import path = require('path');

export namespace Util {
	export function getFilePath(filePath: string): string {
		if (path.isAbsolute(filePath)) {
			return filePath;
		}
		return path.join(process.cwd().trim(), filePath.trim());
	}

	export function toQuerymapPath(filePath: string): string {
		// Strip it of all file extensions
		const stripped = filePath.split('.')[0];
		// Append to end
		const appended = `${stripped}-querymap`;
		// Add extension
		return `${appended}.d.ts`;
	}

	export function endsWith(str: string, end: string): boolean {
		return str.lastIndexOf(end) === str.length - end.length;
	}

	export function isHtmlFile(file: string): boolean {
		return (
			Util.endsWith(file, '.html') ||
			Util.endsWith(file, '.jade') ||
			Util.endsWith(file, '.pug')
		);
	}

	export function getFileType(name: string): FILE_TYPE {
		if (endsWith(name, '.html')) {
			return FILE_TYPE.HTML;
		}
		if (endsWith(name, '.pug') || endsWith(name, '.jade')) {
			return FILE_TYPE.PUG;
		}
		if (endsWith(name, '.js')) {
			return FILE_TYPE.COMPILED_JSX;
		}
		return FILE_TYPE.HTML;
	}

	export function objectForEach<
		U,
		P,
		O extends {
			[key: string]: U;
		} = {
			[key: string]: U;
		}
	>(
		obj: O,
		map: (value: U, key: keyof O) => P,
		base: {
			[key: string]: P;
		} = {}
	): {
		[key: string]: P;
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

	export function sortObj<
		T extends {
			[key: string]: any;
		}
	>(obj: T): T {
		const newObj: Partial<T> = {};
		const keys = Object.getOwnPropertyNames(obj).sort();
		keys.forEach((key) => {
			newObj[key as keyof typeof newObj] = obj[key];
		});
		return newObj as T;
	}

	export function arrToObj<V>(
		arr: [string, V][]
	): {
		[key: string]: V;
	} {
		const obj: {
			[key: string]: V;
		} = {};
		for (const [key, value] of arr) {
			obj[key] = value;
		}
		return obj;
	}
}
