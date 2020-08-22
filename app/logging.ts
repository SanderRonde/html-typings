export namespace Logging {
	let reroute: boolean = false;
	let listeners: {
		exit(code: number): void;
		error(...args: any[]): void;
		log(...args: any[]): void;
	}|null = null;

	export function handle(handlers: {
		exit(code: number): void;
		error(...args: any[]): void;
		log(...args: any[]): void;
	}) {
		reroute = true;
		listeners = handlers;
	}

	export function exit(code: number = 0) {
		if (reroute) {
			listeners!.exit(code);
		} else {
			process.exit(code);
		}
	}

	export function error(...args: any[]) {
		if (reroute) {
			listeners!.error(...args);
		} else {
			console.error(...args);
		}
	}

	export function log(...args: any[]) {
		if (reroute) {
			listeners!.log(...args);
		} else {
			console.log(...args);
		}
	}
}