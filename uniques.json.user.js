// ==UserScript==
// @id             iitc-plugin-uniques@uniques_json
// @name           IITC plugin: Uniques with json Interface
// @category       Misc
// @version        0.0.1.2016.0401
// @namespace      https://none/ingress-intel-total-conversion
// @description    Highlight unique portals using a list of GPS or portalId
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
plugin_info.buildName = 'uniques_json';
plugin_info.dateTimeVersion = '201600401.100001';
plugin_info.pluginId = 'uniques_with_json';
//END PLUGIN AUTHORS NOTE


//PLUGIN START ////////////////////////////////////////////////////////
/***********************************************************************

  HOOKS:
  - pluginUniquesJsonSyncEnd: fired when the sync is finished; ???

***********************************************************************/
/*
TODO :
CSS du paste pour afficher un peu plus de champ texte a coller

BUG sur le chargement de fichier quand on copie colle simplement le json
*/

window.UNIQUES_KEY = 'uniques';
window.UNIQUES_PARAMS_KEY = 'params';

window.DEBUG_ALL = 0;
window.DEBUG_WARN = 5;
window.DEBUG_ERR = 10;

// Namespace du plugin
window.plugin.uniques_json = function() {};

// maps the JS property names to localStorage keys
window.plugin.uniques_json.FIELDS = {
	'uniques': 'plugin-uniques-json',
	'params': 'plugin-uniques-params-json'
};

// Stock les uniques
window.plugin.uniques_json.uniques = {};
// Stock les paramétrages
window.plugin.uniques_json.params = {};
// Stock les markers affichés
window.plugin.uniques_json.uniques_highlighted = {};

window.plugin.uniques_json.disabledMessage = null;
window.plugin.uniques_json.contentHTML = null;

window.plugin.uniques_json.user = window.PLAYER.nickname
window.plugin.uniques_json.flag_captured = 'black';
window.plugin.uniques_json.captured = true;
window.plugin.uniques_json.flag_uncaptured = 'enl';
window.plugin.uniques_json.uncaptured = false;
window.plugin.uniques_json.default_name = '#TOBECOMPLETED#';

window.plugin.uniques_json.import_element = 'b';
window.plugin.uniques_json.import_element_data = 'black';

window.plugin.uniques_json.load_portals = false;

window.plugin.uniques_json.blackIcon = 'data:image/png;base64,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';
window.plugin.uniques_json.pinkIcon = 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAA8AAAAdCAYAAAB1yDbaAAAABmJLR0QA/wD/AP+gvaeTAAAACXBIWXMAAE2DAABNgwE/cbFwAAAAB3RJTUUH4AMGEC0GbTTIhAAAAvZJREFUOMullE1oHVUUx3/nzp2Zl3mTVJrYaGuT0mII6ELQRaFIUj9QFCriWgRxqytdFLcuXFUX3RZcWeRRGoVoiTZE0mgtgqiUFm0jBikaE9O+zsyb92bmni4eiQmaal//q3M553c5H/dcSafnjekLBqq1ZoYfFPGRCU2nZj2tnAcKiIr1XP2Fw1U2PS/aKXyp1wIJg46kU7NPuVb+OTAnYfAeRi6K0+dUeRr0XpBlEZlTmBL0QW0XR1WYFGtftVqWh8qLlwEm7UPjk+L7papaNqQoHEHkXVcUQXn5Z1DFHzuw26DsrNZuoKpIN3oTuEmqgShoVeGSDJfldYuRK3bP/dj9o2AtqLKtAh9/fAy3+heoWzXieR/Z/aNVWKtRDwJE5F85QYj8gCiOMfftWpT++ILBmNFKxDv17XneOPkBzTzH+D5iLeJbxFqwHllZ8Pbpk7z/xTT1vmiX1MJBq2V1WAR2RBGDUR3z+zL5tR9waYY6hxiDRBFueIjhe3bSH4Q4V8WoHrDAiBHDxPjDPD4wRPbVN7SrCiMGEcGp4q5fx/65wmuPPYI3upe8KMCYQYOQADjncHmbVpbRuPo1S8kK1ngsJSucuHQWXzyKG02qv9vQNoJ82e2IQC3sdlQMnpiNOYfGRwXMjoHuNEQUuCLZmYXApa1PUH1G85zix0vki79gxGDEAEqnKujbO0J48FHwPBBO43mvC0D68dyIluWbCC9pku6ufv2NamUVbbeRMMQODWJGHkD642uonsKY4/GLT/y0MdT0s3N92mqNie/v07S1zzk9iqtiPC831ntHwnBRi3LJ1Pyr0fMTN5ffOgbpp/P/eBDZwvcWIGnMZElj5pXWue/8zf7kw2lasxe2QumZhS3npDGTJ42ZlzcuPXt+i99sPtSfPcTtFD15cHt46xKpDwjQ3C7GcBf6P/BAr3BvaWvzZu9puz9W1821O4ar29T63zV3ynVrTw9w0XvNmrXvAm53uj8BDN952lFtfV3j7UJuATbPO0KGYdypAAAAAElFTkSuQmCC';
//window.plugin.uniques_json.flagIcon = 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAA4AAAAVCAYAAAB2Wd+JAAAABmJLR0QA/wD/AP+gvaeTAAAACXBIWXMAAAsTAAALEwEAmpwYAAAAB3RJTUUH4AMGEB8T7Zl4HgAAAZBJREFUOMutlLFrFFEQxn/z9u3daQ4iapGoKQRJGlMYQRSs8g8o2Ag2FmopgjYiadJaikUKsbCUFNYRwcrGKqISvBM0iKApPBdzu9nd91l4R07YXHLiNI8Z3o/3fTPDg4qQdKjV+nCJUaPdbs9PzU/kw+74qmLazY7Xaw1/c2lqYvzI/nEfW3bi6OznK7NPw1AwYyN1kYDoeih1SjHf13+8X1pcmfmYfKon96+tlpXgyrc7vpt3MB2+u7VZelezkJfhMs7eWKQbwLvqF8ufSCIU2kcJCBD1fFNn4gPpk9uPp19Vgs5iDEN9R/pzhIK4zDRXpEy7UbptBnkXikxNN+qozHqq+MfYEVTPmLYt7r4AhVIMA/hq2FuwL2BnhWaGgpON04qiFyjYI4d/6YKtQbgIugrM7QieP3hPDf+ah7daCwPlBwvPTj6XsmWkyUqwJ7Pfg7Bdd2vAOe9rTb9b9weTxQurAegAnf8/jr+XbY+gcy4gMehvT+DYWHPDzBj5B0iSZD35lWz18wiODcgWEH4DzLCV7iDTeR4AAAAASUVORK5CYII=';
window.plugin.uniques_json.redIcon = 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAA8AAAAdAQMAAABPBqSZAAAABlBMVEWVMzOgEAvouz2fAAAAAXRSTlMAQObYZgAAAAFiS0dEAIgFHUgAAAAJcEhZcwAADsQAAA7EAZUrDhsAAAAHdElNRQfgCxsSJSoGsj6CAAAAKUlEQVQI12NgYGBgZGBgdWDgTWCQNGCQLQAx+B8wsB9gYG6AIkYGUhEAUA4FR0Op0e8AAAAASUVORK5CYII=';
window.plugin.uniques_json.enlIcon = 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABEAAAAXAQMAAADX+jakAAAABlBMVEVvcnQAAAA7ioAkAAAAAXRSTlMAQObYZgAAAAFiS0dEAIgFHUgAAAA3SURBVAjXY2AAgQYgPgDEC4C4A4hvALEYAwP7GwYGCQMg/QDIlwHiEKh8A1TtAiQ2zIwGBhgAABbwCxE3bOxTAAAAAElFTkSuQmCC';
window.plugin.uniques_json.resIcon = 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABEAAAAZAgMAAACqUC0EAAAACVBMVEUAANwAAAAAAAGYB7BnAAAAAXRSTlMAQObYZgAAAAFiS0dEAIgFHUgAAABPSURBVAjXfcsxDoAACAPAMrA7yH/wB5DQ3Uf5YMvoYprc0KaIcSbIkKUkmjErV+ShXoM8XWv5rFZ/9keTXCMqAL9qAKu+AYyn9EeoWvXBC4u0FybeaiQ6AAAAAElFTkSuQmCC';
window.plugin.uniques_json.menuIcon = 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABQAAAATCAYAAACQjC21AAAABGdBTUEAALGPC/xhBQAAAvZJREFUOMutlGtIE2AYhc/c1OkqSVxoVFRqOZfzkm1lhXgpFfNHEEFZRFazssiaYRTizDIIyy4QBEEWMy/DppaltlDQtKktu1ipm5U4ndc227xsrrdfBhLkqM7f7/B8h/c778eEnUo7k8rhenKtHR868V8UHRdls8fnYI/p6HHxGj7PzwEA3rar/x3o588/OWE2o3+wZ4WAH/L3wNfvX8E0YXDluDgnfe3R4eKFSxn/PLuDyUkpFtt3CgoJoI2bwyaIbH8MwQKAQ4eTJLpevU0QxKu5lJ2rYzAYxhlD6Lp1UqvVhvHxCUxOTTnm3shlzAlMSEhQqFQv6xZ7eeXxBX7wXrUcHFfOJJPFtDqA5o+Pm2GxTIHFYjFH9CPNKSnJplGDYWh4aKh/aGTwveciL8P0D+u0srqudNZtWdmZsg1hokQ2m40CWQEUinIsdHdH5eNyxMXF415+PlxcXeDs7Ai9fhCv29RobVHDydnJ5O/P25uedq7sF1BZW4XoiFhkXciQenh4ZCYm7obVaoNcLkdj4wsECoJgMn1H+4eP0Gq0GBgYxNKlSxATs0VyXppzdYYzK6H6TTNCAoUokstStVrtZaNxzLGhoR4ikQhcLhetLa/Q1KTCArd5EApFz+/flW1jMBiTdr2ucMPaEW/f5ZSdIyVlbRUFhwpozDxMo8YBKn+siAcA9bvWuXvY0qbCk+qKpG+j39wjIyORLBajX9eHMeMYrl27DiaTiX59nw8AhASE/jlVR/dHAEBEVHjv1tgo6tP3UGlZIa0PE1p8V6+k1Txf+trbRSdOpWjsLjIRsQXBAdShaac9+3ZRUYnsEADICvMfrfBeRuERm+j2nVvU1dPpat9miPc3nU6XkDQ7Q9HQVMsGgGplJQCgWF4Q4+fvQ0UlD+jAkYNr5/ooIDlz0mnHzu2Ud/PKegBgOs1uAAA8ranwjYndQsdOHM6cM13xw0IGEXEA4Iuu+7dzzedPM2NxSz8reYb/pbp6JQAg8/y53/b6J5j6Q6SExa7PAAAAAElFTkSuQmCC';

