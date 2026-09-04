import {
	buildAttributes,
	createBlockMarkup,
	insertBlockMarkup,
	isValidAnchor,
	normalizeClassName,
} from '../../src/block-markup';

describe( 'block markup helpers', () => {
	test( 'normalizes multiple class names', () => {
		expect( normalizeClassName( ' hero   lead\twide ' ) ).toBe(
			'hero lead wide'
		);
	} );

	test( 'rejects anchors containing whitespace', () => {
		expect( isValidAnchor( 'hero-description' ) ).toBe( true );
		expect( isValidAnchor( 'hero description' ) ).toBe( false );
	} );

	test( 'builds only attributes supported by the definition', () => {
		expect(
			buildAttributes(
				{ fields: [ 'anchor', 'className', 'tagName' ] },
				{
					anchor: 'hero',
					className: ' hero  container ',
					tagName: 'section',
				}
			)
		).toEqual( {
			anchor: 'hero',
			className: 'hero container',
			tagName: 'section',
		} );
	} );

	test( 'uses the WordPress Block API to create markup', () => {
		const createBlock = jest.fn( ( name, attributes ) => ( {
			attributes,
			name,
		} ) );
		const serialize = jest.fn(
			() => '<!-- wp:paragraph -->\n<p></p>\n<!-- /wp:paragraph -->\n'
		);

		const markup = createBlockMarkup(
			{ name: 'core/paragraph', fields: [ 'className' ] },
			{ anchor: '', className: 'lead', tagName: 'div' },
			{ createBlock, serialize }
		);

		expect( createBlock ).toHaveBeenCalledWith( 'core/paragraph', {
			className: 'lead',
		} );
		expect( markup ).toBe(
			'<!-- wp:paragraph -->\n<p></p>\n<!-- /wp:paragraph -->'
		);
	} );

	test( 'inserts markup at the cursor position', () => {
		expect( insertBlockMarkup( '<div></div>', '<p></p>', 5, 5 ) ).toBe(
			'<div><p></p></div>'
		);
	} );

	test( 'replaces the current selection with markup', () => {
		expect(
			insertBlockMarkup( '<div>Replace me</div>', '<p></p>', 5, 15 )
		).toBe( '<div><p></p></div>' );
	} );

	test( 'clamps selection offsets to the content range', () => {
		expect( insertBlockMarkup( 'HTML', '<p></p>', 99, 120 ) ).toBe(
			'HTML<p></p>'
		);
	} );
} );
