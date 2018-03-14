<?php

require_once("./config.php");
require_once("./user.php");

/**
 * @param $type
 * @param $name
 * @param $description
 * @param $attributes
 * @param $files
 * @param $lat
 * @param $lon
 * @param $boundingBox
 * @return mixed
 *
Returning Code:
	0		=	Success. In $return["response"]["resource"] will the new JSON be returned. in $return["response"]["resId"] you can find the new ID
	1		=	failed. User is not logged in into the Project. Or User is not activated.
	3		= 	failed. Could not find the resources folder
	4		= 	failed. Type "image" was expected but the file wasn't transferred.
	5		= 	failed. Type "video" was expected but not both video files has been transferred.
	6		= 	failed. Type "video" was expected but attached File-Mimetypes seem to be incorrect.
	7		= 	failed. Type "map" was expected but $lat or $lon aren't send by parameter.
	8		= 	failed. $type or $name have not been transferred.
	9		= 	failed. $type was wrong.
	10		=	failed. File size too big.
	11		=	failed. Type "url" was expected but url is empty.
 *
 *
 */
function fileUpload($type, $name, $description="", $attributes, $files, $lat, $lon, $boundingBox) {
	global $conf;

	$login = userCheckLogin();

	if ($login["code"] != 1) {
		$return["status"] = "fail";
		$return["code"] = 1;
		$return["string"] = $login["string"];
		return $return;
	} else {
		$file = new sharedFile($conf["dir"]["data"]."/users.json");
		$json = $file->read();
		$file->close();
		$u = json_decode($json,true);
		$_SESSION["ohv"]["user"] = array_replace_recursive($_SESSION["ohv"]["user"], $u["user"][$_SESSION["ohv"]["user"]["id"]]);
	}


	if (!is_dir($conf["dir"]["data"]."/resources")) {
		$return["status"] = "fail";
		$return["code"] = 3;
		$return["string"] = "Could not find the resources folder";
		return $return;
		exit;
	}

	if ((!$type) || (!$name) || ($name == "")) {
		$return["status"] = "fail";
		$return["code"] = 8;
		$return["string"] = "Name or Type have not been submitted.";
		return $return;
		exit;
	}

	if (!$attributes) {
		$attributes = new ArrayObject();
	}

	$max_upload = (int)(ini_get('upload_max_filesize'));
	$max_post = (int)(ini_get('post_max_size'));
	$memory_limit = (int)(ini_get('memory_limit'));
	$upload_mb = min($max_upload, $max_post, $memory_limit);

	$configjson = file_get_contents($conf["dir"]["data"]."/config.json");
	$configDB = json_decode($configjson, true);
	$uploadsAllowed = $configDB["allowUploads"];

	$cTime = time();
	$newResource["name"] = $name;
	$newResource["creator"] = (string)$_SESSION["ohv"]["user"]["name"];
	$newResource["creatorId"] = (string)$_SESSION["ohv"]["user"]["id"];
	$newResource["created"] = (int)$cTime;
	$newResource["description"] = $description;

	switch ($type) {
		case "url":
			
			$urlAttr = json_decode($attributes, true);

			if ( !$urlAttr["src"] || $urlAttr["src"] == "" ) {
				$return["status"] = "fail";
				$return["code"] = 11;
				$return["string"] = "Empty field: URL.";
				return $return;
				exit;
			}

			$newResource["src"] = $urlAttr["src"];
			$newResource["type"] = $urlAttr["type"];
			$newResource["attributes"] = $urlAttr["attributes"];
			$newResource["thumb"] = $urlAttr["thumb"];
		break;
		case "image":
			if ($uploadsAllowed === false) {
				$return["status"] = "fail";
				$return["code"] = 20;
				$return["string"] = "User not allowed to upload files";
				return $return;
				exit;
			}

			if ((!$files["image"]) || (!$files["image"]["size"])) {
				$return["status"] = "fail";
				$return["code"] = 4;
				$return["string"] = "No Image file to upload";
				return $return;
				exit;
			}

			/* TODO: Check file size correctly */
			/*
			if ( $_FILES["image"]["size"] >= $upload_mb ) {
				$return["status"] = "fail";
				$return["code"] = 10;
				$return["string"] = "File too big";
				return $return;
				exit;
			}
			*/

			$filearray = preg_split("/\./", $files["image"]["name"]);
			$filetype = array_pop($filearray);
			$filename = substr($_SESSION["ohv"]["user"]["id"]."_".$cTime."_".sanitize($name),0,90).".".$filetype;
			$newResource["src"] = $filename;
			$newResource["type"] = "image";
			$newResource["attributes"] = ($attributes) ? $attributes : Array();
			move_uploaded_file($files["image"]["tmp_name"], $conf["dir"]["data"]."/resources/".$filename);
		break;
		case "pdf":
			if ($uploadsAllowed === false) {
				$return["status"] = "fail";
				$return["code"] = 20;
				$return["string"] = "User not allowed to upload files";
				return $return;
				exit;
			}

			if ((!$files["pdf"]) || (!$files["pdf"]["size"])) {
				$return["status"] = "fail";
				$return["code"] = 4;
				$return["string"] = "No PDF file to upload";
				return $return;
				exit;
			}

			/* TODO: Check file size correctly */
			/*
			if ( $_FILES["pdf"]["size"] >= $upload_mb ) {
				$return["status"] = "fail";
				$return["code"] = 10;
				$return["string"] = "File too big";
				return $return;
				exit;
			}
			*/

			$filearray = preg_split("/\./", $files["pdf"]["name"]);
			$filetype = array_pop($filearray);
			$filename = substr($_SESSION["ohv"]["user"]["id"]."_".$cTime."_".sanitize($name),0,90).".".$filetype;
			$newResource["src"] = $filename;
			$newResource["type"] = "pdf";
			$newResource["attributes"] = ($attributes) ? $attributes : Array();
			move_uploaded_file($files["pdf"]["tmp_name"], $conf["dir"]["data"]."/resources/".$filename);
		break;
		case "audio":
			if ($uploadsAllowed === false) {
				$return["status"] = "fail";
				$return["code"] = 20;
				$return["string"] = "User not allowed to upload files";
				return $return;
				exit;
			}

			if ((!$files["audio"]) || (!$files["audio"]["size"])) {
				$return["status"] = "fail";
				$return["code"] = 4;
				$return["string"] = "No audio file to upload";
				return $return;
				exit;
			}

			/* TODO: Check file size correctly */
			/*
			if ( $_FILES["audio"]["size"] >= $upload_mb ) {
				$return["status"] = "fail";
				$return["code"] = 10;
				$return["string"] = "File too big";
				return $return;
				exit;
			}
			*/

			$filearray = preg_split("/\./", $files["audio"]["name"]);
			$filetype = array_pop($filearray);
			$filename = substr($_SESSION["ohv"]["user"]["id"]."_".$cTime."_".sanitize($name),0,90).".".$filetype;
			$newResource["src"] = $filename;
			$newResource["type"] = "audio";
			$newResource["attributes"] = ($attributes) ? $attributes : Array();
			move_uploaded_file($files["audio"]["tmp_name"], $conf["dir"]["data"]."/resources/".$filename);
		break;
		case "video":
			if ($uploadsAllowed === false) {
				$return["status"] = "fail";
				$return["code"] = 20;
				$return["string"] = "User not allowed to upload files";
				return $return;
				exit;
			}
			if ( (!$_FILES["mp4"]) || (!$_FILES["mp4"]["size"]) ) {
				$return["status"] = "fail";
				$return["code"] = 5;
				$return["string"] = "Not enough video sources";
				return $return;
				exit;
			} else if ( (!in_array($_FILES["mp4"]["type"], array("video/mp4", "video/mpeg4"))) ) {
				$return["status"] = "fail";
				$return["code"] = 6;
				$return["string"] = "Wrong video file format";
				return $return;
				exit;
			}

			/* TODO: Check file size correctly */
			/*
			if ( $_FILES["mp4"]["size"] >= $upload_mb ) {
				$return["status"] = "fail";
				$return["code"] = 10;
				$return["string"] = "File too big";
				return $return;
				exit;
			}
			*/


			$filename = substr($_SESSION["ohv"]["user"]["id"]."_".$cTime."_".sanitize($name),0,90);
			move_uploaded_file($files["mp4"]["tmp_name"], $conf["dir"]["data"]."/resources/".$filename.".mp4");
			$newResource["src"] = $filename.".mp4";
			$newResource["attributes"] = ($attributes) ? $attributes : Array();
			foreach ($files["subtitles"]["name"] as $k=>$v) {
				$filetype = array_pop(preg_split("/\./", $v));
				$filename = substr($_SESSION["ohv"]["user"]["id"]."_".$cTime."_".sanitize($name),0,90)."_sub_".$k.".".$filetype;
				move_uploaded_file($files["subtitles"]["tmp_name"][$k], $conf["dir"]["data"]."/resources/".$filename);
				$newResource["subtitles"][$k] = $filename;
			}

			$newResource["type"] = "video";
		break;
		case "map":
			if ((!$lat) || (!$lon)) {
				$return["status"] = "fail";
				$return["code"] = 7;
				$return["string"] = "Lat or Lon are missing";
				return $return;
				exit;
			}
			$newResource["type"] = "location";
			$newResource["src"] = "";
			$newResource["attributes"] = ($attributes) ? $attributes : Array();
			$newResource["attributes"]["lat"] = $lat;
			$newResource["attributes"]["lon"] = $lon;
			$newResource["attributes"]["boundingBox"] = $boundingBox;
		break;
		default:
			$return["status"] = "fail";
			$return["code"] = 9;
			$return["string"] = "Type was not correct";
			return $return;
			exit;
		break;
	}
	$file = new sharedFile($conf["dir"]["data"]."/resources/_index.json");
	$json = $file->read();
	$res = json_decode($json,true);
	if (!$res["resources-increment"]) {
		$res["resources-increment"] = 0;
	}
	$res["resources-increment"]++;
	$res["resources"][$res["resources-increment"]] = $newResource;
	$file->writeClose(json_encode($res, $conf["settings"]["json_flags"]));

	$return["status"] = "success";
	$return["code"] = 0;
	$return["string"] = "File saved.";
	$return["response"]["resource"] = $newResource;
	$return["response"]["resId"] = $res["resources-increment"];
	return $return;
}

