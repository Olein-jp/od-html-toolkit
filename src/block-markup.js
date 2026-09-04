/**
 * Normalize a space-separated class list without changing valid class names.
 *
 * @param {string} value Raw class list.
 * @return {string} Normalized class list.
 */
export function normalizeClassName( value ) {
	return value.trim().split( /\s+/ ).filter( Boolean ).join( ' ' );
}

/**
 * Whether an HTML anchor is safe to pass to a core block.
 *
 * WordPress block anchors must not contain whitespace.
 *
 * @param {string} value Anchor value.
 * @return {boolean} Whether the value is valid.
 */
export function isValidAnchor( value ) {
	return ! /\s/.test( value.trim() );
}

/**
 * Build attributes from a supported block definition and form values.
 *
 * @param {Object} definition Block definition.
 * @param {Object} values     Form values.
 * @return {Object} Block attributes.
 */
export function buildAttributes( definition, values ) {
	const fields = Array.isArray( definition?.fields ) ? definition.fields : [];
	const attributes = {};

	if ( fields.includes( 'anchor' ) && values.anchor.trim() ) {
		attributes.anchor = values.anchor.trim();
	}

	if ( fields.includes( 'className' ) ) {
		const className = normalizeClassName( values.className );
		if ( className ) {
			attributes.className = className;
		}
	}

	if ( fields.includes( 'tagName' ) && values.tagName ) {
		attributes.tagName = values.tagName;
	}

	return attributes;
}

/**
 * Create serialized WordPress block markup through the Block API.
 *
 * Dependencies are injectable to keep the transformation independently
 * testable without reimplementing WordPress serialization.
 *
 * @param {Object} definition Block definition.
 * @param {Object} values     Form values.
 * @param {Object} blockApi   WordPress Block API methods.
 * @return {string} Serialized markup.
 */
export function createBlockMarkup( definition, values, blockApi ) {
	const { createBlock, serialize } = blockApi;
	const block = createBlock(
		definition.name,
		buildAttributes( definition, values )
	);

	return serialize( block ).trim();
}

/**
 * Insert generated markup at the current selection in Custom HTML content.
 *
 * A non-collapsed selection is replaced, matching the native behavior of a
 * textarea when text is inserted at its current selection.
 *
 * @param {string} content        Existing content.
 * @param {string} markup         Generated markup.
 * @param {number} selectionStart Selection start offset.
 * @param {number} selectionEnd   Selection end offset.
 * @return {string} Updated content.
 */
export function insertBlockMarkup(
	content,
	markup,
	selectionStart,
	selectionEnd = selectionStart
) {
	const start = Math.max( 0, Math.min( selectionStart, content.length ) );
	const end = Math.max( start, Math.min( selectionEnd, content.length ) );

	return `${ content.slice( 0, start ) }${ markup }${ content.slice( end ) }`;
}
