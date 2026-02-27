( function ( wp ) {
	const { addFilter } = wp.hooks;
	const { createHigherOrderComponent } = wp.compose;

	// Use ColorGradientSettings for the native "Color / Gradient" popover UI
	const { InspectorControls, __experimentalColorGradientSettings: ColorGradientSettings } = wp.blockEditor;

	const { PanelBody, SelectControl, ToggleControl } = wp.components;
	const { __ } = wp.i18n;
	const { createElement: el, Fragment } = wp.element;

	// Blocks
	const BUTTON_BLOCK = 'core/button';
	const NAV_BLOCK = 'core/navigation';
	const GROUP_BLOCK = 'core/group';

	// Attributes
	const ATTR_ARROW = 'inbArrow';
	const ATTR_ARROW_COLOR = 'inbArrowColor';
	const ATTR_NAV_SMOOTH_ROTATION = 'inbSmoothRotation';
	const ATTR_UNDERLINE_REVEAL = 'inbUnderlineReveal';
	const ATTR_UNDERLINE_COLOR = 'inbUnderlineColor';

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
		if (
			value !== 'right' &&
			value !== 'left' &&
			value !== 'up' &&
			value !== 'down' &&
			value !== 'external'
		) {
			return '';
		}
		return 'inb-arrow-' + value;
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
			} );
			return settings;
		}

		// Navigation: smooth caret rotation toggle
		if ( name === NAV_BLOCK ) {
			settings.attributes = Object.assign( {}, settings.attributes, {
				[ ATTR_NAV_SMOOTH_ROTATION ]: { type: 'boolean', default: false },
			} );
			return settings;
		}

		// Group: underline reveal toggle + underline color
		if ( name === GROUP_BLOCK ) {
			settings.attributes = Object.assign( {}, settings.attributes, {
				[ ATTR_UNDERLINE_REVEAL ]: { type: 'boolean', default: false },
				[ ATTR_UNDERLINE_COLOR ]: { type: 'string', default: '' },
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
									// If user disables icon, also clear icon color
									if ( !val ) props.setAttributes( { [ ATTR_ARROW_COLOR ]: '' } );
								},
								help: __( 'Adds a subtle animated icon.', 'inblock-smooth-blocks' ),
							} ),

							// Native WP "Color / Gradient" popover (we only store color)
							!!arrowClass( currentArrow ) &&
								el(
									'div',
									{ style: { marginTop: '12px' } },
									el( ColorGradientSettings, {
										title: __( 'Icon color', 'inblock-smooth-blocks' ),
										settings: [
											{
												label: __( 'Icon color', 'inblock-smooth-blocks' ),
												colorValue: arrowColor || undefined,
												onColorChange: ( val ) => props.setAttributes( { [ ATTR_ARROW_COLOR ]: val || '' } ),
											},
										],
									} ),
									el(
										'div',
										{ style: { marginTop: '6px', fontSize: '12px', opacity: 0.75 } },
										__( 'Defaults to the button text color if not set.', 'inblock-smooth-blocks' )
									)
								)
						)
					)
				);
			}

			// Navigation UI
			if ( props.name === NAV_BLOCK ) {
				const smoothRotation = !!( props.attributes && props.attributes[ ATTR_NAV_SMOOTH_ROTATION ] );

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
							} )
						)
					)
				);
			}

			// Group UI
			if ( props.name === GROUP_BLOCK ) {
				const underlineReveal = !!( props.attributes && props.attributes[ ATTR_UNDERLINE_REVEAL ] );
				const underlineColor = ( props.attributes && props.attributes[ ATTR_UNDERLINE_COLOR ] ) || '';

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
								el(
									'div',
									{ style: { marginTop: '12px' } },
									el( ColorGradientSettings, {
										title: __( 'Underline color', 'inblock-smooth-blocks' ),
										settings: [
											{
												label: __( 'Underline color', 'inblock-smooth-blocks' ),
												colorValue: underlineColor || undefined,
												onColorChange: ( val ) => props.setAttributes( { [ ATTR_UNDERLINE_COLOR ]: val || '' } ),
											},
										],
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

			return el( BlockEdit, props );
		};
	}, 'withInspectorControls' );

	addFilter( 'editor.BlockEdit', 'inblock/smooth-blocks/inspector', withInspectorControls );

	/* ------------------------------------------------------------
	   3) Editor preview class + CSS variables (BlockListBlock)
	   ------------------------------------------------------------ */
	const withEditorClass = createHigherOrderComponent( ( BlockListBlock ) => {
		return ( props ) => {

			// Button: add arrow class + icon color variable
			if ( props.name === BUTTON_BLOCK ) {
				const val = ( props.attributes && props.attributes[ ATTR_ARROW ] ) || '';
				const cls = arrowClass( val );
				if ( !cls ) return el( BlockListBlock, props );

				const arrowColor = ( props.attributes && props.attributes[ ATTR_ARROW_COLOR ] ) || '';
				const className = [ props.className, cls ].filter( Boolean ).join( ' ' );

				const existingWrapperProps = props.wrapperProps || {};
				const existingStyle = existingWrapperProps.style || {};

				const wrapperProps = Object.assign( {}, existingWrapperProps, {
					style: Object.assign( {}, existingStyle, arrowColor ? { '--inb-arrow-color': arrowColor } : {} ),
				} );

				return el( BlockListBlock, Object.assign( {}, props, { className, wrapperProps } ) );
			}

			// Navigation: add smooth rotation class (editor preview)
			if ( props.name === NAV_BLOCK ) {
				const smoothRotation = !!( props.attributes && props.attributes[ ATTR_NAV_SMOOTH_ROTATION ] );
				if ( !smoothRotation ) return el( BlockListBlock, props );

				const className = [ props.className, 'inb-smooth-rotation' ].filter( Boolean ).join( ' ' );
				return el( BlockListBlock, Object.assign( {}, props, { className } ) );
			}

			// Group: add underline reveal class + underline color variable (editor preview)
			if ( props.name === GROUP_BLOCK ) {
				const underlineReveal = !!( props.attributes && props.attributes[ ATTR_UNDERLINE_REVEAL ] );
				if ( !underlineReveal ) return el( BlockListBlock, props );

				const underlineColor = ( props.attributes && props.attributes[ ATTR_UNDERLINE_COLOR ] ) || '';
				const className = [ props.className, 'inb-underline-reveal' ].filter( Boolean ).join( ' ' );

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
			const cls = arrowClass( val );
			if ( !cls ) return extraProps;

			extraProps.className = [ extraProps.className, cls ].filter( Boolean ).join( ' ' );

			const arrowColor = ( attributes && attributes[ ATTR_ARROW_COLOR ] ) || '';
			if ( arrowColor ) {
				extraProps.style = Object.assign( {}, extraProps.style, {
					'--inb-arrow-color': arrowColor,
				} );
			}

			return extraProps;
		}

		// Group
		if ( blockType.name === GROUP_BLOCK ) {
			const underlineReveal = !!( attributes && attributes[ ATTR_UNDERLINE_REVEAL ] );
			if ( !underlineReveal ) return extraProps;

			extraProps.className = [ extraProps.className, 'inb-underline-reveal' ].filter( Boolean ).join( ' ' );

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
			if ( !smoothRotation ) return extraProps;

			extraProps.className = [ extraProps.className, 'inb-smooth-rotation' ].filter( Boolean ).join( ' ' );
			return extraProps;
		}

		return extraProps;
	}
	addFilter( 'blocks.getSaveContent.extraProps', 'inblock/smooth-blocks/save-class', addSaveProps );

} )( window.wp );