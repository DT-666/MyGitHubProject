<?php

function getUserCaptureFromDiD($db, $user, $from, $to, $sleep)
{
	$api = S_DID_HOSTNAME;
	$page = S_DID_CAPTURED_WS;
	$url = $api.$page;
	echo "Recherche entre '$from' et '$to' pour $user\n";
	
	$postdataCaptured = http_build_query(
		array(
			'limit' => '10000', // en debug 2 
			'identifiant' => S_DID_USERNAME,
			'password' => S_DID_PASSWORD,
			'guid_joueur' => "[$user]",
			'last_min' => $from, 
			'last_max' => $to
		)
	);
	$headers = array(
		'Authorization: Basic '.base64_encode(S_DID_USERNAME.':'.S_DID_PASSWORD),
		'Content-type: application/x-www-form-urlencoded',
		'Content-Length: '.strlen($postdataCaptured)
	);
	$optsCaptured = array('http' =>
		array(
			'method'  => 'POST',
			'header'  => $headers,
			'content' => $postdataCaptured,
			'user_agent' => $_SERVER['HTTP_USER_AGENT'] 
		)
	);

	$return = 0;
	$contextCaptured = stream_context_create($optsCaptured);
	$jsonCaptured = file_get_contents($url.'?'.$postdataCaptured, false, $contextCaptured); //GET car post marche pas
	$jsonCaptured_d = json_decode($jsonCaptured, true);
	if ($jsonCaptured_d != null)
	{
		foreach ($jsonCaptured_d as $key => $val) 
		{
			$guid = $jsonCaptured_d[$key]['guid_portal'];
			// Sur init faire un appel toutes les 10s
			//sleep($sleep);
			getPortalInfoDiD($db, $user, $guid);
			$return ++; 
		}
	}
	return $return;
}

function getPortalIdFromDiD($lat, $lng)
{
	$api = S_DID_HOSTNAME;
	$page = S_DID_PORTAL_WS;
	$url = $api.$page;
	
	$postdataCaptured = http_build_query(
		array(
			'limit' => '20', // en debug 2 
			'identifiant' => S_DID_USERNAME,
			'password' => S_DID_PASSWORD,
			'lat1' => $lat,
			'lng1' => $lng,
			'lat2' => $lat,
			'lng2' => $lng
		)
	);
	$headers = array(
		'Authorization: Basic '.base64_encode(S_DID_USERNAME.':'.S_DID_PASSWORD),
		'Content-type: application/x-www-form-urlencoded',
		'Content-Length: '.strlen($postdataCaptured)
	);
	$optsCaptured = array('http' =>
		array(
			'method'  => 'POST',
			'header'  => $headers,
			'content' => $postdataCaptured,
			'user_agent' => $_SERVER['HTTP_USER_AGENT'] 
		)
	);

	$guid = null;
	$contextCaptured = stream_context_create($optsCaptured);
	$jsonCaptured = file_get_contents($url.'?'.$postdataCaptured, false, $contextCaptured); //GET car post marche pas
	$jsonCaptured_d = json_decode($jsonCaptured, true);
	if ($jsonCaptured_d != null)
	{
		if (count($jsonCaptured_d) <= 10) {
			foreach ($jsonCaptured_d as $key => $val) 
			{
				$loc = $jsonCaptured_d[$key]['loc'];
				$guid = $jsonCaptured_d[$key]['guid'];
				if ( ($loc[0] == $lat) && ($loc[1] == $lng) ) {break;}
				$guid = null;
			}
		}
	}
	return $guid;
}

function getPortalInfoDiD($db, $user, $guid)
{
	$api = S_DID_HOSTNAME;
	$page = S_DID_PORTAL_WS;
	$url = $api.$page;	
	$postdataPortal = http_build_query(
		array(
			'limit' => '1',
			'identifiant' => S_DID_USERNAME,
			'password' => S_DID_PASSWORD,
			'guid' => $guid
		)
	);
	$headers = array(
		'Authorization: Basic '.base64_encode(S_DID_USERNAME.':'.S_DID_PASSWORD),
		'Content-type: application/x-www-form-urlencoded',
		'Content-Length: '.strlen($postdataPortal)
	);
	$optsPortal = array('http' =>
		array(
			'method'  => 'POST',
			'header'  => $headers,
			'content' => $postdataPortal
		)
	);

	$contextPortal = stream_context_create($optsPortal);
	$jsonPortal = file_get_contents($url.'?'.$postdataPortal, false, $contextPortal); //GET car post marche pas
	$jsonPortal_d = json_decode($jsonPortal, true);
	if ($jsonPortal_d != null)
	{
		foreach ($jsonPortal_d as $keyP => $valP) 
		{
			$name = $jsonPortal_d[$keyP]['name'];
			$lat = $jsonPortal_d[$keyP]['position_lat'];
			$lng = $jsonPortal_d[$keyP]['position_lng']; // TODO gestion des coordonnées trop petites
			//echo "$name ($guid) $lat - $lng [$user]<br/>";
			insertData($db, $user, formatPosition($lat), formatPosition($lng), $name, 'UNKNOWN', $guid); // NEUTRE car les users recherchés sont deja existant
		}
	}
}
?>