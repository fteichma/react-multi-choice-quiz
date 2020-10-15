const SelectStyle = (width, height) => ({
	default: {
		control: (base, state) => ({
			...base,
			/* background: "rgba(0, 0, 0, 0.05)", */
			borderRadius: 5,
			paddingLeft: '0.25em',
			paddingRight: '0.25em',
			fontSize: '13px',
			fontWeight: '400',
			borderColor: 'rgb(232, 232, 232)',
			':focus-within': {
				borderColor: '#051E34',
				boxShadow: '0 0 0 1px #051E34'
			},
			minWidth: width && width,
			width: width && width,
			minHeight: height && height,
			height: height && height,
			cursor: 'pointer'
		}),
		dropdownIndicator: (base, state) => ({
			...base,
			transition: 'all .2s ease',
			padding: '0 4px',
			transform: state.selectProps.menuIsOpen ? 'scale(0.8) rotate(180deg)' : 'scale(0.8)'
		}),
		indicatorSeparator: () => ({ display: 'none' }),
		option: (provided, state) => ({
			...provided,
			fontSize: '13px',
			cursor: 'pointer',
			overflow: 'hidden',
			textOverflow: 'ellipsis',
			whiteSpace: 'nowrap',
			fontWeight: '400',
			color: state.isSelected ? 'white' : 'black',
			backgroundColor: state.isSelected ? '#051E34' : '',
			':hover': {
				backgroundColor: state.isSelected ? '#051E34' : 'var(--greyC)',
				transition: 'all .2s linear'
			}
		}),
		placeholder: defaultStyles => {
			return {
				...defaultStyles,
				color: 'var(--greyE)',
				fontWeight: '400',
				':focus': {
					color: 'var(--greyD)'
				}
			};
		},
		clearIndicator: provided => ({
			...provided,
			padding: '0',
			transform: 'scale(0.8)'
		}),
		menu: base => ({
			...base,
			minWidth: width && width,
			width: width && width,
			borderRadius: 5,
			marginTop: '0.5em',
			fontSize: '11px',
			zIndex: 9
		}),
		menuList: base => ({
			...base
		}),
		loadingIndicator: styles => ({
			...styles,
			position: 'absolute',
			left: 0,
			right: 0,
			top: 0,
			bottom: 0,
			margin: 'auto',
			display: 'flex',
			paddingLeft: 20,
			alignItems: 'center',
			background: 'white',
			borderRadius: 20
		})
	},
	defaultAction: {
		control: (base, state) => ({
			...base,
			/* background: "rgba(0, 0, 0, 0.05)", */
			borderRadius: 5,
			paddingLeft: '0.25em',
			paddingRight: '0.25em',
			fontSize: '12px',
			fontWeight: '400',
			borderColor: 'rgb(232, 232, 232)',
			borderWidth: 1,
			':focus-within': {
				borderColor: '#051E34',
				boxShadow: '0 0 0 0.5px #051E34'
			},
			minWidth: width && width,
			width: width && width,
			minHeight: height && height,
			height: height && height,
			cursor: 'pointer'
		}),
		container: base => ({
			...base
		}),
		valueContainer: base => ({
			...base,
			padding: '0 8px'
		}),
		dropdownIndicator: (base, state) => ({
			...base,
			transition: 'all .2s ease',
			padding: '0 3px',
			transform: state.selectProps.menuIsOpen ? 'scale(0.8) rotate(180deg)' : 'scale(0.8)'
		}),
		clearIndicator: provided => ({
			...provided,
			padding: '0',
			transform: 'scale(0.8)'
		}),
		indicatorSeparator: () => ({ display: 'none' }),
		option: (provided, state) => ({
			...provided,
			fontSize: '12px',
			cursor: 'pointer',
			padding: '6px 12px',
			textAlign: 'left',
			fontWeight: '400',
			textOverflow: 'ellipsis',
			whiteSpace: 'nowrap',
			overflow: 'hidden',
			color: state.isSelected ? 'white' : 'black',
			backgroundColor: state.isSelected ? '#051E34' : '',
			':hover': {
				backgroundColor: state.isSelected ? '#051E34' : 'var(--greyC)',
				transition: 'all .2s linear'
			}
		}),
		placeholder: defaultStyles => {
			return {
				...defaultStyles,
				color: 'var(--greyE)',
				fontWeight: '400',
				':focus': {
					color: 'var(--greyD)'
				}
			};
		},
		menu: base => ({
			...base,
			borderRadius: 5,
			marginTop: '0.5em',
			fontSize: '11px',
			zIndex: 9,
			minWidth: width && width,
			width: width && width
		}),
		menuList: base => ({
			...base,
			borderRadius: 5,
			maxHeight: '150px'
		})
	},
	searchBar: {
		control: (base, state) => ({
			...base,
			background: 'rgba(0, 0, 0, 0.05)',
			// match with the menu
			borderRadius: 30,
			// Overwrittes the different states of border
			border: 'none',
			// Removes weird border around container
			boxShadow: 'none',
			paddingLeft: 25,
			paddingRight: 30,
			fontSize: '13px',
			fontWeight: '400',
			minWidth: width && width,
			width: width && width,
			minHeight: height && height,
			height: height && height,
			cursor: 'pointer'
		}),
		option: (provided, state) => ({
			...provided,
			fontSize: '13px',
			cursor: 'pointer',
			fontWeight: '400',
			textOverflow: 'ellipsis',
			whiteSpace: 'nowrap',
			overflow: 'hidden',
			color: state.isSelected ? 'white' : 'black',
			backgroundColor: state.isSelected ? '#051E34' : '',
			':hover': {
				backgroundColor: state.isSelected ? '#051E34' : 'var(--greyC)',
				transition: 'all .2s linear'
			}
		}),
		placeholder: defaultStyles => {
			return {
				...defaultStyles,
				color: 'var(--greyE)',
				fontWeight: '400',
				':focus': {
					color: 'var(--greyD)'
				}
			};
		},
		menu: base => ({
			...base,
			// override border radius to match the box
			borderRadius: '0.5em',
			// kill the gap
			marginTop: '0.5em',
			fontSize: '11px',
			zIndex: 9
		}),
		menuList: base => ({
			...base
			// kill the white space on first and last option
		})
	}
});
export default SelectStyle;
