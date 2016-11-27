<html>
    <head>
        <title>Ingress--GenerateJson->MYSQL</title>
        <meta charset="UTF-8">
    </head>
	<body>
<?php	
	require_once('_constants.inc'); 
	require_once('_lib.php');

	$user = '';
	$country = '';
	$users = '';
	$countries = '';
	$format = true;
	
	if (array_key_exists('user', $_POST))
	{
		$user = $_POST['user'];
	}
	else
	{
		$user='DT666';
	}
	if (array_key_exists('country', $_POST))
	{
		$country = $_POST['country'];
	}
	else
	{
		$country = 'France';
	}
	
	if (array_key_exists('users', $_POST))
	{
		$users = $_POST['users'];
	}
	else
	{
		$users = "DT666,lkabibi,planar974";
	}	
	if (array_key_exists('countries', $_POST))
	{
		$countries = $_POST['countries'];
	}

?>
 <form action="mysql2json.php5" method="post">
  Agent&nbsp;:&nbsp;<br/>
  <input type="text" name="user" list="users" value="<?php echo $user; ?>">
	<datalist id="users">
		<?php echo getUsers($user); ?>
	</datalist>
	<input type="text" name="country" list="countries" value="<?php echo $country; ?>">
	<datalist id="countries">
		<?php echo getCountries($country); ?>
	</datalist>
  <input type="submit" value="Submit">
</form>
<textarea name="textarea" rows="30" cols="120">
<?php
	if (array_key_exists('user', $_POST) && $user !== '')
	{
		echo readData($user, $country, $format);
	}
?>
</textarea>
 <form action="mysql2json.php5" method="post">
	Agent1, ..., Agentn&nbsp;:&nbsp;<br/>
	<input type="text" name="users" value="<?php echo $users; ?>">
	<input type="text" name="countries">
	<input type="submit" value="Submit">
</form>
<textarea name="textarea" rows="30" cols="120">
<?php 
	if (array_key_exists('users', $_POST) && $users !== '')
	{
		echo readDatas($users, $format); 
	}
?>
</textarea>

<?php
function getUsers($user)
{	
	$result = '';
	$dbhostname = S_DB_HOSTNAME;
	$dbname = S_DB_NAME;
	$dbusername = S_DB_USERNAME;
	$dbpassword = S_DB_PASSWORD;
	
	try 
	{
		// Connexion à la BDD
		$db = new PDO("mysql:host=".$dbhostname.";dbname=".$dbname, $dbusername, $dbpassword);
		$db->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_WARNING);
		$db->setAttribute(PDO::ATTR_DEFAULT_FETCH_MODE, PDO::FETCH_NAMED);
		$db->setAttribute(PDO::ATTR_CASE, PDO::CASE_UPPER);
		$db->exec("SET NAMES 'UTF8'");
		//$db->setAttribute(PDO::MYSQL_ATTR_INIT_COMMAND, "SET NAMES 'utf8'");

		$query = "SELECT NAME as 'USER' FROM USERS ORDER BY upper(NAME)";
		$resultsQuery = $db->query($query);
		$lines = $resultsQuery->fetchAll();
		foreach ($lines as $key => $line) 
		{
			if ($user === $line['USER'])
			{
				$result .= '<option selected>';
			}
			else
			{
				$result .= '<option>';
			}
			$result .= $line['USER'];
			$result .= '</option>';
		}
	} 
	catch (PDOException $e) 
	{
		echo 'Exception BDD reçue:'.$e->errorInfo()."\n";
	}
	return $result;
}
function getCountries($country)
{	
	$result = '';
	$dbhostname = S_DB_HOSTNAME;
	$dbname = S_DB_NAME;
	$dbusername = S_DB_USERNAME;
	$dbpassword = S_DB_PASSWORD;
	
	try 
	{
		// Connexion à la BDD
		$db = new PDO("mysql:host=".$dbhostname.";dbname=".$dbname, $dbusername, $dbpassword);
		$db->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_WARNING);
		$db->setAttribute(PDO::ATTR_DEFAULT_FETCH_MODE, PDO::FETCH_NAMED);
		$db->setAttribute(PDO::ATTR_CASE, PDO::CASE_UPPER);
		$db->setAttribute(PDO::MYSQL_ATTR_INIT_COMMAND,'SET NAMES UTF8');

		$query = "SELECT DISTINCT COUNTRY as 'COUNTRY' FROM PORTALS ORDER BY COUNTRY";
		$resultsQuery = $db->query($query);
		$lines = $resultsQuery->fetchAll();
		foreach ($lines as $key => $line) 
		{
			if ($user === $line['COUNTRY'])
			{
				$result .= '<option selected>';
			}
			else
			{
				$result .= '<option>';
			}
			$result .= $line['COUNTRY'];
			$result .= '</option>';
		}
	} 
	catch (PDOException $e) 
	{
		echo 'Exception BDD reçue:'.$e->errorInfo()."\n";
	}
	return $result;
}
function clean($name)
{
	return str_replace('"', '&amp;#34;', $name);
}

