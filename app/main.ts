/// <reference path="../typings/gaze.d.ts"/>
import { Extraction } from './main/conversion/extraction';
import { Prettifying } from './main/prettifying';
import { Conversion } from './main/conversion';
import { Constants } from './main/constants';
import { Watching } from './watching';
import { Logging } from './logging';
import { Input } from './input';
import { Files } from './files';
import { Util } from './util';
import { Gaze } from 'gaze';

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
	tags: {
		[key: string]: string;
	};
}

export namespace Main {
	export const constants = Constants;
	export const prettifying = Prettifying;
	export const conversion = Conversion;

	export function main() {
		let close: () => void = null;
		(async () => {
			let watcher: Gaze = null;
			close = () => {
				watcher && watcher.close();
				Logging.exit(0);
			};
			if (Input.args.watch) {
				if (
					!Input.args.separate &&
					!Input.args.output &&
					Input.args.output !== ''
				) {
					Logging.error(
						'Argument "-o/--output" is required when not using -s option and using watch mode'
					);
					Logging.exit(1);
					return;
				}

				let splitTypings: {
					[
						key: string
					]: Extraction.ModuleMappingPartialTypingsObj;
				} = null;
				let input = Input.args.input;
				if (
					Util.endsWith(Input.args.input, '/') ||
					Util.endsWith(Input.args.input, '\\')
				) {
					input = input + '**/*.*';
				} else if (
					Input.args.input.split(/\\\//).slice(-1)[0].indexOf('.') ===
					-1
				) {
					input = input + '/**/*.*';
				}
				watcher = Watching.watchFiles(
					input,
					async (changedFile, files) => {
						Logging.log(
							'File(s) changed, re-generating typings for new file(s)'
						);
						if (splitTypings && changedFile in splitTypings) {
							delete splitTypings[changedFile];
						}
						if (Input.args.separate) {
							await Watching.doSingleFileWatchCompilation(
								changedFile,
								Input.args.jsxfactory
							);
						} else {
							splitTypings = await Watching.doWatchCompilation(
								files,
								splitTypings,
								Input.args.jsxfactory
							);
						}
					}
				);
				if (Input.args.separate) {
					await Watching.doSplitWatchCompilationAll(
						Watching.getWatched(watcher),
						Input.args.jsxfactory
					);
				} else {
					splitTypings = await Watching.doWatchCompilation(
						Watching.getWatched(watcher),
						{},
						Input.args.jsxfactory
					);
				}
			} else {
				(async () => {
					if (Input.args.separate) {
						return Watching.doSplitWatchCompilationAll(
							await Files.getInputFiles(Input.args.input),
							Input.args.jsxfactory
						);
					} else {
						return Conversion.extraction.extractTypesAndWrite(
							undefined,
							Input.args.jsxfactory
						);
					}
				})()
					.then(() => {
						Logging.exit(0);
					})
					.catch(() => {
						Logging.exit(1);
					});
			}
		})();

		return () => {
			close();
		};
	}
}
