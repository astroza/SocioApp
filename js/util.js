function img_url(name) {
	return 'img/'+name+'.png';
}

function time_elapsed(report_gps_time)
{
    var elapsed_seconds = (Date.now() - Date.parse(report_gps_time))/1000;
    var time_unit;
    var time_amount;
    if(elapsed_seconds < 60) {
        time_unit = "segundos";
        time_amount = elapsed_seconds;
    } else if(elapsed_seconds < 3600) {
        time_unit = "minutos";
        time_amount = elapsed_seconds/60;
    } else if(elapsed_seconds < 86400) {
        time_unit = "horas";
        time_amount = elapsed_seconds/3600;
    } else {
        time_unit = "dias";
        time_amount = elapsed_seconds/86400;
    }
    time_amount = Math.floor(time_amount);
	return time_amount + " " + time_unit;
}

// MIT-licensed code by Benjamin Becquet
// https://github.com/bbecquet/Leaflet.PolylineDecorator
L.RotatedMarker = L.Marker.extend({
  options: { angle: 0 },
  _setPos: function(pos) {
    L.Marker.prototype._setPos.call(this, pos);
    if (L.DomUtil.TRANSFORM) {
      // use the CSS transform rule if available
      this._icon.style[L.DomUtil.TRANSFORM] += ' rotate(' + this.options.angle + 'deg)';
    } else if (L.Browser.ie) {
      // fallback for IE6, IE7, IE8
      var rad = this.options.angle * L.LatLng.DEG_TO_RAD,
      costheta = Math.cos(rad),
      sintheta = Math.sin(rad);
      this._icon.style.filter += ' progid:DXImageTransform.Microsoft.Matrix(sizingMethod=\'auto expand\', M11=' +
        costheta + ', M12=' + (-sintheta) + ', M21=' + sintheta + ', M22=' + costheta + ')';
    }
  }
});

L.rotatedMarker = function(pos, options) {
    return new L.RotatedMarker(pos, options);
};

L.arrow = function(pos, options) {
	options.clickable = false;
	options.draggable = false;
	options.icon = L.icon({
      iconSize: [20, 20],
	  iconAnchor: [0, 50],
	  iconUrl: img_url('arrow')
    });
	return new L.RotatedMarker(pos, options);
}