<?php

require_once("./config.php");

/**
 * @param $projectID // ID of Project
 * @param $userID // (optional) ID of User - if send the function will just return the User
 * @return mixed
 */
function userGet($projectID, $userID) {
	global $conf;

	$json = file_get_contents($conf["dir"]["projects"]."/".$projectID."/users.json");

	$uDB = json_decode($json,true);
	//if ($_SESSION["ohv"]["projects"][$projectID]["user"]["role"] != "admin") {
	foreach ($uDB["user"] as $k=>$u) {
		unset($uDB["user"][$k]["passwd"]);
	}
	//}
	$uDB = ($userID) ? $uDB["user"][$userID] : $uDB;
	$return["status"] = "success";
	$return["code"] = 200;
	$return["string"] = "see response";
	$return["response"] = $uDB;

	return $return;
}

/**
 * @param $projectID
 * @param $name
 * @param $mail
 * @param $passwd
 * @return mixed

 * Returning codes:
 * 0 = success
 * 1 = Mail or Password arent given or Mail is not a valid adress
 * 2 = User already registered
 * 3 = Registration success but user needs to be activated

 */
function userRegister($projectID, $name, $mail, $passwd) {
	global $conf;
	$json = file_get_contents($conf["dir"]["projects"]."/". $projectID ."/project.json");
	$configDB = json_decode($json, true);
	
	$userFile = $conf["dir"]["projects"]."/".$projectID."/users.json";


	if (!$mail || !$passwd || (!filter_var($mail, FILTER_VALIDATE_EMAIL)) || !$name || !$projectID) {
		$return["status"] = "fail";
		$return["code"] = 1;
		$return["string"] = "Fill out all fields";
		return $return;
	}

	if (!file_exists($userFile)) {
		$tmp["user-increment"] = 0;
		$tmp["user"] = array();
		file_put_contents($userFile, json_encode($tmp, JSON_UNESCAPED_UNICODE | JSON_UNESCAPED_SLASHES | JSON_PRETTY_PRINT));
	}

	$file = new sharedFile($userFile);
	$json = $file->read();

	$user = json_decode($json,true);

	foreach ($user["user"] as $k=>$v) {
		if ($v["mail"] == strtolower($_REQUEST["mail"])) {
			$return["status"] = "fail";
			$return["code"] = 2;
			$return["string"] = "Already registered";
			$file->close();
			return $return;
		}
	}

	$user["user-increment"]++;
	$user["user"][$user["user-increment"]]["name"] = $name;
	$user["user"][$user["user-increment"]]["mail"] = strtolower($mail);
	$user["user"][$user["user-increment"]]["registrationDate"] =  time();
	$user["user"][$user["user-increment"]]["passwd"] = md5($passwd.$user["user"][$user["user-increment"]]["registrationDate"]);
	$user["user"][$user["user-increment"]]["role"] = $configDB["defaultUserRole"];
	$user["user"][$user["user-increment"]]["active"] = ($configDB["userNeedsConfirmation"]) ? 0 : 1;
	$user["user"][$user["user-increment"]]["lastLogin"] = "";
	$user["user"][$user["user-increment"]]["color"] = getUserColors($projectID)["freeColors"][0];

	$file->writeClose(json_encode($user, JSON_UNESCAPED_UNICODE | JSON_UNESCAPED_SLASHES | JSON_PRETTY_PRINT));

	$return["status"] = "success";
	$return["code"] = ($user["user"][$user["user-increment"]]["active"] == 1) ? 0 : 3;
	$return["string"] = "Registration succeeded";
	return $return;
}


/**
 * @param $projectID
 * @param $mail
 * @param $passwd

 * Returning codes:
 * 0 = success
 * 1 = mail, passwd or projectID arent given
 * 2 = User not found
 * 3 = Password incorrect
 * 4 = Could not find user-database // Project is missing
 * 5 = User is not active

 */