// Trace dans la console
window.plugin.uniques_json.debug = false;
window.plugin.uniques_json.debug_level = window.DEBUG_ERR;

  /**********/
 /* Portal */
/**********/

// Se lance a l'ouverture du détail d'un portail
window.plugin.uniques_json.onPortalDetailsUpdated = function() {
	window.plugin.uniques_json.debugAlert('onPortalDetailsUpdated:', 'start', window.DEBUG_ALL);
	
	if(typeof(Storage) === "undefined") {
		$('#portaldetails > .imgpreview').after(window.plugin.uniques_json.disabledMessage);
		return;
	}
	//Création de la checkbox
	$('#portaldetails > .imgpreview').after(window.plugin.uniques_json.contentHTML);
	
	var guid = window.selectedPortal,
		details = portalDetail.get(guid);
	window.plugin.uniques_json.debugAlert('Portal selected:', guid, window.DEBUG_ALL);
	
	var present = false;
	// On regarde si dans liste, si pas dans liste on met a jour la liste
	if(! window.plugin.uniques_json.uniques[guid]) {
		// On recherche guid ou 'lat.lng', que l'on corrige avec guid si on trouve
		var p = window.portals[guid];
		if (window.plugin.uniques_json.updateLocalKey(window.UNIQUES_KEY, p.options.data.latE6 + '.' + p.options.data.lngE6, guid)) {
			// On met a jour le storeLocal
			window.plugin.uniques_json.debugAlert('Update key:', guid, window.DEBUG_WARN);
			window.plugin.uniques_json.sync(guid);
			present = true;
		}
	}
	else {
		present = true;
		window.plugin.uniques_json.debugAlert('Portal dans la liste:', guid, window.DEBUG_ALL);
	}	

	window.plugin.uniques_json.debugAlert('Portal present:', present, window.DEBUG_ALL);
	if(details) {
		window.plugin.uniques_json.debugAlert('Portal Owner:', details.owner, window.DEBUG_ALL);
		if (details.owner === window.plugin.uniques_json.user) {
			// On rajoute le user s'il n'est pas dans la liste, si le portail a été jarvis la checkbox sera cochée à tort
			if (! present) {
				// Portail pas dans la liste et appartenant au user
				window.plugin.uniques_json.updateCaptured(true, guid);
				window.plugin.uniques_json.debugAlert('Flag Portal Owner:', guid, window.DEBUG_WARN);
			}
			else {
					window.plugin.uniques_json.updateCaptured(true, guid);
					window.plugin.uniques_json.debugAlert('Flag Portal Owner:', guid, window.DEBUG_WARN);
			}
		}
		else {
			if (! present) {
				window.plugin.uniques_json.updateCaptured(false, guid);
			}
			else {
				// Vérifier la présence du user
				uniqueInfo = window.plugin.uniques_json.uniques[guid];
				if (uniqueInfo[window.plugin.uniques_json.user] === 'user') {
					window.plugin.uniques_json.updateCaptured(true, guid);
				}
				else {				
					window.plugin.uniques_json.updateCaptured(false, guid);
				}
			}
		}
	}

}

