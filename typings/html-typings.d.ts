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
	};
}

interface HTMLTypings {
	/**
	 * Extracts the types from given html input string
	 *
	 * @param {string} fileContents - The content of the files
	 * @param {boolean} [getTypesObj] - When true, returns the types obj instead of the d.ts string
	 * @returns {string|Object} - When getTypesObj is set to false, returns the d.ts string, when
	 * 		it's set to true, returns a typings object
	 */
	extractStringTypes(fileContents: string): string;
	extractStringTypes(
		fileContents: string,
		options: {
			exportTypes?: boolean;
			fileType?: HTMLTypings.FILE_TYPE.COMPILED_JSX;
			getTypesObj?: null | false;
			pugPath?: string;
			jsxFactory: string;
		}
	): string;
	extractStringTypes(
		fileContents: string,
		options: {
			exportTypes?: boolean;
			fileType?: HTMLTypings.FILE_TYPE;
			getTypesObj?: null | false;
			pugPath?: string;
			jsxFactory?: string;
		}
	): string;
	extractStringTypes(
		fileContents: string,
		options: {
			exportTypes?: boolean;
			fileType?: HTMLTypings.FILE_TYPE.COMPILED_JSX;
			getTypesObj?: true;
			pugPath?: string;
			jsxFactory: string;
		}
	): TypingsObj;
	extractStringTypes(
		fileContents: string,
		options: {
			exportTypes?: boolean;
			fileType?: HTMLTypings.FILE_TYPE;
			getTypesObj?: true;
			pugPath?: string;
			jsxFactory?: string;
		}
	): TypingsObj;
	/**
	 * Extracts the types from the files given glob pattern describes
	 *
	 * @param {string} glob - A glob pattern specifying the input file(s)
	 * @param {boolean} [getTypesObj] - When true, returns the types obj instead of the d.ts string
	 * @returns {string|Object} - When getTypesObj is set to false, returns the d.ts string, when
	 * 		it's set to true, returns a typings object
	 */
	extractGlobTypes(glob: string): Promise<string>;
	extractGlobTypes(
		glob: string,
		options?: {
			getTypesObj: true;
			exportTypes?: boolean;
			jsxFactory?: string;
		}
	): Promise<TypingsObj>;
	extractGlobTypes(
		glob: string,
		options?: {
			getTypesObj: false | null;
			exportTypes?: boolean;
			jsxFactory?: string;
		}
	): Promise<string>;
	extractGlobTypes(
		glob: string,
		options?: {
			exportTypes?: boolean;
			jsxFactory?: string;
		}
	): Promise<string>;

	/**
	 * Extracts the types from given file path(s)
	 *
	 * @param {string|string[]} files - The paths to the file(s) to parse
	 * @param {boolean} [getTypesObj] - When true, returns the types obj instead of the d.ts string
	 * @returns {string|Object} - When getTypesObj is set to false, returns the d.ts string, when
	 * 		it's set to true, returns a typings object
	 */

	extractGlobTypes(glob: string): Promise<string>;
	extractGlobTypes(
		glob: string,
		options?: {
			getTypesObj: true;
			exportTypes?: boolean;
			jsxFactory?: string;
		}
	): Promise<TypingsObj>;
	extractGlobTypes(
		glob: string,
		options?: {
			getTypesObj: false | null;
			exportTypes?: boolean;
			jsxFactory?: string;
		}
	): Promise<string>;
	extractGlobTypes(
		glob: string,
		options?: {
			exportTypes?: boolean;
			jsxFactory?: string;
		}
	): Promise<string>;

