///<reference path="../typings/mocha-steps.d.ts"/>

require('mocha-steps');
import fs = require('fs');
import glob = require('glob');
import path = require('path');
import { assert } from 'chai';
import * as ts from 'typescript';
import { 
	extractStringTypes, extractGlobTypes,
	extractFileTypes, extractFolderTypes 
} from '../app/index';

type Tests = 'dom-module'|'empty-file'|'multi'|'none'|'standard'|'nested';

function getFilesInDir(dirName: Tests): string[] {
	return glob.sync(`./test/${dirName}/**/*.html`, {
		absolute: true
	});
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
	'dom-module': getFilesInDir('dom-module'),
	'empty-file': getFilesInDir('empty-file'),
	'multi': getFilesInDir('multi'),
	'none': getFilesInDir('none'),
	'standard': getFilesInDir('standard'),
	'nested': getFilesInDir('nested')
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
		throw new Error(JSON.stringify(diagnostics));
	}
}

function doTest(name: Tests) {
	const results: {
		string?: string;
		glob?: string;
		file?: string;
		folder?: string;
	} = {};
	step('should be able to run the main process without errors', async function () {
		this.slow(100);
		results.glob = await extractGlobTypes(`./test/${name}/**/*.html`);
	});
	if (testMaps[name].length === 1) {
		//Skip single-file tests if there are multiple files or none
		step('should be able to run the main process using string-only input', async () => {
			results.string = await extractStringTypes(await readFile(testMaps[name][0]));
		});
	}
	step('should be able to run the main process using folder input', async () => {
		results.folder = await extractFolderTypes(path.join(__dirname, `./${name}/`));
	});
	step('should be able to run the main process using file-only input', async () => {
		results.file = await extractFileTypes(testMaps[name].map((file) => {
			return file;
		}));
	});

	it('should have produced the same results for all input methods', () => {
		let { string, glob, file, folder } = results;
		//Set string to any other in case it's not set
		if (testMaps[name].length !== 1) {
			string = glob;
		}
		assert.equal(string, glob, 'String and glob are equal');
		assert.equal(file, folder, 'File and folder are equal');
		assert.equal(string, file, 'String and file are equal');
	});
	it('results should be correct', async () => {
		const expected = await readFile(path.join(__dirname, `./${name}/expected.d.ts`));
		assert.equal(results.glob, expected, 'Results should match expected values');
	});
	it('should compile without errors', async function() {
		this.timeout(10000);
		this.slow(6000);
		await tsCompile(results.glob);
	});
}

function setupTest(name: Tests) {
	describe(name, () => {
		doTest(name);
	});
}

describe('Tests', () => {
	setupTest('standard');	
	setupTest('none');
	setupTest('empty-file');
	setupTest('dom-module');
	setupTest('multi');
	setupTest('nested');
});