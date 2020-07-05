import { Gaze } from 'gaze';
import { Logging } from './logging';
import { Util } from './util';
import { Main } from './main';

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
			]: Main.Conversion.Extraction.ModuleMappingPartialTypingsObj;
		},
		jsxFactory: string
	) {
		const splitTypings = await Main.Conversion.Extraction.getSplitTypings(
			'',
			files,
			jsxFactory,
			previousTypings
		);
		const joinedTypes = Main.Conversion.Joining.mergeTypes(splitTypings);
		Main.Conversion.Extraction.writeToOutput(joinedTypes).catch(() => {
			Logging.exit(1);
		});
		return splitTypings;
	}

	export async function doSplitWatchCompilationAll(
		files: string[],
		jsxFactory: string
	) {
		const splitTypings = Main.Conversion.Joining.mergeModules(
			await Main.Conversion.Extraction.getSplitTypings(
				'',
				files,
				jsxFactory
			)
		);
		for (const keyPath in splitTypings) {
			Main.Conversion.Extraction.writeToOutput(
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
		const splitTypings = await Main.Conversion.Extraction.getTypingsForInput(
			'',
			[file],
			jsxFactory
		);
		Main.Conversion.Extraction.writeToOutput(
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
