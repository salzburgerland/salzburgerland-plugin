<?php

/**
 * This file defines useful constants for the Jukebox module.
 */

// The jukebox general settings holder.
define( 'SAJU_JUKEBOX_SETTINGS_GENERAL', 'saju_jukebox_settings_general' );

// The jukebox general settings page.
define( 'SAJU_JUKEBOX_SETTINGS_GENERAL_PAGE', 'saju_jukebox_settings_general_page' );

// The event URL field name.
define( 'SAJU_JUKEBOX_SETTINGS_FIELD_EVENT_URL', 'saju_jukebox_settings_field_event_url' );

// The dataset URL field name.
define( 'SAJU_JUKEBOX_SETTINGS_FIELD_DATASET_URL', 'saju_jukebox_settings_field_dataset_url' );

// The Jukebox dataset base URL.
define( 'SAJU_JUKEBOX_DATASET_URL', get_option( SAJU_JUKEBOX_SETTINGS_FIELD_DATASET_URL ) );

// The Jukebox categories.
define( 'SAJU_JUKEBOX_CATEGORIES_SLUGS_TO_LABELS', serialize( array(
	'art-and-culture'   => 'Art & Culture',
	'attractions'       => 'Attractions',
	'eat-and-drink'     => 'Eat & Drink',
	'event'             => 'Event',
	'family'            => 'Family',
	'sport-and-outdoor' => 'Sport and Outdoor',
) ) );

define( 'SAJU_JUKEBOX_CATEGORIES_LABELS_TO_SLUGS', serialize( array(
	'Art & Culture'     => 'art-and-culture',
	'Attractions'       => 'attractions',
	'Eat & Drink'       => 'eat-and-drink',
	'Event'             => 'event',
	'Family'            => 'family',
	'Sport and Outdoor' => 'sport-and-outdoor',
) ) );

// The following is used to pass data to build the wheel.
define( 'SAJU_JUKEBOX_CATEGORIES', serialize( array(
	array(
		'label' => '',
		'value' => 'Eat & Drink',
		'image' => plugins_url( 'images/eat_drink.jpg', __FILE__ )
	),
	array(
		'label' => '',
		'value' => 'Event',
		'image' => plugins_url( 'images/event.jpg', __FILE__ )
	),
	array(
		'label' => '',
		'value' => 'Family',
		'image' => plugins_url( 'images/family.jpg', __FILE__ )
	),
	array(
		'label' => '',
		'value' => 'Sport and Outdoor',
		'image' => plugins_url( 'images/sport_outdoor.jpg', __FILE__ )
	),
	array(
		'label' => '',
		'value' => 'Art & Culture',
		'image' => plugins_url( 'images/art_culture.jpg', __FILE__ ),
	),
	array(
		'label' => '',
		'value' => 'Attractions',
		'image' => plugins_url( 'images/attractions.jpg', __FILE__ )
	),
) ) );

define('SAJU_JUKEBOX_OK_BUTTON_IMAGE', plugins_url( 'images/ok_button.png', __FILE__ ) );
