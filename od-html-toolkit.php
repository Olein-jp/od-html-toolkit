<?php
/**
 * Plugin Name:       OD HTML Toolkit
 * Plugin URI:        https://github.com/Olein-jp/od-html-toolkit
 * Description:       HTML制作を支援するためのツールキットです。
 * Version:           0.1.1
 * Requires at least: 7.1
 * Requires PHP:      7.4
 * Author:            Koji Kuno
 * Author URI:        https://olein-design.com
 * License:           GPL-2.0-or-later
 * License URI:       https://www.gnu.org/licenses/gpl-2.0.html
 * Text Domain:       od-html-toolkit
 * Domain Path:       /languages
 *
 * @package OD_HTML_Toolkit
 */

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

define( 'OD_HTML_TOOLKIT_VERSION', '0.1.1' );
define( 'OD_HTML_TOOLKIT_FILE', __FILE__ );

require_once __DIR__ . '/includes/class-editor-assets.php';

$od_html_toolkit_editor_assets = new OD_HTML_Toolkit\Editor_Assets();
$od_html_toolkit_editor_assets->register();

/**
 * Load the plugin translations.
 *
 * @return void
 */
function od_html_toolkit_load_textdomain() {
	load_plugin_textdomain(
		'od-html-toolkit',
		false,
		dirname( plugin_basename( OD_HTML_TOOLKIT_FILE ) ) . '/languages'
	);
}
add_action( 'init', 'od_html_toolkit_load_textdomain' );

$od_html_toolkit_autoloader = __DIR__ . '/vendor/autoload.php';

if ( file_exists( $od_html_toolkit_autoloader ) ) {
	require_once $od_html_toolkit_autoloader;

	new Inc2734\WP_GitHub_Plugin_Updater\Bootstrap(
		plugin_basename( __FILE__ ),
		'Olein-jp',
		'od-html-toolkit',
		array(
			'homepage' => 'https://github.com/Olein-jp/od-html-toolkit',
		)
	);
} else {
	/**
	 * Display an error when Composer dependencies are unavailable.
	 *
	 * @return void
	 */
	function od_html_toolkit_missing_dependencies_notice() {
		if ( ! current_user_can( 'activate_plugins' ) ) {
			return;
		}

		$message = __( 'OD HTML Toolkit requires its Composer dependencies. Run composer install.', 'od-html-toolkit' );
		printf( '<div class="notice notice-error"><p>%s</p></div>', esc_html( $message ) );
	}
	add_action( 'admin_notices', 'od_html_toolkit_missing_dependencies_notice' );
}
