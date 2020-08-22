import { Constants } from '../../constants';
import { Parser } from 'htmlparser2';

export namespace HTML {
	export class ParserHandler {
		public maps: {
			[moduleName: string]: {
				ids: {
					[key: string]: string;
				};
				classes: [string, string][];
			};
		} = {
			__default__: {
				ids: {},
				classes: [],
			},
		};
		public mapKey: string = '__default__';

		constructor() {}

		public onOpen(
			name: string,
			attribs: {
				[key: string]: string;
			}
		) {
			if (name === 'dom-module') {
				this.mapKey = attribs.id;
				this.maps[this.mapKey] = {
					ids: {},
					classes: [],
				};
				return;
			} else if (name === 'template') {
				if (attribs.id) {
					this.maps[this.mapKey].ids[`#${attribs.id}`] =
						attribs['data-element-type'] ||
						Constants.getTagType(attribs.is);
				}
			} else {
				if (attribs.id) {
					this.maps[this.mapKey].ids[`#${attribs.id}`] =
						attribs['data-element-type'] ||
						Constants.getTagType(name);
				}
			}
			if (attribs.class) {
				for (const className of attribs.class.split(' ')) {
					this.maps[this.mapKey].classes.push([
						className,
						attribs['data-element-type'] ||
							Constants.getTagType(name),
					]);
				}
			}
		}

		public onClose(name: string) {
			if (name === 'dom-module') {
				this.mapKey = '__default__';
			}
		}

		genObj() {
			return {
				onopentag: this.onOpen.bind(this),
				onclosetag: this.onClose.bind(this),
			};
		}

		done() {
			return this.maps;
		}
	}

	export function parseHTML(content: string) {
		const handler = new ParserHandler();
		const parser = new Parser(handler.genObj() as any);

		parser.write(content);
		parser.end();

		return handler.done();
	}
}
