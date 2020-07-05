#!/usr/bin/env node
import { Main, TypingsObj } from './main';
import { Input } from './input';
import { Util } from './util';
import { CLI } from './cli';

const EXTENSIONS = ['html', 'pug', 'jade'];

export const enum FILE_TYPE {
	HTML = 'html',
	JADE = 'pug',
	PUG = 'pug',
	COMPILED_JSX = 'compiled-jsx',
	JSX = 'jsx',
	TSX = 'tsx',
}

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
		fileType?: FILE_TYPE.COMPILED_JSX | FILE_TYPE.TSX;
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
export function extractStringTypes(
	fileContents: string,
	options: {
		fileType?: FILE_TYPE;
		getTypesObj?: boolean | null;
		pugPath?: string;
		exportTypes?: boolean;
		jsxFactory?: string;
	} = {
		fileType: FILE_TYPE.HTML,
		getTypesObj: false,
		pugPath: null,
		exportTypes: false,
	}
): string | TypingsObj {
	const { fileType, getTypesObj, pugPath, exportTypes, jsxFactory } = options;

	if (fileType === FILE_TYPE.COMPILED_JSX && !jsxFactory) {
		throw new Error(
			'JSX factory needs to be defined when parsing compiled JSX'
		);
	}

	const typings = Main.conversion.joining.mergeTypes({
		string: Main.conversion.extraction.getTypings(
			fileContents,
			pugPath,
			fileType,
			jsxFactory
		),
	});
	return getTypesObj
		? typings
		: Main.conversion.joining.convertToDefsFile(typings, exportTypes);
}

export async function extractGlobTypes(glob: string): Promise<string>;
export async function extractGlobTypes(
	glob: string,
	options?: {
		getTypesObj: true;
		exportTypes?: boolean;
		jsxFactory?: string;
	}
): Promise<TypingsObj>;
export async function extractGlobTypes(
	glob: string,
	options?: {
		getTypesObj: false | null;
		exportTypes?: boolean;
		jsxFactory?: string;
	}
): Promise<string>;
export async function extractGlobTypes(
	glob: string,
	options?: {
		exportTypes?: boolean;
		jsxFactory?: string;
	}
): Promise<string>;
export async function extractGlobTypes(
	glob: string,
	{
		exportTypes = false,
		getTypesObj = false,
		jsxFactory,
	}: {
		getTypesObj?: boolean | null;
		exportTypes?: boolean;
		jsxFactory?: string;
	} = {}
): Promise<string | TypingsObj> {
	const typings = await Main.conversion.extraction.getTypingsForInput(
		glob,
		[],
		jsxFactory
	);
	return getTypesObj
		? typings
		: Main.conversion.joining.convertToDefsFile(typings, exportTypes);
}

export async function extractFileTypes(
	files: string | string[]
): Promise<string>;
export async function extractFileTypes(
	files: string | string[],
	options?: {
		getTypesObj?: boolean | null;
		exportTypes: true;
		jsxFactory?: string;
	}
): Promise<TypingsObj>;
export async function extractFileTypes(
	files: string | string[],
	options?: {
		getTypesObj?: boolean | null;
		exportTypes: false;
		jsxFactory?: string;
	}
): Promise<string>;
export async function extractFileTypes(
	files: string | string[],
	options?: {
		getTypesObj?: boolean | null;
		jsxFactory?: string;
	}
): Promise<string>;
export async function extractFileTypes(
	files: string | string[],
	{
		exportTypes = false,
		getTypesObj = false,
		jsxFactory,
	}: {
		getTypesObj?: boolean | null;
		exportTypes?: boolean;
		jsxFactory?: string;
	} = {}
): Promise<string | TypingsObj> {
	const typings = await Main.conversion.extraction.getTypingsForInput(
		files,
		[],
		jsxFactory
	);
	return getTypesObj
		? typings
		: Main.conversion.joining.convertToDefsFile(typings, exportTypes);
}

export async function extractFolderTypes(folder: string): Promise<string>;
export async function extractFolderTypes(
	files: string | string[],
	options?: {
		getTypesObj?: boolean | null;
		exportTypes: true;
		jsxFactory?: string;
	}
): Promise<TypingsObj>;
export async function extractFolderTypes(
	glob: string,
	options?: {
		getTypesObj?: boolean | null;
		exportTypes: false;
		jsxFactory?: string;
	}
): Promise<string>;
export async function extractFolderTypes(
	glob: string,
	options?: {
		getTypesObj?: boolean | null;
		jsxFactory?: string;
	}
): Promise<string>;
export async function extractFolderTypes(
	folder: string,
	{
		exportTypes = false,
		getTypesObj = false,
		jsxFactory,
	}: {
		getTypesObj?: boolean | null;
		exportTypes?: boolean;
		jsxFactory?: string;
	} = {}
): Promise<string | TypingsObj> {
	folder = Util.endsWith(folder, '/') ? folder : `${folder}/`;
	const typings = await Main.conversion.extraction.getTypingsForInput(
		(jsxFactory ? [...EXTENSIONS, 'js', 'tsx'] : EXTENSIONS).map(
			(extension) => {
				return `${folder}**/*.${extension}`;
			}
		),
		[],
		jsxFactory
	);
	return getTypesObj
		? typings
		: Main.conversion.joining.convertToDefsFile(typings, exportTypes);
}

type HTMLTypingsWindow = typeof window & {
	htmlTypings: {
		extractStringTypes: typeof extractStringTypes;
		extractGlobTypes: typeof extractGlobTypes;
		extractFileTypes: typeof extractFileTypes;
		extractFolderTypes: typeof extractFolderTypes;
		cli: typeof CLI.cli;
	};
};

if (require.main === module) {
	//Called via command-line
	Input.parse();
	Main.main();
} else if (typeof window !== 'undefined') {
	(<HTMLTypingsWindow>window).htmlTypings = {
		cli: CLI.cli,
		extractFileTypes: extractFileTypes,
		extractFolderTypes: extractFolderTypes,
		extractGlobTypes: extractGlobTypes,
		extractStringTypes: extractStringTypes,
	};
}