// Se lance a la mise à jour du détail d'un portail
window.plugin.uniques_json.updateCaptured = function(captured, guid) {
	// Si pas de guid, action provenant de IHM
	ihm = (guid == undefined);
	if (ihm) guid = window.selectedPortal;
	window.plugin.uniques_json.debugAlert('updateCaptured:', guid, window.DEBUG_ALL);
	
	var uniqueInfo = plugin.uniques_json.uniques[guid];
	if (! uniqueInfo) 
	{
		if (captured)
		{
			uniqueInfo = JSON.parse('{"' + window.plugin.uniques_json.user + '":"user"}');
		}
		plugin.uniques_json.uniques[guid] = uniqueInfo;
	}
	
	var p = window.portals[guid];
	var name = p.options.data.title.replaceAll('"', '&#34;');
	var lat = p.options.data.latE6;
	var lng = p.options.data.lngE6;
	if (captured) 
	{ 
		uniqueInfo.name = name;
		uniqueInfo[window.plugin.uniques_json.user] = 'user';
		uniqueInfo.lat = lat;
		uniqueInfo.lng = lng;
		window.plugin.uniques_json.sync(guid);
		window.plugin.uniques_json.updateCheckedAndHighlight(guid, captured);
	} 
	else if (ihm)
	{
		// Si user existe
		if (uniqueInfo[window.plugin.uniques_json.user] === 'user') {
			uniqueInfo.name = name;
			// Décochage, on vire le user
			delete uniqueInfo[window.plugin.uniques_json.user];
			uniqueInfo.lat = lat;
			uniqueInfo.lng = lng;
			window.plugin.uniques_json.sync(guid);
			window.plugin.uniques_json.updateCheckedAndHighlight(guid, captured);
		}
	}
}

  /*************/
 /* Highlight */
/*************/

window.plugin.uniques_json.updateCheckedAndHighlight = function(guid, isCaptured) {
	window.plugin.uniques_json.debugAlert('updateCheckedAndHighlight isCaptured:', isCaptured, window.DEBUG_ALL);
	runHooks('pluginUniquesJsonUpdateUniques', { guid: guid });

	if (guid == window.selectedPortal) {
		$('#captured-uniques-json').prop('checked', isCaptured);
	}

	var p = window.portals[guid];
	if (p) {
		window.plugin.uniques_json.highlighterOne(guid, isCaptured, p.options.data.latE6, p.options.data.lngE6, p.options.data.title);
	}
}

window.plugin.uniques_json.highlighter = function() {
	window.plugin.uniques_json.debugAlert('highlighter:', 'start', window.DEBUG_ALL);
	window.plugin.uniques_json.drawnFlag.clearLayers();
	window.plugin.uniques_json.uniques_highlighted = {};
	window.plugin.uniques_json.loadLocal(window.UNIQUES_KEY);
	var portalLat;
	var portalLng;
	var portalName;
	var uniqueInfo;
	//if (p._map && p.options.data.title) {  // only consider portals added to the map and with a title
	
	// Capturés
	if (window.plugin.uniques_json.captured) {
		for (portalId in window.portals) {
			var p = window.portals[portalId];
			if (window.plugin.uniques_json.uniques[portalId]) { 
				// Mise à jour du name
				portalName = window.plugin.uniques_json.uniques[portalId]['name'];
				if ((portalName == window.plugin.uniques_json.default_name) && (p.options.data.title)) {
					portalName = p.options.data.title;
					portalName = portalName.replaceAll('"', '&#34;');
					window.plugin.uniques_json.uniques[portalId]['name'] = portalName;
					window.plugin.uniques_json.sync(portalId);
				}
				if (window.plugin.uniques_json.uniques[portalId][window.plugin.uniques_json.user] === 'user') {
					portalLat = window.plugin.uniques_json.uniques[portalId]['lat'];
					portalLng = window.plugin.uniques_json.uniques[portalId]['lng'];
					
					window.plugin.uniques_json.highlighterOne(portalId, true, portalLat, portalLng, portalName);
				}
			}
			else { 
				portalLat = p.options.data.latE6;
				portalLng = p.options.data.lngE6;
				portalName = p.options.data.title;
				// Gestion du lat.lng, Mise à jour du guid
				if (window.plugin.uniques_json.updateLocalKey(window.UNIQUES_KEY, portalLat + '.' + portalLng, portalId)) {
					window.plugin.uniques_json.debugAlert('Update key:', portalId, window.DEBUG_WARN);
					// Mise à jour du name
					portalName = window.plugin.uniques_json.uniques[portalId]['name'];
					if ((portalName == window.plugin.uniques_json.default_name) && (p.options.data.title)) {
						portalName = p.options.data.title;
						portalName = portalName.replaceAll('"', '&#34;');
						window.plugin.uniques_json.uniques[portalId]['name'] = portalName;
					}
					window.plugin.uniques_json.sync(portalId);
					if (window.plugin.uniques_json.uniques[portalId][window.plugin.uniques_json.user] === 'user') {
						portalLat = window.plugin.uniques_json.uniques[portalId]['lat'];
						portalLng = window.plugin.uniques_json.uniques[portalId]['lng'];
						
						window.plugin.uniques_json.highlighterOne(portalId, true, portalLat, portalLng, portalName);
					}
				}
				else {
					// On mémorise le portail
					if (window.plugin.uniques_json.load_portals) {
						uniqueInfo = JSON.parse('{}');
						if (! portalName) portalName = window.plugin.uniques_json.default_name;
						uniqueInfo.name = portalName.replaceAll('"', '&#34;');
						uniqueInfo.lat = portalLat;
						uniqueInfo.lng = portalLng;
						plugin.uniques_json.uniques[portalId] = uniqueInfo;
						window.plugin.uniques_json.sync(portalId);
					}
				}
			}
		}
	}
	
	// Non capturés
	if (window.plugin.uniques_json.uncaptured) {
		// Ceux chargés
		for (portalId in window.portals) {
			var p = window.portals[portalId];
			portalLat = p.options.data.latE6;
			portalLng = p.options.data.lngE6;

			if ((! window.plugin.uniques_json.uniques[portalId]) && (! window.plugin.uniques_json.uniques[portalLat + '.' + portalLng])) {
				portalName = p.options.data.title;
				// On le rajoute à la liste
				if (window.plugin.uniques_json.load_portals) {
					uniqueInfo = JSON.parse('{}');
					if (! portalName) portalName = window.plugin.uniques_json.default_name;
					uniqueInfo.name = portalName.replaceAll('"', '&#34;');
					uniqueInfo.lat = portalLat;
					uniqueInfo.lng = portalLng;
					plugin.uniques_json.uniques[portalId] = uniqueInfo;
					window.plugin.uniques_json.sync(portalId);
				}	
				window.plugin.uniques_json.highlighterOne(portalId, false, portalLat, portalLng, portalName);
			}
			else {
					
				// On update le guid
				if (window.plugin.uniques_json.updateLocalKey(window.UNIQUES_KEY, portalLat + '.' + portalLng, portalId)) {
					window.plugin.uniques_json.debugAlert('Update key:', portalId, window.DEBUG_WARN);
					
					// Mise à jour du name
					portalName = window.plugin.uniques_json.uniques[portalId]['name'];
					if ((portalName == window.plugin.uniques_json.default_name) && (p.options.data.title)) {
						portalName = p.options.data.title;
						portalName = portalName.replaceAll('"', '&#34;');
						window.plugin.uniques_json.uniques[portalId]['name'] = portalName;
					}
					window.plugin.uniques_json.sync(portalId);
					
					if (! window.plugin.uniques_json.uniques[portalLat + '.' + portalLng][window.plugin.uniques_json.user]) {
						window.plugin.uniques_json.highlighterOne(portalId, false, portalLat, portalLng, portalName);
					}
				}					
				else {

					// Mise à jour du name
					portalName = window.plugin.uniques_json.uniques[portalId]['name'];
					if ((portalName == window.plugin.uniques_json.default_name) && (p.options.data.title)) {
						portalName = p.options.data.title;
						portalName = portalName.replaceAll('"', '&#34;');
						window.plugin.uniques_json.uniques[portalId]['name'] = portalName;
					}
					window.plugin.uniques_json.sync(portalId);
				
					if (! window.plugin.uniques_json.uniques[portalId][window.plugin.uniques_json.user]) {
						window.plugin.uniques_json.highlighterOne(portalId, false, portalLat, portalLng, portalName);
					}
				}
			}
		}
	}
}

