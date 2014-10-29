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

	// Set the URL to plugins URL + helixware, in order to support the plugin being symbolic linked.
	$plugin_url = plugins_url() . '/slt-jukebox/' . $path;

	return $plugin_url;
}

add_filter( 'plugins_url', 'saju_plugins_url', 10, 3 );
