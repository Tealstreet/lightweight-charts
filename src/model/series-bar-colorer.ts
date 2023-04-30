import { ensure, ensureNotNull } from '../helpers/assertions';

import { PlotRowValueIndex } from './plot-data';
import { Series } from './series';
import { SeriesPlotRow } from './series-data';
import {
	AreaStyleOptions,
	BarStyleOptions,
	BaselineStyleOptions,
	BrokenAreaStyleOptions,
	CandlestickStyleOptions,
	CloudAreaStyleOptions,
	HistogramStyleOptions,
	LineStyleOptions,
	SeriesOptionsMap,
	SeriesType,
} from './series-options';
import { TimePointIndex } from './time-data';

export interface PrecomputedBars {
	value: SeriesPlotRow;
	previousValue?: SeriesPlotRow;
}

export interface CommonBarColorerStyle {
	barColor: string;
}

export interface LineStrokeColorerStyle {
	lineColor: string;
}

export interface LineBarColorerStyle extends CommonBarColorerStyle, LineStrokeColorerStyle {
}

export interface HistogramBarColorerStyle extends CommonBarColorerStyle {
}
export interface AreaFillColorerStyle {
	topColor: string;
	bottomColor: string;
}
export interface CloudAreaBarColorerStyle extends CommonBarColorerStyle {
	positiveColor: string;
	negativeColor: string;
	higherLineColor: string;
	lowerLineColor: string;
}
export interface AreaBarColorerStyle extends CommonBarColorerStyle, AreaFillColorerStyle, LineStrokeColorerStyle {
}
export interface BrokenAreaBarColorerStyle extends CommonBarColorerStyle, LineStrokeColorerStyle {
}

export interface BaselineStrokeColorerStyle {
	topLineColor: string;
	bottomLineColor: string;
}

export interface BaselineFillColorerStyle {
	topFillColor1: string;
	topFillColor2: string;
	bottomFillColor2: string;
	bottomFillColor1: string;
}

export interface BaselineBarColorerStyle extends CommonBarColorerStyle, BaselineStrokeColorerStyle, BaselineFillColorerStyle {
}

export interface BarColorerStyle extends CommonBarColorerStyle {
}

export interface CandlesticksColorerStyle extends CommonBarColorerStyle {
	barBorderColor: string;
	barWickColor: string;
}

export interface BarStylesMap {
	Bar: BarColorerStyle;
	Candlestick: CandlesticksColorerStyle;
	Area: AreaBarColorerStyle;
	Baseline: BaselineBarColorerStyle;
	CloudArea: CloudAreaBarColorerStyle;
	BrokenArea: BrokenAreaBarColorerStyle;
	Line: LineBarColorerStyle;
	Histogram: HistogramBarColorerStyle;
}

type FindBarFn = (barIndex: TimePointIndex, precomputedBars?: PrecomputedBars) => SeriesPlotRow | null;

type StyleGetterFn<T extends SeriesType> = (
	findBar: FindBarFn,
	barStyle: ReturnType<Series<T>['options']>,
	barIndex: TimePointIndex,
	precomputedBars?: PrecomputedBars
) => BarStylesMap[T];

type BarStylesFnMap = {
	[T in keyof SeriesOptionsMap]: StyleGetterFn<T>;
};