window.plugin.uniques_json.highlighterOne = function(portalId, portalCaptured, portalLat, portalLng, portalName) {
	window.plugin.uniques_json.debugAlert('highlighterOne:', 'start', window.DEBUG_ALL);
	window.plugin.uniques_json.debugPortal(portalId, portalCaptured, portalLat, portalLng);

	// Nettoyage de la liste
	if (window.plugin.uniques_json.uniques_highlighted.hasOwnProperty(portalId)) {
		if (window.plugin.uniques_json.uniques_highlighted[portalId].options.captured && (!portalCaptured)) {
			window.plugin.uniques_json.drawnFlag.removeLayer(window.plugin.uniques_json.uniques_highlighted[portalId]);
			delete window.plugin.uniques_json.uniques_highlighted[portalId];
		}
		else {
			if ((!window.plugin.uniques_json.uniques_highlighted[portalId].options.captured) && portalCaptured) {
				window.plugin.uniques_json.drawnFlag.removeLayer(window.plugin.uniques_json.uniques_highlighted[portalId]);
				delete window.plugin.uniques_json.uniques_highlighted[portalId];
			}
		}
	}

	if (!  window.plugin.uniques_json.uniques_highlighted.hasOwnProperty(portalId)) {
		if ( (window.plugin.uniques_json.captured && portalCaptured) || (window.plugin.uniques_json.uncaptured && !portalCaptured) ) {
			window.plugin.uniques_json.debugAlert('portal key highlight:', portalId, window.DEBUG_WARN);
			if (!portalLat || !portalLng) {
				var p = window.portals[portalId];
				portalLat = p.options.data.latE6;
				portalLng = p.options.data.lngE6;
			}
			var tooltip = portalName + '<br/>(' + portalId + ')';
			var relOpacity = 0.8;
			var iconCaptured = new window.plugin.uniques_json.iconPortalCaptured();
			var iconUncaptured = new window.plugin.uniques_json.iconPortalUncaptured();
			
			// Création du flag
			var pos = L.latLng(portalLat / 1E6, portalLng / 1E6);
			var m;
			if (portalCaptured) {
				m = L.marker(pos, {icon: iconCaptured, opacity: relOpacity, title: tooltip, captured: portalCaptured});
			}
			else {
				m = L.marker(pos, {icon: iconUncaptured, opacity: relOpacity, title: tooltip, captured: portalCaptured});
			}
			// Ajout au layer
			m.addTo(window.plugin.uniques_json.drawnFlag);
			window.registerMarkerForOMS(m);
			window.setupTooltips($(m._icon));
			window.plugin.uniques_json.uniques_highlighted[portalId] = m;
		}
	}
	else {
		window.plugin.uniques_json.debugAlert('portal key already highlight:', portalId, window.DEBUG_WARN);
	}
}

  /***********/
 /* Options */
/***********/

window.plugin.uniques_json.manualOpt = function() {
    dialog({
      html: plugin.uniques_json.htmlSetbox,
      dialogClass: 'ui-dialog-uniques_jsonSet',
      title: 'Unique Json Options'
    });

    window.runHooks('pluginuniques_jsonOpenOpt');
}

window.plugin.uniques_json.optAlert = function(message) {
	$('.ui-dialog-uniques_jsonSet .ui-dialog-buttonset').prepend('<p class="uniques_json-alert" style="float:left;margin-top:4px;">' + message + '</p>');
	$('.uniques_json-alert').delay(2500).fadeOut();
}

/*
{"portals": [
{"id": "faab4867e01849ea99206f8a1af80447.16", "name": "Portail 1", "lat": "48323012", "lng": "2445298", "ZOGZOG": "user"},
{"id": "c46b93c15c42449f8cdd14b8e4df0c1e.16", "name": "Portail C", "lat": "48884921", "lng": "2235424","ZOGZOG": "user", "DarkMan": "user"},
{"id": "0032766d102e436ebac101fa168de902b.16", "name": "La boucle infinie", "lat": "48899558", "lng": "2237286", "DarkMan": "user"}
]}
*/ 
window.plugin.uniques_json.optCopy = function() {
	window.plugin.uniques_json.debugAlert('optCopy:', 'start', window.DEBUG_ALL);
	//Parcourir chaque guid et construire le json
	var portals_captured = JSON.parse(window.plugin.uniques_json.getLocalStorage(window.UNIQUES_KEY));

	var first = true;
	var result = '{"portals":[';
		
	for (portalId in portals_captured) {
		if (portalId == 'undefined') {
			portalId = portals_captured[portalId]['lat'] + "." + portals_captured[portalId]['lng'];
		}
		window.plugin.uniques_json.debugAlert('portal key:', portalId, window.DEBUG_ALL);
		if (!first) {
			result += ',';
		}
		else {
			first = false;
		}
		result += '{';
		result += '"id":"' + portalId + '",';
		for (user in portals_captured[portalId]) {
			if (portals_captured[portalId][user] === 'user') {
				result += '"' + user + '":"user",';
			}
		}
		if (portals_captured[portalId]['name'])	{
			name = portals_captured[portalId]['name'].replaceAll('&', '&amp;');
			result += '"name":"' + name.replaceAll('\n', '') + '",';
		}
		result += '"lat":"' + portals_captured[portalId]['lat'] + '",';
		result += '"lng":"' + portals_captured[portalId]['lng'] + '"';
		result += ' }';
	}
	result += ']}';

	dialog({
		html: '<p><a onclick="$(\'.ui-dialog-uniques_jsonSet-copy textarea\').select();">Tout selectionner</a> et CTRL+C pour copier.</p><textarea readonly>' + result + '</textarea>',
		dialogClass: 'ui-dialog-uniques_jsonSet-copy',
		title: 'Unique Export'
	});
}

window.plugin.uniques_json.optPaste = function() {
	dialog({
		html: '<input type="file" id="' + window.plugin.uniques_json.import_element + '"/><textarea id="' + window.plugin.uniques_json.import_element_data + '"></textarea>',
		dialogClass: 'ui-dialog-uniques_jsonSet-copy',
		title: 'Unique Import',
		closeCallback : window.plugin.uniques_json.insertData
	});
	document.getElementById(window.plugin.uniques_json.import_element).addEventListener('change', window.plugin.uniques_json.readSingleFile, false);
}

