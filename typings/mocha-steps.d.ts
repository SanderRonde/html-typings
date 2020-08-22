interface StepCallbackContext {
	skip(): this;
	timeout(ms: number): this;
	retries(n: number): this;
	slow(ms: number): this;
	[index: string]: any;
}

interface IRunnable {
	title: string;
	fn: Function;
	async: boolean;
	sync: boolean;
	timedOut: boolean;
	timeout(n: number): this;
}

/** Partial interface for Mocha's `Suite` class. */
interface StepSuite {
	parent: StepSuite;
	title: string;

	fullTitle(): string;
}

/** Partial interface for Mocha's `Test` class. */
interface StepTest extends IRunnable {
	title: string;
	fn: Function;
	async: boolean;
	sync: boolean;
	timedOut: boolean;
	timeout(n: number): this;
	parent: StepSuite;
	pending: boolean;
	state: 'failed' | 'passed' | undefined;

	fullTitle(): string;
}

interface StepTest {
	(
		expectation: string,
		callback?: (this: StepCallbackContext, done: MochaDone) => any
	): StepTest;
	only(
		expectation: string,
		callback?: (this: StepCallbackContext, done: MochaDone) => any
	): StepTest;
	skip(
		expectation: string,
		callback?: (this: StepCallbackContext, done: MochaDone) => any
	): void;
	timeout(ms: number): void;
	state: 'failed' | 'passed' | undefined;
}

declare var step: StepTest;
