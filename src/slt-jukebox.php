<?php
/**
 * Plugin Name: Salzburgerland Tourismus Jukebox
 * Plugin URI: http://salzburgerland.com
 * Description: A Jukebox for tourists looking for events in Salzburgerland.
 * Version: 1.0.0
 * Author: InsideOut10
 * Author URI: http://insideout.io
 * License: tbd
 */

// TODO: define the license for the plugin.

require_once( 'saju_constants.php' );
require_once( 'saju_functions.php' );
require_once( 'admin/saju_admin.php' );

// Load the Jukebox module.
require_once( 'modules/jukebox/saju_jukebox.php' );
