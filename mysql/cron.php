<?php
	require_once('/home/portalautobots/www/lib/_constants.inc'); 
	require_once('/home/portalautobots/www/lib/_lib.php');
	require_once('/home/portalautobots/www/lib/_lib_did.php');
	require_once('/home/portalautobots/www/lib/_lib_db.php');
	
	run();
	
function run() {
	date_default_timezone_set('Europe/Paris');

	$db = connect(S_DB_HOSTNAME, S_DB_NAME, S_DB_USERNAME, S_DB_PASSWORD);
	if ($db) {
		$date_lancement = date("Y-m-d H:i:s");
		$date_termine = date("Y-m-d H:i:s");
		$mails = FALSE;
		$current_email = 1;
		$count_email = 0;

		echo 'Lancement:'.$date_lancement."\n";
		$query = "INSERT INTO traitements (DATE_DEBUT) VALUES ('$date_lancement')";
		$results = @$db->exec($query);

		$mbox = imap_open(S_GMAIL_HOSTNAME, S_GMAIL_USERNAME, S_GMAIL_PASSWORD);
		if (FALSE === $mbox) {
			echo 'La connexion gmail a echoue'."\n";
			$date_termine = date("Y-m-d H:i:s");
		} 
		else {
			$emails  = imap_search($mbox, S_GMAIL_SEARCH);
			if (FALSE === $emails ) {
				echo 'Pas de message à traiter'."\n";
			} 
			else {
				$count_email = count($emails);
				echo "Message à traiter : $count_email\n";
				sort($emails );
				$first = true;
				foreach ($emails  as $mail) {
					try {
						$corps = imap_body($mbox, imap_uid($mbox, $mail), FT_UID | FT_PEEK);
						if(parseResult(clean($corps), $db, $current_email, $count_email)){
							$date_encours = date("Y-m-d H:i:s");
							$query = "UPDATE traitements SET NOMBRE_MEL_TRAITE = '$current_email', NOMBRE_MEL = $count_email, DATE_FIN = '$date_encours' WHERE DATE_DEBUT = '$date_lancement'";
							$results = @$db->exec($query);
							imap_setflag_full($mbox, $mail, "\\Seen");
						}
						else{
							Throw new Exception('Erreur traitement de parsing du mel'."($mail) - $current_email/$count_email\n");
						}
					}
					catch (Exception $e) {
						echo 'Exception reçue : '.$e->getMessage().', UID:'.$mail."\n";
					}
					$current_email ++;
				}
			}
			imap_close($mbox);
		}
		
		// Mise à jour des portails sans information de géolocalisation
		//En commentaire pour éviter la conso d'appels
		//updateCityCountry($db);

		$date_termine = date("Y-m-d H:i:s");
		$query = "UPDATE traitements SET DATE_FIN = '$date_termine' WHERE DATE_DEBUT = '$date_lancement'";
		$results = @$db->exec($query);
	} 

	echo 'Terminé:'.$date_termine."\n";	
}
function updateCityCountry($db) {
	$query = "SELECT ID, LAT, LNG, NAME FROM portals WHERE CITY IS null OR CITY = '' OR COUNTRY IS null OR COUNTRY = '' OR POSTAL_CODE IS null OR POSTAL_CODE = '' ORDER BY POSTAL_CODE, CITY, COUNTRY LIMIT 200";
	$results = $db->query($query);
	$lines = $results->fetchAll();
	foreach ($lines as $key => $line) 
	{
		insertPortal($db, $line['ID'], $line['LAT'], $line['LNG'], $line['NAME'], 0, 0);
	}
}	
	
function insertData($db, $user, $lat, $lng, $name, $team, $guid, $position, $max_position)
{
	$tentative = 0;
	$inserted = false;
	while (! $inserted)
	{
		try 
		{
			$tentative ++;

			if (!$guid) $guid = getPortalIdFromDiD($lat, $lng);

			if (!$guid) $guid = $lat.'.'.$lng;

			//Gestion du user
			insertUser($db, $user, $team, $position, $max_position);
			
			// Gestion du portail
			$guid = insertPortal($db, $guid, $lat, $lng, $name, $position, $max_position);
			
			// Gestion du lien portail/user
			insertRelationUserPortal($db, $user, $guid, $position, $max_position);

			$inserted = true;
		}
		catch (Exception $e) 
		{
			//writelog($fp, 'Exception reçue : '.$e->getMessage().', BDD:'.S_DB_NAME.', Tentative('.$tentative.')');
			//echo 'Exception reçue : '.$e->getMessage().', BDD:'.S_DB_NAME.', Tentative('.$tentative.')'."\n";
			if ($tentative < 4)
			{
				// Erreur d'accès à la bdd, on retente puis coupe le traitement
				sleep(0.5);
			}
			else
			{			
				return false;
			}			
		}			
	}
	
	return $inserted;
}

