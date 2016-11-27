<?php

/* BDD */
function insertUser($db, $fp, $user, $team)
{
	// Gestion user
	if ((! empty($user)) && ($user != '[uncaptured]') && ($user != '__JARVIS__') && ($user != '__ADA__'))
	{
		$query = "SELECT * FROM USERS WHERE NAME='$user'";
		$results = $db->query($query);
		$line = $results->fetch();
		if($line === false)
		{
			//On insère car nouvelle valeur
			$query = "INSERT INTO USERS(NAME, TEAM) VALUES ('$user', '$team')";
			$results = @$db->exec($query);
			mysqlError($db, $results) ;
			writeLog($fp, $query." ($results)");
			echo "&nbsp;&nbsp;@$user ($team) - inserted\n";
		} 
		else
		{
			/* Update temporaire */
			if ($team !== 'UNKNOWN')
			{
				if ((! array_key_exists('TEAM', $line)) || empty($line['TEAM']) || $line['TEAM'] === 'UNKNOWN') {
					$query = "UPDATE USERS set TEAM = '$team' WHERE NAME = '$user'";
					$results = @$db->exec($query);
					mysqlError($db, $results) ;
					writeLog($fp, $query." ($results)");
				}
			}
		}
	}
}

function insertPortal($db, $fp, $guid, $lat, $lng, $name)
{
	$name = SQLite3::escapeString($name);
	$query = "SELECT * FROM PORTALS WHERE ID='$guid'";
	$results = $db->query($query);
	$line = $results->fetch();
	if($line === false)
	{
		$query = "SELECT * FROM PORTALS WHERE LAT='$lat' AND LNG='$lng'";
		$results = $db->query($query);
		$line = $results->fetch();
		if($line === false)
		{
			$cityCountry = getGeoInfo($fp, $lat, $lng);
			$city = SQLite3::escapeString($cityCountry[0]);
			$country = SQLite3::escapeString($cityCountry[1]);
			$code = SQLite3::escapeString($cityCountry[2]);
			//On insère car nouvelle valeur
			$query = '';
			if (empty($city))
			{
				if (empty($country))
				{
					if (empty($code)) $query = "INSERT INTO PORTALS(ID, LAT, LNG, NAME) VALUES ('$guid', '$lat', '$lng', '$name')";
					else $query = "INSERT INTO PORTALS(ID, LAT, LNG, NAME, POSTAL_CODE) VALUES ('$guid', '$lat', '$lng', '$name', '$code')";
				}
				else
				{
					if (empty($code)) $query = "INSERT INTO PORTALS(ID, LAT, LNG, NAME, COUNTRY) VALUES ('$guid', '$lat', '$lng', '$name', '$country')";
					else $query = "INSERT INTO PORTALS(ID, LAT, LNG, NAME, COUNTRY, POSTAL_CODE) VALUES ('$guid', '$lat', '$lng', '$name', '$country', '$code')";
				}
			}
			else
			{
				if (empty($country))
				{
					if (empty($code)) $query = "INSERT INTO PORTALS(ID, LAT, LNG, NAME, CITY) VALUES ('$guid', '$lat', '$lng', '$name', '$city')";
					else $query = "INSERT INTO PORTALS(ID, LAT, LNG, NAME, CITY, POSTAL_CODE) VALUES ('$guid', '$lat', '$lng', '$name', '$city', '$code')";
				}
				else
				{
					if (empty($code)) $query = "INSERT INTO PORTALS(ID, LAT, LNG, NAME, CITY, COUNTRY) VALUES ('$guid', '$lat', '$lng', '$name', '$city', '$country')";
					else $query = "INSERT INTO PORTALS(ID, LAT, LNG, NAME, CITY, COUNTRY, POSTAL_CODE) VALUES ('$guid', '$lat', '$lng', '$name', '$city', '$country', '$code')"; 
				}
			}
			//$query = "INSERT INTO PORTALS(ID, LAT, LNG, NAME, CITY, COUNTRY) VALUES ('$guid', '$lat', '$lng', '$name', '$city', '$country')";
			$results = @$db->exec($query);
			mysqlError($db, $results) ;
			writeLog($fp, $query." ($results)");
			echo "$lat - $lng - $name inserted\n";
		}
		else
		{
			// MAJ du guid
			if (($line['ID'] === $lat.'.'.$lng) && ($guid !== $line['ID']) && isset($guid))
			{
				$query = "SET FOREIGN_KEY_CHECKS = 0";
				@$db->exec($query);

				//On met à jour le guid
				$query = "UPDATE PORTALS set ID = '$guid' WHERE ID = '".$line['ID']."'";
				$results = @$db->exec($query);
				mysqlError($db, $results) ;
				writeLog($fp, $query." ($results)");
				
				$query = "UPDATE PORTALS_USERS set ID_PORTAL = '$guid' WHERE ID_PORTAL = '".$line['ID']."'";
				$results = @$db->exec($query);
				mysqlError($db, $results) ;
				writeLog($fp, $query." ($results)");

				$query = "SET FOREIGN_KEY_CHECKS = 1";
				@$db->exec($query);

				echo "&nbsp;&nbsp;$guid - $name ID updated\n";
			}
			else
			{
				$guid = $line['ID'];
				echo '.'."\n";
			}
			
			// MAJ du name
			if (($line['NAME'] == '#TOBECOMPLETED#') && ($name != '#TOBECOMPLETED#'))
			{
				$query = "UPDATE PORTALS set NAME = '$name' WHERE ID = '".$guid."'";
				$results = @$db->exec($query);
				mysqlError($db, $results) ;
				writeLog($fp, $query." ($results)");
				echo "&nbsp;&nbsp;$guid - $name NAME updated\n";
			}

			// MAJ de city & country
			if ( (! array_key_exists('CITY', $line)) || (! array_key_exists('COUNTRY', $line)) || (empty($line['CITY'])) || (empty($line['COUNTRY'])) )
			{
				$cityCountry = getGeoInfo($fp, $lat, $lng);
				$city = SQLite3::escapeString($cityCountry[0]);
				$country = SQLite3::escapeString($cityCountry[1]);
				$code = SQLite3::escapeString($cityCountry[2]);
				$sCityRequest = '';
				$sCountryRequest = '';
				$sCodeRequest = '';
				$sRequest = '';
				if ( ($city !== null) && (! empty($city)) && (empty($line['CITY'])) ) $sCityRequest = "CITY = '$city'";
				if ( ($country !== null) && (! empty($country))&& (empty($line['COUNTRY'])) ) $sCountryRequest = "COUNTRY = '$country'";
				if ( ($code !== null) && (! empty($code)) && (empty($line['POSTAL_CODE'])) ) $sCodeRequest = "POSTAL_CODE = '$code'";
				
				$sRequest = $sCityRequest;
				if (empty($sRequest))
				{
					$sRequest = $sCountryRequest;
					if (empty($sRequest)) $sRequest = $sCodeRequest;
					else if (! empty($sCodeRequest)) $sRequest .= ', '.$sCodeRequest;
				}
				else
				{
					if (! empty($sCountryRequest)) $sRequest .= ', '.$sCountryRequest;
					if (! empty($sCodeRequest)) $sRequest .= ', '.$sCodeRequest;
				}

				if (! empty($sRequest)) {
					$query = "UPDATE PORTALS set ".$sCityRequest.$sCountryRequest." WHERE ID = '".$guid."'";
					$results = @$db->exec($query);
					mysqlError($db, $results) ;
					writeLog($fp, $query." ($results)");
					echo "&nbsp;&nbsp;$guid $city/$country/$code CITY/COUNTRY/CODE updated\n";
				}
			}
		}
	}
	else
	{
		//MAJ LNG/LAT, a faire manuellement
		if ($lat !== $line['LAT'] || $lng !== $line['LNG'])
		{
			$query = "INSERT INTO ERRORS (ID, LAT, LNG, MSG) VALUES ('$guid', '$lat', '$lng', 'Coord. a updater')";
			$results = @$db->exec($query);
			mysqlError($db, $results) ;
			writeLog($fp, $query." ($results)");
		}
		
		// MAJ du guid
		if (($line['ID'] === $lat.'.'.$lng) && ($guid !== $line['ID']))
		{
			$query = "SET FOREIGN_KEY_CHECKS = 0";
			@$db->exec($query);
				
			$query = "UPDATE PORTALS_USERS set ID_PORTAL = '$guid' WHERE ID_PORTAL = '".$line['ID']."'";
			$results = @$db->exec($query);
			mysqlError($db, $results);
			writeLog($fp, $query." ($results)");
			
			//On met à jour le guid
			$query = "UPDATE PORTALS set ID = '$guid' WHERE ID = '".$line['ID']."'";
			$results = @$db->exec($query);
			mysqlError($db, $results);
			writeLog($fp, $query." ($results)");
			
			$query = "SET FOREIGN_KEY_CHECKS = 1";
			@$db->exec($query);
				
			echo "&nbsp;&nbsp;$guid - $name ID updated\n";
		}

		// MAJ du name
		if (($line['NAME'] == '#TOBECOMPLETED#') && ($name != '#TOBECOMPLETED#'))
		{
			$query = "UPDATE PORTALS set NAME = '$name' WHERE ID = '".$guid."'";
			$results = @$db->exec($query);
			mysqlError($db, $results) ;
			writeLog($fp, $query." ($results)");
			echo "&nbsp;&nbsp;$guid - $name NAME updated\n";
		}

		// MAJ de city & country & postal_code
		if ( (! array_key_exists('CITY', $line)) || (! array_key_exists('COUNTRY', $line)) || (! array_key_exists('POSTAL_CODE', $line)) || (empty($line['CITY'])) || (empty($line['COUNTRY'])) || (empty($line['POSTAL_CODE'])) )
		{
			$cityCountry = getGeoInfo($fp, $lat, $lng);
			$city = SQLite3::escapeString($cityCountry[0]);
			$country = SQLite3::escapeString($cityCountry[1]);
			$code = SQLite3::escapeString($cityCountry[2]);
			$sCityRequest = '';
			$sCountryRequest = '';
			$sCodeRequest = '';
			$sRequest = '';
			if ( ($city !== null) && (! empty($city)) && (empty($line['CITY'])) ) $sCityRequest = "CITY = '$city'";
			if ( ($country !== null) && (! empty($country))&& (empty($line['COUNTRY'])) ) $sCountryRequest = "COUNTRY = '$country'";
			if ( ($code !== null) && (! empty($code)) && (empty($line['POSTAL_CODE'])) ) $sCodeRequest = "POSTAL_CODE = '$code'";
			
			$sRequest = $sCityRequest;
			if (empty($sRequest))
			{
				$sRequest = $sCountryRequest;
				if (empty($sRequest)) $sRequest = $sCodeRequest;
				else if (! empty($sCodeRequest)) $sRequest .= ', '.$sCodeRequest;
			}
			else
			{
				if (! empty($sCountryRequest)) $sRequest .= ', '.$sCountryRequest;
				if (! empty($sCodeRequest)) $sRequest .= ', '.$sCodeRequest;
			}

			if (! empty($sRequest)) {
				$query = "UPDATE PORTALS set ".$sRequest." WHERE ID = '".$guid."'";
				$results = @$db->exec($query);
				mysqlError($db, $results) ;
				writeLog($fp, $query." ($results)");
				echo "&nbsp;&nbsp;$guid $city/$country/$code CITY/COUNTRY/CODE updated\n";
			}
			else
			{
				echo "&nbsp;&nbsp;$guid NO DATA CITY/COUNTRY/CODE\n";
			}
		}
	}
	
	return $guid;
}

