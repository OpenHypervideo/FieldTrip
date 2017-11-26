<?php

require_once("./config.php");
require_once("./projects.php");

/**
 * @param $projectID
 * @param $tagName
 * @param $lang
 * @param $label
 * @param $description
 * @return mixed
Returning Code:
0		=	Success. In $return["response"] you will find the tagdefinitions
1		=	failed. User is not logged in as masterUser
2		=	failed. Project Directory has not been found
3		= 	failed. Name too short
4		= 	failed. Language not correct (2 chars)
5		= 	failed. Label too short (4 chars)
6		= 	failed. Description too short (4 chars)
 */
function tagSet($projectID,$tagName,$lang,$label,$description) {
	global $conf;

	$login = superUserLogin();

	if ($login["status"] == "fail") {
		$return["status"] = "fail";
		$return["code"] = 1;
		$return["string"] = "User not logged in with Masterpassword";
		return $return;
	}

	if ((!$projectID) || (!is_dir($conf["dir"]["projects"]."/".$projectID))) {
		$return["status"] = "fail";
		$return["code"] = 2;
		$return["string"] = "Projects Directory not found.";
		return $return;
	}

	if (strlen($tagName)<2) {
		$return["status"] = "fail";
		$return["code"] = 3;
		$return["string"] = "Tag Name has to have min. 2 character";
		return $return;
	}

	if (strlen($lang) != 2) {
		$return["status"] = "fail";
		$return["code"] = 4;
		$return["string"] = "Language is not valid. Two character expected";
		return $return;
	}

	if (strlen($label) < 4) {
		$return["status"] = "fail";
		$return["code"] = 5;
		$return["string"] = "Label expects at least 4 character";
		return $return;
	}

	if (strlen($description) < 4) {
		$return["status"] = "fail";
		$return["code"] = 6;
		$return["string"] = "Description expects at least 4 character";
		return $return;
	}

	if (!file_exists($conf["dir"]["projects"]."/".$projectID."/tagdefinitions.json")) {
		file_put_contents($conf["dir"]["projects"]."/".$projectID."/tagdefinitions.json","{}");
	}

	$file = new sharedFile($conf["dir"]["projects"]."/".$projectID."/tagdefinitions.json");
	$json = $file->read();
	$t = json_decode($json,true);

	$t[$tagName][$lang]["label"] = $label;
	$t[$tagName][$lang]["description"] = $description;

	$t = json_encode($t, $conf["settings"]["json_flags"]);
	$file->writeClose($t);
	$return["status"] = "success";
	$return["code"] = 0;
	$return["string"] = "Tag has been saved";
	$return["response"] = json_decode($t,true);
	return $return;
}


/**
 * @param $projectID
 * @param $tagName
Returning Code:
0		=	Success. In $return["response"] you will find the tagdefinitions
1		=	failed. User is not logged in as masterUser
2		=	failed. Project Directory has not been found
3		= 	failed. tagdefinitions.json has not been found
4		= 	failed. tagName was not submitted
 */
