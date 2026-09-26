import {
	formatCode,
	getBlockCommentSignatures,
	validateFormattedCode,
} from '../../src/format-code';

describe( 'format code helpers', () => {
	test( 'formats HTML with embedded CSS and JavaScript', async () => {
		const formatted = await formatCode(
			'<div><p>Hello</p></div><style>.foo{color:red}</style><script>const a=1;</script>'
		);

		expect( formatted ).toContain( '<div><p>Hello</p></div>' );
		expect( formatted ).toContain( '  .foo {\n    color: red;\n  }' );
		expect( formatted ).toContain( 'const a = 1;' );
		expect( formatted ).not.toContain( '\t' );
	} );

	test( 'formats CSS and JavaScript modal tabs independently', async () => {
		const css = await formatCode( '.foo{color:red}', 'css' );
		const js = await formatCode( 'const answer=42;', 'babel' );

		expect( css ).toBe( '.foo {\n  color: red;\n}\n' );
		expect( js ).toBe( 'const answer = 42;\n' );
	} );

	test( 'indents nested HTML with two spaces', async () => {
		const formatted = await formatCode(
			'<div><section><p>Text</p></section></div>'
		);

		expect( formatted ).toBe(
			'<div>\n  <section><p>Text</p></section>\n</div>\n'
		);
		expect( formatted ).not.toContain( '\t' );
	} );

	test( 'normalizes JSON whitespace in block comment signatures', () => {
		const compact =
			'<!-- wp:paragraph {"anchor":"hero","className":"lead"} --><!-- /wp:paragraph -->';
		const spaced =
			'<!-- wp:paragraph { "anchor": "hero", "className": "lead" } -->\n<!-- /wp:paragraph -->';

		expect( getBlockCommentSignatures( compact ) ).toEqual(
			getBlockCommentSignatures( spaced )
		);
	} );

	test( 'accepts formatted code when block comments are preserved', () => {
		const original =
			'<!-- wp:paragraph {"className":"lead"} --><p class="lead">Hello</p><!-- /wp:paragraph -->';
		const formatted =
			'<!-- wp:paragraph { "className": "lead" } -->\n<p class="lead">Hello</p>\n<!-- /wp:paragraph -->\n';
		const parse = jest.fn( () => [] );

		expect( validateFormattedCode( original, formatted, parse ) ).toBe(
			true
		);
		expect( parse ).toHaveBeenCalledWith( formatted );
	} );

	test( 'rejects formatted code when a block comment changed', () => {
		const original =
			'<!-- wp:paragraph --><p>Hello</p><!-- /wp:paragraph -->';
		const formatted = '<!-- wp:paragraph --><p>Hello</p>';

		expect( () =>
			validateFormattedCode( original, formatted, () => [] )
		).toThrow( 'wordpress-block-comments-changed' );
	} );
} );
