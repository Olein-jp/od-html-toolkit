/**
 * Wait until a native Custom HTML modal tab has rendered its editor.
 *
 * @return {Promise<void>} Promise resolved after two animation frames.
 */
function waitForEditorRender() {
	return new Promise( ( resolve ) => {
		window.requestAnimationFrame( () => {
			window.requestAnimationFrame( resolve );
		} );
	} );
}

/**
 * Return an editor from the native Custom HTML modal.
 *
 * @param {Element}     modal          Native modal element.
 * @param {string|null} requestedTabId Optional tab ID: html, css, or js.
 * @return {Promise<Object>} Active tab ID and textarea.
 */
export async function getNativeModalEditor( modal, requestedTabId = null ) {
	const tabSelector = requestedTabId
		? `[role="tab"][aria-controls$="-${ requestedTabId }-view"]`
		: '[role="tab"][aria-selected="true"]';
	const tab = modal.querySelector( tabSelector );

	if ( ! tab ) {
		throw new Error( 'native-html-modal-tab-not-found' );
	}

	if ( tab.getAttribute( 'aria-selected' ) !== 'true' ) {
		tab.click();
		await waitForEditorRender();
	}

	const panelId = tab.getAttribute( 'aria-controls' );
	const textarea = panelId
		? modal.querySelector( `[id="${ panelId }"] textarea` )
		: null;
	const tabId = panelId?.match( /-(html|css|js)-view$/ )?.[ 1 ];

	if ( ! textarea || ! tabId ) {
		throw new Error( 'native-html-modal-editor-not-found' );
	}

	return { tabId, textarea };
}

/**
 * Update a native modal textarea and notify its React change handler.
 *
 * @param {HTMLTextAreaElement} textarea Editor textarea.
 * @param {string}              value    New value.
 * @return {void}
 */
export function setNativeModalEditorValue( textarea, value ) {
	const editorWindow = textarea.ownerDocument.defaultView;
	const valueSetter = Object.getOwnPropertyDescriptor(
		editorWindow.HTMLTextAreaElement.prototype,
		'value'
	)?.set;

	if ( ! valueSetter ) {
		throw new Error( 'native-html-modal-value-setter-not-found' );
	}

	valueSetter.call( textarea, value );
	textarea.dispatchEvent(
		new editorWindow.Event( 'input', { bubbles: true } )
	);
}
