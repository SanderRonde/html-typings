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

const x = () => (
	<html>
		<head>
			<title>Empty file test</title>
		</head>
		<body />
	</html>
);
x;