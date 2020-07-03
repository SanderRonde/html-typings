///<reference path="../../typings/mocha-steps.d.ts"/>

require('mocha-steps');
import fs = require('fs');
import glob = require('glob');
import path = require('path');
import { assert } from 'chai';
import * as ts from 'typescript';
import {
	extractStringTypes,
	extractGlobTypes,
	extractFileTypes,
	extractFolderTypes,
	FILE_TYPE,
} from '../../app/index';

type Tests =
	| 'dom-module'
	| 'empty-file'
	| 'multi'
	| 'none'
	| 'standard'
	| 'nested';

function getFileExtension(fileType: FILE_TYPE) {
	switch (fileType) {
		case FILE_TYPE.HTML:
			return 'html';
		case FILE_TYPE.PUG:
		case FILE_TYPE.JADE:
			return 'pug';
		case FILE_TYPE.COMPILED_JSX:
			return 'js';
	}
}

function getFilesInDir(dirName: Tests, fileType: FILE_TYPE): string[] {
	return glob
		.sync(
			`./test/programmatic/${fileType}/${dirName}/**/*.${getFileExtension(
				fileType
			)}`,
			{
				absolute: true,
			}
		)
		.sort();
}

function readFile(filePath: string): Promise<string> {
	return new Promise((resolve, reject) => {
		fs.readFile(filePath, 'utf8', (err, data) => {
			if (err) {
				reject(err);
			} else {
				resolve(data);
			}
		});
	});
}

const testMaps: {
	[FT in FILE_TYPE]: {
		[T in Tests]: string[];
	};
} = {
	[FILE_TYPE.HTML]: {
		'dom-module': getFilesInDir('dom-module', FILE_TYPE.HTML),
		'empty-file': getFilesInDir('empty-file', FILE_TYPE.HTML),
		multi: getFilesInDir('multi', FILE_TYPE.HTML),
		none: getFilesInDir('none', FILE_TYPE.HTML),
		standard: getFilesInDir('standard', FILE_TYPE.HTML),
		nested: getFilesInDir('nested', FILE_TYPE.HTML),
	},
	[FILE_TYPE.PUG]: {
		'dom-module': getFilesInDir('dom-module', FILE_TYPE.PUG),
		'empty-file': getFilesInDir('empty-file', FILE_TYPE.PUG),
		multi: getFilesInDir('multi', FILE_TYPE.PUG),
		none: getFilesInDir('none', FILE_TYPE.PUG),
		standard: getFilesInDir('standard', FILE_TYPE.PUG),
		nested: getFilesInDir('nested', FILE_TYPE.PUG),
	},
	[FILE_TYPE.COMPILED_JSX]: {
		'dom-module': getFilesInDir('dom-module', FILE_TYPE.COMPILED_JSX),
		'empty-file': getFilesInDir('empty-file', FILE_TYPE.COMPILED_JSX),
		multi: getFilesInDir('multi', FILE_TYPE.COMPILED_JSX),
		none: getFilesInDir('none', FILE_TYPE.COMPILED_JSX),
		standard: getFilesInDir('standard', FILE_TYPE.COMPILED_JSX),
		nested: getFilesInDir('nested', FILE_TYPE.COMPILED_JSX),
	},
};

