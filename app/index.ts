const isGlob: (path: string) => boolean = require('is-glob');
import { ArgumentParser } from 'argparse';
import path = require('path');
import { Parser } from 'htmlparser2';
import { Glob } from 'glob'
import fs = require('fs');

const parser = new ArgumentParser({
	addHelp: true,
	description: 'Generates typings for your HTML files'
});
parser.addArgument(['-f', '--files'], {
	help: 'The path to a single file, a folder, or a glob pattern',
	required: true
});
parser.addArgument(['-o', '--output'], {
	help: 'The location to output the typings to',
	required: true
});
parser.addArgument(['-d', '--dom-module'], {
	help: 'Splits dom-modules into their own subsection',
	action: 'storeTrue'
});

const args: {
	files: string;
	output: string;
} = parser.parseArgs();

function readFullDir(dir: string): Promise<string[]> {
	return new Promise((resolve) => {
		fs.readdir(dir, async (err, files) => {
			if (err) {
				console.error('Error reading files');
				process.exit(2);
			} else {
				resolve((await Promise.all(files.map((path) => {
					return new Promise<string[]>((resolveDirRead) => {
						fs.stat(path, async (err, stats) => {
							if (err) {
								console.error('Error reading files');
								process.exit(2);
							} else {
								if (stats.isDirectory()) {
									resolveDirRead(await readFullDir(path));
								} else {
									resolveDirRead([path]);
								}
							}
						});
					});
				}))).reduce((a, b) => {
					return a.concat(b);
				}));
			}
		});
	});
}

function getInputFiles(): Promise<string[]> {
	return new Promise((resolve, reject) => {
		const input = path.join(process.cwd(), args.files);
		if (isGlob(input)) {
			new Glob(input, (err, matches) => {
				if (err) {
					console.error('Error reading glob pattern');
					process.exit(2);
				} else {
					resolve(matches);
				}
			});
		} else {
			fs.stat(input, async (err, stats) => {
				if (err) {
					console.error('Input file(s) not found');
					process.exit(2);
				} else {
					if (stats.isDirectory()) {
						resolve(await readFullDir(input));
					} else {
						resolve([input]);
					}
				}
			});
		}
	});
}

async function readInputFiles(inputs: string[]): Promise<string[]> {
	return Promise.all(inputs.map((input) => {
		return new Promise<string>((resolve) => {
			fs.readFile(input, 'utf8', (err, data) => {
				if (err) {
					console.error('Error reading input file(s)');
					process.exit(2);
				} else {
					resolve(data);
				}
			});
		});
	}));
}

const getFileTemplate = (content: string) => {
	return `interface IDMap 
${content}
`;
}

//TODO: querySelector map etc


function stringToType(str: string) {
	return str.replace(/":"(\w+)"/g, '": $1');
}

function prettyify(str: string) {
	str = str
		.replace(/"(\w+)": (\w+),/g, '\t"$1": $2,\n')
		.replace(/"(\w+)": (\w+)},/g, '\t"$1": $2\n},\n')
		.replace(/"([\w|-]+)":{/g, '"$1":{\n')
		.replace(/\n},"/g, '\n},\n"')
		.replace(/{\n}/g, '{ }')
		.replace(/"(\w+)": (\w+)}}/g, '\t"$1": $2\n}\n}')
		.replace(/{"/g, '{\n"')
		.replace(/:"{ }",/, ':{ },\n');
	const split = str.split('\n');
	return `${split[0]}\n${split.slice(1, -1).map((line) => {
		return `\t${line}`;
	}).join('\n')}\n${split.slice(-1)[0]}`;
}

function getTagType(name: string) {
	switch (name) {
		case 'svg':
			return 'SVGElement';
		case 'textarea':
			return 'HTMLTextAreaElement';
		case 'a':
			return 'HTMLAnchorElement';
		case 'h1':
		case 'h2':
		case 'h3':
			return 'HTMLHeadingElement';
		case 'br':
			return 'HTMLBRElement';
		case 'img':
			return 'HTMLImageElement';
		case 'b':
			return 'HTMLElement';
		case undefined:
			return 'HTMLTemplateElement';
		default: 
			return `HTML${name.split('-').map((word) => {
				return word[0].toUpperCase() + word.slice(1);
			}).join('')}Element`;
	}
}

function getTypings(file: string) {
	const map: {
		ids: {
			[key: string]: string;
		}
		classes: [string, string][]
		module?: string;
	} = {
		ids: {},
		classes: []
	};

	let domModuleKey: string = null;
	const parser = new Parser({
		 onopentag(name, attribs) {
			if (name === 'dom-module') {
				domModuleKey = attribs.id;
				return;
			} else if (name === 'template') {
				if (attribs.id) {
					map.ids[attribs.id] = `#${attribs['data-element-type']}` || 
						`#${getTagType(attribs.is)}`;
				}
			} else {
				if (attribs.id) {
					map.ids[attribs.id] = `#${attribs['data-element-type']}` || 
						`#${getTagType(name)}`;
				}
			}
			if (attribs.class) {
				map.classes.push([attribs.class, `${attribs['data-element-type']}` || 
					`${getTagType(name)}`]);
			}
		 }
	});

	parser.write(file);
	parser.end();

	if (domModuleKey) {
		map.module = domModuleKey;
	}

	return map;
}

function convertToDefsFile(typings: {
	[key: string]: string|{
		[key: string]: string;
	}
}) {
	return getFileTemplate(prettyify(stringToType(JSON.stringify(typings))));
}

function mergeTypes(types: {
	ids: {
		[key: string]: string;
	}
	classes: [string, string][]
	module?: string;
}[]): {
	[key: string]: string|{
		[key: string]: string;
	}
} {
	let map: {
		[key: string]: string|{
			[key: string]: string;
		}
	} = {};

	const allClassTypes: {
		[key: string]: string[]
	} = {};

	types.forEach((typeMap) => {
		if (!typeMap.module) {
			map = { ...map, ...typeMap.ids }

			typeMap.classes.forEach((typeMapClass) => {
				if (typeMapClass[0] in allClassTypes) {
					if (allClassTypes[typeMapClass[0]].indexOf(typeMapClass[1]) === -1) {
						allClassTypes[typeMapClass[0]].push(typeMapClass[1]);
					}
				}
			});
		} else {
			map[typeMap.module] = typeMap.ids;

			const classTypes: {
				[key: string]: string[];
			} = {};
			typeMap.classes.forEach((typeMapClass) => {
				if (typeMapClass[0] in classTypes) {
					if (classTypes[typeMapClass[0]].indexOf(typeMapClass[1]) === -1) {
						classTypes[typeMapClass[0]].push(typeMapClass[1]);
					}
				}
			});

			Object.getOwnPropertyNames(classTypes).forEach((elName: string) => {
				(<any>map[typeMap.module])[`.${elName}`] = classTypes[elName].join('|');
			});
		}
	});

	Object.getOwnPropertyNames(allClassTypes).forEach((elName: string) => {
		map[`.${elName}`] = allClassTypes[elName].join('|');
	});

	return map;
}

async function main() {
	const files = await getInputFiles();
	const contents = await readInputFiles(files);
	const types = contents.map((fileContent) => {
		return getTypings(fileContent);
	});
	fs.writeFile(args.output, convertToDefsFile(mergeTypes(types)), (err) => {
		if (err) {
			console.error('Error writing to file');
			process.exit(1);
		} else {
			process.exit(0);
		}
	});
}

export function extractTypes(data: string): string {
	return convertToDefsFile(mergeTypes([getTypings(data)]));
}

main();