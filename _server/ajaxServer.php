<?php

require_once("./config.php");

header('Cache-Control: no-cache, must-revalidate');
header('Expires: Mon, 26 Jul 2020 05:00:00 GMT');
header('Content-type: application/json');

$return["status"] = "fail";
$return["code"] = "404";
$return["string"] = "No action was taken";


switch($_REQUEST["a"]) {


	case "projectsGet":
		include_once("projects.php");
		$return = projectsGet($_REQUEST["details"], $_REQUEST["login"]);
		break;



	/*#########################################
	 ############ User Handling
	 #########################################*/

	case "userGet":
		include_once("user.php");
		$return = userGet($_REQUEST["projectID"], $_REQUEST["userID"]);
		break;


	case "userRegister":
		include_once("user.php");
		$return = userRegister($_REQUEST["projectID"], $_REQUEST["name"], $_REQUEST["mail"], $_REQUEST["passwd"]);
		break;


	case "userLogin":
		include_once("user.php");
		$return = userLogin($_REQUEST["projectID"], $_REQUEST["mail"], $_REQUEST["passwd"]);
		break;


	case "userLogout":
		include_once("user.php");
		$return = userLogout($_REQUEST["projectID"]);
		break;


	case "userCheckLogin":
		include_once("user.php");
		$return = userCheckLogin($_REQUEST["projectID"]);
		break;

	case "userChange":
		include_once("user.php");
		$return = userChange($_REQUEST["projectID"],$_REQUEST["userID"],$_REQUEST["mail"],$_REQUEST["name"],$_REQUEST["passwd"],$_REQUEST["color"],$_REQUEST["role"],$_REQUEST["active"]);
		break;




	/*#########################################
	 ############ File Handling
	 #########################################*/

	case "fileUpload":
		include_once("files.php");
		$return = fileUpload($_REQUEST["projectID"],$_REQUEST["type"],$_REQUEST["name"],$_REQUEST["description"],$_REQUEST["attributes"],$_FILES,$_REQUEST["lat"], $_REQUEST["lon"], $_REQUEST["boundingBox"]);
		break;

	case "fileUploadThumb":
		include_once("files.php");
		$return = fileUploadThumb($_REQUEST["projectID"],$_REQUEST["resourcesID"],$_REQUEST["thumb"]);
		break;

	case "fileDelete":
		include_once("files.php");
		$return = fileDelete($_REQUEST["projectID"],$_REQUEST["resourcesID"]);
		break;

	case "fileGetByFilter":
		include_once("files.php");
		$return = fileGetByFilter($_REQUEST["projectID"],$_REQUEST["key"],$_REQUEST["condition"],$_REQUEST["value"]);
		break;

	case "fileGetMaxUploadSize":
		include_once("files.php");
		$return = fileGetMaxUploadSize();
		break;




	/*#########################################
	 ############ Hypervideo Handling
	 #########################################*/
	case "hypervideoAdd":
		include_once("hypervideos.php");
		$return = hypervideoAdd($_REQUEST["projectID"],$_REQUEST["src"], $_FILES["subtitles"]);
		break;

	case "hypervideoClone":
		include_once("hypervideos.php");
		$return = hypervideoClone($_REQUEST["projectID"],$_REQUEST["hypervideoID"],$_REQUEST["src"]);
		break;

	case "hypervideoDelete":
		include_once("hypervideos.php");
		$return = hypervideoDelete($_REQUEST["projectID"],$_REQUEST["hypervideoID"],$_REQUEST["hypervideoName"]);
		break;

	case "hypervideoChange":
	case "hypervideoChangeFile":

		include_once("hypervideos.php");
		$return = hypervideoChange($_REQUEST["projectID"], $_REQUEST["hypervideoID"], $_REQUEST["src"], $_REQUEST["SubtitlesToDelete"], $_FILES["subtitles"]);
		break;





	/*#########################################
	 ############ Annotation Handling
	 #########################################*/
	case "annotationfileSave":
		include_once("annotationfiles.php");
		$return = annotationfileSave($_REQUEST["projectID"],$_REQUEST["hypervideoID"],$_REQUEST["annotationfileID"],$_REQUEST["action"],$_REQUEST["name"],$_REQUEST["description"],$_REQUEST["hidden"],$_REQUEST["src"]);
		break;

	case "annotationfileDelete":
		include_once("annotationfiles.php");
		$return = annotationfileDelete($_REQUEST["projectID"],$_REQUEST["hypervideoID"],$_REQUEST["annotationfileID"]);
		break;






	/*#########################################
	 ############ Tag Handling
	 #########################################*/

	case "tagSet":
		include_once("tags.php");
		$return = tagSet($_REQUEST["projectID"],$_REQUEST["tagName"],$_REQUEST["lang"],$_REQUEST["label"],$_REQUEST["description"]);
		break;

	case "tagDelete":
		include_once("tags.php");
		$return = tagDelete($_REQUEST["projectID"],$_REQUEST["tagName"]);
		break;

	case "tagLangDelete":
		include_once("tags.php");
		$return = tagLangDelete($_REQUEST["projectID"],$_REQUEST["lang"]);
		break;


	/*#########################################
	 ############ Project Handling
	 #########################################*/
	case "projectsNew":
		include_once("projects.php");
		$return = projectsNew($_REQUEST["name"], $_REQUEST["description"], $_REQUEST["config"], $_REQUEST["userNeedsConfirmation"], $_REQUEST["defaultUserRole"], $_REQUEST["theme"], $_REQUEST["overviewMode"], $_REQUEST["defaultHypervideoHidden"]);
		break;
	case "projectsEdit":
		include_once("projects.php");
		$return = projectsEdit($_REQUEST["projectID"],$_REQUEST["name"], $_REQUEST["description"], $_REQUEST["config"], $_REQUEST["userNeedsConfirmation"], $_REQUEST["defaultUserRole"], $_REQUEST["theme"], $_REQUEST["overviewMode"], $_REQUEST["defaultHypervideoHidden"]);
		break;
	case "projectsDelete":
		include_once("projects.php");
		$return = projectsDelete($_REQUEST["projectID"],$_REQUEST["projectName"]);
		break;
	case "superUserLogin":
		include_once("projects.php");
		$return = superUserLogin($_REQUEST["password"]);
		break;
	case "superUserLogout":
		include_once("projects.php");
		$return = superUserLogout();
		break;



	/*#########################################
	 ############ Setup Handling
	 #########################################*/

	case "setupCheck":

		if ( version_compare(phpversion(), '5.6.2', '<') ) {
			$return["status"] = "fail";
			$return["code"] = 6;
			$return["string"] = "Server does not meet the requirements. PHP version needs to be 5.6.20 or later.";
			echo json_encode($return);
			exit;
		}
		
		if ( !is_writable("../") ) {
			chmod("../", 0755);
			if ( !is_writable("../") ) {
				$return["status"] = "fail";
				$return["code"] = 7;
				$return["string"] = "Root directory not writable. Please change permissions (755) or create '_data' directory manually.";
				echo json_encode($return);
				exit;
			}
		}

		if (	(!file_exists($conf["dir"]["data"]) && !is_dir($conf["dir"]["data"]))
			||	(!file_exists($conf["dir"]["projects"]) && !is_dir($conf["dir"]["projects"]))
			||	(!file_exists($conf["dir"]["data"]."/config.json"))
			||  (!file_exists($conf["dir"]["data"]."/projects/_index.json"))
		) {
			if (!file_exists($conf["dir"]["data"]."/masterpassword.php")) {
				$return["status"] = "fail";
				$return["code"] = 3;
				$return["string"] = "Setup not correct. Masterpassword missing.";
			} else {
				$return["status"] = "fail";
				$return["code"] = 0;
				$return["string"] = "Setup not correct. Please retry.";
			}
		} elseif (!file_exists($conf["dir"]["data"]."/masterpassword.php")) {
			$return["status"] = "fail";
			$return["code"] = 3;
			$return["string"] = "Setup not correct. Masterpassword missing.";
		} else {
			include_once($conf["dir"]["data"]."/masterpassword.php");
			if (!$masterpassword || (strlen($masterpassword) < 5)) {
				$return["status"] = "fail";
				$return["code"] = 2;
				$return["string"] = "Masterpassword missing or too short.";
			} else {
				$return["status"] = "success";
				$return["code"] = 1;
				$return["string"] = "Data directory exists";
			}
		}
		break;

	case "setupInit":
		$errorCnt = 0;
		if (!file_exists($conf["dir"]["data"]) && !is_dir($conf["dir"]["data"])) {
			if (!mkdir($conf["dir"]["data"])) {
				$errorCnt++;
			} else {
				chmod($conf["dir"]["data"], 0755);
			}
		}

		if (!file_exists($conf["dir"]["data"]."/masterpassword.php")) {
			if (!$_REQUEST["masterpassword"] || (strlen($_REQUEST["masterpassword"]) < 5)) {
				$return["status"] = "fail";
				$return["code"] = 2;
				$return["string"] = "Masterpassword missing or too short.";
				echo json_encode($return,$conf["settings"]["json_flags"]);
				exit;
			} else {
				if (!file_put_contents($conf["dir"]["data"] . "/masterpassword.php", "<?php \$masterpassword = '" . $_REQUEST["masterpassword"] . "'; // Needs to have 5 chars min. ?>")) {
					$errorCnt++;
				}
			}
		}

		if (!file_exists($conf["dir"]["projects"]) && !is_dir($conf["dir"]["projects"])) {
			if (!mkdir($conf["dir"]["projects"])) {
				$errorCnt++;
			} else {
				chmod($conf["dir"]["data"], 0755);
			}
		}

		if (!file_exists($conf["dir"]["data"]."/config.json")) {
			$tmpColors = array("597081", "339966", "16a09c", "cd4436", "0073a6", "8b5180", "999933", "CC3399", "7f8c8d", "ae764d", "cf910d", "b85e02");

			$tmpConf = array(
				"updateServiceURL"=> "http://update.frametrail.org",
				"autoUpdate"=> false,
				"defaultUserRole"=> "admin",
				"userNeedsConfirmation"=> false,
				"allowUploads"=> true,
				"userColorCollection"=> $tmpColors
			);
			if (!file_put_contents($conf["dir"]["data"]."/config.json", json_encode($tmpConf,$conf["settings"]["json_flags"]))) {
				$errorCnt++;
			}
		}

		if (!file_exists($conf["dir"]["data"]."/projects/_index.json")) {
			$tmpConf = array(
				"projects"=> ""
			);
			if (!file_put_contents($conf["dir"]["data"]."/projects/_index.json", json_encode($tmpConf,$conf["settings"]["json_flags"]))) {
				$errorCnt++;
			}
		}

		if ($errorCnt > 0) {
			$return["status"] = "fail";
			$return["code"] = 0;
			$return["string"] = "An error occurred. Please try again";
			rmdir($conf["dir"]["data"]);
		} else {
			$return["status"] = "success";
			$return["code"] = 1;
			$return["string"] = "Installation successful";
		}
		break;
	default:
		$return["status"] = "success";
		$return["code"] = 0;
		$return["string"] = "No question? No answer!";
		break;
}

echo json_encode($return,$conf["settings"]["json_flags"]);