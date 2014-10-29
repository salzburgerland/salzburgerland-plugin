<?php


/**
 * Register the Salzburgerland Jukebox settings.
 */
function saju_jukebox_settings_register() {

	// 1: the unique id for the section
	// 2: the title or name of the section
	// 3: callback to display the section
	// 4: the page name: wordlift_settings_section_page
	add_settings_section( SAJU_JUKEBOX_SETTINGS_GENERAL, __( 'General Settings', SAJU_LANGUAGE_DOMAIN ), 'saju_jukebox_echo_section_top', SAJU_JUKEBOX_SETTINGS_GENERAL_PAGE );

	// Add the setting field for the display as default.
	add_settings_field(
		SAJU_JUKEBOX_SETTINGS_FIELD_EVENT_URL,
		__( 'Event URL:', SAJU_LANGUAGE_DOMAIN ),
		'saju_jukebox_echo_input',
		SAJU_JUKEBOX_SETTINGS_GENERAL_PAGE,
		SAJU_JUKEBOX_SETTINGS_GENERAL,
		array(
			'id'   => SAJU_JUKEBOX_SETTINGS_FIELD_EVENT_URL,
			'size' => 100
		)
	);

	// Add the setting field for the color coding of entities.
	add_settings_field(
		SAJU_JUKEBOX_SETTINGS_FIELD_DATASET_URL,
		__( 'Dataset URL:', SAJU_LANGUAGE_DOMAIN ),
		'saju_jukebox_echo_input',
		SAJU_JUKEBOX_SETTINGS_GENERAL_PAGE,
		SAJU_JUKEBOX_SETTINGS_GENERAL,
		array(
			'id'   => SAJU_JUKEBOX_SETTINGS_FIELD_DATASET_URL,
			'size' => 100
		)
	);

	// Register the settings.
	register_setting( SAJU_JUKEBOX_SETTINGS_GENERAL, SAJU_JUKEBOX_SETTINGS_FIELD_EVENT_URL );
	register_setting( SAJU_JUKEBOX_SETTINGS_GENERAL, SAJU_JUKEBOX_SETTINGS_FIELD_DATASET_URL );

}

add_action( 'admin_init', 'saju_jukebox_settings_register' );


/**
 * Echoes a small explanation text between the title and the page content. This method is called as a callback set in
 * the *saju_jukebox_settings_register* method.
 *
 * @since 1.0.0
 *
 */
function saju_jukebox_echo_section_top() {

	_e( 'Configure the general settings for the Jukebox', SAJU_LANGUAGE_DOMAIN );

}


/**
 * Echo the input box using the provided parameters.
 *
 * @since 1.0.0
 *
 * @param array $args An array of parameters containing the *id* of the input and the *value* to display.
 */
function saju_jukebox_echo_input( $args ) {

	// Get the ID and the option value.
	$id      = $args['id'];
	$id_a    = esc_attr( $id );
	$value_a = esc_attr( get_option( $id ) );

	$size_a = ( isset( $args['size'] ) ? esc_attr( $args['size'] ) : 40 );

	?>
	<input type="text" size="<?php echo $size_a; ?>" id="<?php echo $id_a; ?>" name="<?php echo $id_a; ?>"
	       value="<?php echo esc_attr( $value_a ); ?>"/>

<?php

}

/**
 * This function is called by the *saju_admin_menu* hook which is raised when the plugin builds the admin_menu.
 *
 * @since 1.0.0
 *
 * @param string $parent_slug The parent slug for the menu.
 * @param string $capability The required capability to access the page.
 */
function saju_jukebox_admin_menu( $parent_slug, $capability ) {

	// see http://codex.wordpress.org/Function_Reference/add_submenu_page
	add_submenu_page(
		$parent_slug, // The parent menu slug, provided by the calling hook.
		__( 'Jukebox', SAJU_LANGUAGE_DOMAIN ),  // page title
		__( 'Jukebox', SAJU_LANGUAGE_DOMAIN ),  // menu title
		$capability,                   // The required capability, provided by the calling hook.
		'saju_jukebox_admin_menu',      // The menu slug
		'saju_jukebox_admin_menu_callback' // the menu callback for displaying the page content
	);

}

add_action( 'saju_admin_menu', 'saju_jukebox_admin_menu', 10, 2 );

/**
 * Displays the page content.
 */
function saju_jukebox_admin_menu_callback() {

	if ( ! current_user_can( 'manage_options' ) ) {
		wp_die( __( 'You do not have sufficient permissions to access this page.' ) );
	}

	?>

	<div class="wrap">

		<h2><?php esc_html_e( 'Jukebox', SAJU_LANGUAGE_DOMAIN ); ?></h2>

		<form action="options.php" method="post">
			<?php settings_fields( SAJU_JUKEBOX_SETTINGS_GENERAL ); ?>
			<?php do_settings_sections( SAJU_JUKEBOX_SETTINGS_GENERAL_PAGE ); ?>
			<input name="Submit" type="submit" value="<?php esc_attr_e( 'Save Changes' ); ?>"/>

		</form>

	</div>

<?php

}

/**
 * Handle the *jukebox* shortcode.
 *
 * @since 1.0.0
 *
 * @param array $atts An array of configuration parameters.
 *
 * @return string The shortcode result html.
 */
function saju_jukebox_shortcode_jukebox( $atts ) {

	wp_enqueue_style( 'saju-css', plugins_url( 'modules/jukebox/css/jukebox.css', __FILE__ ) );
	wp_enqueue_script( 'angular-js', '//ajax.googleapis.com/ajax/libs/angularjs/1.2.26/angular.min.js', array(), '1.2.26' );

	// Load the Salzburgerland Jukebox javascript along with the configuration options.
	wp_enqueue_script( 'saju-js', plugins_url( 'modules/jukebox/js/jukebox.js', __FILE__ ), array( 'angular-js' ) );
	// TODO: the following parameters should come from somewhere.

	wp_localize_script( 'saju-js', 'saju_js_options', array(
		'api_url'     => admin_url( 'admin-ajax.php?action=wl_sparql&slug=' ),
		'event_url'   => get_option( SAJU_JUKEBOX_SETTINGS_FIELD_EVENT_URL),
		'dataset_url' => get_option( SAJU_JUKEBOX_SETTINGS_FIELD_DATASET_URL)
	) );

	// Get the HTML fragment from the file.
	return file_get_contents( dirname( __FILE__ ) . '/html/jukebox.html' );

}

add_shortcode( 'slt_jukebox', 'saju_jukebox_shortcode_jukebox' );