function insertRelationUserPortal($db, $fp, $user, $guid)
{
	// Gestion lien portail
	if ((! empty($user)) && ($user != '[uncaptured]') && ($user != '__JARVIS__') && ($user != '__ADA__'))
	{
		$query = "SELECT * FROM PORTALS_USERS WHERE USER_NAME='$user' AND ID_PORTAL='$guid'";
		$results = $db->query($query);
		if($results->fetch() === false)
		{
			//On insère car nouvelle valeur
			$query = "INSERT INTO PORTALS_USERS (USER_NAME, ID_PORTAL, CAPTURED) VALUES ('$user', '$guid', true)";
			$results = @$db->exec($query);
			mysqlError($db, $results) ;
			writeLog($fp, $query." ($results)");
			echo "@$user - $guid inserted\n";
		}
		else
		{
			writeLog($fp, "Lien $user/$guid existant");
			//echo "@$user - $guid exist<br/>";
		}
	}
}

/* LOGS */
function writeLog($fp, $line)
{
	if ($fp !== null)
	{
		fputs ($fp, $line."\n");
	}
}

function getFile($file)
{
	date_default_timezone_set('Europe/Paris');
	$date_courante = date("Ymd");

	if($file === 'mel2sqlite')	return fopen ('logs/mel2sql_'.$date_courante.'.log', 'a+');
	if($file === 'mel2mysql') return fopen ('logs/mel2mysql_'.$date_courante.'.log', 'a+');
	if($file === 'json2sql') return fopen ('logs/json2sql_'.$date_courante.'.log', 'a+');
	if($file === 'json2mysql') return fopen ('logs/json2mysql_'.$date_courante.'.log', 'a+');
	if($file === 'sql2json') return fopen ('logs/sql2json_'.$date_courante.'.log', 'a+');
	if($file === 'test') return fopen ('logs/test_'.$date_courante.'.log', 'a+');
	if($file === 'gets') return fopen ('logs/gets_'.$date_courante.'.log', 'a+');
}

