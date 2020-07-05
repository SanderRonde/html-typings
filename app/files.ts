import { Logging } from './logging';
import { Util } from './util';
import { Glob } from 'glob';
import fs = require('fs');

export namespace Files {
	export function getInputFiles(files: string | string[]): Promise<string[]> {
		return new Promise((resolve) => {
			if (Array.isArray(files)) {
				Promise.all(files.map((file) => getInputFiles(file))).then(
					(matches) => {
						const matched: string[] = [];
						for (const match of matches) {
							matched.push(...match);
						}
						resolve(matched);
					}
				);
				return;
			}
			new Glob(
				Util.getFilePath(files),
				{
					absolute: true,
					nodir: true,
				},
				(err, matches) => {
					if (err) {
						Logging.error('Error reading input', err);
						Logging.exit(2);
					} else {
						resolve(matches);
					}
				}
			);
		});
	}

	export async function readInputFiles(
		inputs: string[],
		skip: string[] = []
	): Promise<{
		[key: string]: string;
	}> {
		const fileMap: {
			[key: string]: string;
		} = {};
		await Promise.all(
			inputs.map((input) => {
				return new Promise<string>((resolve) => {
					if (skip.indexOf(input) > -1) {
						resolve('');
					}
					fs.readFile(input, 'utf8', (err, data) => {
						if (err) {
							Logging.error('Error reading input file(s)', err);
							Logging.exit(2);
						} else {
							fileMap[input] = data;
							resolve(data);
						}
					});
				});
			})
		);
		return fileMap;
	}
}
