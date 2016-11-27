<html>
    <head>
<!--        <meta http-equiv="Refresh" content="1800; url=mel2mysql.php5"> -->
        <title>Ingress--ReadMel->MYSQL</title>
        <meta charset="UTF-8">
    </head>
	<body>
	<textarea name="textarea" rows="30" cols="120">
<?php
	require_once('_constants.inc'); 
	require_once('_lib.php');
	require_once('_lib_did.php');
	
	$dbhostname = S_DB_HOSTNAME;
	$dbname = S_DB_NAME;
	$dbusername = S_DB_USERNAME;
	$dbpassword = S_DB_PASSWORD;
	$gmailhostname = S_GMAIL_HOSTNAME;
	$gmailsearch = S_GMAIL_SEARCH;
	$gmailusername = S_GMAIL_USERNAME;
	$gmailpassword = S_GMAIL_PASSWORD;
	
	$count_email = 0;
	$count_DiD = 0;
	
	$fp = getFile('mel2mysql');
	date_default_timezone_set('Europe/Paris');
	$date_lancement = date("Y-m-d H:i:s");
	$date_termine = date("Y-m-d H:i:s");
	try 
	{
		// Connexion à la BDD
		$db = new PDO("mysql:host=".$dbhostname.";dbname=".$dbname, $dbusername, $dbpassword);
		$db->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_WARNING);
		$db->setAttribute(PDO::ATTR_DEFAULT_FETCH_MODE, PDO::FETCH_NAMED);
		$db->setAttribute(PDO::ATTR_CASE, PDO::CASE_UPPER);
		$db->exec("SET NAMES 'UTF8'");
		//$db->setAttribute(PDO::MYSQL_ATTR_INIT_COMMAND, "SET NAMES 'utf8'");
		
		writeLog($fp, $date_lancement.'-Lancement');
		echo 'Lancement:'.$date_lancement."\n";
		
		// Récupération du lancement d'avant
		$unJour = 3600 * 24; // nombre de secondes dans une journée
		$date_min = '1970-01-01 01:00:00';
		$query = "SELECT MAX(DATE_DEBUT) MAX_DATE_DEBUT, DATE_DEBUT, DATE_FIN, NOMBRE_MEL, NOMBRE_DID FROM TRAITEMENTS ORDER BY DATE_DEBUT";
		$results = $db->query($query);
		$line = $results->fetch();
		if (empty($line['MAX_DATE_DEBUT']))
		{
			writeLog($fp, 'Date de dernier traitement inexistante');
			$ts_min = strtotime($date_min);
			$ts_max = strtotime(date("Y-m-d")) + $unJour;
			$date_min = (date('Y-m-d 00:00:00', $ts_min));
			$date_max = (date('Y-m-d 00:00:00', $ts_max));	
		}
		else
		{
			writeLog($fp, 'Date de dernier traitement '.$line['MAX_DATE_DEBUT']);
			$date_min = $line['MAX_DATE_DEBUT'];
			$ts_min = strtotime($date_min);//- $unJour;
			$ts_max = strtotime(date("Y-m-d")) + $unJour;
			$date_min = (date('Y-m-d 00:00:00', $ts_min));
			$date_max = (date('Y-m-d 00:00:00', $ts_max));
		} 
		
		$mbox = imap_open($gmailhostname, $gmailusername, $gmailpassword);
		$mails = FALSE;
		if (FALSE === $mbox) 
		{
			writeLog($fp, '///!!!\\\ La connexion a echoue !');
			echo 'La connexion a echoue !'."\n";
			$date_termine = date("Y-m-d H:i:s");
		} 
		else 
		{
			$emails  = imap_search($mbox, $gmailsearch);
			if (FALSE === $emails ) 
			{
				writeLog($fp, 'Pas de message à traiter');
				echo 'Pas de message à traiter'."\n";
			} 
			else 
			{
				$count_email = count($emails);
				echo "Message à traiter : $count_email\n";
				sort($emails );
				$first = true;
				$i = 1;
				foreach ($emails  as $mail) 
				{
					try
					{
						echo "Message $i/$count_email\n";
						writeLog($fp, "Message $i/$count_email");
						$corps = imap_body($mbox, imap_uid($mbox, $mail), FT_UID | FT_PEEK);
						if(parseResult(clean($corps), $db, $i))
						{
							imap_setflag_full($mbox, $mail, "\\Seen");
						}
						else
						{
							writeLog($fp, '///!!!\\\ Erreur traitement de parsing des mels');
							echo 'Erreur traitement'."\n";
							break;
						}
					}
					catch (Exception $e) 
					{
						writeLog($fp, 'Exception reçue : '.$e->getMessage().', UID:'.$mail);
						echo 'Exception reçue : '.$e->getMessage().', UID:'.$mail."\n";
					}
					$i ++;
				}
			}
		}
		imap_close($mbox);

		if ((($timestampEnd = strtotime($date_max)) === false)  || (($timestampStart = strtotime($date_min)) === false) )
		{
			writeLog($fp, 'La transformation de date a echoué !');
			echo 'La transformation de date a echoué !'."\n";
		}
		else
		{
			$sleep = 0;
			
			echo "Récupération du $date_min au  $date_max\n";
			$count_DiD = getUserCaptureFromDiD($db, S_USER_RQST_001, $timestampStart * 1000, $timestampEnd * 1000, $sleep);
			$count_DiD += getUserCaptureFromDiD($db, S_USER_RQST_002, $timestampStart * 1000, $timestampEnd * 1000, $sleep);
			$count_DiD += getUserCaptureFromDiD($db, S_USER_RQST_003, $timestampStart * 1000, $timestampEnd * 1000, $sleep);
			$count_DiD += getUserCaptureFromDiD($db, S_USER_RQST_004, $timestampStart * 1000, $timestampEnd * 1000, $sleep);			
			$count_DiD += getUserCaptureFromDiD($db, S_USER_RQST_005, $timestampStart * 1000, $timestampEnd * 1000, $sleep);
			writeLog($fp, 'Message(s) récupéré(s) : '.$count_DiD);
			echo 'Message(s) récupéré(s) : '.$count_DiD."\n";
			
		}
		
		updateCityCountry($db, $fp);

		$date_termine = date("Y-m-d H:i:s");
		//$date_termine = $line['MAX_DATE_FIN'];
		$query = "INSERT INTO TRAITEMENTS (DATE_DEBUT, DATE_FIN, NOMBRE_MEL, NOMBRE_DID) VALUES ('$date_lancement', '$date_termine', $count_email, $count_DiD)";
		$results = @$db->exec($query);
	} 
	catch (PDOException $e) 
	{
		writeLog($fp, $e->getTraceAsString());
		echo 'Exception BDD reçue:'.$e->getTraceAsString()."\n";
		writeLog($fp, $date_termine.'-Terminé'."\n");
		echo 'Terminé:'.$date_termine."\n";	
		fclose ($fp);
		//throw new PDOException('Error  : '.$e->errorInfo());
	}
	writeLog($fp, $date_termine.'-Terminé'."\n");
	echo 'Terminé:'.$date_termine."\n";	
	fclose ($fp);

