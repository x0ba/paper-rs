/** The app's line icons (`paint_icon` in src/theme.rs), as SVG paths on its 16-unit grid. */

const circle = (cx: number, cy: number, r: number) => `M${cx - r} ${cy}a${r} ${r} 0 1 0 ${2 * r} 0a${r} ${r} 0 1 0 ${-2 * r} 0`;

const star = () => {
	const pts = Array.from({ length: 10 }, (_, i) => {
		const a = -Math.PI / 2 + (i * Math.PI) / 5;
		const r = i % 2 === 0 ? 6.5 : 2.8;
		return `${(8 + Math.cos(a) * r).toFixed(2)} ${(8.5 + Math.sin(a) * r).toFixed(2)}`;
	});
	return `M${pts.join('L')}Z`;
};

const wave = () => {
	const pts = Array.from({ length: 17 }, (_, i) => {
		const t = i / 16;
		return `${(2.5 + 11 * t).toFixed(2)} ${(8 - 3.2 * Math.sin(t * 2 * Math.PI)).toFixed(2)}`;
	});
	return `M${pts.join('L')}`;
};

export const ICONS = {
	pointer: 'M4.5 2.5L12.5 9.5L8.8 9.9L10.9 14L9.4 14.7L7.3 10.6L4.5 13Z',
	hand: 'M5.5 9V5M7.7 9V3M9.9 9V3.5M12 11V5.5M5.5 9V11L3.3 9M5.5 11A3.25 3.25 0 0 0 12 11',
	frame: 'M5 2V14M11 2V14M2 5H14M2 11H14',
	rect: 'M4.5 3.5H11.5A2 2 0 0 1 13.5 5.5V10.5A2 2 0 0 1 11.5 12.5H4.5A2 2 0 0 1 2.5 10.5V5.5A2 2 0 0 1 4.5 3.5Z',
	ellipse: circle(8, 8, 5.75),
	diamond: 'M8 1.8L14.2 8L8 14.2L1.8 8Z',
	polygon: 'M8 2L14 13.5H2Z',
	star: star(),
	line: 'M3 13L13 3',
	arrow: 'M3 13L13 3M7.5 3H13V8.5',
	pen: `M8 2L12.5 8.5L10 13.5H6L3.5 8.5ZM8 2V8${circle(8, 9, 1)}`,
	text: 'M3.5 4V3H12.5V4M8 3V13M6.3 13H9.7',
	sticky: 'M2.5 2.5H13.5V9.5L9.5 13.5H2.5ZM13.5 9.5H9.5V13.5',
	pencil: 'M11 2.2L13.8 5L5.5 13.3L2.2 13.8L2.7 10.5ZM9.3 3.9L12.1 6.7',
	eraser: 'M9.5 2.5L14 7L8 13H5L2 10ZM5.8 6.2L10.3 10.7M8 13H14',
	laser: `M2.5 13.5L9.5 6.5M11 1.6V0.3M14.4 5H15.7M13.4 2.6L14.3 1.7${circle(11, 5, 1.6)}`,
	ink: wave(),
	page: 'M3.5 1.8H9.5L12.5 4.8V14.2H3.5ZM9.5 1.8V4.8H12.5',
	grid: 'M3.5 2.5H6A1 1 0 0 1 7 3.5V6A1 1 0 0 1 6 7H3.5A1 1 0 0 1 2.5 6V3.5A1 1 0 0 1 3.5 2.5ZM10 2.5H12.5A1 1 0 0 1 13.5 3.5V6A1 1 0 0 1 12.5 7H10A1 1 0 0 1 9 6V3.5A1 1 0 0 1 10 2.5ZM3.5 9H6A1 1 0 0 1 7 10V12.5A1 1 0 0 1 6 13.5H3.5A1 1 0 0 1 2.5 12.5V10A1 1 0 0 1 3.5 9ZM10 9H12.5A1 1 0 0 1 13.5 10V12.5A1 1 0 0 1 12.5 13.5H10A1 1 0 0 1 9 12.5V10A1 1 0 0 1 10 9Z',
	chevronDown: 'M3.5 6L8 10.5L12.5 6',
	chevronRight: 'M6 3.5L10.5 8L6 12.5',
	chevronUp: 'M3.5 10L8 5.5L12.5 10',
	plus: 'M8 3V13M3 8H13',
	minus: 'M3 8H13',
	question: `${circle(8, 8, 6.5)}M6.4 6.4A1.6 1.6 0 1 1 8.6 7.9C8.1 8.2 8 8.5 8 9.2M8 11.4V11.5`,
	alignLeft: 'M2.5 1.5V14.5',
	alignHCenter: 'M8 1.5V14.5',
	alignRight: 'M13.5 1.5V14.5',
	alignTop: 'M1.5 2.5H14.5',
	alignVCenter: 'M1.5 8H14.5',
	alignBottom: 'M1.5 13.5H14.5',
	distributeH: 'M2 2V14M14 2V14',
	distributeV: 'M2 2H14M2 14H14',
	corners: 'M2.5 6V2.5H6M10 2.5H13.5V6M13.5 10V13.5H10M6 13.5H2.5V10',
	arrowRight: 'M2.5 8H13M9.5 4.5L13 8L9.5 11.5',
	arrowDown: 'M8 2.5V13M4.5 9.5L8 13L11.5 9.5',
	wrap: 'M2 4H12A3.25 3.25 0 0 1 12 10.5H5M7 8.5L5 10.5L7 12.5',
	spaceBetween: 'M1.5 3V13M14.5 3V13M4 8H12M6 6L4 8L6 10M10 6L12 8L10 10'
} as const;

export type IconName = keyof typeof ICONS;

/** Filled bars inside the align and distribute icons, as [x, y, w, h]. */
export const BARS: Partial<Record<IconName, [number, number, number, number][]>> = {
	alignLeft: [
		[4, 4, 8, 3],
		[4, 9, 5, 3]
	],
	alignHCenter: [
		[4, 4, 8, 3],
		[5.5, 9, 5, 3]
	],
	alignRight: [
		[4, 4, 8, 3],
		[7, 9, 5, 3]
	],
	alignTop: [
		[4, 4, 3, 8],
		[9, 4, 3, 5]
	],
	alignVCenter: [
		[4, 4, 3, 8],
		[9, 5.5, 3, 5]
	],
	alignBottom: [
		[4, 4, 3, 8],
		[9, 7, 3, 5]
	],
	distributeH: [[6.5, 4.5, 3, 7]],
	distributeV: [[4.5, 6.5, 7, 3]]
};