/**
 * @param $resourcesID
 * @param $thumb
 * @return mixed
 *
Returning Code:
0		=	Success. In $return["response"] will the full Object of manipulated Resource be returned.
1		=	failed. User is not logged in into the Project. Or User is not activated.
3		= 	failed. Could not find the resources folder
4		= 	failed. resourcesID or thumb are not transferred
5		= 	failed. No valid resourcesID
6		= 	failed. Not permitted. Its not your resource and you're not an admin!
 *
 */
function fileUploadThumb($resourcesID,$thumb) {
	global $conf;

	$login = userCheckLogin();

	if ($login["code"] != 1) {
		$return["status"] = "fail";
		$return["code"] = 1;
		$return["string"] = $login["string"];
		return $return;
	} else {
		$file = new sharedFile($conf["dir"]["data"]."/users.json");
		$json = $file->read();
		$file->close();
		$u = json_decode($json,true);
		$_SESSION["ohv"]["user"] = array_replace_recursive($_SESSION["ohv"]["user"], $u["user"][$_SESSION["ohv"]["user"]["id"]]);
	}

	if (!is_dir($conf["dir"]["data"]."/resources")) {
		$return["status"] = "fail";
		$return["code"] = 3;
		$return["string"] = "Could not find the resources folder";
		return $return;
		exit;
	}

	if ((!$resourcesID) || (!$thumb) || ($thumb == "")) {
		$return["status"] = "fail";
		$return["code"] = 4;
		$return["string"] = "resourcesID or thumb are not transferred";
		return $return;
		exit;
	}
	$file = new sharedFile($conf["dir"]["data"]."/resources/_index.json");
	$json = $file->read();
	$res = json_decode($json,true);
	if (!is_array($res["resources"][$resourcesID])) {
		$return["status"] = "fail";
		$return["code"] = 5;
		$return["string"] = "No valid resourcesID";
		$return["response"] = $res;
		$file->close();
		return $return;
		exit;
	}
	if (($res["resources"][$resourcesID]["creatorId"] != $_SESSION["ohv"]["user"]["id"]) && ($_SESSION["ohv"]["user"]["role"] != "admin")) {
		$return["status"] = "fail";
		$return["code"] = 6;
		$return["string"] = "Not permitted. Its not your resource and you're not an admin!";
		$file->close();
		return $return;
		exit;
	}
	$thumb = str_replace('data:image/png;base64,', '', $thumb);
	//$_REQUEST["thumb"] = str_replace(' ', '+', $_REQUEST["thumb"]);
	//echo $_REQUEST["thumb"];
	$data = base64_decode($thumb);

	$filename = substr($_SESSION["ohv"]["user"]["id"]."_".$res["resources"][$resourcesID]["created"]."_thumb_".sanitize($res["resources"][$resourcesID]["name"]),0,90);
	file_put_contents($conf["dir"]["data"]."/resources/".$filename.".png", $data);

	$res["resources"][$resourcesID]["thumb"] = $filename.".png";
	$file->writeClose(json_encode($res, $conf["settings"]["json_flags"]));
	$return["status"] = "success";
	$return["code"] = 0;
	$return["string"] = "thumb saved";
	$return["response"] = $res["resources"][$resourcesID];
	return $return;
}

