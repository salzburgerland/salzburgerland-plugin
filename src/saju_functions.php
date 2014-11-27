<?php


/**
 * Change *plugins_url* response to return the correct file paths when working in development mode (with symbolic links).
 *
 * @since 1.0.0
 *
 * @param string $url v The URL as set by the plugins_url method.
 * @param string $path The request path.
 * @param string $plugin The plugin folder.
 *
 * @return string The URL.
 */
function saju_plugins_url( $url, $path, $plugin ) {

	// Check if it's our pages calling the plugins_url.
	if ( 1 !== preg_match( '/\/slt-jukebox\/.*/i', $plugin ) ) {
		return $url;
	};

	// Get the path to the file relative to the plugin root.
	$rel_path = substr( dirname( $plugin ), strlen( dirname( __FILE__ ) ) ) . '/' . $path;

	// Set the URL to plugins URL in order to support the plugin being symbolic linked.
	$plugin_url = plugins_url() . '/slt-jukebox/' . $rel_path;

	// Enable this for debugging this function.
	// saju_write_log( "[ rel path :: $rel_path ][ file :: " . __FILE__  . " ][ url :: $url ][ path :: $path ][ plugin :: $plugin ][ plugins url  :: $plugin_url ]" );

	return $plugin_url;
}

add_filter( 'plugins_url', 'saju_plugins_url', 10, 3 );


/**
 * Log to the debug.log file.
 *
 * @since 1.0.0
 *
 * @uses saju_write_log_handler to write the log output.
 *
 * @param string|mixed $log The log data.
 */
function saju_write_log( $log ) {

	$handler = apply_filters( 'saju_write_log_handler', null );

	$callers         = debug_backtrace();
	$caller_function = $callers[1]['function'];

	if ( is_null( $handler ) ) {
		saju_write_log_handler( $log, $caller_function );

		return;
	}

	call_user_func( $handler, $log, $caller_function );
}

/**
 * The default log handler prints out the log.
 *
 * @since13.0.0
 *
 * @param string|array $log The log data.
 * @param string $caller The calling function.
 */
function saju_write_log_handler( $log, $caller = null ) {

	if ( true === WP_DEBUG ) {
		if ( is_array( $log ) || is_object( $log ) ) {
			error_log( "[ $caller ] " . print_r( $log, true ) );
		} else {
			error_log( "[ $caller ] " . $log );
		}
	}

}