window.plugin.uniques_json.optReset = function() {
	window.plugin.uniques_json.debugAlert('optReset:', 'start', window.DEBUG_ALL);
	var promptAction = confirm('Toutes les captures seront supprimées ?', '');
	if(promptAction) 
	{
		// On reset puis refresh
		window.plugin.uniques_json.uniques = JSON.parse('{}');
		window.plugin.uniques_json.storeLocal(window.UNIQUES_KEY);
		window.plugin.uniques_json.highlighter();
		window.plugin.uniques_json.optAlert('Réussite. ');
	}
	else
	{
		// On refresh la carte
		window.plugin.uniques_json.highlighter();
		window.plugin.uniques_json.optAlert('Abandon. ');
	}
}

// Génère un json avec tous les portails dont le détail a été chargé
window.plugin.uniques_json.optPortails = function() {
	window.plugin.uniques_json.debugAlert('Get portal detail:', 'start', window.DEBUG_ALL);

	var result = '{"portals":[';
	var i = 0;
	var first = true;
	for (guid in window.portals) {
		i ++;
		if (!first) {
			result += ',';
		}
		else {
			first = false;
		}

		var detail = portalDetail.get(guid); // Utilisation plugin IITC
		if (detail) {
			var lat = detail.latE6;
			var lng = detail.lngE6;
			var user = detail.owner;
			var name = detail.title;
			result += '{';
			result += '"id":"' + guid + '",';
			result += '"' + user + '":"user",';
			result += '"name":"' + name.replaceAll('"', '&amp;#34;') + '",';
			result += '"lat":"' + lat + '",';
			result += '"lng":"' + lng + '"';
			result += '}';

			window.plugin.uniques_json.debugAlert('Get portal detail:', name + '(' + i + '/' +  Object.keys(window.portals).length + ')', window.DEBUG_ALL);
			window.plugin.uniques_json.optAlert('<span style="color: darkgreen">Traitement ' + name + '(' + i + '/' +  Object.keys(window.portals).length + ')</span>');
		}
		else {
			result += '{"notfind":"' + guid + '"}';
			window.plugin.uniques_json.debugAlert('Get portal detail:', guid + '(' + i + '/' +  Object.keys(window.portals).length + ')', window.DEBUG_ERR);
			window.plugin.uniques_json.optAlert('<span style="color: darkred">Traitement ' + guid + '(' + i + '/' +  Object.keys(window.portals).length + ')</span>');
		}
	}
	result += ']}';

	dialog({
		html: '<p><a onclick="$(\'.ui-dialog-uniques_jsonSet-copy textarea\').select();">Tout selectionner</a> et CTRL+C pour copier.</p><textarea readonly>' + result + '</textarea>',
		dialogClass: 'ui-dialog-uniques_jsonSet-copy',
		title: 'Portal Export'
	});
}

///////////
window.plugin.uniques_json.onPortalSelectedPending = false;
window.plugin.uniques_json.onPortalSelected = function() {
    if(window.selectedPortal == null) return;

    if (!window.plugin.uniques_json.onPortalSelectedPending) {
      window.plugin.uniques_json.onPortalSelectedPending = true;

      setTimeout(function() { // the sidebar is constructed after firing the hook
        window.plugin.uniques_json.onPortalSelectedPending = false;
        // Prepend a star to mobile status-bar
        if(window.plugin.targets_json.isSmart) {}

        $('#portaldetails > h3.title').before(window.plugin.targets_json.htmlCallAddTagEnl);
		$('#portaldetails > h3.title').before(window.plugin.targets_json.htmlCallAddTagRes);
      }, 0);
    }
}

/////////////

window.plugin.uniques_json.optRefresh = function() {
	window.plugin.uniques_json.debugAlert('optRefresh:', 'start', window.DEBUG_ALL);

	//window.addHook('portalSelected', window.plugin.targets_json.onPortalSelected);
	//window.addHook('portalDetailsUpdated', window.plugin.showLinkedPortal.portalDetail);
	var promptAction = prompt('Saisir le passcode (risque ban)', '');
    if (promptAction !== null && promptAction.startsWith('REFRESH#'))
	{
		//var params 
		var i_max =  promptAction.replace('REFRESH#', '');
		window.plugin.uniques_json.debugAlert('optRefresh number:', i_max, window.DEBUG_ALL);
		var i = 0;
		// Boucle de refresh des infos des portails
		for (guid in window.portals)
		{
			portal = window.portals[guid];
			i ++;
			var detail = portalDetail.get(guid); // Utilisation plugin IITC
			//if (!detail) // On ne recharge que ce qui n'existe pas encore
			{
				window.plugin.uniques_json.debugAlert('Refresh portal :', guid, window.DEBUG_ERR); //TODO
				//selectPortal(guid);
				//window.renderPortalDetails a la place du request puis catcher la fin du request avec addhoock
				portalDetail.request(guid);
				var s = Math.floor((Math.random() * 5) + 1); // entre 1s et  5s
				console.log('Sleep :',  s + '=>' + guid);
				sleep(s * 1000); //Sleep pour pas requeter l'intel comme un ouf en seconde
				setTimeout(function(){ sleep(10);}, 0.1); // on rend la main pour que la fonction ajax récupère les données de detail

				if (i >= i_max) //break manuel pour limiter les appels
				{
					break;
				}
			}
		}

		// Libère le CPU avant l'affichage
		setTimeout(window.plugin.uniques_json.optPortails, 4000);
	}
}

// Construction des radio du menu Params
window.plugin.uniques_json.radio = function(value, title, name, selected) {
	var result = '<input type="radio" name="' + name + '" value="' + value + '"';
	if (selected === value)  result += ' checked ';
	result += '/>' + title;
	return result;
}

window.plugin.uniques_json.saveParams = function() {
	window.plugin.uniques_json.user = document.getElementById('user_json').value;
	window.plugin.uniques_json.captured = document.getElementById('captured_json').checked;
	var elts = document.getElementsByName('icon_captured_json');
	for(var elt in elts) {
		if(elts[elt].checked) {
			window.plugin.uniques_json.flag_captured = elts[elt].value;
			break;
		 }
	}
	window.plugin.uniques_json.uncaptured = document.getElementById('uncaptured_json').checked;
	elts = document.getElementsByName('icon_uncaptured_json');
	for(var elt in elts) {
		if(elts[elt].checked) {
			window.plugin.uniques_json.flag_uncaptured = elts[elt].value;
			break;
		 }
	}	
	window.plugin.uniques_json.load_portals = document.getElementById('load_portals_json').checked;
	if (window.plugin.uniques_json.user == '') window.plugin.uniques_json.user = window.PLAYER.nickname;
	
	var result = '{"params":{"user":"';
	result += window.plugin.uniques_json.user;
	result += '","captured":';
	result += window.plugin.uniques_json.captured;
	result += ',"uncaptured":';
	result += window.plugin.uniques_json.uncaptured;
	result += ',"flag_captured":"';
	result += window.plugin.uniques_json.flag_captured;
	result += '","flag_uncaptured":"';
	result += window.plugin.uniques_json.flag_uncaptured;
	result += '","load_portals":"';
	result += window.plugin.uniques_json.load_portals;
	result += '"}}';
	try
	{
		window.plugin.uniques_json[window.UNIQUES_PARAMS_KEY] = JSON.parse(result);
		window.plugin.uniques_json.storeLocal(window.UNIQUES_PARAMS_KEY);
		window.plugin.uniques_json.setIcons();
		window.plugin.uniques_json.highlighter();
		window.plugin.uniques_json.optAlert('Réussite. ');
	} 
	catch(e) 
	{
		window.plugin.uniques_json.optAlert('<span style="color: #f88">Echec. </span>');
		window.plugin.uniques_json.debugAlert('saveParams erreur:', e.message, window.DEBUG_ERR);
	}
}

