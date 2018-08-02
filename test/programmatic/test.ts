///<reference path="../../typings/mocha-steps.d.ts"/>

require('mocha-steps');
import fs = require('fs');
import glob = require('glob');
import path = require('path');
import { assert } from 'chai';
import * as ts from 'typescript';
import { 
	extractStringTypes, extractGlobTypes,
	extractFileTypes, extractFolderTypes
} from '../../app/index';

type Tests = 'dom-module'|'empty-file'|'multi'|'none'|'standard'|'nested';

function getFilesInDir(dirName: Tests, isPug: boolean = false): string[] {
	const type = isPug ? 'pug' : 'html';
	return glob.sync(`./test/programmatic/${type}/${dirName}/**/*.${type}`, {
		absolute: true
	}).sort();
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

const testMaps = {
	html: {
		'dom-module': getFilesInDir('dom-module'),
		'empty-file': getFilesInDir('empty-file'),
		'multi': getFilesInDir('multi'),
		'none': getFilesInDir('none'),
		'standard': getFilesInDir('standard'),
		'nested': getFilesInDir('nested')
	},
	pug: {
		'dom-module': getFilesInDir('dom-module', true),
		'empty-file': getFilesInDir('empty-file', true),
		'multi': getFilesInDir('multi', true),
		'none': getFilesInDir('none', true),
		'standard': getFilesInDir('standard', true),
		'nested': getFilesInDir('nested', true)
	}
}

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
		strictNullChecks: true
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
	const diagnostics = ts.getPreEmitDiagnostics(program).concat(emitResult.diagnostics);

	if (diagnostics.length > 0 || emitResult.emitSkipped) {
		if (diagnostics.map((diagnostic) => {
			return diagnostic.messageText.toString().indexOf('Cannot find name') === -1;
		}).filter(val => val).length > 0) {
			throw new Error(JSON.stringify(diagnostics.map(({ code, file, category, messageText, source, start }) => {
				return {
					code, file, category, messageText, source, start
				}
			})));
		}
	}
}

function doTest(name: Tests, isPug: boolean) {
	const results: {
		string?: string;
		glob?: string;
		file?: string;
		folder?: string;
	} = {};
	const type = isPug ? 'pug' : 'html';;
	step('should be able to run the main process without errors', async function () {
		this.slow(100);
		results.glob = await extractGlobTypes(`./test/programmatic/${type}/${name}/**/*.${type}`);
	});
	if (testMaps[type][name].length === 1) {
		//Skip single-file tests if there are multiple files or none
		step('should be able to run the main process using string-only input', async () => {
			results.string = await extractStringTypes(await readFile(testMaps[type][name][0]), {
				isPug: isPug,
				pugPath: testMaps[type][name][0]
			});
		});
	}
	step('should be able to run the main process using folder input', async () => {
		results.folder = await extractFolderTypes(path.join(__dirname, `./${type}/${name}/`));
	});
	step('should be able to run the main process using file-only input', async () => {
		results.file = await extractFileTypes(testMaps[type][name]);
	});

	it('should have produced the same results for all input methods', () => {
		let { string, glob, file, folder } = results;
		//Set string to any other in case it's not set
		if (testMaps[type][name].length !== 1) {
			string = glob;
		}
		assert.equal(string, glob, 'String and glob are equal');
		assert.equal(file, folder, 'File and folder are equal');
		assert.equal(string, file, 'String and file are equal');
	});
	it('results should be correct', async () => {
		const expected = await readFile(path.join(__dirname, `./${type}/${name}/expected.d.ts`));
		assert.equal(results.glob, expected, 'Results should match expected values');
	});
	it('should compile without errors', async function() {
		this.timeout(20000);
		this.slow(6000);
		await tsCompile(results.glob);
	});
}

function setupTest(name: Tests, isPug: boolean = false) {
	describe(name, () => {
		doTest(name, isPug);
	});
}

export function programmaticTests() {
	describe('Programmatic', () => {
		describe('HTML', () => {
			setupTest('standard');	
			setupTest('none');
			setupTest('empty-file');
			setupTest('dom-module');
			setupTest('multi');
			setupTest('nested');
		});
		describe('Pug', () => {
			setupTest('standard', true);	
			setupTest('none', true);
			setupTest('empty-file', true);
			setupTest('dom-module', true);
			setupTest('multi', true);
			setupTest('nested', true);
		});
	});
}