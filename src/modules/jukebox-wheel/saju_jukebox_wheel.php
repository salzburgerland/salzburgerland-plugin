<?php

/**
 * Create the Jukebox Wheel.
 *
 * @since 1.0.0
 *
 * @param array $atts The shortcode attributes.
 *
 * @return string The shortcode content.
 */
function saju_shortcode_jukebox_wheel( $atts ) {

	// Get the configuration parameters.
	$params = shortcode_atts( array(
		// The *search_slug* is the slug of the WordPress page which we will redirect to with the *from*, *to* and *interests* parameters.
		'search_slug' => 'search'
	), $atts );

	// Queue styles
	wp_enqueue_style( 'bootstrap-css', plugins_url( 'bower_components/bootstrap/dist/css/bootstrap.min.css', __FILE__ ) );
	wp_enqueue_style( 'jukebox-wheel-css', plugins_url( 'css/style.css', __FILE__ ) );

	// Queue scripts
//	wp_enqueue_script( 'jquery', plugins_url( 'bower_components/jquery/dist/jquery.min.js', __FILE__ ) );
	wp_enqueue_script( 'bootstrap-js', plugins_url( 'bower_components/bootstrap/dist/js/bootstrap.min.js', __FILE__ ), array( 'jquery' ) );
	wp_enqueue_script( 'hammer', plugins_url( 'bower_components/hammerjs/hammer.min.js', __FILE__ ) );
	wp_enqueue_script( 'd3', plugins_url( 'bower_components/d3/d3.min.js', __FILE__ ) );
	wp_enqueue_script( 'saju-jukebox-wheel-functions-js', plugins_url( 'js/jukebox-functions.js', __FILE__ ), array( 'bootstrap-js' ) );
	wp_enqueue_script( 'saju-jukebox-wheel-js', plugins_url( 'js/jukebox.js', __FILE__ ), array( 'saju-jukebox-wheel-functions-js' ) );


	// Print out the parameters.
	wp_localize_script( 'saju-jukebox-wheel-js', 'saju_jukebox_wheel_options', array(
		'search_slug' => $params['search_slug'],
		'interests'   => unserialize( SAJU_JUKEBOX_CATEGORIES ),
                'ok_button'   => SAJU_JUKEBOX_OK_BUTTON_IMAGE
	) );


	// Write markup
	ob_start();
	require_once( 'saju_jukebox_wheel_html_template.php' );

	return ob_get_clean();

}

add_shortcode( 'slt_jukebox_wheel', 'saju_shortcode_jukebox_wheel' );
