# Leaflet Draw Manager Change Log

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](http://keepachangelog.com/)
and this project adheres to [Semantic Versioning](http://semver.org/).

## [2.0.0] - unreleased

### Added

- Added ability to drag a polygon from the center.
- Added dashed polyline when drawing LineShapes. (Not for tablets)
- Added ability to change attributes for Polygons/Polylines.
- Added more custom events. View documentation for more details.

### Added Back

-

### Changed

- Trying to access a ShapeClass instance outside of ShapeFactory will now throw an error.
- Added/Updated some of the documentation.
- Made map event methods private.
- Changed the way events are set for custom behavior.
- getShapePositions is now the only way to get a shape's positions.

### Fixed

- 

## [1.0.1] - released

### Added

- Added ability to add custom click callbacks for circles and markers.
- Added ability to add custom cancel edit callbacks for circles and markers.

### Added Back

-

### Changed

- Made id random so it does not conflict with someone else's id.

### Fixed

-

## [1.0.0] - released

### Added

- Draw Circles/Polygons/Markers/Polylines/ArrowPolylines/TextMarkers
- Edit all shapes mentioned above.
- Switch between edits smoothly.
- Cancel edit.
- Cancel edit on shape when switching edits when currently editing a shape.
- Delete shapes.
- Ability to set custom callbacks when drawing and editing shapes.
