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
	<body>
		<div id="test6"></div>
		<div id="test7"></div>
		<div id="test8"></div>
		<div id="test9"></div>
		<input class="test4" />
		<form class="test4"></form>
		<b class="test4"></b>
	</body>
);
x;
