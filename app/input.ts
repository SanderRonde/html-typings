import { ArgumentParser } from "argparse";

export namespace Input {
	const parser = new ArgumentParser({
		addHelp: true,
		description: 'Generates typings for your HTML files',
		debug: !!process.env.DEBUG_HTML_TYPINGS,
	} as any);
	parser.addArgument(['-i', '--input'], {
		help: 'The path to a single file, a folder, or a glob pattern',
		required: true,
	});
	parser.addArgument(['-o', '--output'], {
		help:
			'The location to output the typings to, required if --separate is not passed',
	});
	parser.addArgument(['-w', '--watch'], {
		help: 'Watch for HTML file changes',
		action: 'storeTrue',
	});
	parser.addArgument(['-e', '--export'], {
		help: 'Export all interfaces',
		action: 'storeTrue',
	});
	parser.addArgument(['-s', '--separate'], {
		help:
			'Separate the querymaps when given multiple input files. Will output the files alongside the input files',
		action: 'storeTrue',
	});
	parser.addArgument(['-j', '--jsxfactory'], {
		help: 'The jsx factory name',
	});

	export function parse(programArgs?: string[]) {
		args = parser.parseArgs(programArgs);
	}

	export let args: {
		input: string;
		output: string;
		watch: boolean;
		export: boolean;
		separate: boolean;
		jsxfactory: string;
	};
}