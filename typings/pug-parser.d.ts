declare function PugParser(tokens: PugLexer.LexerToken[], options?: {
	filename?: string;
	plugins?: any[];
	src?: string;
}): PugParser.ParserBlock;

declare namespace PugParser {
	interface ParserTag {
		type: 'Tag';
		name: string;
		selfClosing: boolean;
		block: ParserBlock;
		attrs: {
			name: string;
			val: string;
			mustEscape: boolean;
		}[];
		attributeBlocks: any[];
		isInline: boolean;
		line: number;
		filename: string;
	}

	interface ParserInclude {
		type: 'Include';
		line: number;
		column: number;
		block: ParserBlock;
		file: {
			type: string;
			path: string;
			column: number;
			line: number;
		}
	}

	interface ParserMixin {
		type: 'Mixin';
		name: string;
		call: boolean;
		args: string;
		block: ParserBlock;
		column: number;
		line: number;
	}

	interface ParserConditional {
		type: 'Conditional';
		alternate?: ParserBlock|ParserConditional;
		consequent: ParserBlock;
		line: number;
		column: number;
		test: string;
	}

	type ParserNode = ParserBlock|ParserTag|ParserInclude|ParserMixin|
		ParserConditional;

	export interface ParserBlock {
		type: 'Block';
		line: number;
		filename: string;
		nodes: ParserNode[];
	}
}

declare module 'pug-parser' {
	export = PugParser;
}