// Affiche le menu des options
window.plugin.uniques_json.optParams = function() {
	window.plugin.uniques_json.debugAlert('optParams:', 'start', window.DEBUG_ALL);
	
	var result = '';
	result += '<div>User : <input id="user_json" name="user_json" type="text" value="' + window.plugin.uniques_json.user + '"/></div>';
	result += '<div>Capturés : <input id="captured_json" name="captured_json" type="checkbox"'; 
	if (window.plugin.uniques_json.captured)  result += ' checked '
	result += '"/></div>';
	result += '&nbsp;<div>icon : ';
	result += window.plugin.uniques_json.radio('black', 'Etoile', 'icon_captured_json', window.plugin.uniques_json.flag_captured);
	result += window.plugin.uniques_json.radio('pink', 'Cochon', 'icon_captured_json', window.plugin.uniques_json.flag_captured);
	result += window.plugin.uniques_json.radio('red', 'Drapeau', 'icon_captured_json', window.plugin.uniques_json.flag_captured);
	result += '</div><br/>';
	result += '<div>Non capturés : <input id="uncaptured_json" name="uncaptured_json" type="checkbox"'; 
	if (window.plugin.uniques_json.uncaptured)  result += ' checked '
	result += '"/></div>';
	result += '&nbsp;<div>icon : ';
	result += window.plugin.uniques_json.radio('enl', 'ENL', 'icon_uncaptured_json', window.plugin.uniques_json.flag_uncaptured);
	result += window.plugin.uniques_json.radio('res', 'RES', 'icon_uncaptured_json', window.plugin.uniques_json.flag_uncaptured);
	result += '</div><br/>';
	result += '<div>Chargement des données : <input id="load_portals_json" name="load_portals_json" type="checkbox"'; 
	if (window.plugin.uniques_json.load_portals)  result += ' checked '
	result += '"/></div>';

	dialog({
		html: result,
		dialogClass: 'ui-dialog-uniques_jsonSet-copy',
		title: 'Unique Params',
		closeCallback : window.plugin.uniques_json.saveParams
	});
}

  /**********/
 /* OUTILS */
/**********/

// Debug dans la console
window.plugin.uniques_json.debugAlert = function(title, message, level) {
	if (window.plugin.uniques_json.debug){
		if (level >= window.plugin.uniques_json.debug_level) console.log(title + message);
	}
}

// Debug les données d'un portail
window.plugin.uniques_json.debugPortal = function (portalId, portalCaptured, portalLat, portalLng) {
	window.plugin.uniques_json.debugAlert('debugPortal:',  'start', window.DEBUG_ALL);
	window.plugin.uniques_json.debugAlert('portalId:', portalId, window.DEBUG_ALL);
	window.plugin.uniques_json.debugAlert('portalCaptured:', portalCaptured, window.DEBUG_ALL);
	window.plugin.uniques_json.debugAlert('lat:' , portalLat, window.DEBUG_ALL);
	window.plugin.uniques_json.debugAlert('lng:' , portalLng, window.DEBUG_ALL);
}

window.plugin.uniques_json.setupCSS = function() {
	$("<style>")
	.prop("type", "text/css")
	.html("#uniques-json-container {\n  display: block;\n  text-align: center;\n  margin: 6px 3px 1px 3px;\n  padding: 0 4px;\n}\n#uniques-container label {\n  margin: 0 0.5em;\n}\n#uniques-json-container input {\n  vertical-align: middle;\n}\n\n.portal-list-uniques input[type=\'checkbox\'] {\n  padding: 0;\n  height: auto;\n  margin-top: -5px;\n  margin-bottom: -5px;\n}\n#uniques_jsonSetbox a{\n	display:block;\n	color:#ffce00;\n	border:1px solid #ffce00;\n	padding:3px 0;\n	margin:10px auto;\n	width:80%;\n	text-align:center;\n	background:rgba(8,48,78,.9);\n}\n#uniques_jsonSetbox a.disabled,\n#uniques_jsonSetbox a.disabled:hover{\n	color:#666;\n	border-color:#666;\n	text-decoration:none;\n}\n/* Opt panel - copy */\n.ui-dialog-uniques_jsonSet-copy textarea{\n	width:96%;\n	height:120px;\n	resize:vertical;\n}\n\n\n\n")
	.appendTo("head");
}

window.plugin.uniques_json.setupContent = function() {
	// Checkbox 'Capturé'
	plugin.uniques_json.contentHTML = '<div id="uniques-json-container">'
		+ '<label><input type="checkbox" id="captured-uniques-json" name="captured-uniques-json" onclick="window.plugin.uniques_json.updateCaptured($(this).prop(\'checked\'))">&nbsp;Capturé</label>'
		+ '</div>';
    // Lien pour ouvrir les Options
	plugin.uniques_json.htmlCallSetBox = '<a onclick="window.plugin.uniques_json.manualOpt();return false;"><img width="16px" height="16px" alt="Uniques Json" src="' + window.plugin.uniques_json.menuIcon + '"/></a>';
	plugin.uniques_json.disabledMessage = '<div id="uniques-json-container" class="help" title="Your browser does not support localStorage">Plugin Uniques Json disabled</div>';
}

window.plugin.uniques_json.setIcons = function() {
	var capturedIcon = window.plugin.uniques_json.getCapturedIcon();
	var uncapturedIcon = window.plugin.uniques_json.getUncapturedIcon();

	plugin.uniques_json.iconPortalCaptured = L.Icon.Default.extend(
	{
		options: 
		{
			iconUrl: capturedIcon,
			iconRetinaUrl: capturedIcon
		}
	});
	plugin.uniques_json.iconPortalUncaptured = L.Icon.Default.extend(
	{
		options: 
		{
			iconUrl: uncapturedIcon,
			iconRetinaUrl: uncapturedIcon
		}
	});
}

window.plugin.uniques_json.readSingleFile = function(e) {
	var file = e.target.files[0];
	if (!file) {
		return;
	}
	var reader = new FileReader();
	reader.onload = function(e) {
		var contents = e.target.result;
		document.getElementById(window.plugin.uniques_json.import_element_data).innerHTML = contents.replaceAll('&', '&amp;');;
	};
	reader.readAsText(file);
}

String.prototype.replaceAll = function(search, replacement) {
    var target = this;
    return target.replace(new RegExp(search, 'g'), replacement);
};