function addLine($line, $index, $format)
{
	 $result = '';
	for ($i = 0; $i < $index; $i ++)
	{
		$result .= ' ';
	}
	$result .= $line;
	if ($format)
	{
		$result .= "\n";
	}
	return $result;
}

function readData($user, $country, $format)
{	
	$result = addLine('{"portals":[', 0, $format);
	$first = true;
	$dbhostname = S_DB_HOSTNAME;
	$dbname = S_DB_NAME;
	$dbusername = S_DB_USERNAME;
	$dbpassword = S_DB_PASSWORD;
	
	try 
	{
		// Connexion à la BDD
		$db = new PDO("mysql:host=".$dbhostname.";dbname=".$dbname, $dbusername, $dbpassword);
		$db->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_WARNING);
		$db->setAttribute(PDO::ATTR_DEFAULT_FETCH_MODE, PDO::FETCH_NAMED);
		$db->setAttribute(PDO::ATTR_CASE, PDO::CASE_UPPER);
		$db->setAttribute(PDO::MYSQL_ATTR_INIT_COMMAND,'SET NAMES UTF8');
		
		$query = "select portals.id as 'ID', portals.lat as 'LAT', portals.lng as 'LNG', portals.name as 'NAME', user_name  as 'USER', captured as 'CAPTURED' from portals";
		$query .= " ,portals_users where user_name = '$user' AND portals.id = id_portal and captured = true ";
		if ($country) $query .= "AND (upper(portals.country)like upper('$country%') OR portals.country is null)";
		$query .= " order by lat, lng";
	//echo $query;
		$resultsQuery = $db->query($query);
		$lines = $resultsQuery->fetchAll();
		foreach ($lines as $key => $line) 
		{
			if ($line['CAPTURED']) {
				if ($first) $first = false;
				else $result .= ',';

				$result .= addLine('{', 1, $format);
				if ($line['ID'] != $line['LAT'].'.'.$line['LNG'])
				{
					$result .= addLine('"id":"'.clean($line['ID']).'",', 2, $format);
				}

				if ($line['USER'] != '')
				{
					$result .= addLine('"'.clean($line['USER']).'":"user",', 2, $format);
				}
				$result .= addLine('"name":"'.clean($line['NAME']).'",', 2, $format);
				$result .= addLine('"lat":"'.$line['LAT'].'",', 2, $format);
				$result .= addLine('"lng":"'.$line['LNG'].'"', 2, $format);
				$result .= addLine('}', 1, $format);
			}
		}
	} 
	catch (PDOException $e) 
	{
		echo 'Exception BDD reçue:'.$e->errorInfo()."\n";
	}
	$result .= addLine(']}', 0, $format);
	
	/*
	header("Content-type: application/force-download");
	header("Content-Length: ".filesize($result));
	header("Content-Disposition: attachment; filename=extract_$user_$country.json");
	readfile($result);
	*/	
		
	/*
	$full_path = '...'; // chemin système (local) vers le fichier
$file_name = basename($full_path);
 
ini_set('zlib.output_compression', 0);
$date = gmdate(DATE_RFC1123);
 
header('Pragma: public');
header('Cache-Control: must-revalidate, pre-check=0, post-check=0, max-age=0');
 
header('Content-Tranfer-Encoding: none');
header('Content-Length: '.filesize($full_path));
header('Content-MD5: '.base64_encode(md5_file($full_path)));
header('Content-Type: application/octetstream; name="'.$file_name.'"');
header('Content-Disposition: attachment; filename="'.$file_name.'"');
 
header('Date: '.$date);
header('Expires: '.gmdate(DATE_RFC1123, time()+1));
header('Last-Modified: '.gmdate(DATE_RFC1123, filemtime($full_path)));
 
readfile($full_path);
exit; // nécessaire pour être certain de ne pas envoyer de fichier corrompu
*/
	return $result;
}

