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
	extractStringTypes(fileContents: string, getTypesObj: boolean): TypingsObj;
	/**
	 * Extracts the types from the files given glob pattern describes
	 * 
	 * @param {string} glob - A glob pattern specifying the input file(s)
	 * @param {boolean} [getTypesObj] - When true, returns the types obj instead of the d.ts string
	 * @returns {string|Object} - When getTypesObj is set to false, returns the d.ts string, when 
	 * 		it's set to true, returns a typings object
	 */
	extractGlobTypes(glob: string): Promise<string>;
	extractGlobTypes(glob: string, getTypesObj: boolean): Promise<TypingsObj>;

	/**
	 * Extracts the types from given file path(s)
	 * 
	 * @param {string|string[]} files - The paths to the file(s) to parse
	 * @param {boolean} [getTypesObj] - When true, returns the types obj instead of the d.ts string
	 * @returns {string|Object} - When getTypesObj is set to false, returns the d.ts string, when 
	 * 		it's set to true, returns a typings object
	 */
	extractFileTypes(files: string|string[]): Promise<string>;
	extractFileTypes(files: string|string[], getTypesObj: boolean): Promise<TypingsObj>;

	/**
	 * Extracts the types from all HTML files in the given folder (recursively)
	 * 
	 * @param {string} folder - The folder containing the HTML files
	 * @param {boolean} [getTypesObj] - When true, returns the types obj instead of the d.ts string
	 * @returns {string|Object} - When getTypesObj is set to false, returns the d.ts string, when 
	 * 		it's set to true, returns a typings object
	 */
	extractFolderTypes(folder: string): Promise<string>;
	extractFolderTypes(folder: string, getTypesObj: boolean): Promise<TypingsObj>;

	/**
	 * A way to use the CLI programmatically, not recommended for use
	 * 
	 * @param {string[]} args - The arguments to pass along
	 * @returns {Object} - An object containing an 'on' and 'addEventListener' property
	 * 		in order to listen to the 'exit', 'error' and 'log' events
	 */
	cli(args: string[]): {
		on(event: 'exit', handler: (exitCode: number) => void): void;
		on(event: 'error', handler: (...args: any[]) => void): void;
		on(event: 'log', handler: (...args: any[]) => void): void;
		addEventListener(event: 'exit', handler: (exitCode: number) => void): void;
		addEventListener(event: 'error', handler: (...args: any[]) => void): void;
		addEventListener(event: 'log', handler: (...args: any[]) => void): void;
	};
}

declare namespace HTMLTypings {
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
	export function extractStringTypes(fileContents: string, getTypesObj: boolean): TypingsObj;

	/**
	 * Extracts the types from the files given glob pattern describes
	 * 
	 * @param {string} glob - A glob pattern specifying the input file(s)
	 * @param {boolean} [getTypesObj] - When true, returns the types obj instead of the d.ts string
	 * @returns {string|Object} - When getTypesObj is set to false, returns the d.ts string, when 
	 * 		it's set to true, returns a typings object
	 */
	export function extractGlobTypes(glob: string): Promise<string>;
	export function extractGlobTypes(glob: string, getTypesObj: boolean): Promise<TypingsObj>;

	/**
	 * Extracts the types from given file path(s)
	 * 
	 * @param {string|string[]} files - The paths to the file(s) to parse
	 * @param {boolean} [getTypesObj] - When true, returns the types obj instead of the d.ts string
	 * @returns {string|Object} - When getTypesObj is set to false, returns the d.ts string, when 
	 * 		it's set to true, returns a typings object
	 */
	export function extractFileTypes(files: string|string[]): Promise<string>;
	export function extractFileTypes(files: string|string[], getTypesObj: boolean): Promise<TypingsObj>;

	/**
	 * Extracts the types from all HTML files in the given folder (recursively)
	 * 
	 * @param {string} folder - The folder containing the HTML files
	 * @param {boolean} [getTypesObj] - When true, returns the types obj instead of the d.ts string
	 * @returns {string|Object} - When getTypesObj is set to false, returns the d.ts string, when 
	 * 		it's set to true, returns a typings object
	 */
	export function extractFolderTypes(folder: string): Promise<string>;
	export function extractFolderTypes(folder: string, getTypesObj: boolean): Promise<TypingsObj>;

	/**
	 * A way to use the CLI programmatically, not recommended for use
	 * 
	 * @param {string[]} args - The arguments to pass along
	 * @returns {Object} - An object containing an 'on' and 'addEventListener' property
	 * 		in order to listen to the 'exit', 'error' and 'log' events
	 */
	export function cli(args: string[]): {
		on(event: 'exit', handler: (exitCode: number) => void): void;
		on(event: 'error', handler: (...args: any[]) => void): void;
		on(event: 'log', handler: (...args: any[]) => void): void;
		addEventListener(event: 'exit', handler: (exitCode: number) => void): void;
		addEventListener(event: 'error', handler: (...args: any[]) => void): void;
		addEventListener(event: 'log', handler: (...args: any[]) => void): void;
	};
}

declare module 'html-typings' {
	export = HTMLTypings;
}