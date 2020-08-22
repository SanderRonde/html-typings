declare const JSX: any;
import {} from 'acorn';

declare global {
	namespace JSX {
		interface IntrinsicElements {
			// @ts-ignore
			[key: string]: any;
		}
	}
}

class WebComponent extends HTMLElement {}

class WebComponentTemplate<T> extends HTMLElement {}

interface SomeType {
	named: boolean;
}

const x = () => (
	<html>
		<head>
			<title>Standard test</title>
		</head>
		<body>
			<WebComponent id="wc-id" />
			<WebComponent class="wc-class" />
			<WebComponentTemplate<{ inline: string }> id="inline-wc-template" />
			<WebComponentTemplate<SomeType> id="named-wc-template" />
		</body>
	</html>
);

x;
