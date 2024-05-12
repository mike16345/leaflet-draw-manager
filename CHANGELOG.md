# Leaflet Draw Manager Change Log

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](http://keepachangelog.com/)
and this project adheres to [Semantic Versioning](http://semver.org/).


## [2.1.8] - released

### Added 

- Added ability to change circle attributes.

### Fixed

- Fixed issue where editing an arrow polyline would create an extra arrow.
- Fixed issue where the arrow color would not get updated when changing arrow polyline color.
- Fixed issue where the color of the dashed polyline would not get updated when changing a LineShape's color.


## [2.1.6] - released as 2.1.7 on NPM

### Fixed

- Display distances after dragging a polygon does not throw an exception anymore.

## [2.1.5] - released

### Fixed

- DragEnd event not firing for polygon

## [2.1.4] - released

### Added

- Added more events for dragging center of polygon/circle

## [2.1.2] - released

### Added

- Option to disable delete dashed polyline on finish edit.

### Changed

- Fill opacity is not changed when starting edit.

### Fixed

- Fixed switch edit for markers.

## [2.1.1] - released

### Changed

- Changed draggable to true by default.

### Fixed

- Fixed import bug

## [2.1.0] - released

### Added

- Added flag for displaying vertex numbers (default=disabled).
- Added class config in shape factory for more comfortable coding. See Docs for more info.
- Added option to set polygon drag icon.
- Added option to set vertex icon.
- Added option to set midpoint vertex icon.

### Changed

- Display line distances is disabled by default.

### Fixed

- LineShapes disappearing on start edit.
- Circle mousemove functionality on computer.
- Cancelling edit after dragging polygon works properly now.

## [2.0.0] - released

### Added

- Added ability to drag a polygon from the center.
- Added dashed polyline when drawing LineShapes. (Not for tablets)
- Added ability to change attributes for Polygons/Polylines.
- Added more custom events. View documentation for more details.

### Changed

- Trying to access a ShapeClass instance outside of ShapeFactory will now throw an error.
- Added/Updated some of the documentation.
- Made map event methods private.
- Changed the way events are set for custom behavior.
- getShapePositions is now the only way to get a shape's positions.

## [1.0.1] - released

### Added

- Added ability to add custom click callbacks for circles and markers.
- Added ability to add custom cancel edit callbacks for circles and markers.

### Changed

- Made id random so it does not conflict with someone else's id.

## [1.0.0] - released

### Added

- Draw Circles/Polygons/Markers/Polylines/ArrowPolylines/TextMarkers
- Edit all shapes mentioned above.
- Switch between edits smoothly.
- Cancel edit.
- Cancel edit on shape when switching edits when currently editing a shape.
- Delete shapes.
- Ability to set custom callbacks when drawing and editing shapes.