async function tsCompile(input: string) {
	const tempFileLocation = path.join(__dirname, 'tempFile.d.ts');
	await new Promise((resolve, reject) => {
		fs.writeFile(tempFileLocation, input, (err) => {
			if (err) {
				reject();
			} else {
				resolve();
			}
		});
	});
	const program = ts.createProgram([tempFileLocation], {
		noImplicitAny: true,
		noImplicitReturns: true,
		noImplicitUseStrict: true,
		noImplicitThis: true,
		noUnusedLocals: true,
		noUnusedParameters: true,
		strictNullChecks: true,
	});
	await new Promise((resolve, reject) => {
		fs.unlink(tempFileLocation, (err) => {
			if (err) {
				reject();
			} else {
				resolve();
			}
		});
	});
	const emitResult = program.emit();
	const diagnostics = ts
		.getPreEmitDiagnostics(program)
		.concat(emitResult.diagnostics);

	if (diagnostics.length > 0 || emitResult.emitSkipped) {
		if (
			diagnostics.filter((diagnostic) => {
				const msg = diagnostic.messageText.toString();
				return (
					msg.indexOf('Cannot find name') === -1 &&
					msg.indexOf(
						"TagMap[T]' does not satisfy the constraint 'Node'."
					) === -1
				);
			}).length > 0
		) {
			throw new Error(
				JSON.stringify(
					diagnostics.map(
						({
							code,
							file: { fileName },
							category,
							messageText,
							source,
							start,
						}) => {
							if (typeof messageText !== 'string') {
								messageText = messageText.messageText;
							}
							return {
								code,
								fileName,
								category,
								messageText,
								source,
								start,
							};
						}
					)
				)
			);
		}
	}
}

function doTest(name: Tests, fileType: FILE_TYPE) {
	const results: {
		string?: string;
		glob?: string;
		file?: string;
		folder?: string;
	} = {};
	step(
		'should be able to run the main process without errors',
		async function () {
			this.slow(100);
			results.glob = await extractGlobTypes(
				`./test/programmatic/${fileType}/${name}/**/*.${getFileExtension(
					fileType
				)}`,
				{
					jsxFactory: 'JSX.factory',
				}
			);
		}
	);
	if (testMaps[fileType][name].length === 1) {
		//Skip single-file tests if there are multiple files or none
		step(
			'should be able to run the main process using string-only input',
			async () => {
				debugger;
				if (fileType !== FILE_TYPE.COMPILED_JSX) {
					results.string = extractStringTypes(
						await readFile(testMaps[fileType][name][0]),
						{
							fileType,
							pugPath: testMaps[fileType][name][0],
						}
					);
				} else {
					results.string = extractStringTypes(
						await readFile(testMaps[fileType][name][0]),
						{
							fileType: FILE_TYPE.COMPILED_JSX,
							jsxFactory: 'JSX.factory',
						}
					);
				}
			}
		);
	}
	step(
		'should be able to run the main process using folder input',
		async () => {
			results.folder = await extractFolderTypes(
				path.join(__dirname, `./${fileType}/${name}/`),
				{
					jsxFactory: 'JSX.factory',
				}
			);
		}
	);
	step(
		'should be able to run the main process using file-only input',
		async () => {
			results.file = await extractFileTypes(testMaps[fileType][name], {
				jsxFactory: 'JSX.factory',
			});
		}
	);

	it('should have produced the same results for all input methods', () => {
		let { string, glob, file, folder } = results;
		//Set string to any other in case it's not set
		if (testMaps[fileType][name].length !== 1) {
			string = glob;
		}
		assert.equal(string, glob, 'String and glob are equal');
		assert.equal(file, folder, 'File and folder are equal');
		assert.equal(string, file, 'String and file are equal');
	});
	it('results should be correct', async () => {
		const expected = await readFile(
			path.join(__dirname, `./${fileType}/${name}/expected.d.ts`)
		);
		assert.equal(
			results.glob,
			expected,
			'Results should match expected values'
		);
	});
	it('should compile without errors', async function () {
		this.timeout(20000);
		this.slow(6000);
		await tsCompile(results.glob);
	});
}

function setupTest(name: Tests, fileType: FILE_TYPE) {
	describe(name, () => {
		doTest(name, fileType);
	});
}

export function programmaticTests() {
	describe('Programmatic', () => {
		[FILE_TYPE.HTML, FILE_TYPE.PUG, FILE_TYPE.COMPILED_JSX].map(
			(fileType) => {
				describe(fileType, () => {
					setupTest('standard', fileType);
					setupTest('none', fileType);
					setupTest('empty-file', fileType);
					setupTest('dom-module', fileType);
					setupTest('multi', fileType);
					setupTest('nested', fileType);
				});
			}
		);
	});
}