function tagDelete($projectID,$tagName) {
	global $conf;

	$login = superUserLogin();

	if ($login["status"] == "fail") {
		$return["status"] = "fail";
		$return["code"] = 1;
		$return["string"] = "User not logged in with Masterpassword";
		return $return;
	}

	if ((!$projectID) || (!is_dir($conf["dir"]["projects"]."/".$projectID))) {
		$return["status"] = "fail";
		$return["code"] = 2;
		$return["string"] = "Projects Directory not found.";
		return $return;
	}

	if (!file_exists($conf["dir"]["projects"]."/".$projectID."/tagdefinitions.json")) {
		$return["status"] = "fail";
		$return["code"] = 3;
		$return["string"] = "tagdefinitions.json has not been found.";
		return $return;
	}

	if (!$tagName) {
		$return["status"] = "fail";
		$return["code"] = 4;
		$return["string"] = "tagName has not been submitted.";
		return $return;
	}

	$file = new sharedFile($conf["dir"]["projects"]."/".$projectID."/tagdefinitions.json");

	$json = $file->read();

	$t = json_decode($json,true);

	$tagFound["count"] = 0;

	$hvi = json_decode(file_get_contents($conf["dir"]["projects"]."/".$projectID."/_index.json"),true);
	foreach ($hvi["hypervideos"] as $hvd) {
		$hv = json_decode(file_get_contents($conf["dir"]["projects"]."/".$projectID."/hypervideos/".$hvd."/hypervideo.json"),true);
		foreach($hv["contents"] as $hvc) {
			if (in_array($tagName, $hvc["frametrail:tags"])) {
				$tagFound["count"]++;
				$tagFoundTmp["hypervideo"] = $hvd;
				$tagFoundTmp["where"] = "overlay";
				$tagFoundTmp["type"] = $hvc["frametrail:type"];
				$tagFoundTmp["owner"] = $hvc["creator"];
				$tagFound["matches"][] = $tagFoundTmp;
			}
		}
		$ani = json_decode(file_get_contents($conf["dir"]["projects"]."/".$projectID."/hypervideos/".$hvd."/annotations/_index.json"),true);
		foreach($ani["annotationfiles"] as $anifk=>$anif) {
			$anifc = json_decode(file_get_contents($conf["dir"]["projects"]."/".$projectID."/hypervideos/".$hvd."/annotations/".$anifk.".json"),true);
			foreach ($anifc as $anifck=>$anifcv) {
				if (in_array($tagName, $anifcv["frametrail:tags"])) {
					$tagFound["count"]++;
					$tagFoundTmp["hypervideo"] = $hvd;
					$tagFoundTmp["where"] = "annotation";
					$tagFoundTmp["type"] = $anifcv["frametrail:type"];
					$tagFoundTmp["owner"] = $anifcv["creator"];
					$tagFoundTmp["content"] = $anifcv;
					$tagFound["matches"][] = $tagFoundTmp;
				}
			}
		}
	}

	if ($tagFound["count"] > 0) {
		$return["status"] = "fail";
		$return["code"] = 5;
		$return["string"] = "tagName is in use";
		$return["response"] = $tagFound;
		return $return;
	}


	unset($t[$tagName]);

	$t = json_encode($t, $conf["settings"]["json_flags"]);
	$file->writeClose($t);

	$return["status"] = "success";
	$return["code"] = 0;
	$return["string"] = "Tag has been removed";
	$return["response"] = json_decode($t,true);
	return $return;

}




/**
 * @param $projectID
 * @param $lang
Returning Code:
0		=	Success. In $return["response"] you will find the tagdefinitions
1		=	failed. User is not logged in as masterUser
2		=	failed. Project Directory has not been found
3		= 	failed. tagdefinitions.json has not been found
4		= 	failed. lang has not 2 characters
 */
function tagLangDelete($projectID,$lang) {
	global $conf;

	$login = superUserLogin();

	if ($login["status"] == "fail") {
		$return["status"] = "fail";
		$return["code"] = 1;
		$return["string"] = "User not logged in with Masterpassword";
		return $return;
	}

	if ((!$projectID) || (!is_dir($conf["dir"]["projects"]."/".$projectID))) {
		$return["status"] = "fail";
		$return["code"] = 2;
		$return["string"] = "Projects Directory not found.";
		return $return;
	}

	if (!file_exists($conf["dir"]["projects"]."/".$projectID."/tagdefinitions.json")) {
		$return["status"] = "fail";
		$return["code"] = 3;
		$return["string"] = "tagdefinitions.json has not been found.";
		return $return;
	}

	if (strlen($lang) != 2) {
		$return["status"] = "fail";
		$return["code"] = 4;
		$return["string"] = "lang seems not to be valid (2 character)";
		return $return;
	}

	$file = new sharedFile($conf["dir"]["projects"]."/".$projectID."/tagdefinitions.json");

	$json = $file->read();

	$t = json_decode($json,true);

	foreach ($t as $tn=>$tv) {
		if (array_key_exists($lang,$tv)) {
			unset($t[$tn][$lang]);
		}
	}

	$t = json_encode($t, $conf["settings"]["json_flags"]);
	$file->writeClose($t);

	$return["status"] = "success";
	$return["code"] = 0;
	$return["string"] = "Tag has been removed";
	$return["response"] = json_decode($t,true);
	return $return;

}

?>