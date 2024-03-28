import { IShapeClassConfig } from "../../src/interfaces/IShapeClassConfig";
import dragImg from "../assets/drag.svg";
import L from "leaflet";

const polygonDragIcon = L.divIcon({
  className: "bg-white rounded-full p-1 ",
  html: `<img src=${dragImg} width=12 />`,
  iconSize: L.point(30, 30),
});

const vertexIcon = L.divIcon({
  className: "text-lg ",
  html: `Custom`,
  iconSize: L.point(30, 30),
});

const midvertexIcon = L.divIcon({
  className: "text-lg ",
  html: `midpoint`,
  iconSize: L.point(28, 28),
});

export const shapeClassConfig: IShapeClassConfig = {
  displayLineDistances: false,
  displayVertexNumbers: true,
  isTouchDevice: false,
  isDraggable: true,
  vertexIcon: vertexIcon,
  midpointIcon: midvertexIcon,
  polygonDragIcon: polygonDragIcon,
  events: {},
};