function sleep(milliseconds) {
  var start = new Date().getTime();
  for (var i = 0; i < 1e7; i++) {
    if ((new Date().getTime() - start) > milliseconds){
      break;
    }
  }
}

  /*******************/
 /* Synchronization */
/*******************/

plugin.uniques_json.sync = function(guid) {
	window.plugin.uniques_json.storeLocal(window.UNIQUES_KEY);
}

//Call after local or remote change uploaded ?
window.plugin.uniques_json.syncCallback = function(pluginName, fieldName, e, fullUpdated) {
	window.plugin.uniques_json.debugAlert('syncCallback:', 'start', window.DEBUG_ALL);
	if (fullUpdated) {
		window.runHooks('pluginUniquesJsonRefreshAll');
		return;
	}
}

window.plugin.uniques_json.syncInitialed = function(pluginName, fieldName) {
	window.plugin.uniques_json.debugAlert('syncInitialed:', 'start', window.DEBUG_ALL);
	if(fieldName === 'uniques_json') {
		window.plugin.uniques_json.highlighter();
	}
}

  /************/
 /* Stockage */
/************/

/*
{
	"faab4898f11849ea99206f8a1af80447.16":{"name":"La boucle terminée","lat":"43237547","lng":"2256478","ZOGZOG":"user"},
	"faab4898e01849ea99486f8a1af33347.22":{"name":"La boucle du milieu","lat":"43256547","lng":"2244478"},	
}
*/
window.plugin.uniques_json.insertData = function(element) {
	window.plugin.uniques_json.debugAlert('insertData:', 'start', window.DEBUG_ALL);
	try {
		var portals_captured = JSON.parse(document.getElementById(window.plugin.uniques_json.import_element_data).innerHTML);
		var result = '{';
		for	(index = 0; index < portals_captured['portals'].length; index ++) {
			var value = portals_captured['portals'][index];
			if (index > 0)
			{
				result += ','
			}
			
			// Présence de l'id portail
			if (value.id)
			{
				result += '"' + value['id'] + '":{';
				for (user in portals_captured['portals'][index]) 
				{
					if (portals_captured['portals'][index][user] === 'user')
					{
						result += '"' + user + '":"user",';
					}
				}					
				result += '"name":"' + value['name'] + '",';
				result += '"lat":"' + value['lat'] + '",';
				result += '"lng":"' + value['lng'] + '"';
				result += '}';					
			}
			else
			{
				// Calcul de l'id de portail
				var guid = window.findPortalGuidByPositionE6(value.lat, value.lng);
				if(guid) 
				{
					result += '"' + guid + '":{';
				}
				else 
				{
					result += '"' + value['lat'] + "." + value['lng'] + '":{';
				}
				for (user in portals_captured['portals'][index]) 
				{
					if (portals_captured['portals'][index][user] === 'user')
					{
						result += '"' + user + '":"user",';
					}
				}
				result += '"name":"' + value['name'] + '",';
				result += '"lat":"' + value['lat'] + '",';
				result += '"lng":"' + value['lng'] + '"';
				result += '}';
			}
		}
		result += '}';
		window.plugin.uniques_json.debugAlert('Json:', result, window.DEBUG_ALL);
		// On écrase la liste courante
		window.plugin.uniques_json.uniques = JSON.parse(result);
		window.plugin.uniques_json.storeLocal(window.UNIQUES_KEY);
		// On refresh la carte
		window.plugin.uniques_json.highlighter();
		window.runHooks('pluginUniquesJsonRefreshAll');
		window.plugin.uniques_json.optAlert('Réussite. ');
	} 
	catch(e) 
	{
		window.plugin.uniques_json.optAlert('<span style="color: #f88">Echec. ' + e.message + '</span>');
		window.plugin.uniques_json.debugAlert('optPaste erreur:', e.message, window.DEBUG_ERR);
	}
}

// Remplace un 'lat.lng' par guid si correspond au meme portail dans le store local
window.plugin.uniques_json.updateLocalKey = function(name, oldKeyValue, newKeyValue) {
	window.plugin.uniques_json.debugAlert('updateLocalKey:', 'start', window.DEBUG_ALL);
	var result = false;
	var key = window.plugin.uniques_json.FIELDS[name];
	if(key === undefined) return;

	var value = window.plugin.uniques_json[name];
	if(typeof value !== 'undefined' && value !== null) 
	{
		var uniqueInfoOld = plugin.uniques_json.uniques[oldKeyValue];
		var uniqueInfoNew = plugin.uniques_json.uniques[newKeyValue];
		if ((! uniqueInfoNew) && uniqueInfoOld)
		{
			plugin.uniques_json.uniques[newKeyValue] = plugin.uniques_json.uniques[oldKeyValue];
			delete plugin.uniques_json.uniques[oldKeyValue];
			window.plugin.uniques_json.debugAlert('Delete value:', oldKeyValue, window.DEBUG_WARN);
			result = true;
		}
	} 
	return result;
}

window.plugin.uniques_json.getLocalStorage = function(name) {
	window.plugin.uniques_json.debugAlert('getLocalStorage :', name, window.DEBUG_ALL);
	var key = window.plugin.uniques_json.FIELDS[name];
	if(key === undefined) return;

	var value = window.plugin.uniques_json[name];
	if(typeof value !== 'undefined' && value !== null) 
	{
		window.plugin.uniques_json.debugAlert('localStorage :', localStorage[key], window.DEBUG_ALL);
		return localStorage[key];
	}
	return;
}

window.plugin.uniques_json.storeLocal = function(name) {
	window.plugin.uniques_json.debugAlert('storeLocal:', name, window.DEBUG_ALL);
	var key = window.plugin.uniques_json.FIELDS[name];
	if(key === undefined) return;

	var value = window.plugin.uniques_json[name];

	if(typeof value !== 'undefined' && value !== null) 
	{
		localStorage[key] = JSON.stringify(value);
	} 
	else 
	{
		localStorage.removeItem(key);
	}
}

window.plugin.uniques_json.loadLocal = function(name) {
	window.plugin.uniques_json.debugAlert('loadLocal:', name, window.DEBUG_ALL);
	var key = window.plugin.uniques_json.FIELDS[name];
	if(key === undefined) return;

	if(localStorage[key] !== undefined) 
	{
		try 
		{
			window.plugin.uniques_json.debugAlert('loadLocal :', localStorage[key], window.DEBUG_ALL);
			window.plugin.uniques_json[name] = JSON.parse(localStorage[key]);
		} 
		catch(e) 
		{
			window.plugin.uniques_json.debugAlert('loadLocal erreur:', e.message, window.DEBUG_ERR);
			window.plugin.uniques_json.debugAlert('loadLocal localStorage:', localStorage[key], window.DEBUG_ERR);
		}
	}
}

  /**********/
 /* Params */
/**********/

window.plugin.uniques_json.getUser = function() {
	if (window.plugin.uniques_json[window.UNIQUES_PARAMS_KEY]) {
		if (window.plugin.uniques_json[window.UNIQUES_PARAMS_KEY]['params']) {
			var user = window.plugin.uniques_json[window.UNIQUES_PARAMS_KEY]['params']['user'];
			window.plugin.uniques_json.debugAlert('Params getUser:', user, window.DEBUG_ALL);
			return user;
		}
	}
	window.plugin.uniques_json.debugAlert('Params defaultUser:', window.plugin.uniques_json.user, window.DEBUG_ALL);
	return window.plugin.uniques_json.user;
}

