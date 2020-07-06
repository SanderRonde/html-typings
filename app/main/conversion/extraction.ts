import { CompiledJSX } from './extraction/compiled-jsx';
import { HTML } from './extraction/html';
import { TypingsObj } from '../../main';
import { Logging } from '../../logging';
import { Pug } from './extraction/pug';
import { Files } from '../../files';
import { Input } from '../../input';
import { Joining } from './joining';
import { FILE_TYPE } from '../..';
import { Util } from '../../util';
import fs = require('fs');
import { JSX } from './extraction/jsx';

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

	export function parseJSX(
		content: string,
		jsxFactory: string
	): ModuleMappingPartialTypingsObj {
		return CompiledJSX.parseJSX(content, jsxFactory);
	}

	export function getTypings(
		file: string,
		filePath: string,
		fileType: FILE_TYPE,
		jsxFactory?: string
	): ModuleMappingPartialTypingsObj {
		switch (fileType) {
			case FILE_TYPE.PUG:
			case FILE_TYPE.JADE:
				return Pug.parsePug(file, filePath);
			case FILE_TYPE.COMPILED_JSX:
				return CompiledJSX.parseJSX(file, jsxFactory);
			case FILE_TYPE.JSX:
			case FILE_TYPE.TSX:
				return JSX.parseJSX(file, fileType === FILE_TYPE.TSX);
			case FILE_TYPE.HTML:
			default:
				return HTML.parseHTML(file);
		}
	}

	export async function writeToOutput(
		typings: TypingsObj,
		outPath: string = Input.args.output
	) {
		return new Promise((resolve, reject) => {
			fs.writeFile(
				Util.getFilePath(outPath),
				Joining.convertToDefsFile(typings),
				(err) => {
					if (err) {
						Logging.error('Error writing to file');
						reject(err);
					} else {
						if (!Input.args.watch) {
							Logging.log(
								'Output typings to',
								Util.getFilePath(outPath)
							);
						}
						resolve();
					}
				}
			);
		});
	}

	export async function extractTypes(files?: string[], jsxFactory?: string) {
		const inFiles = files || (await Files.getInputFiles(Input.args.input));
		if (
			inFiles.length !== 1 &&
			!Input.args.output &&
			Input.args.output !== ''
		) {
			Logging.error(
				'Argument "-o/--output" is required when not using -s option and passing multiple files'
			);
			Logging.exit(1);
		}
		const typings = await getTypingsForInput(
			Input.args.input,
			inFiles,
			jsxFactory
		);
		return typings;
	}

	export async function extractTypesAndWrite(
		files?: string[],
		jsxFactory?: string
	) {
		const typings = await extractTypes(files, jsxFactory);
		return writeToOutput(
			typings,
			Input.args.output || Util.toQuerymapPath(files[0])
		);
	}

	export async function getSplitTypings(
		input: string | string[],
		files?: string[],
		jsxFactory?: string,
		splitTypings: {
			[key: string]: ModuleMappingPartialTypingsObj;
		} = {}
	) {
		files = files.length ? files : await Files.getInputFiles(input);
		files = files.sort();
		const toSkip = Object.getOwnPropertyNames(splitTypings);
		const contentsMap = await Files.readInputFiles(files, toSkip);
		return Util.objectForEach<string, ModuleMappingPartialTypingsObj>(
			contentsMap,
			(fileContent, fileName: string) => {
				return getTypings(
					fileContent,
					fileName,
					Util.getFileType(fileName),
					jsxFactory
				);
			},
			splitTypings
		);
	}

	export async function getTypingsForInput(
		input: string | string[],
		files?: string[],
		jsxFactory?: string
	) {
		const typingMaps = await getSplitTypings(input, files, jsxFactory);
		return Joining.mergeTypes(typingMaps);
	}
}
