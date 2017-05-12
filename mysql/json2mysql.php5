<html>
    <head>
        <title>Ingress--ReadJson</title>
        <meta charset="UTF-8">
    </head>
	<body>
<?php	
	require_once('_constants.inc'); 
	require_once('_lib.php');
	
	$dbhostname = S_DB_HOSTNAME;
	$dbname = S_DB_NAME;
	$dbusername = S_DB_USERNAME;
	$dbpassword = S_DB_PASSWORD;
	

	$json = '';
	if (array_key_exists('json', $_POST))
	{
		$json = $_POST['json'];
	}
	
//echo "49017833/".formatPosition(49017833)."<br/>";
//echo "-631118/".formatPosition(-631118)."<br/>";
//echo "658253/".formatPosition(658253)."<br/>";
//echo "-1151455/".formatPosition(-1151455)."<br/>";
?>
<form action="json2mysql.php5" method="post">
  JSON&nbsp;:&nbsp;<br/>
  <textarea name="json" rows="30" cols="120"><?php echo str_replace('&', '&amp;', $json); ?></textarea>
  <input type="submit" value="Submit">
</form>
<br/>
	<textarea rows="30" cols="120">
<?php
if ($json != '')
{
	$fp = getFile('json2mysql');
	date_default_timezone_set('Europe/Paris');
	$date_lancement = date("Y-m-d H:i:s");
	$date_termine = date("Y-m-d H:i:s");
	writeLog($fp, $date_lancement.'-Lancement');
	echo 'Lancement:'.$date_lancement."\n";
	$json_d = json_decode($json, true);
	if ($json_d != null && $json_d['portals'])
	{
		try 
		{
			// Connexion à la BDD
			$db = new PDO("mysql:host=".$dbhostname.";dbname=".$dbname, $dbusername, $dbpassword);
			$db->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_WARNING);
			$db->setAttribute(PDO::ATTR_DEFAULT_FETCH_MODE, PDO::FETCH_NAMED);
			$db->setAttribute(PDO::ATTR_CASE, PDO::CASE_UPPER);
			$db->exec("SET NAMES 'UTF8'");

			foreach ($json_d['portals']as $key => $val) 
			{
				$guid = $json_d['portals'][$key]['id'];
				if ($guid)
				{
					$lat = $json_d['portals'][$key]['lat'];
					$lng = $json_d['portals'][$key]['lng'];
					$name = $json_d['portals'][$key]['name'];
					
					$name= preg_replace_callback("/(&#[0-9]+;)/", function($m) { return mb_convert_encoding($m[1], "UTF-8", "HTML-ENTITIES"); }, $name);
					// COmpléter lat et lng avec un 0 si taille inférieur a 1E6 (6 chiffres)
					$guid = insertPortal($db, $fp, $guid, formatPosition($lat), formatPosition($lng), $name);
					
					foreach ($val as $subkey => $subval) 
					{
						if ($subval === 'user')
						{
							//Gestion du user
							insertUser($db, $fp, $subkey, 'UNKNOWN');
							//Gestion du lien user portal
							insertRelationUserPortal($db, $fp, $subkey, $guid);
						}
					}
				}
			}
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
	}
	$date_termine = date("Y-m-d H:i:s");
	writeLog($fp, $date_termine.'-Terminé'."\n");
	echo 'Terminé:'.$date_termine."\n";	
	fclose ($fp);
}

function formatPosition($position) {
	//return str_pad($position, 7,  '0', STR_PAD_LEFT);
	//return  sprintf( "%07d", $position ); //pas bon pour les negatifs
	if ($position < 0) return '-'.sprintf( "%07d", abs($position));
	else return sprintf( "%07d", $position );
	//return "000000" + $position;
}
?>
		</textarea>
	</body>
</html>