function userLogin($projectID, $mail, $passwd) {
	global $conf;

	$userFile = $conf["dir"]["projects"]."/".$projectID."/users.json";

	if ((!$passwd) || (!$mail) || (!$projectID)) {
		$return["status"] = "fail";
		$return["code"] = 1;
		$return["string"] = "Fill out all fields";
		return $return;
	}

	if (!file_exists($userFile)) {
		$return["status"] = "fail";
		$return["code"] = 4;
		$return["string"] = "Could not find user database";
		return $return;
	}

	$mail = strtolower($mail);

	$file = new sharedFile($userFile);
	$json = $file->read();

	$userDB = json_decode($json,true);
	foreach ($userDB["user"] as $k=>$v) {
		if ($v["mail"] == $mail) {
			$user = $userDB["user"][$k];
			$user["id"] = $k;
			break;
		}
	}
	if (!$user) {
		$return["status"] = "fail";
		$return["code"] = 2;
		$return["string"] = "User not found!";
		$file->close();
		return $return;
	}
	if ($user["active"] != 1) {
		$return["status"] = "fail";
		$return["code"] = 5;
		$return["string"] = "User not active!";
		$file->close();
		return $return;
	}
	if ($user["passwd"] != md5($passwd.$user["registrationDate"])) {
		$return["status"] = "fail";
		$return["code"] = 3;
		$return["string"] = "Wrong password!";
		$file->close();
		return $return;
	}


	$_SESSION["ohv"]["projects"][$projectID]["login"] = 1;
	$_SESSION["ohv"]["projects"][$projectID]["user"] = $user;

	$return["status"] = "success";
	$return["code"] = 0;
	$return["string"] = "Login successful";

	$return["userdata"]["id"] = $user["id"];
	$return["userdata"]["mail"] = $user["mail"];
	$return["userdata"]["name"] = $user["name"];
	$return["userdata"]["registrationDate"] = $user["registrationDate"];
	$return["userdata"]["role"] = $user["role"];
	$return["userdata"]["color"] = $user["color"];
	$userDB["user"][$user["id"]]["lastLogin"] = time();
	$file->writeClose(json_encode($userDB, JSON_UNESCAPED_UNICODE | JSON_UNESCAPED_SLASHES | JSON_PRETTY_PRINT));

	$return["session_lifetime"] = $conf["server"]["session_lifetime"];

	return $return;
}




/**
 * @param $projectID

 * Returning codes:
 * 0 = success for one project
 * 1 = success for all projects

 */
function userLogout($projectID) {
	$return["status"] = "success";
	if ($projectID) {
		unset($_SESSION["ohv"]["projects"][$projectID]);
		$return["code"] = 0;
		$return["string"] = "Logout of Project #".$projectID;
	} else {
		session_destroy();
		$return["code"] = 1;
		$return["string"] = "Logout of all Projects";
	}
	return $return;
}



/**
 * checks if User is logged in to a project
 * @param $projectID

 * Returning codes:
 * 2 = project not correct
 * 1 = success
 * 0 = nope
 *

 */
function userCheckLogin($projectID) {
	global $conf;

	if ((!$projectID) || (!file_exists($conf["dir"]["projects"]."/".$projectID."/users.json"))) {
		$return["status"] = "fail";
		$return["code"] = 2;
		$return["string"] = "there is no project with the given projectID";
	} elseif ($_SESSION["ohv"]["projects"][$projectID]["login"] == 1) {

		$userFile = $conf["dir"]["projects"]."/".$projectID."/users.json";
		$file = new sharedFile($userFile);

		$json = $file->read();
		$userdb = json_decode($json,true);

		//Update own data to check if user is still admin or other things have changed
		$tmpUserID = $_SESSION["ohv"]["projects"][$projectID]["user"]["id"];
		$_SESSION["ohv"]["projects"][$projectID]["user"] = $userdb["user"][$tmpUserID];
		$_SESSION["ohv"]["projects"][$projectID]["user"]["id"] = $tmpUserID;
		$file->close();

		$return["status"] = "success";
		$return["code"] = 1;
		$return["string"] = "user logged in to project #".$projectID;
		$return["session_lifetime"] = $conf["server"]["session_lifetime"];

		if ($_SESSION["ohv"]["projects"][$projectID]["user"]["active"] == 0) {
			$return["status"] = "success";
			$return["code"] = 3;
			$return["string"] = "user is logged in but not active";
		}

		$return["response"] = $_SESSION["ohv"]["projects"][$projectID]["user"];
		unset($return["response"]["passwd"]);
	} else {
		$return["status"] = "fail";
		$return["code"] = 0;
		$return["string"] = "User not logged in";
	}
	return $return;
}

/**
 * @param $projectID
 * @param $userID
 * @param $mail
 * @param $name
 * @param $passwd
 * @param $color
 * @param $role
 * @param $active

 * Returning codes:
 * 0 = success
 * 1 = Project UserDB could not be find
 * 2 = User is not Admin and not himself
 * 3 = All data has been saved but mail because its not valid. so old mailadress will still be saved/used

 */
