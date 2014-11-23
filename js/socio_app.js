var night_base_map = 'astroza.i93m27gp';
var day_base_map = 'astroza.if918gm1'
var bus_stops = 'astroza.idpiljen';
var route_features = 'astroza.iffba1od';
var avl_server = 'http://avl.iccutal.cl';

function str_to_point(lonlat) {
	point = {};
	matches = lonlat.match(/POINT \((-?\d+\.\d+)\s(-?\d+\.\d+)\)/);
	point.longitude = matches[1];
	point.latitude = matches[2];
	return point;
}

function subscribe_to_device(device_id, name, color) {
	var marker = L.marker([0, 0], {
	    icon: L.mapbox.marker.icon({
	      'marker-color': color,
		  'marker-size': 'medium',
		  'marker-symbol': 'bus'
	    }),
		zIndexOffset: 50,
		title: name
	});
	marker.addTo(SocioApp.vehiclesLayer);
	marker.dir_arrow = L.arrow([0, 0], {zIndexOffset: 51});
	marker.dir_arrow.addTo(SocioApp.vehiclesLayer);
	
	SocioApp.vehicle_markers[device_id] = marker;
	var update_point = function(trackpoint) {
		pos = str_to_point(trackpoint.lonlat);
		marker.dir_arrow.options.angle = 360-trackpoint.direction;
		marker.dir_arrow.setLatLng(L.latLng(pos.latitude, pos.longitude));
		marker.setLatLng(L.latLng(pos.latitude, pos.longitude));
		marker.last_velocity = trackpoint.velocity;
		marker.last_report_datetime = trackpoint.gps_time;		
	};
	$.getJSON(avl_server+'/devices/'+device_id+'/trackpoints.json?callback=?', function(tp) { update_point(tp[0]); });
	var s = SocioApp.faye_client.subscribe('/device_trackpoints/'+device_id, update_point);
	SocioApp.subscriptions[device_id] = s;
}

function add_person(person) {
	var marker = L.marker([person.lat, person.lon], {
	    icon: L.mapbox.marker.icon({
	      'marker-color': '#98992e',
		  'marker-size': 'medium',
		  'marker-symbol': 'school'
	    })
	});
	marker.bindPopup(person.name + ': ' + person.status);
	marker.addTo(SocioApp.peopleLayer);
}

function people_interaction_init() {
	window.ret = $.getJSON(avl_server+'/people.json?callback=?', function(people) {
		$.each(people, function(key, person) { add_person(person); });
	});
	
	if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(function(pos) {
			// Firefox falla al serializar "pos", asi que hago un objeto nuevo
			person = {}
			person['lon'] = pos.coords.longitude;
			person['lat'] = pos.coords.latitude;
			person['name'] = localStorage.getItem('person_name');
			person['status'] = localStorage.getItem('person_status');
			
			SocioApp.faye_client.publish('/people', person);
			var marker = L.marker([pos.coords.latitude, pos.coords.longitude], {
			    icon: L.mapbox.marker.icon({
			      'marker-color': '#534f99',
			      'marker-size': 'medium',
			      'marker-symbol': 'pitch'
			    }),
				zIndexOffset: 1000,
			});
			marker.bindPopup('Este eres tu');
			marker.addTo(SocioApp.peopleLayer);
			marker.openPopup();
			// En Chrome la vista se va a la posicion del marker (puede ser porque es el primer marker, en Chrome)
			SocioApp.map.setView([-34.989246,-71.2367369]);
		});
	}
	SocioApp.faye_client.subscribe('/people', add_person);
}

function socio_init() {
	window.SocioApp = {}
	var now = new Date();
	var hours = now.getHours();
	var base_map = night_base_map;

	if(hours >= 7 && hours < 19) {
		base_map = day_base_map;
	}
	SocioApp.map = L.mapbox.map('map', base_map).setView([-34.989246,-71.2367369], 14);

	SocioApp.busStopsLayer = L.mapbox.featureLayer(bus_stops);
	SocioApp.vehiclesLayer = L.mapbox.featureLayer();
	SocioApp.peopleLayer = L.mapbox.featureLayer();
	SocioApp.routeLayer = L.mapbox.featureLayer(route_features);
	L.control.layers({
	}, {
	    'Paraderos': SocioApp.busStopsLayer.addTo(SocioApp.map),
	    'Buses': SocioApp.vehiclesLayer.addTo(SocioApp.map),
		'Ruta': SocioApp.routeLayer.addTo(SocioApp.map),
		'Gente': SocioApp.peopleLayer.addTo(SocioApp.map)
	}).addTo(SocioApp.map);

	// HACK: Texto de atribuiciones demasiado largo para pantallas pequenas 
	SocioApp.map.attributionControl._attributions = {};
	SocioApp.map.attributionControl.addAttribution("<a href='https://www.mapbox.com/about/maps/' target='_blank'>&copy; Mapbox</a>");
	SocioApp.map.attributionControl.addAttribution = function(dummy) {};
	
	// Algunas veces no se redimensiona el mapa cuando se rota la pantalla
	var update_screen = function(event) {
		window.scrollTo(0,0);
		$(SocioApp.map._container).resize();
	};
	$(window).on( "orientationchange", update_screen);
	

	SocioApp.faye_client = new Faye.Client(avl_server+'/push', {timeout: 120 });
	SocioApp.subscriptions = {}; // Prefiero un Object sobre un Array porque 
								 // itera exactamente el numero de elementos agregados en un $.each
	SocioApp.vehicle_markers = {};
	
	subscribe_to_device(1, "Bus UTalca", '#F50087');
	subscribe_to_device(2, "Bus de Apoyo", '#000080');
	
	people_interaction_init();
	
	//subscribe_to_device(3, "Bus Imaginario", '#000080');
}
socio_init();