function formatPosition($position) {
	if ($position < 0) return '-'.sprintf( "%07d", abs($position));
	else return sprintf( "%07d", $position );
}

function to6($string) 
{
	$string = str_replace('.', '', $string);
	return  explode ( ',' , $string); // lat puis lng.
}

function clean($string) 
{
	$string = quoted_printable_decode($string);
	$string = htmlspecialchars_decode($string);
	$string = substr ($string, strpos($string, '<div>'));
	return  $string; 
}

function parseResult($html, $db, $position, $max_position)
{
	//echo $html;
	$patternReport = 'DAMAGE REPORT';
	$patternPortal = '://www.ingress.com/intel?ll=';
	$patternOwner = 'Owner: ';
	$patternUncaptured = '[uncaptured]';
	$patternEnl = '#428F43';
	$patternRes = '#3679B9';
	$pattern = "/($patternEnl|$patternRes)/i";

	$iStartPosReport = 0;
	
	$iStartPosName = 0;
	$iEndPosName = 0;
	
	$iStartPosPortal = 0;
	$iEndPosPortal = 0;
	$iLenPortal = strlen($patternPortal);

	$iStartPosOwner = 0;
	$iEndPosOwner = 0;

	$iStartPosReport = strpos($html, $patternReport);
	$iEndPosOwner = $iStartPosReport;
	// On cherche le nom du portail qui est le premier div après le report, puis le premier div après le propriétaire
	While (strpos($html, '<div>', $iEndPosOwner))
	{
		$iStartPosName = strpos($html, '<div>', $iEndPosOwner) + 5; // taille du div
		$iEndPosName =  strpos($html, '</div>', $iStartPosName);
		$user = '';
		$name = '';
		$team = 'ENL';

		$name = substr($html, $iStartPosName, $iEndPosName - $iStartPosName);
		$name= preg_replace_callback("/(&#[0-9]+;)/", function($m) { return mb_convert_encoding($m[1], "UTF-8", "HTML-ENTITIES"); }, $name); 
	
		// On recherche le premier lien de portail à partir du dernier proprietaire
		$iStartPosPortal = strpos($html, $patternPortal, $iEndPosOwner) + $iLenPortal;
		$iEndPosPortal = strpos($html, '&pll=', $iStartPosPortal);
		$iSizeEndPosPortal =  $iEndPosPortal - $iStartPosPortal;

		// On récupères ses lat et lng
		$latlng = substr($html, $iStartPosPortal, $iSizeEndPosPortal);
		$line = to6($latlng);

		// On recherche le proprietaire à partir de la fin du portail
		$iStartPosOwner = strpos($html, $patternOwner, $iEndPosPortal) + strlen($patternOwner);
		if ($iStartPosOwner - strlen($patternOwner))
		{
			//NEUTRE
			if (startsWith(substr($html, $iStartPosOwner), $patternUncaptured))
			{
				$iEndPosOwner = $iStartPosOwner + strlen($patternUncaptured);
				$user = $patternUncaptured;
				$team = 'NEUTRE';
			}
			else
			{
				//ENL / RES
				if(preg_match($pattern, $html, $matches, PREG_OFFSET_CAPTURE, $iStartPosOwner))
				{
					// Cas du ';' en plus sur le style
					if (startsWith(substr($html, $matches[1][1] + strlen($matches[1][0])), ';')) // $patternEnl // $patternRes
					{
						$iStartPosition = $matches[1][1] + strlen($matches[1][0]) + 3;
					}
					else
					{
						$iStartPosition = $matches[1][1] + strlen($matches[1][0]) + 2;
					}				
					if (startsWith(substr($html, $matches[1][1]), "$patternRes"))
					{
						$team = 'RES';
					}
					
					$iEndPosOwner = strpos($html, '</span>', $matches[1][1]);
					$user = substr($html, $iStartPosition, $iEndPosOwner - $iStartPosition);
				}
				else
				{
echo 'Faut pas pousser mémé dans les orties => Propriétaire de faction inconnue'."\n";
					$iEndPosOwner = strlen($html);
					return false;
				}
			}
		}
		else
		{
echo 'Faut pas pousser mémé dans les orties => pas de Owner'."\n";
			$iEndPosOwner = strlen($html);
			return false;
		}
		$lat = $line[0];
		$lng = $line[1];
		
		//echo "$user $lat $lng $name <br/>";
		if (! insertData($db, $user, $lat, $lng, $name, $team, null, $position, $max_position)) return false;
		$line = [];
	}
	return true;
}
?>
