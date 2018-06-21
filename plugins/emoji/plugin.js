/**
 * @license Copyright (c) 2003-2018, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-oss-license
 */

( function() {
	'use strict';

	var stylesLoaded = false;
	var DEFAULT_EMOJI = [ 'star', 'poop', 'grinning_face', 'face_with_tongue', 'upside-down_face', 'smiling_face_with_horns', 'gear', 'doughnut', 'cookie', 'Poland' ];

	CKEDITOR.plugins.add( 'emoji', {
		requires: 'autocomplete,textmatch,ajax',
		icons: 'emojipanel',
		beforeInit: function() {
			if ( CKEDITOR.env.ie && CKEDITOR.env.version < 11 ) {
				return;
			}
			if ( !stylesLoaded ) {
				CKEDITOR.document.appendStyleSheet( this.path + 'skins/default.css' );
				stylesLoaded = true;
			}
		},

		init: function( editor ) {

			var emojiListUrl = editor.config.emoji_emojiListUrl || 'plugins/emoji/emoji.json',
				emojiPanelLimit = editor.config.emoji_emojiPanelLimit || 30,
				favouriteEmoji = editor.config.emoji_favourite || DEFAULT_EMOJI,
				lang = editor.lang.emoji;

			CKEDITOR.ajax.load( CKEDITOR.getUrl( emojiListUrl ), function( data ) {
				if ( editor._.emoji === undefined ) {
					editor._.emoji = {};
				}

				if ( editor._.emoji.list === undefined ) {
					editor._.emoji.list = JSON.parse( data );
				}

				var emojiList = editor._.emoji.list,
					charactersToStart = editor.config.emoji_minChars === undefined ? 2 : editor.config.emoji_minChars;

				if ( editor.status !== 'ready' ) {
					editor.once( 'instanceReady', function() {
						initPlugin();
					} );
				} else {
					initPlugin();
				}

				// HELPER FUNCTIONS:

				function initPlugin() {
					editor._.emoji.autocomplete = new CKEDITOR.plugins.autocomplete( editor, {
						textTestCallback: getTextTestCallback(),
						dataCallback: dataCallback,
						itemTemplate: '<li data-id="{id}" class="cke_emoji_suggestion_item">{symbol} {id}</li>',
						outputTemplate: '{symbol}'
					} );
				}

				function getTextTestCallback() {
					return function( range ) {
						if ( !range.collapsed ) {
							return null;
						}
						return CKEDITOR.plugins.textMatch.match( range, matchCallback );
					};
				}

				function matchCallback( text, offset ) {
					var left = text.slice( 0, offset ),
						match = left.match( new RegExp( ':\\S{' + charactersToStart + '}\\S*$' ) );

					if ( !match ) {
						return null;
					}

					return { start: match.index, end: offset };
				}

				function dataCallback( query, range, callback ) {
					var data = CKEDITOR.tools.array.filter( emojiList, function( item ) {
						return item.id.indexOf( query.slice( 1 ) ) !== -1;
					} ).sort( function( a, b ) {
						// Sort at the beginning emoji starts with given query.
						var emojiName = query.substr( 1 ),
							isAStartWithEmojiName = a.id.substr( 1, emojiName.length ) === emojiName,
							isBStartWithEmojiName = b.id.substr( 1, emojiName.length ) === emojiName;

						if ( isAStartWithEmojiName && isBStartWithEmojiName || !isAStartWithEmojiName && !isBStartWithEmojiName ) {
							return a.id === b.id ? 0 : ( a.id > b.id ? 1 : -1 );
						} else if ( isAStartWithEmojiName ) {
							return -1;
						} else {
							return 1;
						}
					} );
					callback( data );
				}
			} );

			editor.addCommand( 'insertEmoji', {
				exec: function( editor, data ) {
					editor.insertText( data.emojiName );
				}
			} );

			// Name is responsible for icon name also.
			editor.ui.add( 'emojiPanel', CKEDITOR.UI_PANELBUTTON, {
				label: 'emoji',
				title: 'Emoji List',
				modes: { wysiwyg: 1 },
				editorFocus: 0,
				toolbar: 'emoji',
				panel: {
					css: [ CKEDITOR.skin.getPath( 'editor' ), this.path + 'skins/default.css' ],
					attributes: { role: 'listbox', 'aria-label': 'Emoji List' }
				},

				onBlock: function( panel, block ) {
					block.element.addClass( 'cke_emoji_panel_block' );
					block.element.setHtml( getEmojiBlock() );
					panel.element.addClass( 'cke_emoji_panel' );

				}

			} );

			var clickFn = CKEDITOR.tools.addFunction( function( event ) {
				if ( event.target.dataset.ckeEmojiName ) {
					editor.insertText( event.target.dataset.ckeEmojiSymbol );
				}
			} );

			var filterFn = CKEDITOR.tools.addFunction( ( function() {
				var ul;
				var title;
				return function( searchElement ) {
					if ( !ul ) {
						ul = new CKEDITOR.dom.element( searchElement.parentElement.querySelector( '.cke_emoji_unordered_list' ) );
					}
					if ( !title ) {
						title = new CKEDITOR.dom.element( searchElement.parentElement.querySelector( 'h2' ) );
					}
					var query = searchElement.value;
					ul.setHtml( getEmojiList( query, emojiPanelLimit ) );
					title.setHtml( getSearchTitle( query ) );
				};
			} )() );

			function getEmojiList( query ) {
				var emojiTpl = new CKEDITOR.template( '<li data-cke-emoji-name="{id}" data-cke-emoji-symbol="{symbol}" title="{id}" class="cke_emoji_item">{symbol}</li>' );
				var output = [];
				var name;
				var i;

				editor._.emoji.autocomplete.model.dataCallback( query.indexOf( ':' ) === 0 ? query : ':' + query, null, function( data ) {
					if ( query === '' ) {
						if ( favouriteEmoji ) {
							var emojiCounter = 0;
							for ( i = 0; i < data.length; i++ ) {
								var favIndex = favouriteEmoji.indexOf( data[ i ].id.replace( /^:|:$/g, '' ) );
								if ( favIndex !== -1 ) {
									output[ favIndex ] = emojiTpl.output( { symbol: data[ i ].symbol, id: data[ i ].id.replace( /^:|:$/g, '' ) } );
									emojiCounter++;
								}
								if ( emojiCounter >= emojiPanelLimit || emojiCounter === favouriteEmoji.length ) {
									break;
								}
							}
						}
					} else {
						for ( i = 0; i < data.length; i++ ) {
							name = data[ i ].id.replace( /^:|:$/g, '' );
							if ( name.toLowerCase().indexOf( query.toLowerCase() ) !== -1 || query === '' ) {
								output.push( emojiTpl.output( { symbol: data[ i ].symbol, id: data[ i ].id.replace( /^:|:$/g, '' ) } ) );
							}
							if ( output.length >= emojiPanelLimit ) {
								break;
							}
						}
					}

				} );

				return output.join( '' );
			}

			function getSearchTitle( query ) {
				var output = [];
				if ( query === '' ) {
					output.push( lang ? lang.commonEmojiTitle : 'Common emoji:' );
				} else {
					output.push( lang ? lang.searchResultTitle : 'Search results:' );
				}
				return output.join( '' );
			}

			function getEmojiBlock() {
				var output = [];
				// Search Box:
				output.push( '<input placeholder="', lang ? lang.searchPlaceholder : 'Search emoji...' ,'" type="search" oninput="CKEDITOR.tools.callFunction(', filterFn ,',this)">' );
				// Result box:

				output.push( '<h2>', getSearchTitle( '' ), '</h2>' );

				output.push( '<div class="cke_emoji_list"><ul class="cke_emoji_unordered_list" onclick="CKEDITOR.tools.callFunction(', clickFn, ',event);return false;">' );
				output.push( getEmojiList( '' ) );
				output.push( '</ul></div>' );

				return '<div class="cke_emoji_inner_panel">' + output.join( '' ) + '</div>';
			}

		}
	} );
} )();