function updateCityCountry($db, $fp) {
	$query = "SELECT ID, LAT, LNG, NAME FROM PORTALS WHERE CITY IS null OR CITY = '' OR COUNTRY IS null OR COUNTRY = '' OR POSTAL_CODE IS null OR POSTAL_CODE = '' ORDER BY POSTAL_CODE, CITY, COUNTRY LIMIT 200";
	$results = $db->query($query);
	$lines = $results->fetchAll();
	foreach ($lines as $key => $line) 
	{
		insertPortal($db, $fp, $line['ID'], $line['LAT'], $line['LNG'], $line['NAME']);
	}
}	
	
function insertData($db, $user, $lat, $lng, $name, $team, $guid)
{
	$tentative = 0;
	$inserted = false;
	$fp = getFile('mel2mysql');
	while (! $inserted)
	{
		try 
		{
			$tentative ++;
			if (!$guid) $guid = getPortalIdFromDiD($lat, $lng);
			if (!$guid) $guid = $lat.'.'.$lng;
			
			//Gestion du user
			insertUser($db, $fp, $user, $team);
			
			// Gestion du portail
			$guid = insertPortal($db, $fp, $guid, $lat, $lng, $name);
			
			// Gestion du lien portail/user
			insertRelationUserPortal($db, $fp, $user, $guid);

			$inserted = true;
		}
		catch (Exception $e) 
		{
			writeLog($fp, 'Exception reçue : '.$e->getMessage().', BDD:'.S_DB_NAME.', Tentative('.$tentative.')');
			echo 'Exception reçue : '.$e->getMessage().', BDD:'.S_DB_NAME.', Tentative('.$tentative.')'."\n";
			if ($tentative < 4)
			{
				// Erreur d'accès à la bdd, on retente puis coupe le traitement
				sleep(0.5);
			}
			else
			{			
				fclose ($fp);
				return false;
			}			
		}			
	}
	
	fclose($fp);
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

function parseResult($html, $db, $position)
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
		if (! insertData($db, $user, $lat, $lng, $name, $team, null)) return false;
		$line = [];
	}
	return true;
}

	
?>
	</textarea>
	</body>
</html>