/* OUTILS */
$isGeoCodeInfoBurn = false; // Mettre à true pour DEBUG
$numberGeoCode = 0;
function getGeoInfo($fp, $lat, $lng)
{
	if ((! $GLOBALS['isGeoCodeInfoBurn']) && ($GLOBALS['numberGeoCode'] < 2500)) //limite a 2500 par jour
	{
		sleep(0.1); // limite a 10 requetes par seconde
		$latlng = ($lat/1E6).','.($lng/1E6);
		$returns  = null;
		$url = S_MAP_HOSTNAME;
		$postdataPortal = http_build_query(
			array(
				'latlng' => $latlng,
				//'location_type' => 'ROOFTOP',
				//'result_type' => 'street_address',
				'key' => S_MAP_PASSWORD
			)
		);
		$headers = array(
			'Authorization: Basic '.base64_encode(S_MAP_USERNAME.':'.S_MAP_PASSWORD),
			'Content-type: application/x-www-form-urlencoded',
			'Content-Length: '.strlen($postdataPortal)
		);
		$optsPortal = array('http' =>
			array(
				'method'  => 'GET',
				'header'  => $headers,
				'content' => $postdataPortal
			)
		);
		$url .= '?'.$postdataPortal;
		$GLOBALS['numberGeoCode'] ++;
		writeLog($fp, $url.'&cur_call='.$GLOBALS['numberGeoCode'].'');
		$jsonGeo = file_get_contents($url, false, null);
		$jsonGeo_d = json_decode($jsonGeo, true);

		if ($jsonGeo_d != null)
		{
			$city = null;
			$subcity = null;
			$postalcity = null;
			$admcity = null;
			$country = null;
			$postalCode = null;
			if (array_key_exists('status', $jsonGeo_d) && ($jsonGeo_d['status'] === 'OVER_QUERY_LIMIT'))
			{
				writeLog($fp, $jsonGeo_d['status'].'-'.$jsonGeo_d['error_message']);
				$GLOBALS['isGeoCodeInfoBurn'] = true;
			}
			else
			{
				foreach ($jsonGeo_d['results'] as $keyGr => $valGr) {
					foreach ($valGr as $keyGa => $valGa) {
						if ($keyGa === 'address_components') {
							foreach ($valGa as $keyGb => $valGb) {
								if (is_array($valGb['types'])) {
									if (in_array('country', $valGb['types'])) { // rajouter pas de valeur
										$country = $valGb['long_name'];
									}
									if (in_array('locality', $valGb['types'])) { // rajouter pas de valeur
										$city = $valGb['long_name'];
									}
									if (in_array('sublocality', $valGb['types'])) { // rajouter pas de valeur
										$subcity = $valGb['long_name'];
									}
									if (in_array('postal_town', $valGb['types'])) { // rajouter pas de valeur
										$postalcity = $valGb['long_name'];
									}
									if (in_array('administrative_area_level_3', $valGb['types'])) { // rajouter pas de valeur
										$admcity = $valGb['long_name'];
									}
									if (in_array('postal_code', $valGb['types'])) { // rajouter pas de valeur
										$postalCode = $valGb['long_name'];
									}
								}
							}
						}
						//if ($numberAttribute >=3 ) break;// virer numberatriubute et faire sur valo champs country city postalCode
					}
				}
			}
			if ($subcity === null) $subcity = $postalcity;
			if ($subcity === null) $subcity = $admcity;
			if ($city === null) $city = $subcity;
			$returns = array($city, $country, $postalCode);
		}
		return $returns;
	}
	else
	{
		return array(null, null, null);
	}
}

function mysqlError($db, $results) {
	if ($results === false) throw new Exception('Erreur BDD('.$db->errorCode().':'.$db->errorInfo()[2].')');
}

function startsWith($haystack, $needle) {
    return $needle === "" || strrpos($haystack, $needle, -strlen($haystack)) !== FALSE;
}
/*
function endsWith($haystack, $needle) {
    return $needle === "" || (($temp = strlen($haystack) - strlen($needle)) >= 0 && strpos($haystack, $needle, $temp) !== FALSE);
}	
*/
?>