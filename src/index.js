/* @jsxRuntime classic */
/* @jsx createElement */

import { createBlock, getBlockType, parse, serialize } from '@wordpress/blocks';
import {
	Button,
	Dropdown,
	Notice,
	SelectControl,
	TextControl,
} from '@wordpress/components';
import { createHigherOrderComponent } from '@wordpress/compose';
import { useDispatch } from '@wordpress/data';
import {
	createElement,
	createPortal,
	Fragment,
	useEffect,
	useMemo,
	useState,
} from '@wordpress/element';
import { addFilter, applyFilters } from '@wordpress/hooks';
import { __ } from '@wordpress/i18n';

import {
	appendBlockMarkup,
	createBlockMarkup,
	isValidAnchor,
} from './block-markup';
import { formatCode, validateFormattedCode } from './format-code';
import {
	getNativeModalEditor,
	setNativeModalEditorValue,
} from './native-modal';
import './editor.scss';

const TAG_OPTIONS = [
	{ label: 'div', value: 'div' },
	{ label: 'section', value: 'section' },
	{ label: 'article', value: 'article' },
	{ label: 'main', value: 'main' },
	{ label: 'aside', value: 'aside' },
	{ label: 'header', value: 'header' },
	{ label: 'footer', value: 'footer' },
];

/**
 * Return supported, currently registered block definitions.
 *
 * @return {Array<Object>} Block definitions.
 */
function getSupportedBlocks() {
	const configured = window.odHtmlToolkitSettings?.supportedBlocks || [];

	return applyFilters( 'odHtmlToolkit.supportedBlocks', configured ).filter(
		( definition ) =>
			definition &&
			typeof definition.name === 'string' &&
			Array.isArray( definition.fields ) &&
			Boolean( getBlockType( definition.name ) )
	);
}

/**
 * Form used to append serialized block markup to the native HTML editor.
 *
 * @param {Object}        props             Props.
 * @param {string}        props.content     Current HTML editor content.
 * @param {Array<Object>} props.definitions Supported block definitions.
 * @param {Function}      props.onClose     Close the form.
 * @param {Function}      props.onInsert    Update the HTML editor.
 * @return {Element} Form component.
 */
function InsertBlockForm( { content, definitions, onClose, onInsert } ) {
	const [ blockName, setBlockName ] = useState(
		definitions[ 0 ]?.name || ''
	);
	const [ anchor, setAnchor ] = useState( '' );
	const [ className, setClassName ] = useState( '' );
	const [ tagName, setTagName ] = useState( 'div' );
	const [ error, setError ] = useState( '' );

	const definition = definitions.find( ( item ) => item.name === blockName );
	const fields = definition?.fields || [];
	const anchorIsValid = isValidAnchor( anchor );
	const options = definitions.map( ( item ) => ( {
		label: getBlockType( item.name )?.title || item.name,
		value: item.name,
	} ) );

	const insertMarkup = async () => {
		setError( '' );

		try {
			const markup = createBlockMarkup(
				definition,
				{ anchor, className, tagName },
				{ createBlock, serialize }
			);

			if ( ! markup ) {
				throw new Error( 'empty-block-markup' );
			}

			await onInsert( appendBlockMarkup( content, markup ) );
			onClose();
		} catch {
			setError(
				__(
					'Block markup could not be generated. The original content was preserved.',
					'od-html-toolkit'
				)
			);
		}
	};

	return (
		<div className="od-html-toolkit-insert-form">
			<h2>{ __( 'Insert Block Markup', 'od-html-toolkit' ) }</h2>

			{ error && (
				<Notice status="error" isDismissible={ false }>
					{ error }
				</Notice>
			) }

			<SelectControl
				label={ __( 'Block', 'od-html-toolkit' ) }
				value={ blockName }
				options={ options }
				onChange={ setBlockName }
				__nextHasNoMarginBottom
			/>

			{ fields.includes( 'tagName' ) && (
				<SelectControl
					label={ __( 'Element', 'od-html-toolkit' ) }
					value={ tagName }
					options={ TAG_OPTIONS }
					onChange={ setTagName }
					__nextHasNoMarginBottom
				/>
			) }

			{ fields.includes( 'anchor' ) && (
				<TextControl
					label={ __( 'ID / Anchor', 'od-html-toolkit' ) }
					value={ anchor }
					onChange={ setAnchor }
					help={
						anchorIsValid
							? undefined
							: __(
									'An ID cannot contain whitespace.',
									'od-html-toolkit'
							  )
					}
					__nextHasNoMarginBottom
				/>
			) }

			{ fields.includes( 'className' ) && (
				<TextControl
					label={ __( 'Class', 'od-html-toolkit' ) }
					value={ className }
					onChange={ setClassName }
					help={ __(
						'Separate multiple classes with spaces.',
						'od-html-toolkit'
					) }
					__nextHasNoMarginBottom
				/>
			) }

			<div className="od-html-toolkit-insert-form__actions">
				<Button variant="tertiary" onClick={ onClose }>
					{ __( 'Close', 'od-html-toolkit' ) }
				</Button>
				<Button
					variant="primary"
					disabled={ ! definition || ! anchorIsValid }
					onClick={ insertMarkup }
				>
					{ __( 'Insert', 'od-html-toolkit' ) }
				</Button>
			</div>
		</div>
	);
}

