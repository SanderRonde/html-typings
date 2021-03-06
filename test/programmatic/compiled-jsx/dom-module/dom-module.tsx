declare const JSX: any;
import {} from 'acorn';

declare global {
	namespace JSX {
		interface IntrinsicElements {
			[key: string]: any;
		}
	}
}

const x = () => (
	<dom-module id="some-module">
		<div id="someDivId" />
		<div
			class="divClass"
			id="otherDivId"
			{...{
				other: 'attribute',
			}}
		/>
		<image class="imgOrVideoClass" />
		<video class="imgOrVideoClass" />
		<div class="lotOfElementsClass" />
		<address class="lotOfElementsClass" />
		<h1 class="lotOfElementsClass" />
		<figure class="lotOfElementsClass" />
		<article class="lotOfElementsClass" />

		<link id="link" />
		<meta id="meta" />
		<style id="style" />
		<address id="address" />
		<article id="article" />
		<aside id="aside" />
		<footer id="footer" />
		<h1 id="h1" />
		<h2 id="h2" />
		<h3 id="h3" />
		<h4 id="h4" />
		<h5 id="h5" />
		<h6 id="h6" />
		<header id="header" />
		<hgroup id="hgroup" />
		<nav id="nav" />
		<section id="section" />
		<blockquote id="blockquote" />
		<dd id="dd" />
		<div id="div" />
		<dl id="dl" />
		<dt id="dt" />
		<figcaption id="figcaption" />
		<figures id="figures" />
		<hr id="hr" />
		<li id="li" />
		<main id="main" />
		<ol id="ol" />
		<p id="p" />
		<pre id="pre" />
		<ul id="ul" />
		<a id="a" />
		<abbr id="abbr" />
		<b id="b" />
		<bdi id="bdi" />
		<br id="br" />
		<cite id="cite" />
		<code id="code" />
		<data id="data" />
		<dfn id="dfn" />
		<em id="em" />
		<i id="i" />
		<kbd id="kbd" />
		<mark id="mark" />
		<q id="q" />
		<rp id="rp" />
		<rt id="rt" />
		<rtc id="rtc" />
		<ruby id="ruby" />
		<s id="s" />
		<samp id="samp" />
		<small id="small" />
		<span id="span" />
		<strong id="strong" />
		<sub id="sub" />
		<sup id="sup" />
		<time id="time" />
		<u id="u" />
		<var id="var" />
		<wbr id="wbr" />
		<area id="area" />
		<audio id="audio" />
		<img id="img" />
		<map id="map" />
		<track id="track" />
		<video id="video" />
		<embed id="embed" />
		<object id="object" />
		<param id="param" />
		<source id="source" />
		<canvas id="canvas" />
		<noscript id="noscript" />
		<script id="script" />
		<del id="del" />
		<ins id="ins" />
		<caption id="caption" />
		<col id="col" />
		<colgroup id="colgroup" />
		<table id="table" />
		<tbody id="tbody" />
		<td id="td" />
		<tfoot id="tfoot" />
		<th id="th" />
		<thead id="thead" />
		<tr id="tr" />
		<button id="button" />
		<datalist id="datalist" />
		<fieldset id="fieldset" />
		<form id="form" />
		<input id="input" />
		<label id="label" />
		<legend id="legend" />
		<meter id="meter" />
		<optgroup id="optgroup" />
		<option id="option" />
		<output id="output" />
		<progress id="progress" />
		<select id="select" />
		<textarea id="textarea" />
		<details id="details" />
		<dialog id="dialog" />
		<menu id="menu" />
		<menuitem id="menuitem" />
		<summary id="summary" />
		<content id="content" />
		<element id="element" />
		<shadow id="shadow" />
		<slot id="slot" />
		<template id="template" />
		<acronym id="acronym" />
		<applet id="applet" />
		<basefront id="basefront" />
		<big id="big" />
		<blink id="blink" />
		<center id="center" />
		<command id="command" />
		<dir id="dir" />
		<font id="font" />
		<frame id="frame" />
		<frameset id="frameset" />
		<image id="image" />
		<isindex id="isindex" />
		<key id="key" />
		<listing id="listing" />
		<marquee id="marquee" />
		<multicol id="multicol" />
		<nextid id="nextid" />
		<noembed id="noembed" />
		<plaintext id="plaintext" />
		<spacer id="spacer" />
		<strike id="strike" />
		<tt id="tt" />
		<xmp id="xmp" />
	</dom-module>
);

x;
