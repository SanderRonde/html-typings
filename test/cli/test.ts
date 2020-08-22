///<reference path="../../typings/mocha-steps.d.ts"/>

require('mocha-steps');

import { cli } from '../../app/index';
import { assert } from 'chai';
import fs = require('fs');
import path = require('path');

function captureLogs(program: {
	on(event: 'exit', handler: (exitCode: number) => void): void;
	on(event: 'error', handler: (...args: any[]) => void): void;
	on(event: 'log', handler: (...args: any[]) => void): void;
	addEventListener(event: 'exit', handler: (exitCode: number) => void): void;
	addEventListener(event: 'error', handler: (...args: any[]) => void): void;
	addEventListener(event: 'log', handler: (...args: any[]) => void): void;
}): Promise<{
	exitCode: number;
	errors: any[][];
	logs: any[][];
}> {
	return new Promise((resolve) => {
		const errors: any[][] = [];
		const logs: any[][] = [];
		program.on('error', (...args) => {
			errors.push(args);
		});
		program.on('log', (...args) => {
			logs.push(args);
		});
		program.on('exit', (exitCode: number) => {
			resolve({
				exitCode: exitCode,
				errors: errors,
				logs: logs
			});
		});
	});
}

function hasOutputted(filePath: string = path.join(__dirname, 'output.d.ts')): Promise<string|null> {
	return new Promise((resolve) => {
		fs.stat(filePath, async (err) => {
			if (err) {
				resolve(null);		
			} else {
				const content = await new Promise<string|null>((resolveRead) => {
					fs.readFile(filePath, 'utf8', (err, data) => {
						if (err) {
							resolveRead(null);
						} else {
							resolveRead(data);
						}
					});
				});
				await new Promise((resolveDelete) => {
					fs.unlink(filePath, (err) => {
						if (err) {
							resolveDelete();
							resolve(null);
						} else {
							resolveDelete();
						}
					});
				});
				resolve(content);
			}
		});
	});
}

function write(filePath: string, data: string): Promise<void> {
	return new Promise((resolve, reject) => {
		fs.writeFile(filePath, data, {
			encoding: 'utf8'
		}, (err) => {
			if (err) {
				reject(err);
			} else {
				resolve();
			}
		});
	});
}

function remove(filePath: string): Promise<void> {
	return new Promise((resolve, reject) => {
		fs.unlink(filePath, (err) => {
			if (err) {
				reject(err);
			} else {
				resolve();
			}
		})
	});
}

function assertDir(filePath: string): Promise<void> {
	return new Promise((resolve, reject) => {
		fs.mkdir(filePath, (err) => {
			if (!err || err.code === 'EEXIST') {
				resolve();
			} else {
				reject(err);
			}
		});
	});
}

function htmlTemplate(body: string): string { 
	return `<html><head><title>test</title></head><body>${body}</body></html>`
}

function wait(duration: number): Promise<void> {
	return new Promise((resolve) => {
		setTimeout(resolve, duration);
	});
}

function captureError(fn: (done: MochaDone) => Promise<any>) {
	return (done: MochaDone) => {
		new Promise(async (resolve) => {
			try {
				await fn((e?: Error) => {
					if (e) {
						done(e);
					} else {
						resolve();
					}
				});
				resolve();
			} catch(e) {
				done(e);
			}
		}).then(() => {
			done();
		});
	}
}

