// ==UserScript==
// @id             iitc-plugin-circle-to-point@circletopoint
// @name           IITC plugin: Circle to point
// @category       Portal Info
// @version        0.1.1.20161212.140000
// @namespace      
// @updateURL      
// @downloadURL    
// @description    Allows to draw a circle.
// @include        https://www.ingress.com/intel*
// @include        http://www.ingress.com/intel*
// @match          https://www.ingress.com/intel*
// @match          http://www.ingress.com/intel*
// @include        https://www.ingress.com/mission/*
// @include        http://www.ingress.com/mission/*
// @match          https://www.ingress.com/mission/*
// @match          http://www.ingress.com/mission/*
// @grant          none
// ==/UserScript==


//libelle selectionnable
//couleur selectionnable

function wrapper(plugin_info) {
// ensure plugin framework is there, even if iitc is not yet loaded
if(typeof window.plugin !== 'function') window.plugin = function() {};

//PLUGIN AUTHORS: writing a plugin outside of the IITC build environment? if so, delete these lines!!
//(leaving them in place might break the 'About IITC' page or break update checks)
plugin_info.buildName = 'circletopoint';
plugin_info.dateTimeVersion = '20160301.140000';
plugin_info.pluginId = 'circle-to-point';
//END PLUGIN AUTHORS NOTE



// PLUGIN START ////////////////////////////////////////////////////////



// use own namespace for plugin
window.plugin.circleToPoint = function() {};

window.plugin.circleToPoint.NAME_WIDTH = 150;
window.plugin.circleToPoint.NAME_HEIGHT = 80;
window.plugin.circleToPoint.labels = [];
window.plugin.circleToPoint.couples =  [];
window.plugin.circleToPoint.circles =  [];
window.plugin.circleToPoint.couleurs = ['#8b0000', '#5e4800', '#013220', '#808000', '#ff8c00', '#ff5050', '#ffd54a', '#37fbb3', '#408000', '#ffaf4d'];

window.plugin.circleToPoint.save = function() {
	var result = '';
	
	for (i = 0; i < window.plugin.circleToPoint.couples.length; i ++) {
		var couple = window.plugin.circleToPoint.couples[i];
		result += '<div>';
		result += 'Cercle ' + i;
		result += '<input id="save_circle_' + i + '" type="text" value="';
		result += couple['Nom'];
		result += '" /></div>';
	}

	dialog({
		html: result,
		title: 'Sauvegarde des zone',
		closeCallback : window.plugin.circleToPoint.saveNames
	});
}

window.plugin.circleToPoint.addDistance = function() {
	var plusIcon = 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABQAAAAUCAYAAACNiR0NAAAABmJLR0QA/wD/AP+gvaeTAAAACXBIWXMAAAsTAAALEwEAmpwYAAAAB3RJTUUH4AMDFDoWRdcEmAAAAEVpVFh0Q29tbWVudAAAAAAAQ1JFQVRPUjogZ2QtanBlZyB2MS4wICh1c2luZyBJSkcgSlBFRyB2NjIpLCBxdWFsaXR5ID0gOTAKZ51HQAAAAl9JREFUOMullD1olEEQhp93v/vxYs6LMYjG+EMQVBSioCEIKiKCJGgjWAgWWqiNlYidgoVgGYvYpLYRC1EkYiGIVRJFOzUhkYBefkiIXPTOeN+MxZmz8ouYhSmWnXl2duedgaR1LEVUzGzQ43Bb/eGLHhWGUy+bbwJKsOQV+qOHOhq+6Hl6moHgehqeJQHDssRxcv7CNjIX5wGk8DExgeV4Pu15AFp+B7g+rAioOQpCeJNbLSCsDMhXCqwSxLVtoZpZGdAXvECz14Ezp0oTSf6phltRY3mDPfPAAcCARbmGcR7YRbsXquRpBqoAipdVRaWsjypFbeoME9odiqwl73DU8T71y72MWAuKJcyr2b5Mj+9zAK+b/shP4XSI/SHBMcgBBVXCZhmHFdPNlF207eoAv8CiPpNx1T9qAZgVmg4eBjIWPSlf+jGo9LX0+mqbtaeGw/44th4v2wmKoEEw89q1azC1h2/qEHRR8i5fpIx80rcy62ACOexqeSNASgmvui+lnT2XXr94KN4RYp21q3aZDhk/XYxKPm8IwTqHVs1rZzDfg/nxLPpamUzsv/AudcU74l5u6bvvpYEKg3qv++G9unzOu6xk2/QZ9EnYK/eG2ezBVGLJFtjiOMpLpCGk9dpuxHdj6K0X4XrU6Zv8SG4k+/z7+crbvwIlYIwtAN7kICHT2NLxkp/diYeAoTIVEoeDO1C0VgA1yWuUML6sDpOahEmtBqCpJrQ00dj/AP8UqUhOCM9ZAGhbaBz9H2BdPj5FjkaBCRlDI2dmSit5MtFefdBJEVWjJ95tnf8y4n8BOjr2aiTHKE0AAAAASUVORK5CYII=';
	var moinsIcon = 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABQAAAAUCAYAAACNiR0NAAAABmJLR0QA/wD/AP+gvaeTAAAACXBIWXMAAAsTAAALEwEAmpwYAAAAB3RJTUUH4AMDFQYAwzKiAQAAAMdJREFUOMvtkr8KglAUh3/WvaKSNghuDkKugVPQC/UArj6IY+/T2pAt4qwIiuE/5DREIVpYtPrBWS7nfJzf4QIzMz8jDB/OrmsvVXWFogCaBhAEQBQBRXkUY6/etixvW8+79ufZULhxnCM3jD2IJrepiU4AdgDoozAPgpZH0XQ2IrSy3PRlb4UX30cXx1/di5vmKMZIGIsiq98dd7ggAIkxNinMLOuwsO31M1ZXVajTFFWSoM0yEBG4pkHSdXBdzxGG89ee+Zc70nk9scWpCWkAAAAASUVORK5CYII=';
	var saveIcon = 'data:image/png;base64,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';
	var exportIcon = 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABAAAAAQCAYAAAAf8/9hAAABf0lEQVR42mNkAAJlZeUAXl7eiUCmLBAzMmCCL79+/Wq6du1aN7oEo5CQkIScnNz9nz9/Tn737t22/0CArkhCQqKDiYnJAmhIPdCQJhQDJCUlPcTFxTfcvXuX8/Pnz/+x2M6gq6u7hZmZ2RvERjcEZIAn0IA1Fy5c4GbAAdTU1Mq5uLg6YPwfP37k37hxYxLRBrCzszMC1YQAXaHAyclpxsbGpg1Ur0W0AcgAGF6JwHCrAapXpr8BCgoKgdzc3NasrKyBRBnAw8PDCcSGsLQhKipaDwwHVyDzHlEGaGtrzwPalojFMf9///7de+/evXK8BgDjfyvQRi9cXnr16pUNXgO0tLSmAqMsC4veP8C0UAVMC914DeDg4GAGJiBFWBhISUn1srCwWABTe/rFixfXw8KAYFKGARkZGWcBAQFeoCHFQAttwQbAMhMwjU9+//491swEA8AA5QKq7/z379/Fy5cvxzLAnKakpBTAx8eHLzvD/Q7UvOvx48fxQMvegAQAZUy9t0q+wJkAAAAASUVORK5CYII=';
	var importIcon = 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABAAAAAQCAYAAAAf8/9hAAABkElEQVR42mNkAAJlZeUAXl7eiUCmLBAzMmCCL79+/Wq6du1aN7oEo5CQkIScnNz9nz9/Tn737t22/0CArkhCQqKDiYnJAmhIPdCQJhQDJCUlPcTFxTfcvXuX8/Pnz/+x2M6gq6u7hZmZ2RvERjcEZIAn0IA1Fy5c4GbAAdTU1Mq5uLg6YHyga/OvX78+iWgD2NnZGYFqQoCuUODk5DRjY2PTBqrXItoAZAAMr0RguNUA1SvT1wBgVKcAY2kTMLq9STKAn5+fG2jrPKD/w758+ZIJpOWA4RD/6tUr12fPnl3DawAw/lWAcusZGRl1sJj9/+XLl6Z4DdDR0VnGwsISictbr1+/9sJrgLCwsKS0tPRqYCq0xqL/z4sXL4wIhgEwAbEqKir2s7KyZn38+DHyz58/N4Hpgu/9+/c33759+5KopAyNPv8PHz4cAsZAqICAQCnQQlVwLMAyEzCNTwaaijUzwQDQFVxA9Z3//v27ePny5ViwASBCSUkpgI+PD192hvsbqHnX48eP44GWvQEJAAAbJ82eLi+veAAAAABJRU5ErkJggg==';
	
	var div = '<div id="circle-distance-block">';
	div += '<span ondblclick="window.plugin.circleToPoint.removeCircleLocation()" title="Double click to remove the last circle"><img src="' + moinsIcon + '"/></span>';
	div += '  <span id="circle-distance" title="Distance between flags" />  ';
	div += '<span ondblclick="window.plugin.circleToPoint.addCircleLocation()" title="Double click to add a new circle"><img src="' + plusIcon + '"/></span>';
	div += '<span ondblclick="window.plugin.circleToPoint.save()" title="Double click to save"><img src="' + saveIcon + '"/></span>';
	div += '<span ondblclick="window.plugin.circleToPoint.optCopy()" title="Export"><img src="' + exportIcon + '"/></span>';
	div += '<span ondblclick="window.plugin.circleToPoint.optPaste()" title="Import"><img src="' + importIcon + '"/></span>';
	div += '</div>';

	$('#toolbox').before(div);
	window.plugin.circleToPoint.updateDistance(-1);
};

window.plugin.circleToPoint.formatDistance = function(dist) {
	if (dist >= 10000) {
		dist = Math.round(dist/1000)+' km';
	} else if (dist >= 1000) {
		dist = Math.round(dist/100)/10+' km';
	} else {
		dist = Math.round(dist)+' m';
	}

	return dist;
}

window.plugin.circleToPoint.updateDistance = function(index) {
	if (window.plugin.circleToPoint.couples[index]) {
		var couple = window.plugin.circleToPoint.couples[index]
		var ll = couple['Circle'].getLatLng();

		var dist = couple['Point'].getLatLng().distanceTo(ll);
		var formattedDist = window.plugin.circleToPoint.formatDistance(dist);

		$('#circle-distance')
			.text(' ' + couple['Nom'] + '(' + index + ')' + ' Distance: ' + formattedDist + ' ');
	} else {
		$('#circle-distance').text('Location not set');
	}
};

window.plugin.circleToPoint.traceCircle = function(couple, index) {
	var coord = couple['Point'].getLatLng();
	var dist = coord.distanceTo(couple['Circle'].getLatLng());
	var formattedDist = window.plugin.circleToPoint.formatDistance(dist);

	var latlngs = new Array(couple['Point'].getLatLng(), couple['Circle'].getLatLng());
    var currentAxe = new L.GeodesicPolyline(latlngs, {
            stroke: true,
            color: window.plugin.circleToPoint.couleurs[index%10],
            weight: 3,
            fill: true,
            fillColor: null //same as color by default
        });    

	var currentPointCircle = L.geodesicCircle(coord, dist, {
		  fill: true,
		  color: window.plugin.circleToPoint.couleurs[index%10],
		  weight: 3,
		  dashArray: "10,10",
		  clickable: false });
	
	var label;
	if (window.plugin.circleToPoint.labels[index]) {
		label = window.plugin.circleToPoint.labels[index];
		map.removeLayer(label);
	}
	label = L.marker(coord, {
		icon: L.divIcon({
			className: 'plugin-circle-to-point-distance',
			iconAnchor: [window.plugin.circleToPoint.NAME_WIDTH / 2,0],
			iconSize: [window.plugin.circleToPoint.NAME_WIDTH, window.plugin.circleToPoint.NAME_HEIGHT],
			html: couple['Nom'] + '(' + index + ')<br/> ' + formattedDist
		}),
		guid: 'label_' + index,
	});

	map.addLayer(label);
	window.plugin.circleToPoint.labels[index] = label;
		  
	map.addLayer(currentPointCircle);
	window.plugin.circleToPoint.circles.push(currentPointCircle);
	
	map.addLayer(currentAxe);
	window.plugin.circleToPoint.circles.push(currentAxe);
}

window.plugin.circleToPoint.traceCircles = function() {
	//Nettoyage de la carte
	while (window.plugin.circleToPoint.circles.length > 0) {
		var currentPointCircle = window.plugin.circleToPoint.circles.pop();
		map.removeLayer(currentPointCircle);
	}
	window.plugin.circleToPoint.couples.forEach(window.plugin.circleToPoint.traceCircle);
}

window.plugin.circleToPoint.removeCircleLocation = function() {
	if (window.plugin.circleToPoint.couples.length > 0) {
		var couple = window.plugin.circleToPoint.couples.pop();
		var label = window.plugin.circleToPoint.labels.pop();
		map.removeLayer(couple['Point']);
		map.removeLayer(couple['Circle']);
		map.removeLayer(label);
		window.plugin.circleToPoint.traceCircles();
	}
}

window.plugin.circleToPoint.addMarkers = function(point_latlng, circle_latlng, nom) {
	var index = window.plugin.circleToPoint.couples.length;
	var currentPointLocMarker = createGenericMarker (point_latlng, window.plugin.circleToPoint.couleurs[window.plugin.circleToPoint.couples.length%10],{draggable:true, 'id':index});
	
	var iconUrl = 'https://upload.wikimedia.org/wikipedia/commons/d/d7/Green_dot_7px.gif';
    var iconSize = 10;
    var opacity = 1.0;
	var circleIcon = L.icon({
          iconUrl: iconUrl,
          iconSize: [iconSize,iconSize],
          iconAnchor: [iconSize/2,iconSize/2]
        });
    var currentCircleLocMarker = L.marker(circle_latlng, {icon: circleIcon, draggable: true, 'id':index});
 	
    currentPointLocMarker.on('drag', function(e) {
		window.plugin.circleToPoint.updateDistance(e.target.options.id);
	});
	currentCircleLocMarker.on('drag', function(e) {
		window.plugin.circleToPoint.updateDistance(e.target.options.id);
	});

	currentPointLocMarker.on('dragend', function(e) {
		window.plugin.circleToPoint.traceCircles();
	});
	currentCircleLocMarker.on('dragend', function(e) {
		window.plugin.circleToPoint.traceCircles();
	});	
	
	map.addLayer(currentPointLocMarker);
	map.addLayer(currentCircleLocMarker);
	var couple = [];
	couple['Point'] = currentPointLocMarker;
	couple['Circle'] = currentCircleLocMarker;
	couple['Nom'] = nom;
	window.plugin.circleToPoint.couples.push(couple);
}

window.plugin.circleToPoint.saveNames = function() {
	var elt;
	var couple = [];
	// Maj des titres
	for (i = 0; i < window.plugin.circleToPoint.couples.length; i ++)
	{
		elt = document.getElementById('save_circle_' + i);
		couple = window.plugin.circleToPoint.couples[i];
		if (elt) couple['Nom'] = elt.value;	
		window.plugin.circleToPoint.couples[i] = couple;
	}

	var result = '{"list":[';
	for (i = 0; i < window.plugin.circleToPoint.couples.length; i ++)
	{
		var couple = window.plugin.circleToPoint.couples[i];
		if (i > 0) result += ',';
		result += '{"point":';
		result += JSON.stringify(couple['Point'].getLatLng());
		result += ', "circle":';
		result += JSON.stringify(couple['Circle'].getLatLng());
		result += ', "nom":';
		result += JSON.stringify(couple['Nom']);
		result += '}';
	}
	result += ']}';
	localStorage['plugin-circle-to-point'] = result;
	window.plugin.circleToPoint.traceCircles();
}

window.plugin.circleToPoint.updateNames = function() {
	var elt;
	var couple = [];
	// Maj des titres
	for (i = 0; i < window.plugin.circleToPoint.couples.length; i ++)
	{
		elt = document.getElementById('maj_circle_' + i);
		couple = window.plugin.circleToPoint.couples[i];
		if (elt) couple['Nom'] = elt.value;	
		window.plugin.circleToPoint.couples[i] = couple;
	}
	
	// Ajout du nouveau
	elt = document.getElementById('maj_circle_' + window.plugin.circleToPoint.couples.length);
	if (elt) {
		var centerNew = map.getCenter();
//		centerNew.lat += window.plugin.circleToPoint.couples.length/100000000000000;
//		centerNew.lng += window.plugin.circleToPoint.couples.length/100000000000000;
		window.plugin.circleToPoint.addMarkers(centerNew, centerNew, elt.value);
	}
}

window.plugin.circleToPoint.addCircleLocation = function() {
	var result = '';
	
	for (i = 0; i < window.plugin.circleToPoint.couples.length; i ++) {
		var couple = window.plugin.circleToPoint.couples[i];
		result += '<div>';
		result += 'Cercle ' + i;
		result += '<input id="maj_circle_' + i + '" type="text" value="';
		result += couple['Nom'];
		result += '" /></div>';
	}
	result += '<div>';
	result += 'Cercle ' + window.plugin.circleToPoint.couples.length;
	result += '<input id="maj_circle_' + window.plugin.circleToPoint.couples.length + '" type="text" />';
	result += '</div>';

	dialog({
		html: result,
		title: 'Ajout de zone',
		closeCallback : window.plugin.circleToPoint.updateNames
	});
}

/*
{"list": [
{"point": {"lat": "48323012", "lng": "2445298"}, "circle": {"lat": "48323016", "lng": "2445698"}, "nom": "toto"}
]}
*/ 
window.plugin.circleToPoint.optCopy = function() {
	var first = true;
	var result = '{"list":[';
	for (i = 0; i < window.plugin.circleToPoint.couples.length; i ++)
	{
		var couple = window.plugin.circleToPoint.couples[i];
		if (i > 0) result += ',';
		result += '{"point":';
		result += JSON.stringify(couple['Point'].getLatLng());
		result += ', "circle":';
		result += JSON.stringify(couple['Circle'].getLatLng());
		result += ', "nom":';
		result += JSON.stringify(couple['Nom']);
		result += '}';
	}
	result += ']}';
	//localStorage['plugin-circle-to-point'] = result;	
	
	dialog({
		html: '<p><a onclick="$(\'.ui-dialog-circle_to_pointSet-copy textarea\').select();">Tout selectionner</a> et CTRL+C pour copier.</p><textarea readonly>' + result + '</textarea>',
		dialogClass: 'ui-dialog-circle_to_pointSet-copy',
		title: 'Area Export'
	});
}

/*
{"list": [
{"point": {"lat": "48323012", "lng": "2445298"}, "circle": {"lat": "48323016", "lng": "2445698"}, "nom": "toto"}
]}
*/ 
window.plugin.circleToPoint.optPaste = function() {
    var promptAction = prompt('Coller votre JSON.', '');
    if(promptAction !== null && promptAction !== '') {
	
		try {
			var couple = [];
			var datas = JSON.parse(promptAction);
			for	(index = 0; index < datas['list'].length; index ++) {
				var value = datas['list'][index];
				if (value.point && value.circle)
				{
					window.plugin.circleToPoint.addMarkers(L.latLng(value.point), L.latLng(value.circle), value.nom);				
				}
			}
			window.plugin.circleToPoint.traceCircles();
			localStorage['plugin-circle-to-point'] = promptAction;
		} catch(e) {
			window.plugin.circleToPoint.currentLoc = null;
			localStorage['plugin-circle-to-point'] = null;
		}
    }
}
  
window.plugin.circleToPoint.setupPortalsList = function() {
  if(!window.plugin.portalslist) return;

  window.plugin.portalslist.fields.push({
    title: "Dist",
    value: function(portal) { if (window.plugin.circleToPoint.currentLoc) return window.plugin.circleToPoint.currentLoc.distanceTo(portal.getLatLng()); else return 0; },
    format: function(cell, portal, dist) {
      $(cell).addClass('alignR').text(dist?window.plugin.circleToPoint.formatDistance(dist):'-');
    }
  });
}


window.plugin.circleToPoint.setup  = function() {
	window.plugin.circleToPoint.currentPointLocMarker = null;
	window.plugin.circleToPoint.currentCircleLocMarker = null;
	window.plugin.circleToPoint.currentPointCircle = null;

	$('<style>').prop('type', 'text/css').html(''
	+'#circle-distance-block{\n	text-align: center;\n}\n#circle-distance {\n	text-align: center;\n width : 80%;\n}\n.circle-distance-bearing {\n	display: inline-block;\n	vertical-align: top;\n	position: relative;\n	height: 1em;\n	width: 1em;\n}\n.circle-distance-bearing:before, .circle-distance-bearing:after {\n	border-color: transparent currentcolor transparent transparent;\n	border-style: solid;\n	border-width: 0.75em 0.4em 0 0;\n	content: "";\n	height: 0;\n	width: 0;\n	position: absolute;\n	top: 0.15em;\n	left: 0.15em;\n	transform: skewY(-30deg);\n	-moz-transform: skewY(-30deg);\n	-webkit-transform: skewY(-30deg);\n}\n.circle-distance-bearing:after {\n	left: auto;\n	right: 0.15em;\n	transform: scaleX(-1) skewY(-30deg);\n	-moz-transform: scaleX(-1) skewY(-30deg);\n	-webkit-transform: scaleX(-1) skewY(-30deg);\n}\n\n'
	+'.plugin-circle-to-point-distance {'
	+'color:#FFFFBB;'
    +'font-size:20px;line-height:20px;'
    +'text-align:center;padding: 2px;'
	+'overflow:hidden;'
	+'text-shadow:1px 1px #000,1px -1px #000,-1px 1px #000,-1px -1px #000, 0 0 5px #000;'
	+'pointer-events:none;'
	+'}\n').appendTo('head');

	window.plugin.circleToPoint.addDistance();
	
	if (localStorage['plugin-circle-to-point']) {
		try {
			var couple = [];
			var datas = JSON.parse(localStorage['plugin-circle-to-point']);
			for	(index = 0; index < datas['list'].length; index ++) {
				var value = datas['list'][index];
				if (value.point && value.circle)
				{
					window.plugin.circleToPoint.addMarkers(L.latLng(value.point), L.latLng(value.circle), value.nom);				
				}
			}
			window.plugin.circleToPoint.traceCircles();
		} catch(e) {
			window.plugin.circleToPoint.currentLoc = null;
			localStorage['plugin-circle-to-point'] = null;
		}
	}
	
	window.plugin.circleToPoint.setupPortalsList();
};

var setup =  window.plugin.circleToPoint.setup;

// PLUGIN END //////////////////////////////////////////////////////////


setup.info = plugin_info; //add the script info data to the function as a property
if(!window.bootPlugins) window.bootPlugins = [];
window.bootPlugins.push(setup);
// if IITC has already booted, immediately run the 'setup' function
if(window.iitcLoaded && typeof setup === 'function') setup();
} // wrapper end
// inject code into site context
var script = document.createElement('script');
var info = {};
if (typeof GM_info !== 'undefined' && GM_info && GM_info.script) info.script = { version: GM_info.script.version, name: GM_info.script.name, description: GM_info.script.description };
script.appendChild(document.createTextNode('('+ wrapper +')('+JSON.stringify(info)+');'));
(document.body || document.head || document.documentElement).appendChild(script);