function userChange($projectID,$userID,$mail,$name,$passwd,$color,$role,$active) {
	global $conf;
	$userFile = $conf["dir"]["projects"]."/".$projectID."/users.json";



	if ((!$projectID) || (!file_exists($userFile))) {
		$return["status"] = "fail";
		$return["code"] = 1;
		$return["string"] = "there is no project with the given projectID";
		return $return;
	}

	if (($_SESSION["ohv"]["projects"][$projectID]["login"] == 1) || ($_SESSION["masterpassword"])) {
		$file = new sharedFile($userFile);

		$json = $file->read();
		$userdb = json_decode($json,true);

		//Update own data to check if user is still admin
		$tmpUserID = $_SESSION["ohv"]["projects"][$projectID]["user"]["id"];
		$_SESSION["ohv"]["projects"][$projectID]["user"] = $userdb["user"][$tmpUserID];
		$_SESSION["ohv"]["projects"][$projectID]["user"]["id"] = $tmpUserID;
		include_once($conf["dir"]["data"]."/masterpassword.php");
		if (($_SESSION["masterpassword"]) && ($masterpassword != $_SESSION["masterpassword"])) {
			$return["status"] = "fail";
			$return["code"] = 7;
			$return["string"] = "user has set masterpassword but its wrong. logout on projectmanager.";
		} elseif ((($_SESSION["ohv"]["projects"][$projectID]["user"]["role"] != "admin") && ($userID != $tmpUserID)) && (!$_SESSION["masterpassword"])) {
			$return["status"] = "fail";
			$return["code"] = 2;
			$return["string"] = "user is not admin nor himself";
		} elseif (($_SESSION["ohv"]["projects"][$projectID]["user"]["active"] != 1) && (!$_SESSION["masterpassword"])) {
			$return["status"] = "fail";
			$return["code"] = 5;
			$return["string"] = "user is not active";
			unset($_SESSION["ohv"]["projects"][$projectID]);
		} else {
			if ($userdb["user"][$userID]) {
				$return["code"] = 0;
				if (!filter_var($mail, FILTER_VALIDATE_EMAIL)) {
					$mail = strtolower($userdb["user"][$userID]["mail"]);
					$return["code"] = 3;
				} else {
					$mail = strtolower($mail);
				}
				$userdb["user"][$userID]["role"] = (($role) && (($_SESSION["ohv"]["projects"][$projectID]["user"]["role"] == "admin") || $_SESSION["masterpassword"])) ? $role : $userdb["user"][$userID]["role"];
				$userdb["user"][$userID]["name"] = $name;
				$userdb["user"][$userID]["mail"] = $mail;
				$userdb["user"][$userID]["color"] = $color;
				$userdb["user"][$userID]["active"] = ((($active==="1" || $active==="0") && (($_SESSION["ohv"]["projects"][$projectID]["user"]["role"] == "admin") || $_SESSION["masterpassword"])) ? $active*1 : $userdb["user"][$userID]["active"]*1);
				$userdb["user"][$userID]["passwd"] = ($passwd) ? md5($passwd.$userdb["user"][$userID]["registrationDate"]) : $userdb["user"][$userID]["passwd"];
				$file->write(json_encode($userdb, JSON_UNESCAPED_UNICODE | JSON_UNESCAPED_SLASHES | JSON_PRETTY_PRINT));				
				$return["status"] = "success";
				$return["string"] = "userdata updated";
				$return["response"] = $userdb["user"][$userID];
				unset($return["response"]["passwd"]);
			} else {
				$return["status"] = "fail";
				$return["code"] = 6;
				$return["string"] = "Targeted User not found";
			}
		}
		$file->close();
	} else {
		$return["status"] = "fail";
		$return["code"] = 4;
		$return["string"] = "User not logged in";
	}

	return $return;
}

function getUserColors($projectID) {
	global $conf;
	$json = file_get_contents($conf["dir"]["data"]."/config.json");
	$configDB = json_decode($json, true);
	$return["colorCollection"] = $configDB["userColorCollection"];

	if ($projectID) {
		$json = file_get_contents($conf["dir"]["projects"]."/".$projectID."/users.json");
		$user = json_decode($json, true);
		foreach ($user["user"] as $k => $u) {
			$used[$k] = $u["color"];
		}
		$return["user"] = $used;

		//because array_diff returns keys too.
		foreach ($return["colorCollection"] as $c) {
			if (!in_array($c, $used)) {
				$return["freeColors"][] = $c;
			}
		}

		if (count($return["freeColors"]) < 1) {
			$return["freeColors"] = $return["colorCollection"][0];
		}
	} else {
		$return["freeColors"] = $return["colorCollection"];
	}
	return $return;
}