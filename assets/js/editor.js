( function ( wp ) {
	const { addFilter } = wp.hooks;
	const { createHigherOrderComponent } = wp.compose;
	const { InspectorControls } = wp.blockEditor;
	const { PanelBody, SelectControl, ToggleControl } = wp.components;
	const { __ } = wp.i18n;
	const { createElement: el, Fragment } = wp.element;

	// Access theme/editor settings (palette)
	const { select } = wp.data;

	// Blocks
	const BUTTON_BLOCK = 'core/button';
	const NAV_BLOCK = 'core/navigation';
	const GROUP_BLOCK = 'core/group';
	const IMAGE_BLOCK = 'core/image';

	// Attributes
	const ATTR_ARROW = 'inbArrow';
	const ATTR_ARROW_COLOR = 'inbArrowColor';
	const ATTR_BUTTON_BORDER_REVEAL = 'inbButtonBorderReveal';
	const ATTR_BUTTON_BORDER_COLOR = 'inbButtonBorderColor';

	const ATTR_NAV_SMOOTH_ROTATION = 'inbSmoothRotation';
	const ATTR_NAV_SUBMENU_SOFT_SLIDE = 'inbNavSubmenuSoftSlide';

	const ATTR_UNDERLINE_REVEAL = 'inbUnderlineReveal';
	const ATTR_UNDERLINE_COLOR = 'inbUnderlineColor';
	const ATTR_UNDERLINE_KEEP_DECORATION = 'inbUnderlineKeepDecoration';

	const ATTR_IMAGE_SUBTLE_SCALE = 'inbImageSubtleScale';

	// UI options
	const ARROW_OPTIONS = [
		{ label: __( 'None', 'inblock-smooth-blocks' ), value: '' },
		{ label: __( 'Arrow right (→)', 'inblock-smooth-blocks' ), value: 'right' },
		{ label: __( 'Arrow left (←)', 'inblock-smooth-blocks' ), value: 'left' },
		{ label: __( 'Arrow up (↑)', 'inblock-smooth-blocks' ), value: 'up' },
		{ label: __( 'Arrow down (↓)', 'inblock-smooth-blocks' ), value: 'down' },
		{ label: __( 'Arrow external (↗)', 'inblock-smooth-blocks' ), value: 'external' },
	];

	function arrowClass( value ) {
		// Whitelist expected values only
		if ( value !== 'right' && value !== 'left' && value !== 'up' && value !== 'down' && value !== 'external' ) return '';
		return 'inb-arrow-' + value;
	}

	/**
	 * Return the editor theme palette (Theme + Custom).
	 * On modern WP, theme palette is exposed as `colorPalette`.
	 * Fallback to `colors` if needed.
	 */
	function getThemePalette() {
		const settings = select( 'core/block-editor' )?.getSettings?.() || {};

		// Preferred (most consistent) key
		if ( Array.isArray( settings.colorPalette ) && settings.colorPalette.length ) {
			return settings.colorPalette;
		}

		// Fallback used by some versions/contexts
		if ( Array.isArray( settings.colors ) && settings.colors.length ) {
			return settings.colors;
		}

		return [];
	}

	/* ------------------------------------------------------------
	   1) Extend block attributes
	   ------------------------------------------------------------ */
	function addAttributes( settings, name ) {
		// Button: animated icon selector + icon color
		if ( name === BUTTON_BLOCK ) {
			settings.attributes = Object.assign( {}, settings.attributes, {
				[ ATTR_ARROW ]: { type: 'string', default: '' },
				[ ATTR_ARROW_COLOR ]: { type: 'string', default: '' },
				[ ATTR_BUTTON_BORDER_REVEAL ]: { type: 'boolean', default: false },
				[ ATTR_BUTTON_BORDER_COLOR ]: { type: 'string', default: '' },
			} );
			return settings;
		}

		// Navigation: smooth caret rotation toggle
		if ( name === NAV_BLOCK ) {
			settings.attributes = Object.assign( {}, settings.attributes, {
				[ ATTR_NAV_SMOOTH_ROTATION ]: { type: 'boolean', default: false },
				[ ATTR_NAV_SUBMENU_SOFT_SLIDE ]: { type: 'boolean', default: false },
			} );
			return settings;
		}

		// Group: underline reveal toggle + underline color
		if ( name === GROUP_BLOCK ) {
			settings.attributes = Object.assign( {}, settings.attributes, {
				[ ATTR_UNDERLINE_REVEAL ]: { type: 'boolean', default: false },
				[ ATTR_UNDERLINE_KEEP_DECORATION ]: { type: 'boolean', default: true },
				[ ATTR_UNDERLINE_COLOR ]: { type: 'string', default: '' },
			} );
			return settings;
		}

		// Image: subtle scale
		if ( name === IMAGE_BLOCK ) {
			settings.attributes = Object.assign( {}, settings.attributes, {
				[ ATTR_IMAGE_SUBTLE_SCALE ]: { type: 'boolean', default: false },
			} );
			return settings;
		}

		return settings;
	}
	addFilter( 'blocks.registerBlockType', 'inblock/smooth-blocks/add-attrs', addAttributes );

	/* ------------------------------------------------------------
	   2) Inspector UI (Styles tab)
	   ------------------------------------------------------------ */
	const withInspectorControls = createHigherOrderComponent( ( BlockEdit ) => {
		return ( props ) => {

			// Button UI
			if ( props.name === BUTTON_BLOCK ) {
				const currentArrow = ( props.attributes && props.attributes[ ATTR_ARROW ] ) || '';
				const arrowColor = ( props.attributes && props.attributes[ ATTR_ARROW_COLOR ] ) || '';
				const borderReveal = !!( props.attributes && props.attributes[ ATTR_BUTTON_BORDER_REVEAL ] );
				const borderColor = ( props.attributes && props.attributes[ ATTR_BUTTON_BORDER_COLOR ] ) || '';
				const palette = getThemePalette();

				return el(
					Fragment,
					{},
					el( BlockEdit, props ),
					el(
						InspectorControls,
						{ group: 'styles' },
						el(
							PanelBody,
							{ title: __( 'Inblock effects', 'inblock-smooth-blocks' ), initialOpen: true },
							el( SelectControl, {
								label: __( 'Animated icon', 'inblock-smooth-blocks' ),
								value: currentArrow,
								options: ARROW_OPTIONS,
								onChange: ( val ) => {
									props.setAttributes( { [ ATTR_ARROW ]: val } );
									// If user disables arrow, also clear icon color (optional but clean)
									if ( !val ) props.setAttributes( { [ ATTR_ARROW_COLOR ]: '' } );
								},
								help: __( 'Adds a subtle animated icon.', 'inblock-smooth-blocks' ),
							} ),

							// Show color picker only when an icon is selected
							!!arrowClass( currentArrow ) &&
								el(
									'div',
									{ style: { marginTop: '12px' } },
									el(
										'div',
										{ style: { marginBottom: '8px', fontSize: '11px', textTransform: 'uppercase', opacity: 0.7 } },
										__( 'Icon color', 'inblock-smooth-blocks' )
									),
									el( wp.blockEditor.ColorPalette, {
										colors: palette,
										value: arrowColor || undefined,
										onChange: ( val ) => props.setAttributes( { [ ATTR_ARROW_COLOR ]: val || '' } ),
										disableCustomColors: false,
										clearable: true,
									} ),
									el(
										'div',
										{ style: { marginTop: '6px', fontSize: '12px', opacity: 0.75 } },
										__( 'Defaults to the button text color if not set.', 'inblock-smooth-blocks' )
									)
								)
							,

							el( ToggleControl, {
								label: __( 'Border reveal', 'inblock-smooth-blocks' ),
								checked: borderReveal,
								onChange: ( val ) => {
									props.setAttributes( { [ ATTR_BUTTON_BORDER_REVEAL ]: !!val } );
									if ( !val ) props.setAttributes( { [ ATTR_BUTTON_BORDER_COLOR ]: '' } );
								},
								help: __( 'Reveals a subtle border on hover/focus.', 'inblock-smooth-blocks' ),
							} ),

							borderReveal &&
								el(
									'div',
									{ style: { marginTop: '12px' } },
									el(
										'div',
										{ style: { marginBottom: '8px', fontSize: '11px', textTransform: 'uppercase', opacity: 0.7 } },
										__( 'Border color', 'inblock-smooth-blocks' )
									),
									el( wp.blockEditor.ColorPalette, {
										colors: palette,
										value: borderColor || undefined,
										onChange: ( val ) => props.setAttributes( { [ ATTR_BUTTON_BORDER_COLOR ]: val || '' } ),
										disableCustomColors: false,
										clearable: true,
									} ),
									el(
										'div',
										{ style: { marginTop: '6px', fontSize: '12px', opacity: 0.75 } },
										__( 'Defaults to current text color if not set.', 'inblock-smooth-blocks' )
									)
								)
						)
					)
				);
			}

			// Navigation UI
			if ( props.name === NAV_BLOCK ) {
				const smoothRotation = !!( props.attributes && props.attributes[ ATTR_NAV_SMOOTH_ROTATION ] );
				const submenuSoftSlide = !!( props.attributes && props.attributes[ ATTR_NAV_SUBMENU_SOFT_SLIDE ] );

				return el(
					Fragment,
					{},
					el( BlockEdit, props ),
					el(
						InspectorControls,
						{ group: 'styles' },
						el(
							PanelBody,
							{ title: __( 'Inblock effects', 'inblock-smooth-blocks' ), initialOpen: true },
							el( ToggleControl, {
								label: __( 'Smooth rotation', 'inblock-smooth-blocks' ),
								checked: smoothRotation,
								onChange: ( val ) => props.setAttributes( { [ ATTR_NAV_SMOOTH_ROTATION ]: !!val } ),
								help: __( 'Animates the submenu caret rotation instead of flipping instantly.', 'inblock-smooth-blocks' ),
							} ),
							el( ToggleControl, {
								label: __( 'Submenu soft slide', 'inblock-smooth-blocks' ),
								checked: submenuSoftSlide,
								onChange: ( val ) => props.setAttributes( { [ ATTR_NAV_SUBMENU_SOFT_SLIDE ]: !!val } ),
								help: __( 'Submenus fade in and slide slightly (desktop dropdown).', 'inblock-smooth-blocks' ),
							} )
						)
					)
				);
			}

			// Group UI
			if ( props.name === GROUP_BLOCK ) {
				const underlineReveal = !!( props.attributes && props.attributes[ ATTR_UNDERLINE_REVEAL ] );
				const underlineKeepDecoration = !!( props.attributes && props.attributes[ ATTR_UNDERLINE_KEEP_DECORATION ] );
				const underlineColor = ( props.attributes && props.attributes[ ATTR_UNDERLINE_COLOR ] ) || '';
				const palette = getThemePalette();

				return el(
					Fragment,
					{},
					el( BlockEdit, props ),
					el(
						InspectorControls,
						{ group: 'styles' },
						el(
							PanelBody,
							{ title: __( 'Inblock effects', 'inblock-smooth-blocks' ), initialOpen: true },
							el( ToggleControl, {
								label: __( 'Underline reveal', 'inblock-smooth-blocks' ),
								checked: underlineReveal,
								onChange: ( val ) => props.setAttributes( { [ ATTR_UNDERLINE_REVEAL ]: !!val } ),
								help: __( 'Animates an underline on links inside this group.', 'inblock-smooth-blocks' ),
							} ),

							underlineReveal &&
								el( ToggleControl, {
									label: __( 'Keep default underline', 'inblock-smooth-blocks' ),
									checked: underlineKeepDecoration,
									onChange: ( val ) => props.setAttributes( { [ ATTR_UNDERLINE_KEEP_DECORATION ]: !!val } ),
									help: __( 'If disabled, removes the underline until reveal.', 'inblock-smooth-blocks' ),
								} ),

							underlineReveal &&
								el(
									'div',
									{ style: { marginTop: '12px' } },
									el(
										'div',
										{ style: { marginBottom: '8px', fontSize: '11px', textTransform: 'uppercase', opacity: 0.7 } },
										__( 'Underline color', 'inblock-smooth-blocks' )
									),
									el( wp.blockEditor.ColorPalette, {
										colors: palette,
										value: underlineColor || undefined,
										onChange: ( val ) => props.setAttributes( { [ ATTR_UNDERLINE_COLOR ]: val || '' } ),
										disableCustomColors: false,
										clearable: true,
									} ),
									el(
										'div',
										{ style: { marginTop: '6px', fontSize: '12px', opacity: 0.75 } },
										__( 'Defaults to current text color if not set.', 'inblock-smooth-blocks' )
									)
								)
						)
					)
				);
			}

			// Image UI
			if ( props.name === IMAGE_BLOCK ) {
				const subtleScale = !!( props.attributes && props.attributes[ ATTR_IMAGE_SUBTLE_SCALE ] );

				return el(
					Fragment,
					{},
					el( BlockEdit, props ),
					el(
						InspectorControls,
						{ group: 'styles' },
						el(
							PanelBody,
							{ title: __( 'Inblock effects', 'inblock-smooth-blocks' ), initialOpen: true },
							el( ToggleControl, {
								label: __( 'Subtle scale', 'inblock-smooth-blocks' ),
								checked: subtleScale,
								onChange: ( val ) => props.setAttributes( { [ ATTR_IMAGE_SUBTLE_SCALE ]: !!val } ),
								help: __( 'Scales the image slightly on hover/focus (1.02).', 'inblock-smooth-blocks' ),
							} )
						)
					)
				);
			}

			return el( BlockEdit, props );
		};
	}, 'withInspectorControls' );

	addFilter( 'editor.BlockEdit', 'inblock/smooth-blocks/inspector', withInspectorControls );

	/* ------------------------------------------------------------
	   3) Editor preview class + CSS variables (BlockListBlock)
	   ------------------------------------------------------------ */
	const withEditorClass = createHigherOrderComponent( ( BlockListBlock ) => {
		return ( props ) => {

			// Button: add effect classes + CSS variables
			if ( props.name === BUTTON_BLOCK ) {
				const val = ( props.attributes && props.attributes[ ATTR_ARROW ] ) || '';
				const clsArrow = arrowClass( val );
				const borderReveal = !!( props.attributes && props.attributes[ ATTR_BUTTON_BORDER_REVEAL ] );

				if ( !clsArrow && !borderReveal ) return el( BlockListBlock, props );

				const arrowColor = ( props.attributes && props.attributes[ ATTR_ARROW_COLOR ] ) || '';
				const borderColor = ( props.attributes && props.attributes[ ATTR_BUTTON_BORDER_COLOR ] ) || '';

				const className = [ props.className, clsArrow, borderReveal ? 'inb-border-reveal' : '' ].filter( Boolean ).join( ' ' );

				const existingWrapperProps = props.wrapperProps || {};
				const existingStyle = existingWrapperProps.style || {};

				const styleVars = Object.assign( {},
					arrowColor ? { '--inb-arrow-color': arrowColor } : {},
					borderColor ? { '--inb-border-color': borderColor } : {}
				);

				const wrapperProps = Object.assign( {}, existingWrapperProps, {
					style: Object.assign( {}, existingStyle, styleVars ),
				} );

				return el( BlockListBlock, Object.assign( {}, props, { className, wrapperProps } ) );
			}

			// Navigation: add classes (editor preview)
			if ( props.name === NAV_BLOCK ) {
				const smoothRotation = !!( props.attributes && props.attributes[ ATTR_NAV_SMOOTH_ROTATION ] );
				const submenuSoftSlide = !!( props.attributes && props.attributes[ ATTR_NAV_SUBMENU_SOFT_SLIDE ] );
				if ( !smoothRotation && !submenuSoftSlide ) return el( BlockListBlock, props );

				const className = [
					props.className,
					smoothRotation ? 'inb-smooth-rotation' : '',
					submenuSoftSlide ? 'inb-submenu-soft-slide' : '',
				].filter( Boolean ).join( ' ' );
				return el( BlockListBlock, Object.assign( {}, props, { className } ) );
			}

			// Image: subtle scale (editor preview)
			if ( props.name === IMAGE_BLOCK ) {
				const subtleScale = !!( props.attributes && props.attributes[ ATTR_IMAGE_SUBTLE_SCALE ] );
				if ( !subtleScale ) return el( BlockListBlock, props );

				const className = [ props.className, 'inb-image-subtle-scale' ].filter( Boolean ).join( ' ' );
				return el( BlockListBlock, Object.assign( {}, props, { className } ) );
			}

			// Group: add underline reveal class + underline color variable (editor preview)
			if ( props.name === GROUP_BLOCK ) {
				const underlineReveal = !!( props.attributes && props.attributes[ ATTR_UNDERLINE_REVEAL ] );
				if ( !underlineReveal ) return el( BlockListBlock, props );

				const underlineKeepDecoration = !!( props.attributes && props.attributes[ ATTR_UNDERLINE_KEEP_DECORATION ] );
				const underlineColor = ( props.attributes && props.attributes[ ATTR_UNDERLINE_COLOR ] ) || '';
				const className = [
					props.className,
					'inb-underline-reveal',
					underlineKeepDecoration ? '' : 'inb-underline-no-default',
				].filter( Boolean ).join( ' ' );

				const existingWrapperProps = props.wrapperProps || {};
				const existingStyle = existingWrapperProps.style || {};

				const wrapperProps = Object.assign( {}, existingWrapperProps, {
					style: Object.assign( {}, existingStyle, underlineColor ? { '--inb-underline-color': underlineColor } : {} ),
				} );

				return el( BlockListBlock, Object.assign( {}, props, { className, wrapperProps } ) );
			}

			return el( BlockListBlock, props );
		};
	}, 'withEditorClass' );

	addFilter( 'editor.BlockListBlock', 'inblock/smooth-blocks/editor-class', withEditorClass );

	/* ------------------------------------------------------------
	   4) Save classes + CSS variables to frontend markup
	   (Navigation may be server-rendered; PHP ensures frontend output there.)
	   ------------------------------------------------------------ */
	function addSaveProps( extraProps, blockType, attributes ) {

		// Button
		if ( blockType.name === BUTTON_BLOCK ) {
			const val = ( attributes && attributes[ ATTR_ARROW ] ) || '';
			const clsArrow = arrowClass( val );
			const borderReveal = !!( attributes && attributes[ ATTR_BUTTON_BORDER_REVEAL ] );

			if ( !clsArrow && !borderReveal ) return extraProps;

			extraProps.className = [
				extraProps.className,
				clsArrow,
				borderReveal ? 'inb-border-reveal' : '',
			].filter( Boolean ).join( ' ' );

			const arrowColor = ( attributes && attributes[ ATTR_ARROW_COLOR ] ) || '';
			const borderColor = ( attributes && attributes[ ATTR_BUTTON_BORDER_COLOR ] ) || '';

			const styleVars = Object.assign( {},
				arrowColor ? { '--inb-arrow-color': arrowColor } : {},
				borderColor ? { '--inb-border-color': borderColor } : {}
			);
			if ( Object.keys( styleVars ).length ) {
				extraProps.style = Object.assign( {}, extraProps.style, styleVars );
			}

			return extraProps;
		}

		// Group
		if ( blockType.name === GROUP_BLOCK ) {
			const underlineReveal = !!( attributes && attributes[ ATTR_UNDERLINE_REVEAL ] );
			if ( !underlineReveal ) return extraProps;

			const underlineKeepDecoration = !!( attributes && attributes[ ATTR_UNDERLINE_KEEP_DECORATION ] );
			extraProps.className = [
				extraProps.className,
				'inb-underline-reveal',
				underlineKeepDecoration ? '' : 'inb-underline-no-default',
			].filter( Boolean ).join( ' ' );

			const underlineColor = ( attributes && attributes[ ATTR_UNDERLINE_COLOR ] ) || '';
			if ( underlineColor ) {
				extraProps.style = Object.assign( {}, extraProps.style, {
					'--inb-underline-color': underlineColor,
				} );
			}

			return extraProps;
		}

		// Navigation (best-effort; frontend is guaranteed by PHP filter)
		if ( blockType.name === NAV_BLOCK ) {
			const smoothRotation = !!( attributes && attributes[ ATTR_NAV_SMOOTH_ROTATION ] );
			const submenuSoftSlide = !!( attributes && attributes[ ATTR_NAV_SUBMENU_SOFT_SLIDE ] );
			if ( !smoothRotation && !submenuSoftSlide ) return extraProps;

			extraProps.className = [
				extraProps.className,
				smoothRotation ? 'inb-smooth-rotation' : '',
				submenuSoftSlide ? 'inb-submenu-soft-slide' : '',
			].filter( Boolean ).join( ' ' );
			return extraProps;
		}

		// Image
		if ( blockType.name === IMAGE_BLOCK ) {
			const subtleScale = !!( attributes && attributes[ ATTR_IMAGE_SUBTLE_SCALE ] );
			if ( !subtleScale ) return extraProps;

			extraProps.className = [ extraProps.className, 'inb-image-subtle-scale' ].filter( Boolean ).join( ' ' );
			return extraProps;
		}

		return extraProps;
	}
	addFilter( 'blocks.getSaveContent.extraProps', 'inblock/smooth-blocks/save-class', addSaveProps );

} )( window.wp );