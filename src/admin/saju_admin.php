<?php

/**
 * This function is called by the *admin_menu* hook to create and configure the Salzburgerland administration menu.
 * It raises the *saju_admin_menu* action to have modules add their own submenu.
 *
 * @since 1.0.0
 */
function saju_admin_menu() {

	$menu_slug  = 'saju_admin_menu';
	$capability = 'manage_options';

	// see http://codex.wordpress.org/Function_Reference/add_utility_page
	add_utility_page(
		__( 'Salzburgerland', SAJU_LANGUAGE_DOMAIN ), // page title
		__( 'Salzburgerland', SAJU_LANGUAGE_DOMAIN ), // menu title
		$capability,                 // capabilities
		$menu_slug,                  // menu slug
		'saju_admin_menu_callback'); // function callback to draw the menu
	// TODO: add logo
	// WP_CONTENT_URL . '/plugins/slt-jukebox/images/logo.gif' );  // icon URL 20x20 px

	// Call hooked functions.
	do_action( 'saju_admin_menu', $menu_slug, $capability );

}

add_action( 'admin_menu', 'saju_admin_menu' );


/**
 * This function is called as a callback by the *saju_admin_menu* to display the actual page.
 *
 * @since 1.0.0
 */
function saju_admin_menu_callback() {

	if ( ! current_user_can( 'manage_options' ) ) {
		wp_die( __( 'You do not have sufficient permissions to access this page.' ) );
	}

	echo '<div class="wrap">';
	echo '<p>Choose a setting from the left menu.</p>';
	echo '</div>';

}