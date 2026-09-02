import {
	getNativeModalEditor,
	setNativeModalEditorValue,
} from '../../src/native-modal';

describe( 'native Custom HTML modal helpers', () => {
	afterEach( () => {
		document.body.innerHTML = '';
	} );

	test( 'finds the active native HTML editor', async () => {
		document.body.innerHTML = `
			<div class="block-library-html__modal">
				<button role="tab" aria-selected="true" aria-controls="tabs-1-html-view">HTML</button>
				<div id="tabs-1-html-view"><textarea aria-label="HTML"></textarea></div>
			</div>
		`;

		const modal = document.querySelector( '.block-library-html__modal' );
		const result = await getNativeModalEditor( modal );

		expect( result.tabId ).toBe( 'html' );
		expect( result.textarea ).toBeInstanceOf( window.HTMLTextAreaElement );
	} );

	test( 'updates the native editor and dispatches an input event', () => {
		const textarea = document.createElement( 'textarea' );
		const onInput = jest.fn();
		textarea.addEventListener( 'input', onInput );

		setNativeModalEditorValue( textarea, '<p>Generated</p>' );

		expect( textarea.value ).toBe( '<p>Generated</p>' );
		expect( onInput ).toHaveBeenCalledTimes( 1 );
	} );
} );