window.plugin.uniques_json.getCaptured = function() {
	var captured = false;
	if (window.plugin.uniques_json[window.UNIQUES_PARAMS_KEY]) {
		if (window.plugin.uniques_json[window.UNIQUES_PARAMS_KEY]['params']) {
			captured = window.plugin.uniques_json[window.UNIQUES_PARAMS_KEY]['params']['captured'];
		}
	}
	window.plugin.uniques_json.debugAlert('Params getCaptured:', captured, window.DEBUG_ALL);
	return captured;
}

window.plugin.uniques_json.getUncaptured = function() {
	var uncaptured = false;
	if (window.plugin.uniques_json[window.UNIQUES_PARAMS_KEY]) {
		if (window.plugin.uniques_json[window.UNIQUES_PARAMS_KEY]['params']) {
			uncaptured = window.plugin.uniques_json[window.UNIQUES_PARAMS_KEY]['params']['uncaptured'];
		}
	}
	window.plugin.uniques_json.debugAlert('Params getUncaptured:', uncaptured, window.DEBUG_ALL);
	return uncaptured;
}

window.plugin.uniques_json.getCapturedFlag = function() {
	var flag_captured = 'black';
	if (window.plugin.uniques_json[window.UNIQUES_PARAMS_KEY]) {
		if (window.plugin.uniques_json[window.UNIQUES_PARAMS_KEY]['params']) {
			flag_captured = window.plugin.uniques_json[window.UNIQUES_PARAMS_KEY]['params']['flag_captured'];
		}
	}
	window.plugin.uniques_json.debugAlert('Params getCapturedFlag:', flag_captured, window.DEBUG_ALL);
	
	return flag_captured;
}

window.plugin.uniques_json.getUncapturedFlag = function() {
	var flag_uncaptured = 'enl';
	if (window.plugin.uniques_json[window.UNIQUES_PARAMS_KEY]) {
		if (window.plugin.uniques_json[window.UNIQUES_PARAMS_KEY]['params']) {
			flag_uncaptured = window.plugin.uniques_json[window.UNIQUES_PARAMS_KEY]['params']['flag_uncaptured'];
		}
	}
	window.plugin.uniques_json.debugAlert('Params getUncapturedFlag:', flag_uncaptured, window.DEBUG_ALL);
	
	return flag_uncaptured;
}

window.plugin.uniques_json.getCapturedIcon = function() {
	var flag_captured = window.plugin.uniques_json.getCapturedFlag();
	
	if (flag_captured === 'black') return window.plugin.uniques_json.blackIcon;
	if (flag_captured === 'pink') return window.plugin.uniques_json.pinkIcon;
	if (flag_captured === 'red') return window.plugin.uniques_json.redIcon;
	return window.plugin.uniques_json.blackIcon;
}

window.plugin.uniques_json.getUncapturedIcon = function() {
	var flag_uncaptured = window.plugin.uniques_json.getUncapturedFlag();
	
	if (flag_uncaptured === 'enl') return window.plugin.uniques_json.enlIcon;
	if (flag_uncaptured === 'res') return window.plugin.uniques_json.resIcon;
	return window.plugin.uniques_json.enlIcon;
}

  /********/
 /* Init */
/********/

window.plugin.uniques_json.delayedUpdatePortalFlags = function(wait) {

  if (window.plugin.uniques_json.timer === undefined) {
    window.plugin.uniques_json.timer = setTimeout ( function() {
      window.plugin.uniques_json.timer = undefined;
      window.plugin.uniques_json.highlighter();
    }, wait*1000);

  }
}

//Call after IITC and all plugin loaded
window.plugin.uniques_json.registerFieldForSyncing = function() {
	if(!window.plugin.sync) return;
	window.plugin.sync.registerMapForSync('uniques_json', 'uniques_json', window.plugin.uniques_json.syncCallback, window.plugin.uniques_json.syncInitialed);
}

var setup = function() {
	window.plugin.uniques_json.loadLocal(window.UNIQUES_PARAMS_KEY);
	
	// Params
	window.plugin.uniques_json.user = window.plugin.uniques_json.getUser();
	window.plugin.uniques_json.captured = window.plugin.uniques_json.getCaptured();
	window.plugin.uniques_json.uncaptured = window.plugin.uniques_json.getUncaptured();
	window.plugin.uniques_json.flag_captured = window.plugin.uniques_json.getCapturedFlag();
	window.plugin.uniques_json.flag_uncaptured = window.plugin.uniques_json.getUncapturedFlag();
	// Params
	
	// Layer & Icon
	window.plugin.uniques_json.setIcons();
	window.plugin.uniques_json.drawnFlag = new L.LayerGroup();
    window.addLayerGroup('Uniques Json', plugin.uniques_json.drawnFlag, true);
	map.on('layeradd',function(obj) {
		if(obj.layer === plugin.uniques_json.drawnFlag) 
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
	
	window.pluginCreateHook('pluginUniquesJsonUpdateUniques');
	window.pluginCreateHook('pluginUniquesJsonRefreshAll');
	
	window.plugin.uniques_json.setupCSS();
	window.plugin.uniques_json.setupContent();
	window.plugin.uniques_json.loadLocal(window.UNIQUES_KEY);
	window.addHook('portalDetailsUpdated', window.plugin.uniques_json.onPortalDetailsUpdated);
	window.addHook('iitcLoaded', window.plugin.uniques_json.registerFieldForSyncing);

	if($.inArray('pluginuniques_jsonOpenOpt', window.VALID_HOOKS) < 0) { window.VALID_HOOKS.push('pluginuniques_jsonOpenOpt'); }
	$('#toolbox').append(window.plugin.uniques_json.htmlCallSetBox);
	
    var actions = '';
	
    actions += '<a onclick="window.plugin.uniques_json.optReset();return false;">Reset</a>';
    actions += '<a onclick="window.plugin.uniques_json.optCopy();return false;">Exporter</a>';
    actions += '<a onclick="window.plugin.uniques_json.optPaste();return false;">Importer</a>';
	actions += '<a onclick="window.plugin.uniques_json.optRefresh();return false;">Scan Map</a>';   
	actions += '<a onclick="window.plugin.uniques_json.optParams();return false;">Paramètres</a>';  
	if (window.plugin.uniques_json.debug)
	{
		actions += '<a onclick="window.plugin.uniques_json.optPortails();return false;">Ré-extraire portails</a>';   
	}
	plugin.uniques_json.htmlSetbox = '<div id="uniques_jsonSetbox">' + actions + '</div>';

	window.addHook('requestFinished', function() { setTimeout(function(){window.plugin.uniques_json.delayedUpdatePortalFlags(3.0);},1); });
	window.addHook('mapDataRefreshEnd', function() { window.plugin.uniques_json.delayedUpdatePortalFlags(0.5); });
	window.map.on('overlayadd overlayremove', function() { setTimeout(function(){window.plugin.uniques_json.delayedUpdatePortalFlags(1.0);},1); });
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
