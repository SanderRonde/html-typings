import { Extraction } from './main/conversion/extraction';
import { Logging } from './logging';
import { Util } from './util';
import { Main } from './main';
import { Gaze } from 'gaze';

export namespace Watching {
	export function watchFiles(
		input: string,
		callback: (changedFile: string, files: string[]) => void
	) {
		const gaze = new Gaze(input, {}, (err, watcher) => {
			if (err) {
				Logging.error(err);
				Logging.exit(1);
			}
		});

		gaze.on('all', (event, filePath) => {
			switch (event) {
				case 'added':
				case 'changed':
				case 'deleted':
					callback(filePath, getWatched(gaze));
					break;
			}
		});

		return gaze;
	}

	export async function doWatchCompilation(
		files: string[],
		previousTypings: {
			[
				key: string
			]: Extraction.ModuleMappingPartialTypingsObj;
		},
		jsxFactory: string
	) {
		const splitTypings = await Main.conversion.extraction.getSplitTypings(
			'',
			files,
			jsxFactory,
			previousTypings
		);
		const joinedTypes = Main.conversion.joining.mergeTypes(splitTypings);
		Main.conversion.extraction.writeToOutput(joinedTypes).catch(() => {
			Logging.exit(1);
		});
		return splitTypings;
	}

	export async function doSplitWatchCompilationAll(
		files: string[],
		jsxFactory: string
	) {
		const splitTypings = Main.conversion.joining.mergeModules(
			await Main.conversion.extraction.getSplitTypings(
				'',
				files,
				jsxFactory
			)
		);
		for (const keyPath in splitTypings) {
			Main.conversion.extraction.writeToOutput(
				splitTypings[keyPath],
				Util.toQuerymapPath(keyPath)
			).catch(() => {
				Logging.exit(1);
			});
		}
		return splitTypings;
	}

	export async function doSingleFileWatchCompilation(
		file: string,
		jsxFactory: string
	) {
		const splitTypings = await Main.conversion.extraction.getTypingsForInput(
			'',
			[file],
			jsxFactory
		);
		Main.conversion.extraction.writeToOutput(
			splitTypings,
			Util.toQuerymapPath(file)
		).catch(() => {
			Logging.exit(1);
		});
		return splitTypings;
	}

	export function getWatched(watcher: Gaze): string[] {
		const watched = watcher.watched();
		const keys = Object.getOwnPropertyNames(watched);
		let files: string[] = [];
		for (let i = 0; i < keys.length; i++) {
			files = [...files, ...watched[keys[i]]];
		}
		return files.filter((file) => {
			return file && Util.isHtmlFile(file);
		});
	}
}
