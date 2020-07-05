export namespace Prettifying {
	function stringToType(str: string) {
		return str.replace(/":( )?"((\w|#|\.|\|)+)"/g, '": $2');
	}

	function prettyify(str: string) {
		if (str === '{}') {
			return '{}';
		}
		str = str
			.replace(/"((#|\.)?\w+)": ((\w|\|)+),/g, '"$1": $3,')
			.replace(/"((#|\.)?\w+)": ((\w|\|)+)},/g, '"$1": $3\n},')
			.replace(/"(\w+)":{/g, '"$1":{\n')
			.replace(/\n},"/g, '\n},\n"')
			.replace(/{\n}/g, '{ }')
			.replace(/"(\w+)": (\w+)}}/g, '\t"$1": $2\n}\n}')
			.replace(/{"/g, '{\n"')
			.replace(/:"{ }",/, ':{ },\n')
			.replace(/,/g, ';')
			.replace(/(\s+)\}/g, ';\n}');
		const split = str.split('\n');
		return split.join('\n');
	}

	export function formatTypings(typings: {
		[key: string]:
			| string
			| {
					[key: string]: string;
			  };
	}) {
		return prettyify(stringToType(JSON.stringify(typings, null, '\t')));
	}
}
