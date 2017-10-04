declare function Gaze(patterns?: string|string[], options?: Gaze.GazeOptions, callback?: (err: Error|void, watcher: Gaze.Gaze) => void): void

declare namespace Gaze {
	interface GazeOptions {
		interval?: number;
		debounceDelay?: number;
		mode?: 'auto'|'watch'|'poll';
		cwd?: string;
	}

	export class Gaze {
		constructor(patterns?: string|string[], options?: GazeOptions, callback?: (err: Error|void, watcher: Gaze) => void);

		emit(event: string, ...args: any[]): void;
		close(): void;
		add(patterns: string|string[], callback: (err: Error|void, watcher: Gaze) => void): void;
		remove(filePath: string): void;
		watched(): string[];
		relative(dir?: string, unixify?: boolean): string[];

		addEventListener(event: 'ready', callback: (watcher: Gaze) => void): void;
		addEventListener(event: 'all', callback: (event: 'added'|'changed'|'renamed'|'deleted', filePath: string) => void): void;
		addEventListener(event: 'added', callback: (filePath: string) => void): void;
		addEventListener(event: 'changed', callback: (filePath: string) => void): void;
		addEventListener(event: 'deleted', callback: (filePath: string) => void): void;
		addEventListener(event: 'renamed', callback: (newPath: string, oldPath: string) => void): void;
		addEventListener(event: 'end', callback: () => void): void;
		addEventListener(event: 'error', callback: (err: Error) => void): void;
		addEventListener(event: 'nomatch', callback: () => void): void;
	}
}

declare module 'gaze' {
	export = Gaze;
}