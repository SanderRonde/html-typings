declare function PugLexer(str: string, options?: {
	filename?: string;
	plugins?: any[];
}): PugLexer.LexerToken[];

declare namespace PugLexer {
	interface Attribute {
		name: string;
		val: string;
		escaped: boolean;
	}

	interface TagToken {
		type: 'tag';
		line: number;
		col: number;
		val: string;
		selfClosing: boolean;
	}

	interface AttributesToken {
		type: 'attribute';
		line: number;
		col: number;
		name: string;
		val: string;
	}

	interface NewlineToken {
		type: 'newline';
		line: number;
		col: number;
	}

	interface IndentToken {
		type: 'indent';
		line: number;
		col: number;
		val: number;
	}

	interface OutdentToken {
		type: 'outdent';
		line: number;
		col: number;
	}

	interface StartAttributesToken {
		type: 'start-attributes';
		line: number;
		col: number;
	}

	interface EndAttributesToken {
		type: 'end-attributes';
		line: number;
		col: number;
	}

	interface IncludeToken {
		type: 'include';
		line: number;
		col: number;
	}

	interface PathToken {
		type: 'path';
		line: number;
		col: number;
		val: string;
	}

	export type LexerToken = TagToken|AttributesToken|NewlineToken|
		IndentToken|OutdentToken|StartAttributesToken|EndAttributesToken|
		IncludeToken|PathToken|{
			type: 'any';
			[key: string]: any;
		};
}

declare module 'pug-lexer' {
	export = PugLexer;
}