	/**
	 * Extracts the types from given file path(s)
	 *
	 * @param {string|string[]} files - The paths to the file(s) to parse
	 * @param {boolean} [getTypesObj] - When true, returns the types obj instead of the d.ts string
	 * @returns {string|Object} - When getTypesObj is set to false, returns the d.ts string, when
	 * 		it's set to true, returns a typings object
	 */
	extractFileTypes(files: string | string[]): Promise<string>;
	extractFileTypes(
		files: string | string[],
		options?: {
			getTypesObj?: boolean | null;
			exportTypes: true;
			jsxFactory?: string;
		}
	): Promise<TypingsObj>;
	extractFileTypes(
		files: string | string[],
		options?: {
			getTypesObj?: boolean | null;
			exportTypes: false;
			jsxFactory?: string;
		}
	): Promise<string>;
	extractFileTypes(
		files: string | string[],
		options?: {
			getTypesObj?: boolean | null;
			jsxFactory?: string;
		}
	): Promise<string>;

	/**
	 * Extracts the types from all HTML files in the given folder (recursively)
	 *
	 * @param {string} folder - The folder containing the HTML files
	 * @param {boolean} [getTypesObj] - When true, returns the types obj instead of the d.ts string
	 * @returns {string|Object} - When getTypesObj is set to false, returns the d.ts string, when
	 * 		it's set to true, returns a typings object
	 */
	extractFolderTypes(folder: string): Promise<string>;
	extractFolderTypes(
		files: string | string[],
		options?: {
			getTypesObj?: boolean | null;
			exportTypes: true;
			jsxFactory?: string;
		}
	): Promise<TypingsObj>;
	extractFolderTypes(
		glob: string,
		options?: {
			getTypesObj?: boolean | null;
			exportTypes: false;
			jsxFactory?: string;
		}
	): Promise<string>;
	extractFolderTypes(
		glob: string,
		options?: {
			getTypesObj?: boolean | null;
			jsxFactory?: string;
		}
	): Promise<string>;

	/**
	 * A way to use the CLI programmatically, not recommended for use
	 *
	 * @param {string[]} args - The arguments to pass along
	 * @returns {Object} - An object containing an 'on' and 'addEventListener' property
	 * 		in order to listen to the 'exit', 'error' and 'log' events
	 */
	cli(
		args: string[]
	): {
		on(event: 'exit', handler: (exitCode: number) => void): void;
		on(event: 'error', handler: (...args: any[]) => void): void;
		on(event: 'log', handler: (...args: any[]) => void): void;
		addEventListener(
			event: 'exit',
			handler: (exitCode: number) => void
		): void;
		addEventListener(
			event: 'error',
			handler: (...args: any[]) => void
		): void;
		addEventListener(event: 'log', handler: (...args: any[]) => void): void;
	};
}

declare namespace HTMLTypings {
	export const enum FILE_TYPE {
		HTML = 'html',
		JADE = 'pug',
		PUG = 'pug',
		COMPILED_JSX = 'jsx',
	}

	export interface TypingsObj {
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

	/**
	 * Extracts the types from given html input string
	 *
	 * @param {string} fileContents - The content of the files
	 * @param {boolean} [getTypesObj] - When true, returns the types obj instead of the d.ts string
	 * @returns {string|Object} - When getTypesObj is set to false, returns the d.ts string, when
	 * 		it's set to true, returns a typings object
	 */
	export function extractStringTypes(fileContents: string): string;
	export function extractStringTypes(
		fileContents: string,
		options: {
			exportTypes?: boolean;
			fileType?: FILE_TYPE.COMPILED_JSX;
			getTypesObj?: null | false;
			pugPath?: string;
			jsxFactory: string;
		}
	): string;
	export function extractStringTypes(
		fileContents: string,
		options: {
			exportTypes?: boolean;
			fileType?: FILE_TYPE;
			getTypesObj?: null | false;
			pugPath?: string;
			jsxFactory?: string;
		}
	): string;
	export function extractStringTypes(
		fileContents: string,
		options: {
			exportTypes?: boolean;
			fileType?: FILE_TYPE.COMPILED_JSX;
			getTypesObj?: true;
			pugPath?: string;
			jsxFactory: string;
		}
	): TypingsObj;
	export function extractStringTypes(
		fileContents: string,
		options: {
			exportTypes?: boolean;
			fileType?: FILE_TYPE;
			getTypesObj?: true;
			pugPath?: string;
			jsxFactory?: string;
		}
	): TypingsObj;

