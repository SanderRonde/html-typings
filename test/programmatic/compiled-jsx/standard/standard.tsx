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


const x = () => <html>
	<head>
		<title>Standard test</title>
	</head>
	<body>
		<div id="someDivId"></div>
		<div class="divClass" id="otherDivId"></div>
		<image class="imgOrVideoClass"></image>
		<video class="imgOrVideoClass"></video>
		<div class="lotOfElementsClass"></div>
		<address class="lotOfElementsClass"></address>
		<h1 class="lotOfElementsClass"></h1>
		<figure class="lotOfElementsClass"></figure>
		<article class="lotOfElementsClass"></article>

		<link id="link"/>
		<meta id="meta"/>
		<style id="style"></style>
		<address id="address"></address>
		<article id="article"></article>
		<aside id="aside"></aside>
		<footer id="footer"></footer>
		<h1 id="h1"></h1>
		<h2 id="h2"></h2>
		<h3 id="h3"></h3>
		<h4 id="h4"></h4>
		<h5 id="h5"></h5>
		<h6 id="h6"></h6>
		<header id="header"></header>
		<hgroup id="hgroup"></hgroup>	
		<nav id="nav"></nav>
		<section id="section"></section>
		<blockquote id="blockquote"></blockquote>
		<dd id="dd"></dd>
		<div id="div"></div>
		<dl id="dl"></dl>
		<dt id="dt"></dt>
		<figcaption id="figcaption"></figcaption>
		<figures id="figures"></figures>	
		<hr id="hr"/>
		<li id="li"></li>
		<main id="main"></main>
		<ol id="ol"></ol>
		<p id="p"></p>
		<pre id="pre"></pre>
		<ul id="ul"></ul>
		<a id="a"></a>
		<abbr id="abbr"></abbr>
		<b id="b"></b>
		<bdi id="bdi"></bdi>
		<br id="br"/>
		<cite id="cite"></cite>
		<code id="code"></code>
		<data id="data"></data>
		<dfn id="dfn"></dfn>
		<em id="em"></em>
		<i id="i"></i>
		<kbd id="kbd"></kbd>
		<mark id="mark"></mark>
		<q id="q"></q>
		<rp id="rp"></rp>
		<rt id="rt"></rt>
		<rtc id="rtc"></rtc>	
		<ruby id="ruby"></ruby>
		<s id="s"></s>	
		<samp id="samp"></samp>
		<small id="small"></small>
		<span id="span"></span>
		<strong id="strong"></strong>
		<sub id="sub"></sub>
		<sup id="sup"></sup>
		<time id="time"></time>
		<u id="u"></u>
		<var id="var"></var>
		<wbr id="wbr"/>
		<area id="area"/>
		<audio id="audio"></audio>
		<img id="img"/>
		<map id="map"></map>
		<track id="track"/>
		<video id="video"></video>
		<embed id="embed"/>
		<object id="object"></object>
		<param id="param"/>
		<source id="source"/>
		<canvas id="canvas"></canvas>
		<noscript id="noscript"></noscript>
		<script id="script"></script>
		<del id="del"></del>
		<ins id="ins"></ins>
		<caption id="caption"></caption>
		<col id="col"/>
		<colgroup id="colgroup"></colgroup>
		<table id="table"></table>
		<tbody id="tbody"></tbody>
		<td id="td"></td>
		<tfoot id="tfoot"></tfoot>
		<th id="th"></th>
		<thead id="thead"></thead>
		<tr id="tr"></tr>
		<button id="button"></button>
		<datalist id="datalist"></datalist>
		<fieldset id="fieldset"></fieldset>
		<form id="form"></form>
		<input id="input"/>
		<label id="label"></label>
		<legend id="legend"></legend>
		<meter id="meter"></meter>
		<optgroup id="optgroup"></optgroup>
		<option id="option"></option>
		<output id="output"></output>
		<progress id="progress"></progress>
		<select id="select"></select>
		<textarea id="textarea"></textarea>
		<details id="details"></details>
		<dialog id="dialog"></dialog>
		<menu id="menu"></menu>
		<menuitem id="menuitem"></menuitem>
		<summary id="summary"></summary>
		<content id="content"></content>
		<element id="element"></element>
		<shadow id="shadow"></shadow>
		<slot id="slot"></slot>
		<template id="template"></template>
		<acronym id="acronym"></acronym>
		<applet id="applet"></applet>
		<basefront id="basefront"></basefront>	
		<big id="big"></big>
		<blink id="blink"></blink>
		<center id="center"></center>
		<command id="command"/>
		<dir id="dir"></dir>
		<font id="font"></font>
		<frame id="frame"/>
		<frameset id="frameset"></frameset>
		<image id="image"></image>
		<isindex id="isindex"/>
		<key id="key"></key>
		<listing id="listing"></listing>
		<marquee id="marquee"></marquee>
		<multicol id="multicol"></multicol>
		<nextid id="nextid"></nextid>
		<noembed id="noembed"></noembed>
		<plaintext id="plaintext"></plaintext>
		<spacer id="spacer"></spacer>
		<strike id="strike"></strike>
		<tt id="tt"></tt>
		<xmp id="xmp"></xmp>
	</body>
</html>

x;