/**
 * @param $resourcesID
 * @return mixed
 *
Returning Code:
0		=	Success. Resource and its thumbs have been deleted.
1		=	failed. User is not logged in or is inactive
2		=	failed. Could not find resources database (json)
3		= 	failed. resourcesID was not found. Missing or wrong ID
4		= 	failed. Not permitted. Its not your resource and you're no admin!
5		= 	failed. Resource is in use. Check out $return["used"] where
 *
 */
function fileDelete($resourcesID) {
	global $conf;
	$login = userCheckLogin();

	if ($login["code"] != 1) {
		$return["status"] = "fail";
		$return["code"] = 1;
		$return["string"] = $login["string"];
		return $return;
	} else {
		$file = new sharedFile($conf["dir"]["data"]."/users.json");
		$json = $file->read();
		$file->close();
		$u = json_decode($json,true);
		$_SESSION["ohv"]["user"] = array_replace_recursive($_SESSION["ohv"]["user"], $u["user"][$_SESSION["ohv"]["user"]["id"]]);
	}

	if (!file_exists($conf["dir"]["data"]."/resources/_index.json")) {
		$return["status"] = "fail";
		$return["code"] = 2;
		$return["string"] = "Could not find resources database";
		return $return;
		exit;
	}
	$file = new sharedFile($conf["dir"]["data"]."/resources/_index.json");
	$json = $file->read();
	$res = json_decode($json,true);
	if (!$res["resources"][$resourcesID]) {
		$return["status"] = "fail";
		$return["code"] = 3;
		$return["string"] = "No valid resoucesID";
		$file->close();
		return $return;
		exit;
	}
	if (($res["resources"][$resourcesID]["creatorId"] != $_SESSION["ohv"]["user"]["id"]) && ($_SESSION["ohv"]["user"]["role"] != "admin")) {
		$return["status"] = "fail";
		$return["code"] = 4;
		$return["string"] = "Not permitted. Its not your resource and you're no admin!";
		$file->close();
		return $return;
		exit;
	}


	$json = file_get_contents($conf["dir"]["data"]."/hypervideos/_index.json");
	$hv = json_decode($json,true);
	$usedcnt = 0;
	$used = array();
	foreach ($hv["hypervideos"] as $hvk=>$hvc) {
		$hvannotationJson = file_get_contents($conf["dir"]["data"]."/hypervideos/".$hvk."/annotations/_index.json");
		$hvannotationIndex = json_decode($hvannotationJson,true);
		foreach ($hvannotationIndex["annotationfiles"] as $hvak=>$hvac) {
			$hvannotationFileJson = file_get_contents($conf["dir"]["data"]."/hypervideos/".$hvk."/annotations/".$hvak.".json");
			$hvannotationFile = json_decode($hvannotationFileJson,true);
			foreach ($hvannotationFile as $hvannotationFileItem) {
				
				if ($hvannotationFileItem["body"]["frametrail:resourceId"] == $resourcesID) {
					$usedcnt++;
					$tmp = array();
					$tmp["hypervideoId"] = $hvk;
					$tmp["annotationfilesId"] = $hvak;
					$tmp["annotationfilesName"] = $hvac["name"];
					$tmp["type"] = "annotationsfile";
					$tmp["owner"] = $hvac["owner"];
					$tmp["ownerId"] = $hvac["ownerId"];
					array_push($used, $tmp);
				}
				
			}
		}
		
		$hvJson = file_get_contents($conf["dir"]["data"]."/hypervideos/".$hvk."/hypervideo.json");
		$hvIndex = json_decode($hvJson,true);
		foreach ($hvJson["contents"] as $hvcontentsKey=>$hvcontentsVal) {
			if ($hvcontentsVal["body"]["frametrail:resourceId"] == $resourcesID) {
				$usedcnt++;
				$tmp = array();
				$tmp["hypervideoId"] = $hvk;
				$tmp["type"] = $hvcontentsVal["frametrail:type"];
				$tmp["owner"] = $hvcontentsVal["creator"]["nickname"];
				$tmp["ownerId"] = $hvcontentsVal["creator"]["id"];
				array_push($used, $tmp);
			}
		}
		foreach ($hvJson["clips"] as $hvclipsKey=>$hvclipsVal) {
			if ($hvclipsVal["resourceId"] == $resourcesID) {
				$usedcnt++;
				$tmp = array();
				$tmp["hypervideoId"] = $hvk;
				$tmp["type"] = "clip";
				$tmp["obj"] = $hvclipsVal;
				array_push($used, $tmp);
			}
		}
		
		
	}
	
	
	if ($usedcnt > 0) {
		$return["status"] = "fail";
		$return["code"] = 5;
		$return["string"] = "Resource is used";
		$return["usedCount"] = $usedcnt;
		$return["used"] = $used;
		$file->close();
		return $return;
		exit;
	}

	if ($res["resources"][$resourcesID]["type"] == "video") {
		if (file_exists($conf["dir"]["data"]."/resources/".$res["resources"][$resourcesID]["src"])) {
			unlink($conf["dir"]["data"]."/resources/".$res["resources"][$resourcesID]["src"]);
		}
		if (file_exists($conf["dir"]["data"]."/resources/".$res["resources"][$resourcesID]["thumb"])) {
			unlink($conf["dir"]["data"]."/resources/".$res["resources"][$resourcesID]["thumb"]);
		}
	} else if ($res["resources"][$resourcesID]["type"] == "image") {
		if (file_exists($conf["dir"]["data"]."/resources/".$res["resources"][$resourcesID]["src"])) {
			unlink($conf["dir"]["data"]."/resources/".$res["resources"][$resourcesID]["src"]);
		}
		if (file_exists($conf["dir"]["data"]."/resources/".$res["resources"][$resourcesID]["thumb"])) {
			unlink($conf["dir"]["data"]."/resources/".$res["resources"][$resourcesID]["thumb"]);
		}
	} else if ($res["resources"][$resourcesID]["type"] == "pdf") {
		if (file_exists($conf["dir"]["data"]."/resources/".$res["resources"][$resourcesID]["src"])) {
			unlink($conf["dir"]["data"]."/resources/".$res["resources"][$resourcesID]["src"]);
		}
		if (file_exists($conf["dir"]["data"]."/resources/".$res["resources"][$resourcesID]["thumb"])) {
			unlink($conf["dir"]["data"]."/resources/".$res["resources"][$resourcesID]["thumb"]);
		}
	} else {
		if (file_exists($conf["dir"]["data"]."/resources/".$res["resources"][$resourcesID]["thumb"])) {
			unlink($conf["dir"]["data"]."/resources/".$res["resources"][$resourcesID]["thumb"]);
		}
	}
	unset($res["resources"][$resourcesID]);
	$file->writeClose(json_encode($res, $conf["settings"]["json_flags"]));
	//$file->close();
	$return["status"] = "success";
	$return["code"] = 0;
	$return["string"] = "Resource deleted";
	return $return;
}

