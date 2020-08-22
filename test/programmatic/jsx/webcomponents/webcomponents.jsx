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

const x = () => (
	<html>
		<head>
			<title>Standard test</title>
		</head>
		<body>
			<WebComponent id="wc-id" />
			<WebComponent class="wc-class" />
		</body>
	</html>
);

x;
