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
 * Append generated markup to the end of Custom HTML block content.
 *
 * @param {string} content Existing content.
 * @param {string} markup  Generated markup.
 * @return {string} Updated content.
 */
export function appendBlockMarkup( content, markup ) {
	if ( ! content.trim() ) {
		return markup;
	}

	return `${ content.trimEnd() }\n\n${ markup }`;
}