/**
 * Number which defines how many characters is required to start displaying emoji's autocomplete suggestion box.
 * Delimiter `:`, which activates emoji's suggestion box, is not included into this value.
 *
 * ```js
 * 	editor.emoji_minChars = 0; // Emoji suggestion box appear after typing ':'.
 * ```
 *
 * @since 4.10.0
 * @cfg {Number} [emoji_minChars=2]
 * @member CKEDITOR.config
 */

/**
 * Address to JSON file containing emoji list. File is downloaded through {@link CKEDITOR.ajax#load} method
 * and URL address is processed by {@link CKEDITOR#getUrl}.
 * Emoji list has to be an array of objects with `id` and `symbol` property. Those keys represent text to match and UTF symbol for its replacement.
 * Emoji has to start with `:` (colon) symbol.
 * ```json
 * [
 * 	{
 * 		"id": ":grinning_face:",
 * 		"symbol":"😀"
 * 	},
 * 	{
 * 		"id": ":bug:",
 * 		"symbol":"🐛"
 * 	},
 * 	{
 * 		"id": ":star:",
 * 		"symbol":"⭐"
 * 	}
 * ]
 * ```
 *
 * ```js
 * 	editor.emoji_emojiListUrl = 'https://my.custom.domain/ckeditor/emoji.json';
 * ```
 *
 * @since 4.10.0
 * @cfg {String} [emoji_emojiListUrl='plugins/emoji/emoji.json']
 * @member CKEDITOR.config
 */
