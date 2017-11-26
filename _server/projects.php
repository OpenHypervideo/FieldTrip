<?php

require_once("./config.php");

function superUserLogin($password = false) {
	global $conf;

	include_once($conf["dir"]["data"]."/masterpassword.php");

	if (($password) && ($password == $masterpassword)) {

		$return["status"] = "success";
		$return["code"] = 0;
		$return["string"] = "login success";
		$_SESSION["masterpassword"] = $password;

	} elseif ($_SESSION["masterpassword"] == $masterpassword) {

		$return["status"] = "success";
		$return["code"] = 0;
		$return["string"] = "login success";

	} else {

		$return["status"] = "fail";
		$return["code"] = 3;
		$return["string"] = "Masterpassword not correct";
		unset($_SESSION["masterpassword"]);

	}
	return $return;
}


function superUserLogout() {
	unset($_SESSION["masterpassword"]);
	$return["status"] = "success";
	$return["code"] = 0;
	$return["string"] = "superuser logged out";
	return $return;
}

/**
 * @param bool $details
 * @return object
 */
function projectsGet($details = false, $login = false) {
	global $conf;
	$json = file_get_contents($conf["dir"]["projects"]."/_index.json");
	$pDB = json_decode($json,true);
	if ($details) {
		foreach ($pDB["projects"] as $k=>$v) {
			$json = file_get_contents($conf["dir"]["projects"]."/".$k."/hypervideos/_index.json");
			$pDB["projects"][$k]["hypervideos"] = json_decode($json,true);
		}
	}
	if ($login) {
		include_once("user.php");
		foreach ($pDB["projects"] as $k=>$v) {
			if ($_SESSION["ohv"]["projects"][$k]["login"] == 1) {
				$pDB["projects"][$k]["login"] = 1;
				$pDB["projects"][$k]["loginUser"] = userGet($k,$_SESSION["ohv"]["projects"][$k]["user"]["id"])["response"];
				$pDB["loggedInProjects"][] = $k;
			}
		}
	}
	$return["status"] = "success";
	$return["code"] = 200;
	$return["string"] = "see response";
	$return["response"] = $pDB;
	return $return;
}

function projectsNew($name, $description, $config, $userNeedsConfirmation, $defaultUserRole, $theme, $defaultHypervideoHidden) {
	global $conf;
	$login = superUserLogin();

	if ($login["status"] == "fail") {
		$return["status"] = "fail";
		$return["code"] = 3;
		$return["string"] = "User not logged in with Masterpassword";
		return $return;
	}
	$file = new sharedFile($conf["dir"]["projects"]."/_index.json");
	$projects = $file->read();
	$projects = json_decode($projects,true);

	if (strlen($name) < 3) {
		$return["status"] = "fail";
		$return["code"] = 1;
		$return["string"] = "Please enter a name with at least 3 characters";
		$file->close();
		return $return;
	} elseif (strlen($description) < 3) {
		$return["status"] = "fail";
		$return["code"] = 2;
		$return["string"] = "Please enter a description with at least 3 characters";
		$file->close();
		return $return;
	}

	$projects["project-increment"]++;
	$projects["projects"][$projects["project-increment"]] = "./".$projects["project-increment"];
	$projectsJSON = json_encode($projects, $conf["settings"]["json_flags"]);
	$file->writeClose($projectsJSON);

	mkdir($conf["dir"]["projects"]."/".$projects["project-increment"]);
	mkdir($conf["dir"]["projects"]."/".$projects["project-increment"]."/hypervideos");
	mkdir($conf["dir"]["projects"]."/".$projects["project-increment"]."/resources");
	file_put_contents($conf["dir"]["projects"]."/".$projects["project-increment"]."/users.json", json_encode(array("user-increment"=>1,"user"=>array())),$conf["settings"]["json_flags"]);
	file_put_contents($conf["dir"]["projects"]."/".$projects["project-increment"]."/hypervideos/_index.json", json_encode(array("hypervideo-increment"=>1,"hypervideos"=>array())),$conf["settings"]["json_flags"]);
	file_put_contents($conf["dir"]["projects"]."/".$projects["project-increment"]."/resources/_index.json", json_encode(array("resources-increment"=>1,"resources"=>array())),$conf["settings"]["json_flags"]);

	$project["name"] = $name;
	$project["description"] = $description;
	$project["created"] = time();
	$project["userNeedsConfirmation"] = filter_var($userNeedsConfirmation, FILTER_VALIDATE_BOOLEAN);
	$project["defaultUserRole"] = $defaultUserRole;
	$project["defaultHypervideoHidden"] = filter_var($defaultHypervideoHidden, FILTER_VALIDATE_BOOLEAN);
	$project["theme"] = $theme;

	/*
	foreach ($config as $k=>$v) {
		if (($v == "true") || ($v == "false")) {
			$config[$k] = filter_var($v, FILTER_VALIDATE_BOOLEAN);
		}
	}

	$project["defaultHypervideoConfig"] = $config;
	*/
	
	file_put_contents($conf["dir"]["projects"]."/".$projects["project-increment"]."/project.json", json_encode($project,$conf["settings"]["json_flags"]));

	file_put_contents($conf["dir"]["projects"]."/".$projects["project-increment"]."/tagdefinitions.json", "{}");

	$return["status"] = "success";
	$return["code"] = 0;
	$return["string"] = "Project has been created";
	return $return;
}

