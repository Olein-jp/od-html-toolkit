/**
 * Resolve a dynamic import to the module shape exposed by both Webpack and Jest.
 *
 * @param {Object} module Imported module namespace.
 * @return {Object} Module API.
 */
function resolveModule( module ) {
	return module.default || module;
}

/**
 * Format the whole Custom HTML block, including embedded CSS and JavaScript.
 *
 * @param {string} content Source content.
 * @param {string} parser  Prettier parser name.
 * @return {Promise<string>} Formatted content.
 */
export async function formatCode( content, parser = 'html' ) {
	if ( ! content.trim() ) {
		return content;
	}

	const [
		prettierModule,
		prettierPluginHtmlModule,
		prettierPluginPostcssModule,
		prettierPluginBabelModule,
		prettierPluginEstreeModule,
	] = await Promise.all( [
		import(
			/* webpackChunkName: "prettier-standalone" */ 'prettier-standalone/standalone'
		),
		import(
			/* webpackChunkName: "prettier-html" */ 'prettier-standalone/plugins/html'
		),
		import(
			/* webpackChunkName: "prettier-postcss" */ 'prettier-standalone/plugins/postcss'
		),
		import(
			/* webpackChunkName: "prettier-babel" */ 'prettier-standalone/plugins/babel'
		),
		import(
			/* webpackChunkName: "prettier-estree" */ 'prettier-standalone/plugins/estree'
		),
	] );

	const prettier = resolveModule( prettierModule );

	return prettier.format( content, {
		htmlWhitespaceSensitivity: 'ignore',
		parser,
		plugins: [
			resolveModule( prettierPluginHtmlModule ),
			resolveModule( prettierPluginPostcssModule ),
			resolveModule( prettierPluginBabelModule ),
			resolveModule( prettierPluginEstreeModule ),
		],
		printWidth: 100,
		tabWidth: 2,
		useTabs: false,
	} );
}

/**
 * Extract a semantic signature for every WordPress block delimiter comment.
 *
 * @param {string} content Content to inspect.
 * @return {Array<Object>} Ordered signatures.
 */
export function getBlockCommentSignatures( content ) {
	const pattern =
		/<!--\s*(\/)?wp:([a-z0-9][a-z0-9-]*(?:\/[a-z0-9][a-z0-9-]*)?)(?:\s+(\{[\s\S]*?\}))?\s*(\/)?-->/gi;
	const signatures = [];
	let match;

	while ( ( match = pattern.exec( content ) ) !== null ) {
		let attributes = match[ 3 ]?.trim() || '';

		if ( attributes ) {
			try {
				attributes = JSON.stringify( JSON.parse( attributes ) );
			} catch {
				// Keep malformed JSON unchanged so a formatter cannot hide damage.
			}
		}

		signatures.push( {
			attributes,
			closing: Boolean( match[ 1 ] ),
			name: match[ 2 ].toLowerCase(),
			selfClosing: Boolean( match[ 4 ] ),
		} );
	}

	return signatures;
}

/**
 * Verify that formatting preserves WordPress block comments and parseability.
 *
 * @param {string}   original  Original content.
 * @param {string}   formatted Formatted content.
 * @param {Function} parse     WordPress parse function.
 * @return {boolean} True when the formatted content is safe to apply.
 * @throws {Error} When comments changed or parsing failed.
 */
export function validateFormattedCode( original, formatted, parse ) {
	const before = getBlockCommentSignatures( original );
	const after = getBlockCommentSignatures( formatted );

	if ( JSON.stringify( before ) !== JSON.stringify( after ) ) {
		throw new Error( 'wordpress-block-comments-changed' );
	}

	const parsed = parse( formatted );
	if ( ! Array.isArray( parsed ) ) {
		throw new Error( 'wordpress-block-parse-failed' );
	}

	return true;
}
