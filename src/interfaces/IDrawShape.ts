import { LatLng, LeafletEvent } from "leaflet";

interface IDrawShape<T> {
  startDrawing: () => void;
  stopDrawing: () => void;
  drawShape: (latLngs: LatLng[] | null) => void;
  editShape: (shape: T) => void;
  cancelEdit: () => void;
  redrawShape: () => void;
  deleteShape: () => void;
  initDrawEvents: () => void;
  disableDrawEvents: () => void;
}

interface IDrawVertices {
  clearVertices: () => void;
  clearMidpointVertices: () => void;
  clearAllVertices: () => void;
  handleOnDragEnd: ((latLngs: LatLng[]) => void) | null;
  handleContextClick: (() => void) | null;
  setHandleDragVertex: (handler: (e: LeafletEvent, index?: number) => void) => void;
}
export { IDrawShape, IDrawVertices };