export function cliTests() {
	describe('CLI', function () {
		this.slow(200);
		this.timeout(200);
		describe('Input', () => {
			it('should throw an error when no arguments are passed', async () => {
				assert.throws(() => {
					cli([]);
				}, /Argument "-i\/--input" is required/, 'Arguments-invalid message was shown');
			});
			it('should throw an error when no input file is given', async () => {
				assert.throws(() => {
					cli(['-o', 'out_file.d.ts']);
				}, /Argument "-i\/--input" is required/, 'Arguments-invalid message was shown');
			});
			it('should throw an error when no output file is given in normal mode with multiple files', function (done) {
				this.timeout(15000);
				this.slow(15000);

				let errText: string = '';
				const cliInstance = cli(['-i', './test/**/*.html']);
				let isDone: boolean = false;
				cliInstance.on('exit', (code) => {
					assert.strictEqual(code, 1);
					assert.include(errText, 'Argument "-o\/--output" is required', 'Arguments-invalid message was shown');
					if (!isDone) {
						isDone = true;
						done();
					}
				});
				cliInstance.on('error', (...args) => {
					errText += args.reduce((prev, current) => prev + current, '');
				});
			});
			it('should throw an error when no output file is given in watch mode with multiple files', function (done) {
				this.timeout(15000);
				this.slow(15000);

				let errText: string = '';
				const cliInstance = cli(['-i', './test/**/*.html', '-w']);
				let isDone: boolean = false;
				cliInstance.on('error', (...args) => {
					errText += args.reduce((prev, current) => prev + current, '');
				});
				cliInstance.on('exit', (code) => {
					assert.strictEqual(code, 1);
					assert.include(errText, 'Argument "-o\/--output" is required', 'Arguments-invalid message was shown');
					if (!isDone) {
						isDone = true;
						done();
					}
				});
			});
			it('should throw an error when an invalid argument is given', async () => {
				assert.throws(() => {
					cli(['-i', 'in_file.html', '-o', 'out_file.d.ts', '-t']);
				}, /Unrecognized arguments: -t/, 'Arguments-invalid message was shown');
			});
		});

		describe('Conversion', () => {
			describe('File path', () => {
				it('should work when specifying a relative file location', captureError(async () => {
					const data = await captureLogs(cli(['-i', 'test/cli/html/cli.html', '-o', 'test/cli/output.d.ts']));
					assert.equal(data.exitCode, 0, 'Exit code is 0');
					const output = await hasOutputted();
					assert.isTrue(!!output, 'Output file was generated');
					assert.isTrue(output!.indexOf('export') === -1, 'Has not exported types');
				}));
				it('should work when specifying an absolute file location', captureError(async () => {
					const data = await captureLogs(cli(['-i', path.join(__dirname, 'html/cli.html'), '-o', 'test/cli/output.d.ts']));
					assert.equal(data.exitCode, 0, 'Exit code is 0');
					const output = await hasOutputted();
					assert.isTrue(!!output, 'Output file was generated');
					assert.isTrue(output!.indexOf('export') === -1, 'Has not exported types');
				}));
				it('should work when specifying an absolute output location', captureError(async () => {
					const data = await captureLogs(cli(['-i', path.join(__dirname, 'html/cli.html'), '-o', path.join(__dirname, 'output.d.ts')]));
					assert.equal(data.exitCode, 0, 'Exit code is 0');
					const output = await hasOutputted();
					assert.isTrue(!!output, 'Output file was generated');
					assert.isTrue(output!.indexOf('export') === -1, 'Has not exported types');
				}));
				it('should work when the export flag is enabled', captureError(async () => {
					const data = await captureLogs(cli(['-i', 'test/cli/html/cli.html', '-o', 'test/cli/output.d.ts', '-e']));
					assert.equal(data.exitCode, 0, 'Exit code is 0');
					const output = await hasOutputted();
					assert.isTrue(!!output, 'Output file was generated');
					assert.isTrue(output!.indexOf('export') > -1, 'Has exported types');
				}));
			});

			describe('Folder', () => {
				it('should work when specifying a relative folder location', captureError(async () => {
					const data = await captureLogs(cli(['-i', 'test/cli/html/', '-o', 'test/cli/output.d.ts']));
					assert.equal(data.exitCode, 0, 'Exit code is 0');
					assert.isTrue(!!await hasOutputted(), 'Output file was generated');
				}));
				it('should work when specifying an absolute folder location', captureError(async () => {
					const data = await captureLogs(cli(['-i', path.join(__dirname, 'html/'), '-o', 'test/cli/output.d.ts']));
					assert.equal(data.exitCode, 0, 'Exit code is 0');
					assert.isTrue(!!await hasOutputted(), 'Output file was generated');
				}));
				it('should read a folder recursively', captureError(async () => {
					const data = await captureLogs(cli(['-i', __dirname, '-o', 'test/cli/output.d.ts']));
					assert.equal(data.exitCode, 0, 'Exit code is 0');
					assert.isTrue(!!await hasOutputted(), 'Output file was generated');
				}));
			});

			describe('Glob', () => {
				it('should work when specifying a relative glob', captureError(async () => {
					const data = await captureLogs(cli(['-i', 'test/cli/html/**/*.*', '-o', 'test/cli/output.d.ts']));
					assert.equal(data.exitCode, 0, 'Exit code is 0');
					assert.isTrue(!!await hasOutputted(), 'Output file was generated');
				}));
				it('should work when specifying an absolute glob', captureError(async () => {
					const data = await captureLogs(cli(['-i', path.join(__dirname, 'html/**/*.*'), '-o', 'test/cli/output.d.ts']));
					assert.equal(data.exitCode, 0, 'Exit code is 0');
					assert.isTrue(!!await hasOutputted(), 'Output file was generated');
				}));
				it('should recursively read folders', captureError(async () => {
					const data = await captureLogs(cli(['-i', path.join(__dirname, '**/*.*'), '-o', 'test/cli/output.d.ts']));
					assert.equal(data.exitCode, 0, 'Exit code is 0');
					assert.isTrue(!!await hasOutputted(), 'Output file was generated');
				}));
			});
		});

		describe('Watching', function() {
			this.timeout(15000);
			this.slow(15000);
			it('should work when watching a single file', captureError(async (done) => {
				const filePath = path.join(__dirname, 'testInput.html');
				await write(filePath, htmlTemplate('<div id="main"></div>'));

				//Initting
				const program = cli(['-i', filePath, '-o', 'test/cli/output.d.ts', '-w']);
				const logCapturer = captureLogs(program);
				await wait(3000);
				const outputContent = await hasOutputted();
				assert.isTrue(!!outputContent, 'Output file was generated');

				//Change file
				await write(filePath, htmlTemplate('<div id="somediv"></div>'));
				await wait(3000);
				const newOutput = await hasOutputted();
				assert.isTrue(!!newOutput, 'New output file was generated');
				assert.notEqual(newOutput, outputContent, 'Outputs differ');

				//Remove HTML file
				await remove(filePath);

				logCapturer.then((data) => {
					assert.equal(data.exitCode, 0, 'Exit code is 0');
					assert.isAbove(data.logs.length, 0, 'Should have logged something');
					data.logs.forEach((log) => {
						const joinedLog = log.join(',');
						assert.isTrue(joinedLog.indexOf('File(s) changed') > -1 ||
							joinedLog.indexOf('Generated typings') > -1,
								'Logs all contain one of "files changed" or "generated typings"');
					});
					done();
				});
				program.quit();
			}));
			it('should work when watching a folder', captureError(async (done) => {
				const dir = path.join(__dirname, 'temp');
				await assertDir(dir)
				const filePath1 = path.join(dir, 'testInput.html');
				const filePath2 = path.join(dir, 'testInput1.html');
				await write(filePath1, htmlTemplate('<div id="main"></div>'));
				await write(filePath2, htmlTemplate('<div id="main2"></div>'));

				//Initting
				const program = cli(['-i', dir, '-o', 'test/cli/output.d.ts', '-w']);
				const logCapturer = captureLogs(program);
				await wait(3000);
				const outputContent = await hasOutputted();
				assert.isTrue(!!outputContent, 'Output file was generated');

				//Change file
				await write(filePath1, htmlTemplate('<div id="somediv"></div>'));
				await wait(3000);
				const newOutput = await hasOutputted();
				assert.isTrue(!!newOutput, 'New output file was generated');
				assert.notEqual(newOutput, outputContent, 'Outputs differ');

				//Remove HTML file
				await remove(filePath1);
				await remove(filePath2);

				logCapturer.then((data) => {
					assert.equal(data.exitCode, 0, 'Exit code is 0');
					assert.isAbove(data.logs.length, 0, 'Should have logged something');
					data.logs.forEach((log) => {
						const joinedLog = log.join(',');
						assert.isTrue(joinedLog.indexOf('File(s) changed') > -1 ||
							joinedLog.indexOf('Generated typings') > -1,
								'Logs all contain one of "files changed" or "generated typings"');
					});
					done();
				});
				program.quit();
			}));
			it('should work when watching a glob pattern', captureError(async (done) => {
				const dir = path.join(__dirname, 'temp');
				await assertDir(dir)
				const filePath1 = path.join(dir, 'testInput.html');
				const filePath2 = path.join(dir, 'testInput1.html');
				await write(filePath1, htmlTemplate('<div id="main"></div>'));
				await write(filePath2, htmlTemplate('<div id="main2"></div>'));

				//Initting
				const program = cli(['-i', path.join(dir, '**/*.*'), '-o', 'test/cli/output.d.ts', '-w']);
				const logCapturer = captureLogs(program);
				await wait(3000);
				const outputContent = await hasOutputted();
				assert.isTrue(!!outputContent, 'Output file was generated');

				//Change file
				await write(filePath1, htmlTemplate('<div id="somediv"></div>'));
				await wait(3000);
				const newOutput = await hasOutputted();
				assert.isTrue(!!newOutput, 'New output file was generated');
				assert.notEqual(newOutput, outputContent, 'Outputs differ');

				//Remove HTML file
				await remove(filePath1);
				await remove(filePath2);

				logCapturer.then((data) => {
					assert.equal(data.exitCode, 0, 'Exit code is 0');
					assert.isAbove(data.logs.length, 0, 'Should have logged something');
					data.logs.forEach((log) => {
						const joinedLog = log.join(',');
						assert.isTrue(joinedLog.indexOf('File(s) changed') > -1 ||
							joinedLog.indexOf('Generated typings') > -1,
								'Logs all contain one of "files changed" or "generated typings"');
					});
					done();
				});
				program.quit();
			}));
			it('should work when the -s (--separate) flag is passed', captureError(async (done) => {
				const dir = path.join(__dirname, 'temp');
				await assertDir(dir)
				const filePath1 = path.join(dir, 'testInput.html');
				const filePath2 = path.join(dir, 'testInput1.html');
				await write(filePath1, htmlTemplate('<div id="main"></div>'));
				await write(filePath2, htmlTemplate('<div id="main2"></div>'));

				//Initting
				const program = cli(['-i', path.join(dir, '**/*.*'), '-w', '-s']);
				const logCapturer = captureLogs(program);
				await wait(3000);
				const outputs: {
					[key: string]: string;
				} = {};
				for (const src of [filePath1, filePath2]) {
					const outputContent = await hasOutputted(src.replace('.html', '-querymap.d.ts'));
					assert.isTrue(!!outputContent, 'Output file was generated');
					outputs[src] = outputContent!;
				}

				//Change file
				await write(filePath1, htmlTemplate('<div id="somediv"></div>'));
				await wait(3000);
				const newOutput = await hasOutputted(filePath1.replace('.html', '-querymap.d.ts'));
				assert.isTrue(!!newOutput, 'New output file was generated');
				assert.notEqual(newOutput, outputs[filePath1], 'Outputs differ');

				//Remove HTML file
				await remove(filePath1);
				await remove(filePath2);

				logCapturer.then((data) => {
					assert.equal(data.exitCode, 0, 'Exit code is 0');
					assert.isAbove(data.logs.length, 0, 'Should have logged something');
					data.logs.forEach((log) => {
						const joinedLog = log.join(',');
						assert.isTrue(joinedLog.indexOf('File(s) changed') > -1 ||
							joinedLog.indexOf('Output typings to') > -1,
								'Logs all contain one of "files changed" or "Output typings to"');
					});
					done();
				});
				program.quit();
			}));
		});
	});

	after(captureError(async () => {
		if (!!await hasOutputted()) {
			console.log('Some test has not deleted its output');
		}
	}));
}