/**
 * @param $key
 * @param $condition
 * @param $value
 * @return mixed
 *
 *
Returning Code:
0		=	Success. Resource and its thumbs have been found
1		=	failed. Missing parameter
 *
 */
function fileGetByFilter($key,$condition,$value) {
	global $conf;
	if ((!$key) || (!$condition) || (!$value)) {
		$return["status"] = "fail";
		$return["code"] = 1;
		$return["string"] = "Parameter missing!";
		return $return;
	}
	$json = file_get_contents($conf["dir"]["data"]."/resources/_index.json");
	$res = json_decode($json,true);
	$return["result"] = Array();
	$return["resultCount"] = 0;
	foreach ($res["resources"] as $k=>$v) {
		$map = array(
			"==" => $v[$key] == $value,
			"!=" => $v[$key] != $value,
			"<=" => $v[$key] <= $value,
			">=" => $v[$key] >= $value,
			"contains" => strpos("x".$v[$key], $value)
		);
		if ($map[$condition]) {
			$return["result"][$k] = $v;
			$return["resultCount"]++;
		}
	}
	$return["status"] = "success";
	$return["code"] = 0;
	$return["string"] = "see result";
	return $return;
}

/**
 *
 * Returns a file size limit in bytes based on the PHP upload_max_filesize and post_max_size
 * Credits: Drupal Developers, GPL license v2 or later
 *
 * @return int
 *
 */
