'use strict';

var Map = function() {
    this.zoom = 0;
    this.tileLength = 256;
    this.projectedRect = new Map.Rect(-20037508.34, -20037508.34, 20037508.34 * 2, 20037508.34 * 2);
};

// public

Map.prototype.coordinateToPixel = function(coordinate) {
    var projectedPoint = this.coordinateToProjectedPoint(coordinate);
    return this.projectedPointToPixel(projectedPoint);
};

Map.prototype.pixelToCoordinate = function(point) {
    var projectedPoint = this.pixelToProjectedPoint(point);
    return this.projectedPointToCoordinate(projectedPoint);
};

// protected

Map.prototype.projectedPointToCoordinate = function(projectedPoint) {
    projectedPoint.x /= 6378137.0;
    projectedPoint.y /= 6378137.0;

    var d = 180.0 / Math.PI;

    var coordinate = new Map.Coordinate(projectedPoint.x * d, (2 * Math.atan(Math.exp(projectedPoint.y)) - (Math.PI / 2)) * d);
    coordinate.latitude = Math.floor(coordinate.latitude * 1E6) / 1E6;
    coordinate.longitude = Math.floor(coordinate.longitude * 1E6) / 1E6;
    return coordinate;
};

Map.prototype.coordinateToProjectedPoint = function(coordinate) {
    var d = Math.PI / 180.0;
    var max = 85.0511287798;
    var lat = Math.max(Math.min(max, coordinate.latitude), -max);
    var x = coordinate.longitude * d;
    var y = lat * d;
    y = Math.log(Math.tan((Math.PI / 4) + (y / 2)));

    var projectedPoint = new Map.Point(x * 6378137.0, y * 6378137.0);
    return projectedPoint;
};

// private
Map.prototype.projectedPointToPixel = function(projectedPoint) {
    var metersPerPixel = this.metersPerPixel();
    var normalizedProjectedPoint = new Map.Point(projectedPoint.x + Math.abs(this.projectedRect.origin.x), projectedPoint.y + Math.abs(this.projectedRect.origin.y));
    var point = new Map.Point((normalizedProjectedPoint.x / metersPerPixel), (this.contentSize().height - (normalizedProjectedPoint.y / metersPerPixel)));
    return point;
};

Map.prototype.pixelToProjectedPoint = function(point) {
    var metersPerPixel = this.metersPerPixel();
    var normalizedProjectedPointx = point.x * metersPerPixel - Math.abs(this.projectedRect.origin.x);
    var normalizedProjectedPointy = ((this.contentSize().height - point.y) * metersPerPixel) - Math.abs(this.projectedRect.origin.y);
    var normalizedProjectedPoint = new Map.Point(normalizedProjectedPointx, normalizedProjectedPointy);

    return normalizedProjectedPoint;
};

Map.prototype.contentSize = function() {
    var contentLength = Math.pow(2, this.zoom) * this.tileLength;
    return new Map.Size(contentLength, contentLength);
};

Map.prototype.metersPerPixel = function() {
    return this.projectedRect.size.width / this.contentSize().width;
};

Map.Point = function(x, y) {
    this.x = x;
    this.y = y;
};

Map.ProjectedPoint = function(x, y) {
    this.x = x;
    this.y = y;
};

Map.Coordinate = function(latitude, longitude) {
    this.latitude = latitude;
    this.longitude = longitude;
};

Map.Size = function(width, height) {
    this.width = width;
    this.height = height;
};

Map.Rect = function(x, y, width, height) {
    this.origin = new Map.Point(x, y);
    this.size = new Map.Size(width, height);
};

module.exports = Map;
