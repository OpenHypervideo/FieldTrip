<?php

require_once("./config.php");

/**
 * @param $projectID
 * @param $hypervideoID
 * @param $annotationfileID
 * @param $action
 * @param $name
 * @param $description
 * @param $hidden
 * @param $src
 * @return mixed
 *
 *
Returning Code:
0		=	Success. File has been written
1		=	failed. Not logged in to the projectID.
2		=	failed. User not active
3		=	failed. Could not find the annotations folder
4		=	failed. action not correct! "save" or "saveAs"
5		=	failed. Name (min 3 chars) or Description have not been submitted.
6		=	failed. Just on Save - Annotation with $id has not been found. (in DB or as file)
7		=	Permission denied. Just on Save. You are not the annotations owner and no administrator!
 *
 */
function annotationfileSave($projectID, $hypervideoID, $annotationfileID, $action, $name, $description, $hidden, $src) {
	global $conf;

	if ($_SESSION["ohv"]["projects"][$projectID]["login"] != 1) {
		$return["status"] = "fail";
		$return["code"] = 1;
		$return["string"] = "Not logged in or projectID is wrong.";
		return $return;
	} else {
		$file = new sharedFile($conf["dir"]["projects"]."/".$projectID."/users.json");
		$json = $file->read();
		$file->close();
		$u = json_decode($json,true);
		$_SESSION["ohv"]["projects"][$projectID]["user"] = array_replace_recursive($_SESSION["ohv"]["projects"][$projectID]["user"], $u["user"][$_SESSION["ohv"]["projects"][$projectID]["user"]["id"]]);
	}


	if ($_SESSION["ohv"]["projects"][$projectID]["user"]["active"] != 1) {
		$return["status"] = "fail";
		$return["code"] = 2;
		$return["string"] = "User not activated";
		return $return;
	}
	/*if (!is_dir($conf["dir"]["projects"]."/".$projectID."/hypervideos/".$hypervideoID."/annotations")) {
		$return["status"] = "fail";
		$return["code"] = 3;
		$return["string"] = "Could not find the annotations folder";
		return $return;
	}*/

	if (($action != "save") && ($action != "saveAs")) {
		$return["status"] = "fail";
		$return["code"] = 4;
		$return["string"] = "action not correct!";
		return $return;
	}

	if ((!$description) || (!$name) || (strlen($name) <3)) {
		$return["status"] = "fail";
		$return["code"] = 5;
		$return["string"] = "Name (min 3 chars) or Description have not been submitted.";
		return $return;
	}

	/*
	if ((($action == "save") && ($name != false) && ($name != "")) && (strlen($name) <3)) {
		$return["status"] = "fail";
		$return["code"] = 6;
		$return["string"] = "Name has to have min 3 chars!";
		return $return;
	}*/

	if (!is_dir($conf["dir"]["projects"]."/".$projectID."/hypervideos/".$hypervideoID."/annotations/")) {
		mkdir($conf["dir"]["projects"]."/".$projectID."/hypervideos/".$hypervideoID."/annotations/");
	}
	if (!file_exists($conf["dir"]["projects"]."/".$projectID."/hypervideos/".$hypervideoID."/annotations/_index.json")) {
		$tmp["mainAnnotation"] = "1";
		$tmp["annotationfiles"] = (object)array();
		$tmp["annotation-increment"] = 1;
		$annotationfileID = "1";
		file_put_contents($conf["dir"]["projects"]."/".$projectID."/hypervideos/".$hypervideoID."/annotations/_index.json", json_encode($tmp,$conf["settings"]["json_flags"]));
	}

	$file = new sharedFile($conf["dir"]["projects"]."/".$projectID."/hypervideos/".$hypervideoID."/annotations/_index.json");
	$json = $file->read();
	$an = json_decode($json,true);

	if (($action == "save") && ((!is_array($an["annotationfiles"][$annotationfileID])) || (!file_exists($conf["dir"]["projects"]."/".$projectID."/hypervideos/".$hypervideoID."/annotations/".$annotationfileID.".json")))) {
		$return["status"] = "fail";
		$return["code"] = 6;
		$return["string"] = "Annotation with id=".$annotationfileID." has not been found.";
		$file->close();
		return $return;
	}

	if (($action == "save") && (($_SESSION["ohv"]["projects"][$projectID]["user"]["id"] != $an["annotationfiles"][$annotationfileID]["ownerId"]) && ($_SESSION["ohv"]["projects"][$projectID]["user"]["role"] != "admin"))) {
		$return["status"] = "fail";
		$return["code"] = 7;
		$return["string"] = "Permission denied. You are not the annotations owner and no administrator!";
		$file->close();
		return $return;
	}
	$time = time();

	if ($hidden === "false") {
		$hidden = false;
	} elseif ($hidden === "true") {
		$hidden = true;
	}

	if ($action == "save") {
		$anID = $annotationfileID;
		$created = $an["annotationfiles"][$anID]["created"];
	} else {
		$an["annotation-increment"]++;
		$anID = $an["annotation-increment"];
		$created = $time;
	}

	$an["annotationfiles"][$anID]["name"] = ($name) ? $name : $an["annotationfiles"][$anID]["name"];
	$an["annotationfiles"][$anID]["description"] = ($description) ? $description : $an["annotationfiles"][$anID]["description"];
	$an["annotationfiles"][$anID]["created"] = $created;
	$an["annotationfiles"][$anID]["lastchanged"] = $time;
	$an["annotationfiles"][$anID]["owner"] = $_SESSION["ohv"]["projects"][$projectID]["user"]["name"];
	$an["annotationfiles"][$anID]["ownerId"] = $_SESSION["ohv"]["projects"][$projectID]["user"]["id"];
	$an["annotationfiles"][$anID]["hidden"] = $hidden;

	$file->writeClose(json_encode($an, $conf["settings"]["json_flags"]));

	$fileStr = $conf["dir"]["projects"]."/".$projectID."/hypervideos/".$hypervideoID."/annotations/".$anID.".json";
	if (($action == "saveAs") && (!file_exists($fileStr))) {
		file_put_contents($fileStr, "");
	}
	$file = new sharedFile($fileStr);
	/*$src = json_decode($src,true);
	$src = json_encode($src, $conf["settings"]["json_flags"]);
	*/
	$file->writeClose($src);
	$return["status"] = "success";
	$return["code"] = 0;
	$return["string"] = "File has been written";
	$return["annotationID"] = $anID;
	$file->close();
	return $return;
}