/**
 * Add toolkit actions to the native Custom HTML modal footer.
 *
 * @param {Object}        props             Props.
 * @param {Array<Object>} props.definitions Supported block definitions.
 * @param {Element}       props.mountTarget Portal mount target.
 * @return {Element} Portal containing modal actions.
 */
function NativeModalTools( { definitions, mountTarget } ) {
	const [ htmlContent, setHtmlContent ] = useState( '' );
	const [ isFormatting, setIsFormatting ] = useState( false );
	const { createErrorNotice } = useDispatch( 'core/notices' );

	const showEditorError = () => {
		createErrorNotice(
			__(
				'The Custom HTML editor could not be found.',
				'od-html-toolkit'
			),
			{ type: 'snackbar' }
		);
	};

	const getModal = () => mountTarget.closest( '.block-library-html__modal' );

	const prepareInsertForm = async ( onToggle ) => {
		try {
			const modal = getModal();
			const { textarea } = await getNativeModalEditor( modal, 'html' );
			setHtmlContent( textarea.value );
			onToggle();
		} catch {
			showEditorError();
		}
	};

	const insertIntoHtmlEditor = async ( nextContent ) => {
		const modal = getModal();
		const { textarea } = await getNativeModalEditor( modal, 'html' );
		setNativeModalEditorValue( textarea, nextContent );
		setHtmlContent( nextContent );
	};

	const formatActiveEditor = async () => {
		setIsFormatting( true );

		try {
			const modal = getModal();
			const { tabId, textarea } = await getNativeModalEditor( modal );
			const parser = { css: 'css', html: 'html', js: 'babel' }[ tabId ];
			const formatted = await formatCode( textarea.value, parser );

			if ( tabId === 'html' ) {
				validateFormattedCode( textarea.value, formatted, parse );
			}

			setNativeModalEditorValue( textarea, formatted );
		} catch {
			createErrorNotice(
				__(
					'Formatting failed. The original content was preserved.',
					'od-html-toolkit'
				),
				{ type: 'snackbar' }
			);
		} finally {
			setIsFormatting( false );
		}
	};

	return createPortal(
		<div className="od-html-toolkit-native-tools">
			{ definitions.length > 0 && (
				<Dropdown
					renderToggle={ ( { isOpen, onToggle } ) => (
						<Button
							variant="secondary"
							aria-expanded={ isOpen }
							onClick={ () =>
								isOpen
									? onToggle()
									: prepareInsertForm( onToggle )
							}
						>
							{ __( 'Insert Block Markup', 'od-html-toolkit' ) }
						</Button>
					) }
					renderContent={ ( { onClose } ) => (
						<InsertBlockForm
							content={ htmlContent }
							definitions={ definitions }
							onClose={ onClose }
							onInsert={ insertIntoHtmlEditor }
						/>
					) }
				/>
			) }
			<Button
				variant="secondary"
				disabled={ isFormatting }
				isBusy={ isFormatting }
				onClick={ formatActiveEditor }
			>
				{ __( 'Format Code', 'od-html-toolkit' ) }
			</Button>
		</div>,
		mountTarget
	);
}

/**
 * Preserve the Custom HTML block UI and detect its native modal.
 *
 * @param {Object}   props           Block edit props.
 * @param {Function} props.BlockEdit Original BlockEdit component.
 * @return {Element} Custom HTML block edit component.
 */
function HtmlToolkitBlockEdit( { BlockEdit, ...props } ) {
	const definitions = useMemo( getSupportedBlocks, [] );
	const [ nativeModalMount, setNativeModalMount ] = useState( null );

	useEffect( () => {
		if ( ! props.isSelected ) {
			setNativeModalMount( null );
			return undefined;
		}

		let mountTarget = null;
		const updateMountTarget = () => {
			const footer = document.querySelector(
				'.block-library-html__modal-footer'
			);

			if ( footer ) {
				mountTarget = footer.querySelector(
					':scope > .od-html-toolkit-native-tools-mount'
				);

				if ( ! mountTarget ) {
					mountTarget = document.createElement( 'div' );
					mountTarget.className =
						'od-html-toolkit-native-tools-mount';
					footer.append( mountTarget );
				}
			} else {
				mountTarget = null;
			}

			setNativeModalMount( ( current ) =>
				current === mountTarget ? current : mountTarget
			);
		};

		updateMountTarget();

		const observer = new window.MutationObserver( updateMountTarget );
		observer.observe( document.body, { childList: true, subtree: true } );

		return () => {
			observer.disconnect();
			mountTarget?.remove();
			setNativeModalMount( null );
		};
	}, [ props.isSelected ] );

	return (
		<Fragment>
			<BlockEdit { ...props } />

			{ nativeModalMount && (
				<NativeModalTools
					definitions={ definitions }
					mountTarget={ nativeModalMount }
				/>
			) }
		</Fragment>
	);
}

/**
 * Extend only the core Custom HTML block.
 */
const withHtmlToolkitControls = createHigherOrderComponent(
	( BlockEdit ) => ( props ) =>
		props.name === 'core/html' ? (
			<HtmlToolkitBlockEdit BlockEdit={ BlockEdit } { ...props } />
		) : (
			<BlockEdit { ...props } />
		),
	'withHtmlToolkitControls'
);

addFilter(
	'editor.BlockEdit',
	'od-html-toolkit/with-html-toolkit-controls',
	withHtmlToolkitControls
);
