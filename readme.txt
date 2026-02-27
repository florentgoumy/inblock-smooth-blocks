=== Inblock Smooth Blocks ===
Contributors: inblock
Tags: gutenberg, blocks, button, navigation, animation, micro-interactions, ui
Requires at least: 6.0
Tested up to: 6.5
Requires PHP: 7.4
Stable tag: 0.7.0
License: GPLv2 or later
License URI: https://www.gnu.org/licenses/gpl-2.0.html

Elegant micro-interactions for Gutenberg blocks. Enhance native blocks with smooth, additive effects.

== Description ==

Inblock Smooth Blocks adds subtle and elegant micro-interactions to native Gutenberg blocks.

Unlike block styles, these effects are additive. You can keep existing styles (Fill, Outline, As Link, etc.) and enhance them without replacing anything.

Current features:

Button block:
• Animated icon (Arrow right →, Arrow left ←, Arrow external ↗)

Navigation block:
• Smooth submenu caret rotation

Group block:
• Underline reveal on links inside the group

All animations respect user accessibility preferences (`prefers-reduced-motion`).

Lightweight by design. No frontend JavaScript. No external dependencies.

Developed by Inblock
https://www.inblock.net

== Installation ==

1. Upload the plugin to `/wp-content/plugins/` or install it via the Plugins screen.
2. Activate the plugin.
3. Edit supported blocks.
4. In the block settings sidebar, open the "Inblock effects" panel under the Styles tab.
5. Enable the desired effect.

== Frequently Asked Questions ==

= Does this replace existing block styles? =
No. All effects are additive and work alongside native styles.

= Does it add frontend JavaScript? =
No. The plugin uses CSS only on the frontend. Editor enhancements use lightweight WordPress APIs.

= Does it affect layout or spacing? =
No. Button interactions prevent layout shifts and preserve text alignment.

= Does it respect accessibility settings? =
Yes. Animations respect the `prefers-reduced-motion` setting.

= Does it work with custom themes? =
Yes. The plugin only adds classes and CSS micro-interactions without modifying theme structure.

== Changelog ==

= 0.7.0 =
Added Arrow up and Arrow down animated icons for Button blocks.

= 0.6.0 =
Added theme palette icon color control for Button animated icons.

= 0.5.0 =
Added theme palette color control for Group underline reveal.

= 0.4.0 =
Accessibility improvements (focus-visible support and reduced-motion refinements).

= 0.3.0 =
Added underline reveal effect for Group blocks.

= 0.2.0 =
Added additive animated icons for Button block and smooth rotation for Navigation.

= 0.1.0 =
Initial release.