	/**
	 * Extracts the types from the files given glob pattern describes
	 *
	 * @param {string} glob - A glob pattern specifying the input file(s)
	 * @param {boolean} [getTypesObj] - When true, returns the types obj instead of the d.ts string
	 * @returns {string|Object} - When getTypesObj is set to false, returns the d.ts string, when
	 * 		it's set to true, returns a typings object
	 */
	export function extractGlobTypes(glob: string): Promise<string>;
	export function extractGlobTypes(
		glob: string,
		options?: {
			getTypesObj: true;
			exportTypes?: boolean;
			jsxFactory?: string;
		}
	): Promise<TypingsObj>;
	export function extractGlobTypes(
		glob: string,
		options?: {
			getTypesObj: false | null;
			exportTypes?: boolean;
			jsxFactory?: string;
		}
	): Promise<string>;
	export function extractGlobTypes(
		glob: string,
		options?: {
			exportTypes?: boolean;
			jsxFactory?: string;
		}
	): Promise<string>;

	/**
	 * Extracts the types from given file path(s)
	 *
	 * @param {string|string[]} files - The paths to the file(s) to parse
	 * @param {boolean} [getTypesObj] - When true, returns the types obj instead of the d.ts string
	 * @returns {string|Object} - When getTypesObj is set to false, returns the d.ts string, when
	 * 		it's set to true, returns a typings object
	 */
	export function extractFileTypes(files: string | string[]): Promise<string>;
	export function extractFileTypes(
		files: string | string[],
		options?: {
			getTypesObj?: boolean | null;
			exportTypes: true;
			jsxFactory?: string;
		}
	): Promise<TypingsObj>;
	export function extractFileTypes(
		files: string | string[],
		options?: {
			getTypesObj?: boolean | null;
			exportTypes: false;
			jsxFactory?: string;
		}
	): Promise<string>;
	export function extractFileTypes(
		files: string | string[],
		options?: {
			getTypesObj?: boolean | null;
			jsxFactory?: string;
		}
	): Promise<string>;

	/**
	 * Extracts the types from all HTML files in the given folder (recursively)
	 *
	 * @param {string} folder - The folder containing the HTML files
	 * @param {boolean} [getTypesObj] - When true, returns the types obj instead of the d.ts string
	 * @returns {string|Object} - When getTypesObj is set to false, returns the d.ts string, when
	 * 		it's set to true, returns a typings object
	 */
	export function extractFolderTypes(folder: string): Promise<string>;
	export function extractFolderTypes(
		files: string | string[],
		options?: {
			getTypesObj?: boolean | null;
			exportTypes: true;
			jsxFactory?: string;
		}
	): Promise<TypingsObj>;
	export function extractFolderTypes(
		glob: string,
		options?: {
			getTypesObj?: boolean | null;
			exportTypes: false;
			jsxFactory?: string;
		}
	): Promise<string>;
	export function extractFolderTypes(
		glob: string,
		options?: {
			getTypesObj?: boolean | null;
			jsxFactory?: string;
		}
	): Promise<string>;

	/**
	 * A way to use the CLI programmatically, not recommended for use
	 *
	 * @param {string[]} args - The arguments to pass along
	 * @returns {Object} - An object containing an 'on' and 'addEventListener' property
	 * 		in order to listen to the 'exit', 'error' and 'log' events
	 */
	export function cli(
		args: string[]
	): {
		on(event: 'exit', handler: (exitCode: number) => void): void;
		on(event: 'error', handler: (...args: any[]) => void): void;
		on(event: 'log', handler: (...args: any[]) => void): void;
		addEventListener(
			event: 'exit',
			handler: (exitCode: number) => void
		): void;
		addEventListener(
			event: 'error',
			handler: (...args: any[]) => void
		): void;
		addEventListener(event: 'log', handler: (...args: any[]) => void): void;
	};
}

declare module 'html-typings' {
	export = HTMLTypings;
}
