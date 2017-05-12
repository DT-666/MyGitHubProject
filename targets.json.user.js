// ==UserScript==
// @id             iitc-plugin-targets@targets_json
// @name           IITC plugin: Portal targets with json Interface
// @category       Misc
// @version        0.0.1.2016.0326
// @namespace      https://none/ingress-intel-total-conversion
// @description    Highlight specific portals using a list of GPS or portalId (hp / wp)
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


function wrapper(plugin_info) {
// ensure plugin framework is there, even if iitc is not yet loaded
if (typeof window.plugin !== 'function') window.plugin = function() {};

//PLUGIN AUTHORS: writing a plugin outside of the IITC build environment? if so, delete these lines!!
//(leaving them in place might break the 'About IITC' page or break update checks)
plugin_info.buildName = 'targets_json';
plugin_info.dateTimeVersion = '20160326.100001';
plugin_info.pluginId = 'targets_with_json';
//END PLUGIN AUTHORS NOTE


//PLUGIN START ////////////////////////////////////////////////////////

window.TARGETS_KEY = 'targets';

window.DEBUG_ALL = 0;
window.DEBUG_WARN = 5;
window.DEBUG_ERR = 10;

// Namespace du plugin
window.plugin.targets_json = function() {};

// maps the JS property names to localStorage keys
window.plugin.targets_json.FIELDS = {
	'targets': 'plugin-targets-json'
};

window.plugin.targets_json.targets = {};

window.plugin.targets_json.disabledMessage = null;

window.plugin.targets_json.menuIcon = 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABAAAAAQCAYAAAAf8/9hAAAA/klEQVR42mNkwA/8ofRGXAoYcYjrAHEAELtA+XuAeAMQXyFkgCAQ9wPxWyBeCsRaUPFrQBwNxMJAXAjE77EZIAjVVAbE94E4FohDoXKrgHgJECsCcRfUsPfoBiwA4h4g/g+lpwOxEFTuHRBnAnEJVA+ITkA2AOTnRCCuA+I1QBwBxB+BWAwq/wqI+YF4BRCHAHETEM8HhQnMgBog3gbEZkD8FIg34whcPyCWBOLTQOwFxC2MUMEiIJ4DdcUiIN4OtRUWff5Q13hBwwZkewoowJENmA3ESeQYgO6FZ0C8iRQvUCUQKY5GbAkpBojDSElIMEPITsrIgOzMhA4IZmcA8EFQr/cjVBcAAAAASUVORK5CYII=';
window.plugin.targets_json.enlIcon = 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABEAAAAXCAYAAADtNKTnAAAABmJLR0QA/wD/AP+gvaeTAAAACXBIWXMAAAsTAAALEwEAmpwYAAAAB3RJTUUH4AIWFCQzgDVhHQAAASFJREFUOMul1EsrRVEABeDvXo9cQkIpMiIkmUhkYKSUYiolU3MzQ3/FH2Cs/BI/wISB95vJuuV5r3vPmuxzdnuvs9ba6+wWtdGFVrzUWlSuQ7KCSywUISlHxQmWmyVpQQkbOCqiBM6whH7caxBDuMM1RnGb581/CNCGXkyhL3OtIVhL2Jd/be7EOp7xlvEBNyGYwxXOs/YHZuP3ETvpSBW7sXKFxXoWBrP5KUd7EOKXZFOKrS8o1SCdjPwLnEbhQz7wjoHYrYsK9pJJb8atqCr/94gnomAs75shqjTSk4lk0o2ezK02WraqkkosdDRTezmZatWHmyVpwwi2P7W3YZIy5nFYRMlrSriPY01gPMHeFLnZqphRANMJtBDaf/vhvuMDjog7/oXbD3gAAAAASUVORK5CYII=';
window.plugin.targets_json.resIcon = 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABEAAAAZCAYAAADXPsWXAAAABmJLR0QA/wD/AP+gvaeTAAAACXBIWXMAAAsTAAALEwEAmpwYAAAAB3RJTUUH4AIWFCw01oh+tgAAAiVJREFUOMuV1Ftoj3EYB/DP+2/6O0zRZqVYSW6cdkFyLDezpJTIITmUwi2FEiWlhmuUQzncOaQmXJDUbkSJ3FBCOWxsEbLNZntd/J+Xd7P589Tb7/0dnu/v93yf7/Mk2IMZ6NPfhuGRpHBJ2rcCs9CLdMC5zgosxzx8HLBZiVfS4gs6x2AxijmQBKPQW0APzqIadfGq6ZiEb3S2hMMiTIv9majBDiSFQB2BNXiDd2iJsR5zMRvPc+tvcQTDoSL3/B8xXsUXjAwOtuETrqAT37EF3ZljBtKHNnzFLZyI9YVYh1O4E2v12ISXwQm4iwuRjf1oxVGM7s9zdYK9kYDDGIed6MiH04PGANmLKbj2O9T2JWjAAZxGR/6K7CVyqVuGJwHcXsqS1yXyk/zFO9FR8KeluI6NaEZVxL8BF0l/DHQYDCSzCaEHmIqxg6i1LEhb6EKMn4c6+DeQe7gd/zfweKiDFYOAFnPFWMiNyb+C1GBXqPdZqLas5RUL47O0hWaSMv592TMLob58/TzEA0wsA1KbXXQNXdgdKr0Xqcx/Z6JV5G073kdVWxDMpzgWBXYp5l05kHE5Cg5FKK1YlaHWoSkcLmMpVkdFp9G0KjEG52LtYXTEvCW1OBkHmjEf+2LeiDm4WZonTZg8oN5+WRUOhuNTbI2utj5uTnGcpKYM4UkxSOsttcHkfACmQf5o/2Fr8SGcu7FZoTDs31yTfuE14D5WDrEPfgIWYpS6k5SpcwAAAABJRU5ErkJggg==';

window.plugin.targets_json.debug = true;
window.plugin.targets_json.debug_level = window.DEBUG_ALL;

  /*************/
 /* Highlight */
/*************/

window.plugin.targets_json.highlighter = function() {
	window.plugin.targets_json.debugAlert('highlighter:', 'start', window.DEBUG_ALL);
	var portals_tagged = JSON.parse(window.plugin.targets_json.getLocalStorage(window.TARGETS_KEY));
	var portalLat;
	var portalLng;
	var portalName;
	var portalTitle;
	
	for (portalId in portals_tagged) {
		portalLat = portals_tagged[portalId]['lat'];
		portalLng = portals_tagged[portalId]['lng'];
		portalName = portals_tagged[portalId]['name'];
		for (user in portals_tagged[portalId]) {
			if ( (portals_tagged[portalId][user] === 'res') || (portals_tagged[portalId][user] === 'enl') ){
				portalTitle = portalName + '<br/>' + user + '&nbsp;[' + portals_tagged[portalId][user] + ']';
				window.plugin.targets_json.highlighterOne(portalId, portals_tagged[portalId][user], portalLat, portalLng, portalTitle);
			}
		}
	}
}

window.plugin.targets_json.highlighterOne = function(portalId, portalTeam, portalLat, portalLng, portalTitle) {
	window.plugin.targets_json.debugAlert('highlighterOne:', 'start', window.DEBUG_ALL);
	window.plugin.targets_json.debugPortal(portalId, portalTeam, portalLat, portalLng);

	window.plugin.targets_json.debugAlert('portal key highlight:', portalId, window.DEBUG_WARN);
	if (!portalLat || !portalLng) {
		var p = window.portals[portalId];
		portalLat = p.options.data.latE6;
		portalLng = p.options.data.lngE6;
	}
	var relOpacity = 0.8;
	// Création du flag
	var pos = L.latLng(portalLat / 1E6, portalLng / 1E6);
	var m;
	if (portalTeam === 'enl') {
		var enlIcon = new window.plugin.targets_json.iconPortalEnl();
		m = L.marker(pos, {icon: enlIcon, opacity: relOpacity, title: portalTitle});
	}
	if (portalTeam === 'res') {
		var resIcon = new window.plugin.targets_json.iconPortalRes();
		m = L.marker(pos, {icon: resIcon, opacity: relOpacity, title: portalTitle});
	}
	// Ajout au layer
	m.addTo(window.plugin.targets_json.drawnFlag);
	window.registerMarkerForOMS(m);
	window.setupTooltips($(m._icon));
}

  /***********/
 /* Options */
/***********/

window.plugin.targets_json.manualOpt = function() {
    dialog({
      html: plugin.targets_json.htmlSetbox,
      dialogClass: 'ui-dialog-targets_jsonSet',
      title: 'Targets Json Options'
    });

    window.runHooks('plugintargets_jsonOpenOpt');
}

window.plugin.targets_json.optAlert = function(message) {
	$('.ui-dialog-targets_jsonSet .ui-dialog-buttonset').prepend('<p class="targets_json-alert" style="float:left;margin-top:4px;">' + message + '</p>');
	$('.targets_json-alert').delay(2500).fadeOut();
}

/*
{
	"portals": [{
		"id": "faab4867e01849ea99206f8a1af80447.16",
		"name": "Portail 1",
		"lat": "48323012",
		"lng": "2445298",
		"ZOGZOG": "res",
		"ZOGZOG2": "res",
		"ROMROM": "enl"
	},
	{
		"id": "c46b93c15c42449f8cdd14b8e4df0c1e.16",
		"name": "Portail C",
		"lat": "48884921",
		"lng": "2235424",
		"ROMROM": "enl",
		"DarkMan": "enl",
	},
	{
		"id": "0032766d102e436ebac101fa168de902b.16",
		"name": "La boucle infinie",
		"lat": "48899558",
		"lng": "2237286",
		"DarkMan": "user"
	}]
}
*/ 
window.plugin.targets_json.optCopy = function() {
	window.plugin.targets_json.debugAlert('optCopy:', 'start', window.DEBUG_ALL);
	//Parcourir chaque guid et construire le json
	var portals_tagged = JSON.parse(window.plugin.targets_json.getLocalStorage(window.TARGETS_KEY));

	var first = true;
	var result = '{"portals":[';
		
	for (portalId in portals_tagged) {
		if (portalId == 'undefined') {
			portalId = portals_tagged[portalId]['lat'] + "." + portals_tagged[portalId]['lng'];
		}
		window.plugin.targets_json.debugAlert('portal key:', portalId, window.DEBUG_ALL);
		if (!first) {
			result += ',';
		}
		else {
			first = false;
		}
		result += '{';
		result += '"id":"' + portalId + '",';
		for (user in portals_tagged[portalId]) {
			if ( (portals_tagged[portalId][user] === 'res') || (portals_tagged[portalId][user] === 'enl') ){
				result += '"' + user + '":"' + portals_tagged[portalId][user] + '",';
			}
		}
		if (portals_tagged[portalId]['name']) {
			name = portals_tagged[portalId]['name'].replaceAll('&', '&amp;');
			result += '"name":"' + name + '",';
		}
		result += '"lat":"' + portals_tagged[portalId]['lat'] + '",';
		result += '"lng":"' + portals_tagged[portalId]['lng'] + '"';
		result += ' }';
	}
	result += ']}';

	dialog({
		html: '<p><a onclick="$(\'.ui-dialog-targets_jsonSet-copy textarea\').select();">Tout selectionner</a> et CTRL+C pour copier.</p><textarea readonly>' + result + '</textarea>',
		dialogClass: 'ui-dialog-targets_jsonSet-copy',
		title: 'Targets Export'
	});
}

/*
{
	"faab4898f11849ea99206f8a1af80447.16":{"name":"La boucle terminée","lat":"43237547","lng":"2256478","ZOGZOG":"res"},
	"faab4898e01849ea99486f8a1af33347.22":{"name":"La boucle du milieu","lat":"43256547","lng":"2244478",Darkman":"enl"},	
}
*/
window.plugin.targets_json.optPaste = function() {
	window.plugin.targets_json.debugAlert('optPaste:', 'start', window.DEBUG_ALL);
    var promptAction = prompt('Coller votre JSON.', '');
    if(promptAction !== null && promptAction !== '') {
		try {
			var portals_old_tagged = JSON.parse(window.plugin.targets_json.getLocalStorage(window.TARGETS_KEY));
			var portals_tagged = JSON.parse(promptAction);
			var result = '{';
			for	(index = 0; index < portals_tagged['portals'].length; index ++) {
				var value = portals_tagged['portals'][index];
				if (index > 0) {
					result += ','
				}
				
				// Présence de l'id portail
				if (value.id) {
					result += '"' + value['id'] + '":{';		
				}
				else {
					// Calcul de l'id de portail
					var guid = window.findPortalGuidByPositionE6(value.lat, value.lng);
					if(guid) {
						result += '"' + guid + '":{';
						value.id = guid;
					}
					else {
						result += '"' + value['lat'] + "." + value['lng'] + '":{';
						value.id = value['lat'] + "." + value['lng'];
					}
				}
				for (user in portals_tagged['portals'][index]) {
					if ( (portals_tagged['portals'][index][user] === 'res') || (portals_tagged['portals'][index][user] === 'enl') ){
						result += '"' + user + '":"' + portals_tagged['portals'][index][user] + '",';
					}
				}
				for (user in portals_old_tagged[value.id]) {
					if ( (portals_old_tagged[value.id][user] === 'res') || (portals_old_tagged[value.id][user] === 'enl') ){
						result += '"' + user + '":"' + portals_old_tagged[value.id][user] + '",';
					}
					portals_old_tagged[value.id]['added'] = true;
				}
				result += '"name":"' + value['name'] + '",';
				result += '"lat":"' + value['lat'] + '",';
				result += '"lng":"' + value['lng'] + '"';
				result += '}';
			}
			
			//Dédoublonner a faire
			// si portal id au dessus ne rien faire
			for (portalId in portals_old_tagged) {
				if (! portals_old_tagged[portalId]['added']) {
					if (portalId == 'undefined') {
						portalId = portals_old_tagged[portalId]['lat'] + "." + portals_old_tagged[portalId]['lng'];
					}
					result += ',';
					result += '"' + portalId + '":{';

					for (user in portals_old_tagged[portalId]) {
						if ( (portals_old_tagged[portalId][user] === 'res') || (portals_old_tagged[portalId][user] === 'enl') ){
							result += '"' + user + '":"' + portals_old_tagged[portalId][user] + '",';
						}
					}
					if (portals_old_tagged[portalId]['name']) {
						name = portals_old_tagged[portalId]['name'].replaceAll('&', '&amp;');
						result += '"name":"' + name + '",';
					}
					result += '"lat":"' + portals_old_tagged[portalId]['lat'] + '",';
					result += '"lng":"' + portals_old_tagged[portalId]['lng'] + '"';
					result += ' }';
				}
			}	
			
			result += '}';
			window.plugin.targets_json.debugAlert('Json:', result, window.DEBUG_ALL);
			// On écrase la liste courante
			window.plugin.targets_json.targets = JSON.parse(result);
			window.plugin.targets_json.storeLocal(window.TARGETS_KEY);
			// On refresh la carte
			window.plugin.targets_json.drawnFlag.clearLayers();
			window.runHooks('pluginTargetsJsonRefreshAll');
			window.plugin.targets_json.highlighter();
			window.plugin.targets_json.optAlert('Réussite. ');
		} 
		catch(e) {
			window.plugin.targets_json.optAlert('<span style="color: #f88">Echec. </span>');
			window.plugin.targets_json.debugAlert('optPaste erreur:', e.message, window.DEBUG_ERR);
		}
    }
}

window.plugin.targets_json.optReset = function() {
	window.plugin.targets_json.debugAlert('optReset:', 'start', window.DEBUG_ALL);
	var promptAction = confirm('Tous les flags seront supprimées ?', '');
	if(promptAction) 
	{
		// On reset puis refresh
		window.plugin.targets_json.targets = JSON.parse('{}');
		window.plugin.targets_json.storeLocal(window.TARGETS_KEY);
		window.plugin.targets_json.drawnFlag.clearLayers();
		window.plugin.targets_json.optAlert('Réussite. ');
	}
	else
	{
		// On refresh la carte
		window.plugin.targets_json.drawnFlag.clearLayers();
		window.plugin.targets_json.highlighter();
		window.plugin.targets_json.optAlert('Abandon. ');
	}
}

window.plugin.targets_json.addPlayer = function(portalTeam) {
	window.plugin.targets_json.debugAlert('addPlayer:', portalTeam, window.DEBUG_ALL);
	var promptAction = prompt('Nom du joueur ?', '');
    if (promptAction !== null && promptAction !== '') {
		var guid = window.selectedPortal;
		var p = window.portals[guid];
		// On tag le portail
		portalTitle = p.options.data.title.replaceAll('"', '&#34;') + '<br/>' + promptAction + '&nbsp;[' + portalTeam + ']';
		window.plugin.targets_json.highlighterOne(guid, portalTeam, p.options.data.latE6, p.options.data.lngE6, portalTitle);
		// On le rajoute
		var details = window.plugin.targets_json.targets[guid];
		if (! details) {
			details = JSON.parse('{}');
			details["name"] =  p.options.data.title.replaceAll('"', '&#34;');
			details["lat"] =  p.options.data.latE6;
			details["lng"] =  p.options.data.lngE6;
		}
		details[promptAction] = portalTeam;
		window.plugin.targets_json.targets[guid] = details;
		window.plugin.targets_json.sync(guid);		
	}
}
  /**********/
 /* OUTILS */
/**********/

// Debug dans la console
window.plugin.targets_json.debugAlert = function(title, message, level) {
	if (window.plugin.targets_json.debug){
		if (level >= window.plugin.targets_json.debug_level) console.log(title + message);
	}
}

// Debug les données d'un portail
window.plugin.targets_json.debugPortal = function (portalId, portalCaptured, portalLat, portalLng) {
	window.plugin.targets_json.debugAlert('debugPortal:',  'start', window.DEBUG_ALL);
	window.plugin.targets_json.debugAlert('portalId:', portalId, window.DEBUG_ALL);
	window.plugin.targets_json.debugAlert('portalCaptured:', portalCaptured, window.DEBUG_ALL);
	window.plugin.targets_json.debugAlert('lat:' , portalLat, window.DEBUG_ALL);
	window.plugin.targets_json.debugAlert('lng:' , portalLng, window.DEBUG_ALL);
}

window.plugin.targets_json.setupCSS = function() {
	$("<style>")
	.prop("type", "text/css")
	.html("#targets_jsonSetbox a{\n	display:block;\n	color:#ffce00;\n	border:1px solid #ffce00;\n	padding:3px 0;\n	margin:10px auto;\n	width:80%;\n	text-align:center;\n	background:rgba(8,48,78,.9);\n}\n#targets_jsonSetbox a.disabled,\n#targets_jsonSetbox a.disabled:hover{\n	color:#666;\n	border-color:#666;\n	text-decoration:none;\n}\n/* Opt panel - copy */\n.ui-dialog-targets_jsonSet-copy textarea{\n	width:96%;\n	height:120px;\n	resize:vertical;\n}\n\n\n\n.targets_enl span {\n	background-image:url(" + window.plugin.targets_json.enlIcon + ");\n}\n.targets_enl span {\n	display:inline-block;\n	float:left;\n	margin:3px 1px 0 4px;\n	width:17px;\n	height:23px;\n	overflow:hidden;\n	background-repeat:no-repeat;\n}\n.targets_enl span {\n	background-position:left top;\n}\n.targets_res span {\n	background-image:url(" + window.plugin.targets_json.resIcon + ");\n}\n.targets_res span {\n	display:inline-block;\n	float:left;\n	margin:3px 1px 0 4px;\n	width:17px;\n	height:25px;\n	overflow:hidden;\n	background-repeat:no-repeat;\n}\n.targets_res span {\n	background-position:left top;\n}\n")
	.appendTo("head");
}

window.plugin.targets_json.onPortalSelectedPending = false;
window.plugin.targets_json.onPortalSelected = function() {
	window.plugin.targets_json.htmlCallAddTagEnl = '<a class="targets_enl" onclick="window.plugin.targets_json.addPlayer(\'enl\');return false;"><span></span></a>';
	window.plugin.targets_json.htmlCallAddTagRes = '<a class="targets_res" onclick="window.plugin.targets_json.addPlayer(\'res\');return false;"><span></span></a>';
    if(window.selectedPortal == null) return;

    if (!window.plugin.targets_json.onPortalSelectedPending) {
      window.plugin.targets_json.onPortalSelectedPending = true;

      setTimeout(function() { // the sidebar is constructed after firing the hook
        window.plugin.targets_json.onPortalSelectedPending = false;
        if(typeof(Storage) === "undefined") {
          $('#portaldetails > .imgpreview').after(plugin.targets_json.htmlDisabledMessage);
          return;
        }

        // Prepend a star to mobile status-bar
        if(window.plugin.targets_json.isSmart) {
          $('#updatestatus').prepend(window.plugin.targets_json.htmlCallAddTagEnl);
		  $('#updatestatus').prepend(window.plugin.targets_json.htmlCallAddTagRes);
        }

        $('#portaldetails > h3.title').before(window.plugin.targets_json.htmlCallAddTagEnl);
		$('#portaldetails > h3.title').before(window.plugin.targets_json.htmlCallAddTagRes);
      }, 0);
    }
}

window.plugin.targets_json.setupContent = function() {
    // Lien pour ouvrir les Options	
	window.plugin.targets_json.htmlCallSetBox = '<a onclick="window.plugin.targets_json.manualOpt();return false;"><img width="16px" height="16px" alt="Targets Json" src="' + window.plugin.targets_json.menuIcon + '"/></a>';
	window.plugin.targets_json.disabledMessage = '<div id="targets-json-container" class="help" title="Your browser does not support localStorage">Plugin Targets Json disabled</div>';
}

window.plugin.targets_json.setIcons = function(enl, res) {
	window.plugin.targets_json.iconPortalEnl = L.Icon.Default.extend(
	{
		options: 
		{
			iconUrl: enl,
			iconRetinaUrl: enl
		}
	});
	window.plugin.targets_json.iconPortalRes = L.Icon.Default.extend(
	{
		options: 
		{
			iconUrl: res,
			iconRetinaUrl: res
		}
	});
}

String.prototype.replaceAll = function(search, replacement) {
    var target = this;
    return target.replace(new RegExp(search, 'g'), replacement);
};

  /*******************/
 /* Synchronization */
/*******************/

plugin.targets_json.sync = function(guid) {
	window.plugin.targets_json.storeLocal(window.TARGETS_KEY);
}

//Call after local or remote change uploaded ?
window.plugin.targets_json.syncCallback = function(pluginName, fieldName, e, fullUpdated) {
	window.plugin.targets_json.debugAlert('syncCallback:', 'start', window.DEBUG_ALL);
	if (fullUpdated) {
		window.runHooks('pluginTargetsJsonRefreshAll');
		return;
	}
}

window.plugin.targets_json.syncInitialed = function(pluginName, fieldName) {
	window.plugin.targets_json.debugAlert('syncInitialed:', 'start', window.DEBUG_ALL);
	if(fieldName === 'targets_json') {
		window.plugin.targets_json.highlighter();
	}
}

  /************/
 /* Stockage */
/************/

window.plugin.targets_json.getLocalStorage = function(name) {
	window.plugin.targets_json.debugAlert('getLocalStorage :', name, window.DEBUG_ALL);
	var key = window.plugin.targets_json.FIELDS[name];
	if(key === undefined) return;

	var value = window.plugin.targets_json[name];
	if(typeof value !== 'undefined' && value !== null) 
	{
		window.plugin.targets_json.debugAlert('localStorage :', localStorage[key], window.DEBUG_ALL);
		return localStorage[key];
	}
	return;
}

window.plugin.targets_json.storeLocal = function(name) {
	window.plugin.targets_json.debugAlert('storeLocal:', name, window.DEBUG_ALL);
	var key = window.plugin.targets_json.FIELDS[name];
	if(key === undefined) return;

	var value = window.plugin.targets_json[name];

	if(typeof value !== 'undefined' && value !== null) 
	{
		localStorage[key] = JSON.stringify(value);
	} 
	else 
	{
		localStorage.removeItem(key);
	}
}

window.plugin.targets_json.loadLocal = function(name) {
	window.plugin.targets_json.debugAlert('loadLocal:', name, window.DEBUG_ALL);
	var key = window.plugin.targets_json.FIELDS[name];
	if(key === undefined) return;

	if(localStorage[key] !== undefined) 
	{
		try 
		{
			window.plugin.targets_json.debugAlert('loadLocal :', localStorage[key], window.DEBUG_ALL);
			window.plugin.targets_json[name] = JSON.parse(localStorage[key]);
		} 
		catch(e) 
		{
			window.plugin.targets_json.debugAlert('loadLocal erreur:', e.message, window.DEBUG_ERR);
			window.plugin.targets_json.debugAlert('loadLocal localStorage:', localStorage[key], window.DEBUG_ERR);
		}
	}
}

  /********/
 /* Init */
/********/

//Call after IITC and all plugin loaded
window.plugin.targets_json.registerFieldForSyncing = function() {
	if(!window.plugin.sync) return;
	window.plugin.sync.registerMapForSync('targets_json', 'targets_json', window.plugin.targets_json.syncCallback, window.plugin.targets_json.syncInitialed);
}

var setup = function() {
	// Params

	// Params
	
	// Layer & Icon
	window.plugin.targets_json.setIcons(window.plugin.targets_json.enlIcon, window.plugin.targets_json.resIcon);
	window.plugin.targets_json.drawnFlag = new L.LayerGroup();
    window.addLayerGroup('Enl/Res wp/hp', plugin.targets_json.drawnFlag, true);
	map.on('layeradd',function(obj) {
		if(obj.layer === plugin.targets_json.drawnFlag) 
		{
			obj.layer.eachLayer(function(marker) 
			{
				if(marker._icon) 
				{
					window.setupTooltips($(marker._icon));
				}
			});
		}
	});
	// Layer & Icon
	
	window.addHook('portalSelected', window.plugin.targets_json.onPortalSelected);
	window.pluginCreateHook('pluginTargetsJsonRefreshAll');
	
	window.plugin.targets_json.setupCSS();
	window.plugin.targets_json.setupContent();
	window.plugin.targets_json.loadLocal(window.TARGETS_KEY);
	window.addHook('iitcLoaded', window.plugin.targets_json.registerFieldForSyncing);

	if($.inArray('plugintargets_jsonOpenOpt', window.VALID_HOOKS) < 0) { window.VALID_HOOKS.push('plugintargets_jsonOpenOpt'); }
	
	
    var actions = '';
    actions += '<a onclick="window.plugin.targets_json.optReset();return false;">Reset</a>';
    actions += '<a onclick="window.plugin.targets_json.optCopy();return false;">Exporter</a>';
    actions += '<a onclick="window.plugin.targets_json.optPaste();return false;">Importer</a>';
	window.plugin.targets_json.htmlSetbox = '<div id="targets_jsonSetbox">' + actions + '</div>';
	$('#portaldetails').before(window.plugin.targets_json.htmlCallAddTag);
	$('#toolbox').append(window.plugin.targets_json.htmlCallSetBox);

	setTimeout(window.plugin.targets_json.highlighter(), 0.1);
}



//PLUGIN END //////////////////////////////////////////////////////////


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
