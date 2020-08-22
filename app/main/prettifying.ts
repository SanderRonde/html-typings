export namespace Prettifying {
	function indent(level: number) {
		return '\t'.repeat(level);
	}

	export function formatTypings(
		typings: {
			[key: string]:
				| string
				| {
						[key: string]: string;
				  };
		},
		indentLevel: number = 1
	): string {
		if (Object.keys(typings).length === 0) return '{}';

		return `{\n${Object.keys(typings)
			.map((key) => {
				const value = typings[key];
				if (typeof value === 'object') {
					return `${indent(indentLevel)}"${key}": ${formatTypings(
						value,
						indentLevel + 1
					)};`;
				}
				return `${indent(indentLevel)}"${key}": ${value};`;
			})
			.join('\n')}\n}`;
	}
}