function projectsEdit($projectID, $name, $description, $config, $userNeedsConfirmation, $defaultUserRole, $theme, $defaultHypervideoHidden) {
	global $conf;

	/* Check for User is ProjectAdmin */

	if ($_SESSION["ohv"]["projects"][$projectID]["login"]) {
		$tmp = json_decode(file_get_contents($conf["dir"]["projects"]."/".$projectID."/users.json"), true);
		$tmpUserIsAdmin = ($tmp["user"][$_SESSION["ohv"]["projects"][$projectID]["user"]["id"]]["role"] == "admin") ? true : false;
	}

	/* Check for Masterpassword */
	$login = superUserLogin();
	if (($login["status"] == "fail") && (!$tmpUserIsAdmin)) {
		$return["status"] = "fail";
		$return["code"] = 4;
		$return["string"] = "User not logged in with Masterpassword and is no logged in Admin of this Project";
		return $return;
	}

	$file = new sharedFile($conf["dir"]["projects"]."/_index.json");
	$projects = $file->read();
	$projects = json_decode($projects,true);

	if (strlen($name) < 3) {
		$return["status"] = "fail";
		$return["code"] = 1;
		$return["string"] = "Please enter a name with at least 3 characters";
		$file->close();
		return $return;
	} elseif (strlen($description) < 3) {
		$return["status"] = "fail";
		$return["code"] = 2;
		$return["string"] = "Please enter a description with at least 3 characters";
		$file->close();
		return $return;
	} elseif (!array_key_exists($projectID,$projects["projects"]) || (!is_dir(realpath($conf["dir"]["projects"]."/".$projects["projects"][$projectID])))) {
		$return["status"] = "fail";
		$return["code"] = 3;
		$return["string"] = "ProjectID or Project Directory has not been found";
		$file->close();
		return $return;
	}
	$file->close();

	$file = new sharedFile($conf["dir"]["projects"]."/".$projects["projects"][$projectID]."/project.json");
	$project = $file->read();
	$project = json_decode($project,true);

	$project["name"] = $name;
	$project["description"] = $description;
	$project["userNeedsConfirmation"] = filter_var($userNeedsConfirmation, FILTER_VALIDATE_BOOLEAN);
	$project["defaultUserRole"] = $defaultUserRole;
	$project["defaultHypervideoHidden"] = filter_var($defaultHypervideoHidden, FILTER_VALIDATE_BOOLEAN);
	$project["theme"] = $theme;
	
	/*
	foreach ($config as $k=>$v) {
		if (($v == "true") || ($v == "false")) {
			$config[$k] = filter_var($v, FILTER_VALIDATE_BOOLEAN);
		}
	}

	$project["defaultHypervideoConfig"] = $config;
	*/


	$project = json_encode($project, $conf["settings"]["json_flags"]);
	$file->writeClose($project);
	$return["status"] = "success";
	$return["code"] = 0;
	$return["string"] = "Project has been saved";
	$return["response"] = $projects["projects"][$projectID];
	$return["projectID"] = $projectID;
	return $return;
}

function projectsDelete($projectID, $name) {
	global $conf;
	$login = superUserLogin();
	if ($login["status"] == "fail") {
		$return["status"] = "fail";
		$return["code"] = 3;
		$return["string"] = "User not logged in with Masterpassword";
		return $return;
	}
	$file = new sharedFile($conf["dir"]["projects"]."/_index.json");
	$projects = $file->read();
	$projects = json_decode($projects,true);

	// TODO: Validate Key has been found in $projects, dir exists, projectfile exists

	$file2 = new sharedFile($conf["dir"]["projects"]."/".$projects["projects"][$projectID]."/project.json");
	$project = $file2->read();
	$project = json_decode($project,true);

	if ($name != $project["name"]) {
		$return["status"] = "fail";
		$return["code"] = 1;
		$return["string"] = "Project Name was not correct";
		$file->close();
		$file2->close();
		return $return;
	} if (!is_numeric($projectID)) {
		$return["status"] = "fail";
		$return["code"] = 2;
		$return["string"] = "ProjectID is not nummeric";
		$file->close();
		$file2->close();
		return $return;
	}

	$file2->close();

	rrmdir($conf["dir"]["projects"]."/".$projects["projects"][$projectID]);
	unset($projects["projects"][$projectID]);

	$projects = json_encode($projects, $conf["settings"]["json_flags"]);
	$file->writeClose($projects);
	$return["status"] = "success";
	$return["code"] = 0;
	$return["string"] = "Project has been deleted";
	$return["projectID"] = $projectID;
	return $return;
}