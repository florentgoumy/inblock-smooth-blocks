<?php
/**
 * Plugin Name: Inblock Smooth Blocks
 * Description: Adds elegant micro-interactions to Gutenberg blocks (animated icons for Buttons, smooth caret rotation for Navigation, underline reveal for Groups).
 * Version: 0.7.0
 * Requires at least: 6.0
 * Requires PHP: 7.4
 * Author: Inblock
 * Author URI: https://www.inblock.net
 * License: GPLv2 or later
 * License URI: https://www.gnu.org/licenses/gpl-2.0.html
 * Text Domain: inblock-smooth-blocks
 */

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

final class Inblock_Smooth_Blocks {
	const VERSION = '0.7.0';

	const HANDLE_STYLE  = 'inblock-smooth-blocks';
	const HANDLE_EDITOR = 'inblock-smooth-blocks-editor';

	public static function init(): void {
		add_action( 'init', [ __CLASS__, 'register_assets' ] );

		// Load CSS on both frontend and editor
		add_action( 'enqueue_block_assets', [ __CLASS__, 'enqueue_shared_css' ] );

		// Load editor-only JS (adds controls + saves attributes/classes)
		add_action( 'enqueue_block_editor_assets', [ __CLASS__, 'enqueue_editor_js' ] );

		// Ensure Navigation class exists in FRONTEND rendered HTML (server-side injection)
		add_filter( 'render_block', [ __CLASS__, 'inject_navigation_class' ], 10, 2 );
	}

	public static function register_assets(): void {
		wp_register_style(
			self::HANDLE_STYLE,
			plugins_url( 'assets/css/inblock-smooth-blocks.css', __FILE__ ),
			[],
			self::VERSION
		);

		wp_register_script(
			self::HANDLE_EDITOR,
			plugins_url( 'assets/js/editor.js', __FILE__ ),
			[
				'wp-blocks',
				'wp-element',
				'wp-components',
				'wp-compose',
				'wp-hooks',
				'wp-i18n',
				'wp-block-editor',
				'wp-data',
			],
			self::VERSION,
			true
		);
	}

	public static function enqueue_shared_css(): void {
		wp_enqueue_style( self::HANDLE_STYLE );
	}

	public static function enqueue_editor_js(): void {
		wp_enqueue_script( self::HANDLE_EDITOR );
	}

	/**
	 * Inject `inb-smooth-rotation` into rendered Navigation block markup
	 * when attribute `inbSmoothRotation` is enabled.
	 */
	public static function inject_navigation_class( string $block_content, array $block ): string {
		if ( empty( $block['blockName'] ) || 'core/navigation' !== $block['blockName'] ) {
			return $block_content;
		}

		$attrs   = $block['attrs'] ?? [];
		$enabled = ! empty( $attrs['inbSmoothRotation'] );

		if ( ! $enabled ) {
			return $block_content;
		}

		// Add class to <nav class="... wp-block-navigation ..."> element (first match only)
		$block_content = preg_replace(
			'/(<nav\b[^>]*class=")([^"]*\bwp-block-navigation\b[^"]*)(")/i',
			'$1$2 inb-smooth-rotation$3',
			$block_content,
			1
		);

		return $block_content;
	}
}

Inblock_Smooth_Blocks::init();