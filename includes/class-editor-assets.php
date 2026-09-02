<?php
/**
 * Block editor asset registration.
 *
 * @package OD_HTML_Toolkit
 */

namespace OD_HTML_Toolkit;

/**
 * Loads the Custom HTML block editor extension.
 */
class Editor_Assets {

	/**
	 * Editor script handle.
	 *
	 * @var string
	 */
	const SCRIPT_HANDLE = 'od-html-toolkit-editor';

	/**
	 * Register WordPress hooks.
	 *
	 * @return void
	 */
	public function register() {
		add_action( 'enqueue_block_editor_assets', array( $this, 'enqueue' ) );
	}

	/**
	 * Enqueue the editor-only script and stylesheet.
	 *
	 * @return void
	 */
	public function enqueue() {
		$build_directory = plugin_dir_path( OD_HTML_TOOLKIT_FILE ) . 'build/';
		$asset_file      = $build_directory . 'index.asset.php';
		$script_file     = $build_directory . 'index.js';

		if ( ! file_exists( $asset_file ) || ! file_exists( $script_file ) ) {
			return;
		}

		$asset = require $asset_file;

		if ( ! is_array( $asset ) || ! isset( $asset['dependencies'], $asset['version'] ) ) {
			return;
		}

		wp_enqueue_script(
			self::SCRIPT_HANDLE,
			plugins_url( 'build/index.js', OD_HTML_TOOLKIT_FILE ),
			$asset['dependencies'],
			$asset['version'],
			true
		);

		wp_add_inline_script(
			self::SCRIPT_HANDLE,
			'window.odHtmlToolkitSettings = ' . wp_json_encode(
				array(
					'supportedBlocks' => $this->get_supported_blocks(),
				)
			) . ';',
			'before'
		);

		wp_set_script_translations(
			self::SCRIPT_HANDLE,
			'od-html-toolkit',
			plugin_dir_path( OD_HTML_TOOLKIT_FILE ) . 'languages'
		);

		$style_file = $build_directory . 'index.css';
		if ( file_exists( $style_file ) ) {
			wp_enqueue_style(
				self::SCRIPT_HANDLE,
				plugins_url( 'build/index.css', OD_HTML_TOOLKIT_FILE ),
				array( 'wp-components' ),
				$asset['version']
			);
		}
	}

	/**
	 * Get and sanitize supported block definitions.
	 *
	 * @return array<int, array{name: string, fields: array<int, string>}> Supported definitions.
	 */
	private function get_supported_blocks() {
		$definitions = array(
			array(
				'name'   => 'core/paragraph',
				'fields' => array( 'anchor', 'className' ),
			),
			array(
				'name'   => 'core/heading',
				'fields' => array( 'anchor', 'className' ),
			),
			array(
				'name'   => 'core/group',
				'fields' => array( 'anchor', 'className', 'tagName' ),
			),
			array(
				'name'   => 'core/buttons',
				'fields' => array( 'anchor', 'className' ),
			),
			array(
				'name'   => 'core/button',
				'fields' => array( 'anchor', 'className' ),
			),
			array(
				'name'   => 'core/image',
				'fields' => array( 'anchor', 'className' ),
			),
			array(
				'name'   => 'core/spacer',
				'fields' => array( 'anchor', 'className' ),
			),
		);

		/**
		 * Filters block definitions shown by the markup generator.
		 *
		 * Supported fields are `anchor`, `className`, and `tagName`.
		 * JavaScript consumers can further filter definitions with
		 * `odHtmlToolkit.supportedBlocks`.
		 *
		 * @param array<int, array{name: string, fields: array<int, string>}> $definitions Definitions.
		 */
		$definitions = apply_filters( 'od_html_toolkit_supported_blocks', $definitions );

		if ( ! is_array( $definitions ) ) {
			return array();
		}

		$allowed_fields = array( 'anchor', 'className', 'tagName' );
		$sanitized      = array();

		foreach ( $definitions as $definition ) {
			if ( ! is_array( $definition ) || empty( $definition['name'] ) ) {
				continue;
			}

			$name = strtolower( (string) $definition['name'] );
			if ( ! preg_match( '/^[a-z0-9-]+\/[a-z0-9-]+$/', $name ) ) {
				continue;
			}

			$fields = isset( $definition['fields'] ) && is_array( $definition['fields'] )
				? array_values( array_intersect( $allowed_fields, $definition['fields'] ) )
				: array();

			$sanitized[] = array(
				'name'   => $name,
				'fields' => $fields,
			);
		}

		return $sanitized;
	}
}
