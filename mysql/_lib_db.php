<?php
	function checkAuthentification($db) {
		if (isset($_GET['login']) AND isset($_GET['password'])){
			$login = $_GET['login'];
			$pass_crypte = md5($_GET['password']);
			$query = "SELECT * FROM application_users WHERE NAME='$login' AND PASSWORD='$pass_crypte'";
			$results = $db->query($query);
			$line = $results->fetch();
			if($line === false)	{
				return false;
			}
			else {
				return true;
			}
		}
		else {
			return false;
		}
	}
	
	function connect($dbhostname, $dbname, $dbusername, $dbpassword) {
		try {
			// Connexion à la BDD
			$db = new PDO("mysql:host=".$dbhostname.";dbname=".$dbname, $dbusername, $dbpassword);
			$db->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_WARNING);
			$db->setAttribute(PDO::ATTR_DEFAULT_FETCH_MODE, PDO::FETCH_NAMED);
			$db->setAttribute(PDO::ATTR_CASE, PDO::CASE_UPPER);
			
			date_default_timezone_set('Europe/Paris');
			$date_time = new DateTime('now');
			$db->exec("SET time_zone='".$date_time->format('P')."';");
			$db->exec("SET NAMES 'UTF8'");
			
			if (checkAuthentification($db)) {
				return $db;
			}
			else {
				throw new PDOException('Authentification failed');
			}
		} 
		catch (PDOException $e) {
			echo 'Exception BDD reçue:\n';
			echo '\tligne :'.$e->getLine().'\n';
			echo '\tmessage :'.$e->getMessage().'\n';
			//echo '\t'.$e->getTraceAsString().'\n';//Attention, affice le pwd en clair...
		}
	}

	/* Fonction pour executer une requete d'update/insert/drop/truncate */
	function execRequest($db, $query) {
		$date_lancement = date("Y-m-d H:i:s");
		$results = @$db->exec($query);
		echo "Start Request $query ($results) -  $date_lancement <br/>";
		mysqlError($db, $results);
		$date_fin = date("Y-m-d H:i:s");
		echo "End Request $query ($results) - $date_fin<br/><br/>";	
	}

	/* Fonction pour executer une requete select et retourner son résultat */
	function selectRequest($db, $title, $query) {
		$date_lancement = new DateTime();
		$results = $db->query($query);
		$lines = $results->fetchAll();
		echo "Start Request $title(".count($lines).')<br/>';
		mysqlError($db, $results);
		//$delta = date_diff(new DateTime(), $date_lancement)->format("%imn %ss");
		echo "End Request $title(".count($lines).") $delta";
		//echo "Durée :$delta<br/><br/>";
		return $lines;
	}
	
	/* Fonction de gestion des erreurs mysql */
	function mysqlError($db, $results) {
		if ($results === false) {
			echo 'Erreur BDD('.$db->errorCode().':'.$db->errorInfo()[2].')\n';
			throw new Exception('Erreur BDD('.$db->errorCode().':'.$db->errorInfo()[2].')');
		}
	}
?>