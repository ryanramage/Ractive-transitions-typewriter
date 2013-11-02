/*

	Ractive-transitions-typewriter
	==============================

	Version 0.1.0.

	<< description goes here... >>

	==========================

	Troubleshooting: If you're using a module system in your app (AMD or
	something more nodey) then you may need to change the paths below,
	where it says `require( 'ractive' )` or `define([ 'Ractive' ]...)`.

	==========================

	Usage: Include this file on your page below Ractive, e.g:

	    <script src='lib/Ractive.js'></script>
	    <script src='lib/Ractive-transitions-typewriter.js'></script>

	Or, if you're using a module loader, require this module:

	    // requiring the plugin will 'activate' it - no need to use
	    // the return value
	    require( 'Ractive-transitions-typewriter' );

	<< more specific instructions for this plugin go here... >>

*/

(function ( global, factory ) {

	'use strict';

	// Common JS (i.e. browserify) environment
	if ( typeof module !== 'undefined' && module.exports && typeof require === 'function' ) {
		factory( require( 'ractive' ) );
	}

	// AMD?
	else if ( typeof define === 'function' && define.amd ) {
		define([ 'Ractive' ], factory );
	}

	// browser global
	else if ( global.Ractive ) {
		factory( global.Ractive );
	}

	else {
		throw new Error( 'Could not find Ractive! It must be loaded before the Ractive-transitions-fly plugin' );
	}

}( typeof window !== 'undefined' ? window : this, function ( Ractive ) {

	'use strict';

	var typewriter, typewriteNode, typewriteTextNode, props;

	typewriteNode = function ( node, isIntro, complete, interval ) {
		var children, next, method;

		if ( node.nodeType === 1 && isIntro ) {
			node.style.display = node._display;
			node.style.width = node._width;
			node.style.height = node._height;
		}

		if ( node.nodeType === 3 ) {
			typewriteTextNode( node, isIntro, complete, interval );
			return;
		}

		children = Array.prototype.slice.call( node.childNodes );
		method = isIntro ? 'shift' : 'pop';

		next = function () {
			if ( !children.length ) {
				if ( node.nodeType === 1 && isIntro ) {
					node.setAttribute( 'style', node._style || '' );
				}

				complete();
				return;
			}

			typewriteNode( children[ method ](), isIntro, next, interval );
		};

		next();
	};

	typewriteTextNode = function ( node, isIntro, complete, interval ) {
		var str, len, loop, i, d, targetLen;

		// text node
		str = isIntro ? node._hiddenData : '' + node.data;
		len = str.length;

		if ( !len ) {
			complete();
			return;
		}

		i = isIntro ? 0 : len;
		d = isIntro ? 1 : -1;
		targetLen = isIntro ? len : 0;

		loop = setInterval( function () {
			var substr, remaining, match, remainingNonWhitespace, filler;

			substr = str.substr( 0, i );
			remaining = str.substring( i );

			match = /^\w+/.exec( remaining );
			remainingNonWhitespace = ( match ? match[0].length : 0 );

			// add some non-breaking whitespace corresponding to the remaining length of the
			// current word (only really works with monospace fonts, but better than nothing)
			filler = new Array( remainingNonWhitespace + 1 ).join( '\u00a0' );

			node.data = substr + filler;
			if ( i === targetLen ) {
				clearInterval( loop );
				delete node._hiddenData;
				complete();
			}

			i += d;
		}, interval );
	};

	props = [
		'width',
		'height',
		'visibility'
	];

	// TODO differentiate between intro and outro
	typewriter = function ( t ) {
		var interval, currentStyle, hide;

		interval = t.interval || ( t.speed ? 1000 / t.speed : ( t.duration ? t.node.textContent.length / t.duration : 4 ) );
		
		currentStyle = t.getStyle( props );

		hide = function ( node ) {
			var children, i, computedStyle;

			if ( node.nodeType === 1 ) {
				node._style = node.getAttribute( 'style' );
				computedStyle = window.getComputedStyle( node );
				node._display = computedStyle.display;
				node._width = computedStyle.width;
				node._height = computedStyle.height;

				node.style.display = 'none';
			}

			if ( node.nodeType === 3 ) {
				node._hiddenData = '' + node.data;
				node.data = '';
				
				return;
			}

			children = Array.prototype.slice.call( node.childNodes );
			i = children.length;
			while ( i-- ) {
				hide( children[i] );
			}
		};

		if ( t.isIntro ) {
			hide( t.node );
		}

		setTimeout( function () {
			// make style explicit...
			t.setStyle( currentStyle );

			typewriteNode( t.node, t.isIntro, function () {
				t.resetStyle();
				t.complete();
			}, interval );
		}, t.delay || 0 );
	};

	Ractive.transitions.typewriter = typewriter;

}));