function readDatas($user, $format)
{	
	$users = array_unique(explode (',', $user));

	$result = addLine('{"portals":[', 0, $format);
	$first = true;
	
	$dbhostname = S_DB_HOSTNAME;
	$dbname = S_DB_NAME;
	$dbusername = S_DB_USERNAME;
	$dbpassword = S_DB_PASSWORD;
	
	try 
	{
		// Connexion à la BDD
		$db = new PDO("mysql:host=".$dbhostname.";dbname=".$dbname, $dbusername, $dbpassword);
		$db->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_WARNING);
		$db->setAttribute(PDO::ATTR_DEFAULT_FETCH_MODE, PDO::FETCH_NAMED);
		$db->setAttribute(PDO::ATTR_CASE, PDO::CASE_UPPER);
		$db->setAttribute(PDO::MYSQL_ATTR_INIT_COMMAND,'SET NAMES UTF8');
		
		$querySelect = "select p.id as 'ID', lat as 'LAT', lng as 'LNG', name as 'NAME'";
		$queryFrom = " from portals p";

		// Boucle
		$querySelectUser = '';
		$queryFromUser = '';
		foreach ($users as $key => $value)
		{
			$querySelectUser .= ", pu$key.user as 'USER$key'";
			$queryFromUser .= " left outer join (select id_portal, user_name as 'USER' from portals_users where user_name = '".$users[$key]."') pu$key on p.id = pu$key.id_portal";
		}

		$query = $querySelect.$querySelectUser.$queryFrom.$queryFromUser." order by lat, lng";
		$resultsQuery = $db->query($query);
		$lines = $resultsQuery->fetchAll();
		foreach ($lines as $key => $line)
		{
			$extract = false;
			foreach ($users as $key => $value)
			{
				$extract = ($line['USER'.$key] != '');
				if ($extract) break;		
			}
			if ($extract)
			{
				if ($first) $first = false;
				else $result .= ',';

				$result .= addLine('{', 1, $format);
				if ($line['ID'] != $line['LAT'].'.'.$line['LNG'])
				{
					$result .= addLine('"id":"'.clean($line['ID']).'",', 2, $format);
				}
				for ($index = 0; $index < count($users); $index ++)
				{
					if ($line['USER'.$index] != '')
					{
						$result .= addLine('"'.clean($line['USER'.$index]).'":"user",', 2, $format);
					}
				}
				$result .= addLine('"name":"'.clean($line['NAME']).'",', 2, $format);
				$result .= addLine('"lat":"'.$line['LAT'].'",', 2, $format);
				$result .= addLine('"lng":"'.$line['LNG'].'"', 2, $format);
				$result .= addLine('}', 1, $format);
			}
		}
	} 
	catch (PDOException $e) 
	{
		echo 'Exception BDD reçue:'.$e->errorInfo()."\n";
	}
	$result .= addLine(']}', 0, $format);
	return $result;
}
?>
	</body>
</html>