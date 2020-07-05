import { Logging } from './logging';
import { Input } from './input';
import { Main } from './main';

export namespace CLI {
	function addToHandlers<
		T extends {
			[key: string]: P[];
		},
		P extends Function
	>(
		handlers: T,
		prevOutput: {
			exit: number | null;
			error: string[][];
			log: string[][];
		},
		event: 'exit' | 'error' | 'log',
		handler: P
	) {
		if (event === 'exit' || event === 'error' || event === 'log') {
			if (event === 'exit') {
				handlers[event].push(handler);
				if (prevOutput.exit !== null) {
					handler(prevOutput.exit);
				}
			} else {
				handlers[event].push(handler);
				prevOutput[event].forEach((out) => {
					handler(...out);
				});
			}
		}
	}

	export function cli(
		args: string[]
	): {
		on(event: 'exit', handler: (exitCode: number) => void): void;
		on(event: 'error', handler: (...args: any[]) => void): void;
		on(event: 'log', handler: (...args: any[]) => void): void;
		addEventListener(
			event: 'exit',
			handler: (exitCode: number) => void
		): void;
		addEventListener(
			event: 'error',
			handler: (...args: any[]) => void
		): void;
		addEventListener(event: 'log', handler: (...args: any[]) => void): void;
		quit(): void;
		hasQuit: boolean;
	} {
		const handlers: {
			exit: ((code: number) => void)[];
			error: ((...args: any[]) => void)[];
			log: ((...args: any[]) => void)[];
		} = {
			exit: [],
			error: [],
			log: [],
		};
		const output: {
			exit: number | null;
			error: string[][];
			log: string[][];
		} = {
			exit: null,
			error: [],
			log: [],
		};
		Logging.handle({
			exit(code) {
				output.exit = code;
				handlers.exit.forEach((handler) => {
					handler(code);
				});
			},
			error(...args: any[]) {
				output.error.push(args);
				handlers.error.forEach((handler) => {
					handler(...args);
				});
			},
			log(...args: any[]) {
				output.log.push(args);
				handlers.log.forEach((handler) => {
					handler(...args);
				});
			},
		});
		Input.parse(args);
		const close = Main.main();
		return {
			on(
				event: 'exit' | 'error' | 'log',
				handler: (...args: any[]) => void
			) {
				addToHandlers(handlers, output, event, handler);
			},
			addEventListener(
				event: 'exit' | 'error' | 'log',
				handler: (...args: any[]) => void
			) {
				addToHandlers(handlers, output, event, handler);
			},
			quit() {
				close();
			},
			get hasQuit() {
				return output.exit !== null;
			},
		};
	}
}
