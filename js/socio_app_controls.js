(function () {
	var MapButton = L.Control.extend({
    	options: {
        	position: 'topleft'
    	},
		initialize: function(img_src, class_name, position) {
			options = {position: position};
			L.Util.setOptions(this, options);
			this.img_src = img_src;
			this.class_name = class_name;
		},
		
    	onAdd: function (map) {
        	var container = L.DomUtil.create('div', this.class_name);
			container.innerHTML = "<img src=\""+this.img_src+"\" />";
        	return container;
    	}
	});
	
	var app_logo = new MapButton(img_url('socio_small'), 'custom_control', 'topleft');
	app_logo.addTo(SocioApp.map);
	$(app_logo._container).on('click', function(ev) {
		open_person_dialog();
		console.log("Test");
		ev.stopPropagation();
	});
	
	var VehicleInfo = L.Control.extend({
    	options: {
        	position: 'bottomleft'
    	},

    	onAdd: function (map) {
        	var container = L.DomUtil.create('div', 'vehicle_info');
			this._container = container;
			this.reset();
        	return container;
    	},

		showBusInfo: function(device_id, name, icon_url, velocity, report_age) {
			var bus_info = "";
			bus_info += "<img src=\""+icon_url+"\"></img>";
			bus_info += "<h4>"+name+"</h4>";
			bus_info += "<h5>Último reporte:</h5>";
			bus_info += "<ul>";
			bus_info += "<li>Hace: "+report_age+"</li>";
			bus_info += "<li>Velocidad: "+Math.floor(velocity)+" km/h</li>";
			bus_info += "</ul>";
			this._container.innerHTML = bus_info;
		},
		
		reset: function() {
			this._container.innerHTML = "<h4 class=\"info\">Para mayor información</h4><p>Toca un bus</p>";
		}
	});
	
	var info = new VehicleInfo();
	info.addTo(SocioApp.map);
	$.each(SocioApp.vehicle_markers, function(idx, marker) {
		var show_bus = function(center) {
			info.showBusInfo(idx, marker.options.title, marker._icon.src, marker.last_velocity, time_elapsed(marker.last_report_datetime));
			if(center)
				SocioApp.map.setView(marker.getLatLng());
		} 
		var busButton = new MapButton(marker._icon.src, 'custom_control bus_button', 'bottomright');
		busButton.addTo(SocioApp.map);
		$(busButton._container).on('click', function(ev) {
			show_bus(true);
			ev.stopPropagation();
		});
		
		marker.on('click', function (e) { 
			show_bus(false);
		});
	});
	SocioApp.map.on('click', function(e) { info.reset(); });
})();
