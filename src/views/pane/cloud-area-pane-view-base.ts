import { undefinedIfNull } from '../../helpers/strict-type-checks';

import { BarPrice } from '../../model/bar';
import { Coordinate } from '../../model/coordinate';
import { PlotRowValueIndex } from '../../model/plot-data';
import { CloudPricedValue, PriceScale } from '../../model/price-scale';
import { SeriesPlotRow } from '../../model/series-data';
import { TimedValue } from '../../model/time-data';
import { TimeScale } from '../../model/time-scale';
import { IPaneRenderer } from '../../renderers/ipane-renderer';

import { SeriesPaneViewBase } from './series-pane-view-base';

export abstract class CloudAreaPaneViewBase<TSeriesType extends 'CloudArea' | 'BrokenArea', ItemType extends TimedValue & CloudPricedValue, TRenderer extends IPaneRenderer> extends SeriesPaneViewBase<TSeriesType, ItemType, TRenderer> {
	protected _convertToCoordinates(priceScale: PriceScale, timeScale: TimeScale, firstValue: number): void {
		timeScale.indexesToCoordinates(this._items, undefinedIfNull(this._itemsVisibleRange));
		priceScale.cloudPointsArrayToCoordinates(this._items, firstValue, undefinedIfNull(this._itemsVisibleRange));
	}

	/* protected override _makeValidImpl(): void {
		...

		this._itemsVisibleRange = visibleTimedValues(this._items, visibleBars, this._extendedVisibleRange);
		this._convertToCoordinates(priceScale, timeScale, firstValue.value);
	}*/

	protected _fillRawPoints(): void {
		this._items = this._series.bars().rows().map((row: SeriesPlotRow<TSeriesType>) => {
			const higherValue = row.value[PlotRowValueIndex.High] as BarPrice;
			const lowerValue = row.value[PlotRowValueIndex.Low] as BarPrice;
			return {
				time: row.index,
				higherPrice: higherValue,
				lowerPrice: lowerValue,
				x: NaN as Coordinate,
				higherY: NaN as Coordinate,
				lowerY: NaN as Coordinate,
			};
			// eslint-disable-next-line @typescript-eslint/no-explicit-any
		}) as any;
	}
}
