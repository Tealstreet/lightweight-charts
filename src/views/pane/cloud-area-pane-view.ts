import { ChartModel } from '../../model/chart-model';
import { Series } from '../../model/series';
import { CloudLineItem, PaneRendererCloudArea, PaneRendererCloudAreaData } from '../../renderers/cloud-area-renderer';
import { CompositeRenderer } from '../../renderers/composite-renderer';
import { LineStrokeItem, PaneRendererLine, PaneRendererLineData } from '../../renderers/line-renderer';

import { CloudAreaPaneViewBase } from './cloud-area-pane-view-base';

export class SeriesCloudAreaPaneView extends CloudAreaPaneViewBase<'CloudArea', CloudLineItem, CompositeRenderer> {
	protected readonly _renderer: CompositeRenderer = new CompositeRenderer();
	private readonly _cloudAreaRenderer: PaneRendererCloudArea = new PaneRendererCloudArea();
	private readonly _higherRenderer: PaneRendererLine = new PaneRendererLine();
	private readonly _lowerRenderer: PaneRendererLine = new PaneRendererLine();

	public constructor(series: Series<'CloudArea'>, model: ChartModel) {
		super(series, model, false);
		this._renderer.setRenderers([this._cloudAreaRenderer, this._higherRenderer, this._lowerRenderer]);
	}

	protected _prepareRendererData(): void {
		const areaStyleProperties = this._series.options();

		const cloudRendererData: PaneRendererCloudAreaData = {
			items: this._items,
			positiveColor: areaStyleProperties.positiveColor,
			negativeColor: areaStyleProperties.negativeColor,
			visibleRange: this._itemsVisibleRange,
			barWidth: this._model.timeScale().barSpacing(),
		};
		this._cloudAreaRenderer.setData(cloudRendererData);

		const higherLineData: LineStrokeItem[] = [];
		const lowerLineData: LineStrokeItem[] = [];
		for (let i = 0; i < this._items.length; i++) {
			higherLineData.push({
				lineColor: areaStyleProperties.higherLineColor,
				time: this._items[i].time,
				price: this._items[i].higherPrice,
				x: this._items[i].x,
				y: this._items[i].higherY,
			});
			lowerLineData.push({
				lineColor: areaStyleProperties.lowerLineColor,
				time: this._items[i].time,
				price: this._items[i].lowerPrice,
				x: this._items[i].x,
				y: this._items[i].lowerY,
			});
		}

		const higherRendererLineData: PaneRendererLineData = {
			items: higherLineData,
			lineStyle: areaStyleProperties.higherLineStyle,
			lineType: areaStyleProperties.higherLineType,
			lineWidth: areaStyleProperties.higherLineWidth,
			visibleRange: this._itemsVisibleRange,
			barWidth: this._model.timeScale().barSpacing(),
		};
		this._higherRenderer.setData(higherRendererLineData);

		const lowerRendererLineData: PaneRendererLineData = {
			items: lowerLineData,
			lineStyle: areaStyleProperties.lowerLineStyle,
			lineType: areaStyleProperties.lowerLineType,
			lineWidth: areaStyleProperties.lowerLineWidth,
			visibleRange: this._itemsVisibleRange,
			barWidth: this._model.timeScale().barSpacing(),
		};
		this._lowerRenderer.setData(lowerRendererLineData);
	}
}
