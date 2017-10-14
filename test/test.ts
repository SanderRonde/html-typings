import { programmaticTests } from './programmatic/test'
import { cliTests } from './cli/test';

describe('HTMLTypings', () => {
	programmaticTests();
	cliTests();
});