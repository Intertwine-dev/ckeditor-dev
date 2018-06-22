/**
 * @license Copyright (c) 2003-2018, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-oss-license
 */

CKEDITOR.editorConfig = function (config) {
	// Define changes to default configuration here. For example:
	// config.language = 'fr';
	// config.uiColor = '#AADC6E';
	// %REMOVE_START%
	config.plugins =
		'basicstyles,' +
		'blockquote,' +
		'elementspath,' +
		'enterkey,' +
		'entities,' +
		'format,' +
		'htmlwriter,' +
		'indentlist,' +
		'justify,' +
		'list,' +
		'pastefromword,' +
		'pastetext,' +
		'removeformat,' +
		'toolbar,' +
		'undo';
	// %REMOVE_END%
};

// %LEAVE_UNMINIFIED% %REMOVE_LINE%
