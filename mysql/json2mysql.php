<html>
    <head>
        <title>ReadJson</title>
        <meta charset="UTF-8">
    </head>
	<body>
<?php	
	/////cyrPo
	require_once('../lib/_constants.inc'); 
	require_once('../lib/_lib.php');
	require_once('../lib/_lib_db.php');
	
	date_default_timezone_set('Europe/Paris');
	$db = connect(S_DB_HOSTNAME, S_DB_NAME, S_DB_USERNAME, S_DB_PASSWORD);
	if ($db) {
		$filename = '/home/portalautobots/www/data/datas.json'; // Rajouter nom du user
		$input_file = fopen($filename, 'r');
		$json = fread($input_file, filesize($filename));
		fclose($input_file);

		echo '<textarea rows="30" cols="120">';
		$date_lancement = date("Y-m-d H:i:s");
		$date_termine = date("Y-m-d H:i:s");
		echo 'Lancement:'.$date_lancement."\n";
		
		$json_d = json_decode($json, true);
		if ($json_d != null && $json_d['portals']){
			$i = 1;
			$max =  count($json_d['portals']);
			foreach ($json_d['portals']as $key => $val) {
				$guid = $json_d['portals'][$key]['id'];

				if ($guid){
					$lat = $json_d['portals'][$key]['lat'];
					$lng = $json_d['portals'][$key]['lng'];
					$name = $json_d['portals'][$key]['name'];
					echo "$i/$max - $guid - $name\n";

					$name = preg_replace_callback("/(&#[0-9]+;)/", function($m) { return mb_convert_encoding($m[1], "UTF-8", "HTML-ENTITIES"); }, $name);
					// Compléter lat et lng avec un 0 si taille inférieur a 1E6 (6 chiffres)
					$guid = insertPortal($db, $guid, formatPosition($lat), formatPosition($lng), $name, $i, $max);
					
					foreach ($val as $subkey => $subval) {
						if ($subval === 'user'){
							//Gestion du user
							insertUser($db, $subkey, 'UNKNOWN', $i, $max);
							//Gestion du lien user portal
							insertRelationUserPortal($db, $subkey, $guid, $i, $max);
						}
					}
				}
				$i ++;
			}
		}
		else {
			echo json_last_error_msg()."\n";
		}
		$date_termine = date("Y-m-d H:i:s");
		echo 'Terminé:'.$date_termine."\n";	
		echo '</textarea>';
	}

	function formatPosition($position) {
		if ($position < 0) return '-'.sprintf( "%07d", abs($position));
		else return sprintf( "%07d", $position );
	}
?>
	</body>
</html>