/**
 * @param $projectID
 * @param $hypervideoID
 * @param $annotationfileID
 * @return mixed
 *
Returning Code:
0		=	Success. File has been written
1		=	failed. Not logged in to the projectID.
2		=	failed. User not active
3		=	failed. Could not find the annotations folder
4		=	failed. Annotationfile is Main-file and cant be deleted.
5		=	failed. Annotation with id=$annotationfileID has not been found.
7		=	Permission denied. Permission denied. You are not the annotations owner and no administrator!
 */
function annotationfileDelete($projectID,$hypervideoID,$annotationfileID) {
	global $conf;

	if ($_SESSION["ohv"]["projects"][$projectID]["login"] != 1) {
		$return["status"] = "fail";
		$return["code"] = 1;
		$return["string"] = "Not logged in or projectID is wrong.";
		return $return;
	} else {
		$file = new sharedFile($conf["dir"]["projects"]."/".$projectID."/users.json");
		$json = $file->read();
		$file->close();
		$u = json_decode($json,true);
		$_SESSION["ohv"]["projects"][$projectID]["user"] = array_replace_recursive($_SESSION["ohv"]["projects"][$projectID]["user"], $u["user"][$_SESSION["ohv"]["projects"][$projectID]["user"]["id"]]);
	}

	if ($_SESSION["ohv"]["projects"][$projectID]["user"]["active"] != 1) {
		$return["status"] = "fail";
		$return["code"] = 2;
		$return["string"] = "User not activated";
		return $return;
	}
	if (!is_dir($conf["dir"]["projects"]."/".$projectID."/hypervideos/".$hypervideoID."/annotationfiles")) {
		$return["status"] = "fail";
		$return["code"] = 3;
		$return["string"] = "Could not find the annotations folder";
		return $return;
	}

	$file = new sharedFile($conf["dir"]["projects"]."/".$projectID."/hypervideos/_index.json");
	$json = $file->read();
	$hv = json_decode($json,true);

	if ($hv["hypervideos"][$hypervideoID]["mainAnnotation"] == $annotationfileID) {
		$return["status"] = "fail";
		$return["code"] = 4;
		$return["string"] = "Annotationfile is Main-file and cant be deleted.";
		$file->close();
		return $return;
	}

	$currAnnotation = $hv["hypervideos"][$hypervideoID]["annotationfiles"][$annotationfileID];

	if ((!is_array($currAnnotation)) || (!file_exists($conf["dir"]["projects"]."/".$projectID."/hypervideos/".$hypervideoID."/annotationfiles/".$annotationfileID.".json"))) {
		$return["status"] = "fail";
		$return["code"] = 5;
		$return["string"] = "Annotation with id=".$annotationfileID." has not been found.";
		$file->close();
		return $return;
	}

	if (($_SESSION["ohv"]["projects"][$projectID]["user"]["id"] != $currAnnotation["ownerId"]) && ($_SESSION["ohv"]["projects"][$projectID]["user"]["role"] != "admin")) {
		$return["status"] = "fail";
		$return["code"] = 6;
		$return["string"] = "Permission denied. You are not the annotations owner and no administrator!";
		$file->close();
		return $return;
	}

	unlink($conf["dir"]["projects"]."/".$projectID."/hypervideos/".$hypervideoID."/annotationfiles/".$annotationfileID.".json");
	unset($hv["hypervideos"][$hypervideoID]["annotationfiles"][$annotationfileID]);

	$file->writeClose(json_encode($hv, JSON_UNESCAPED_UNICODE | JSON_UNESCAPED_SLASHES| JSON_PRETTY_PRINT));

	$return["status"] = "success";
	$return["code"] = 0;
	$return["string"] = "Annotations deleted.";



	return $return;
}


?>