function fileGetMaxUploadSize() {
	global $conf;

	static $max_size = -1;

	if ($max_size < 0) {
	    // Start with post_max_size.
	    $max_size = parse_size(ini_get('post_max_size'));

	    // If upload_max_size is less, then reduce. Except if upload_max_size is
	    // zero, which indicates no limit.
	    $upload_max = parse_size(ini_get('upload_max_filesize'));
	    if ($upload_max > 0 && $upload_max < $max_size) {
	    	$max_size = $upload_max;
	    }
	}

	$return["maxuploadbytes"] = $max_size;
	$return["status"] = "success";
	$return["code"] = 0;
	$return["string"] = "Max Upload Bytes received";
	return $return;
}

function parse_size($size) {
	$unit = preg_replace('/[^bkmgtpezy]/i', '', $size); // Remove the non-unit characters from the size.
	$size = preg_replace('/[^0-9\.]/', '', $size); // Remove the non-numeric characters from the size.
	
	if ($unit) {
		// Find the position of the unit in the ordered string which is the power of magnitude to multiply a kilobyte by.
		return round($size * pow(1024, stripos('bkmgtpezy', $unit[0])));
	} else {
		return round($size);
	}
}

/**
 * @param $configstring
 * @return mixed
 *
 * Returning Code:
 * 0	=	Success. Config file saved.
 * 1	=	failed. User is not logged in or is inactive or not admin (see resp["string"])
 * 2	=	failed. Config file not found or not writable
 * 3	= 	failed. Config string must be > 3 characters
 *
 */