const barStyleFnMap: BarStylesFnMap = {
	// eslint-disable-next-line @typescript-eslint/naming-convention
	Bar: (findBar: FindBarFn, barStyle: BarStyleOptions, barIndex: TimePointIndex, precomputedBars?: PrecomputedBars): BarColorerStyle => {
		const upColor = barStyle.upColor;
		const downColor = barStyle.downColor;

		const currentBar = ensureNotNull(findBar(barIndex, precomputedBars)) as SeriesPlotRow<'Bar'>;
		const isUp = ensure(currentBar.value[PlotRowValueIndex.Open]) <= ensure(currentBar.value[PlotRowValueIndex.Close]);

		return {
			barColor: currentBar.color ?? (isUp ? upColor : downColor),
		};
	},
	// eslint-disable-next-line @typescript-eslint/naming-convention
	Candlestick: (findBar: FindBarFn, candlestickStyle: CandlestickStyleOptions, barIndex: TimePointIndex, precomputedBars?: PrecomputedBars): CandlesticksColorerStyle => {
		const upColor = candlestickStyle.upColor;
		const downColor = candlestickStyle.downColor;
		const borderUpColor = candlestickStyle.borderUpColor;
		const borderDownColor = candlestickStyle.borderDownColor;

		const wickUpColor = candlestickStyle.wickUpColor;
		const wickDownColor = candlestickStyle.wickDownColor;

		const currentBar = ensureNotNull(findBar(barIndex, precomputedBars)) as SeriesPlotRow<'Candlestick'>;
		const isUp = ensure(currentBar.value[PlotRowValueIndex.Open]) <= ensure(currentBar.value[PlotRowValueIndex.Close]);

		return {
			barColor: currentBar.color ?? (isUp ? upColor : downColor),
			barBorderColor: currentBar.borderColor ?? (isUp ? borderUpColor : borderDownColor),
			barWickColor: currentBar.wickColor ?? (isUp ? wickUpColor : wickDownColor),
		};
	},
	// eslint-disable-next-line @typescript-eslint/naming-convention
	Area: (findBar: FindBarFn, areaStyle: AreaStyleOptions, barIndex: TimePointIndex, precomputedBars?: PrecomputedBars): AreaBarColorerStyle => {
		const currentBar = ensureNotNull(findBar(barIndex, precomputedBars)) as SeriesPlotRow<'Area'>;
		return {
			barColor: currentBar.lineColor ?? areaStyle.lineColor,
			lineColor: currentBar.lineColor ?? areaStyle.lineColor,
			topColor: currentBar.topColor ?? areaStyle.topColor,
			bottomColor: currentBar.bottomColor ?? areaStyle.bottomColor,
		};
	},
	// eslint-disable-next-line @typescript-eslint/naming-convention
	BrokenArea: (findBar: FindBarFn, brokenAreaStyle: BrokenAreaStyleOptions, barIndex: TimePointIndex, precomputedBars?: PrecomputedBars): BrokenAreaBarColorerStyle => {
		const currentBar = ensureNotNull(findBar(barIndex, precomputedBars)) as SeriesPlotRow<'BrokenArea'>;
		return {
			barColor: currentBar.color ?? brokenAreaStyle.color,
			lineColor: brokenAreaStyle.strokeColor,
		};
	},
	// eslint-disable-next-line @typescript-eslint/naming-convention
	CloudArea: (findBar: FindBarFn, cloudAreaStyle: CloudAreaStyleOptions, barIndex: TimePointIndex, precomputedBars?: PrecomputedBars): CloudAreaBarColorerStyle => {
		const currentBar = ensureNotNull(findBar(barIndex, precomputedBars)) as SeriesPlotRow<'Baseline'>;
		const isAboveBaseline = currentBar.value[PlotRowValueIndex.Close] >= currentBar.value[PlotRowValueIndex.Open];
		return {
			barColor: isAboveBaseline ? cloudAreaStyle.positiveColor : cloudAreaStyle.negativeColor,
			negativeColor: cloudAreaStyle.negativeColor,
			positiveColor: cloudAreaStyle.positiveColor,
			higherLineColor: cloudAreaStyle.higherLineColor,
			lowerLineColor: cloudAreaStyle.lowerLineColor,
		};
	},
	// eslint-disable-next-line @typescript-eslint/naming-convention
	Baseline: (findBar: FindBarFn, baselineStyle: BaselineStyleOptions, barIndex: TimePointIndex, precomputedBars?: PrecomputedBars): BaselineBarColorerStyle => {
		const currentBar = ensureNotNull(findBar(barIndex, precomputedBars)) as SeriesPlotRow<'Baseline'>;
		const isAboveBaseline = currentBar.value[PlotRowValueIndex.Close] >= baselineStyle.baseValue.price;

		return {
			barColor: isAboveBaseline ? baselineStyle.topLineColor : baselineStyle.bottomLineColor,
			topLineColor: currentBar.topLineColor ?? baselineStyle.topLineColor,
			bottomLineColor: currentBar.bottomLineColor ?? baselineStyle.bottomLineColor,
			topFillColor1: currentBar.topFillColor1 ?? baselineStyle.topFillColor1,
			topFillColor2: currentBar.topFillColor2 ?? baselineStyle.topFillColor2,
			bottomFillColor1: currentBar.bottomFillColor1 ?? baselineStyle.bottomFillColor1,
			bottomFillColor2: currentBar.bottomFillColor2 ?? baselineStyle.bottomFillColor2,
		};
	},
	// eslint-disable-next-line @typescript-eslint/naming-convention
	Line: (findBar: FindBarFn, lineStyle: LineStyleOptions, barIndex: TimePointIndex, precomputedBars?: PrecomputedBars): LineBarColorerStyle => {
		const currentBar = ensureNotNull(findBar(barIndex, precomputedBars)) as SeriesPlotRow<'Line'>;

		return {
			barColor: currentBar.color ?? lineStyle.color,
			lineColor: currentBar.color ?? lineStyle.color,
		};
	},
	// eslint-disable-next-line @typescript-eslint/naming-convention
	Histogram: (findBar: FindBarFn, histogramStyle: HistogramStyleOptions, barIndex: TimePointIndex, precomputedBars?: PrecomputedBars): HistogramBarColorerStyle => {
		const currentBar = ensureNotNull(findBar(barIndex, precomputedBars)) as SeriesPlotRow<'Histogram'>;
		return {
			barColor: currentBar.color ?? histogramStyle.color,
		};
	},
};

export class SeriesBarColorer<T extends SeriesType> {
	private _series: Series<T>;
	private readonly _styleGetter: typeof barStyleFnMap[T];

	public constructor(series: Series<T>) {
		this._series = series;
		this._styleGetter = barStyleFnMap[series.seriesType()];
	}

	public barStyle(barIndex: TimePointIndex, precomputedBars?: PrecomputedBars): BarStylesMap[T] {
		// precomputedBars: {value: [Array BarValues], previousValue: [Array BarValues] | undefined}
		// Used to avoid binary search if bars are already known
		return this._styleGetter(this._findBar, this._series.options(), barIndex, precomputedBars);
	}

	private _findBar = (barIndex: TimePointIndex, precomputedBars?: PrecomputedBars): SeriesPlotRow | null => {
		if (precomputedBars !== undefined) {
			return precomputedBars.value;
		}

		return this._series.bars().valueAt(barIndex);
	};
}
