/**
 * @license Copyright (c) 2003-2018, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-oss-license
 */

/* exported CKBUILDER_CONFIG */

var CKBUILDER_CONFIG = {
	skin: 'moono-lisa',
	ignore: [
		'.DS_Store',
		'.bender',
		'.editorconfig',
		'.gitattributes',
		'.gitignore',
		'.idea',
		'.jscsrc',
		'.jshintignore',
		'.jshintrc',
		'.mailmap',
		'.travis.yml',
		'bender-err.log',
		'bender-out.log',
		'bender.ci.js',
		'bender.js',
		'dev',
		'gruntfile.js',
		'less',
		'node_modules',
		'package.json',
		'tests'
	],
	plugins : {
		'basicstyles' : 1,
		'blockquote' : 1,
		'elementspath' : 1,
		'enterkey' : 1,
		'entities' : 1,
		'format' : 1,
		'htmlwriter' : 1,
		'indentlist' : 1,
		'justify' : 1,
		'list' : 1,
		'pastefromword' : 1,
		'pastetext' : 1,
		'removeformat' : 1,
		'toolbar' : 1,
		'undo' : 1
	},
	languages : {
		'en' : 1,
		'it' : 1
	}
};
