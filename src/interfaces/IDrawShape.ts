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

interface IDrawManagerEvents {
  onDrawStart?: Function | null;
  onEditStart?: Function | null;
  onCancelEdit?: Function | null;
  onEdit?: Function | null;
  onFinish?: Function | null;
  onAddPoint?: Function | null;
  onDeletePoint?: Function | null;
  onDeleteShape?: Function | null;
  onDragVertexStart?: Function | null;
  onDragVertex?: Function | null;
  onDragEndVertex?: Function | null;
  onDragMidpointVertexStart?: Function | null;
  onDragMidpointVertex?: Function | null;
  onDragEndMidpointVertex?: Function | null;
}

export { IDrawShape, IDrawVertices, IDrawManagerEvents };
