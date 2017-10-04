declare module 'html-typings' {
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
}