function updateConfigFile($configstring) {
	
	global $conf;
	$login = userCheckLogin("admin");
	if ($login["code"] != 1) {
		$return["status"] = "fail";
		$return["code"] = 1;
		$return["string"] = $login["string"];
		return $return;
	} else {

		if (!is_writable($conf["dir"]["data"]."/config.json")) {
			$return["status"] = "fail";
			$return["code"] = 2;
			$return["string"] = "Config file (config.json) not writable.";
			return $return;
		}

		if ((strlen($_REQUEST["src"]) <3)) {
			$return["status"] = "fail";
			$return["code"] = 3;
			$return["string"] = "Config string length must be > 3 characters.";
			return $return;
		}

		$file = new sharedFile($conf["dir"]["data"]."/config.json");
		$src = json_decode($configstring, true);
		$jsonsrc = json_encode($src,$conf["settings"]["json_flags"]);
		$file->writeClose($jsonsrc);

		$return["status"] = "success";
		$return["code"] = 0;
		$return["string"] = "Config successfully saved.";
		return $return;

	}
}

/**
 * @param $cssstring
 * @return mixed
 *
 * Returning Code:
 * 0	=	Success. CSS file saved.
 * 1	=	failed. User is not logged in or is inactive or not admin (see resp["string"])
 * 2	=	failed. CSS file not found or not writable
 *
 */
function updateCSSFile($cssstring) {
	
	global $conf;
	$login = userCheckLogin("admin");
	if ($login["code"] != 1) {
		$return["status"] = "fail";
		$return["code"] = 1;
		$return["string"] = $login["string"];
		return $return;
	} else {

		if (!is_writable($conf["dir"]["data"]."/custom.css")) {
			$return["status"] = "fail";
			$return["code"] = 2;
			$return["string"] = "CSS file (custom.css) not writable.";
			return $return;
		}

		$file = new sharedFile($conf["dir"]["data"]."/custom.css");
		$file->writeClose($cssstring);

		$return["status"] = "success";
		$return["code"] = 0;
		$return["string"] = "CSS file successfully saved.";
		return $return;

	}
}


?>