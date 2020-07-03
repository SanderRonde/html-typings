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
			<title>Multi file test</title>
		</head>
		<body>
			<div id="test1"></div>
			<div id="test2"></div>
			<div id="test3"></div>
			<div id="test4"></div>
			<div class="test4"></div>
			<span class="test4"></span>
			<audio class="test4"></audio>
		</body>
	</html>
);
x;