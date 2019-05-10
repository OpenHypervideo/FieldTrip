<?php

header('Cache-Control: no-cache, must-revalidate');
header('Expires: Mon, 26 Jul 2020 05:00:00 GMT');
header('Content-type: application/json');

$return["status"] = "error";
$return["code"] = "404";
$return["string"] = "No action was taken";

$city = "7290253"; // Berlin Tempelhof
$appid = "29da08fd88015c5b317d9aa3df52fa38"; // Open Weather Map API Code / APP ID
$url = "http://api.openweathermap.org/data/2.5/weather?id=".$city."&units=metric&appid=".$appid."";

$cacheFile = 'cache' . DIRECTORY_SEPARATOR . md5($url);

if (file_exists($cacheFile)) {
    $fh = fopen($cacheFile, 'r');
    $cacheTime = trim(fgets($fh));

    // if data was cached recently, return cached data
    if ($cacheTime > strtotime('-15 minutes')) {
        $weather = fread($fh, filesize($cacheFile));
        $return["status"] = "success";
		$return["code"] = "1";
		$return["string"] = "Weather data successfully retrieved from cache";
		$return["data"] = json_decode($weather);

		echo json_encode($return);
		return;
    }

    // else delete cache file
    fclose($fh);
    unlink($cacheFile);
}

$dw = curl_init($url);

if($dw){
    curl_setopt($dw, CURLOPT_RETURNTRANSFER, true);
    $dataWeather = curl_exec($dw);
    
    if (curl_error($dw)) {
    	$return["status"] = "error";
		$return["code"] = "0";
		$return["string"] = "Error retrieving live weather data";

		curl_close($dw);

		echo json_encode($return);
		return;
    }

    curl_close($dw);

    $weather = json_decode($dataWeather);
    
    $return["status"] = "success";
	$return["code"] = "1";
	$return["string"] = "Live weather data successfully retrieved";
	$return["data"] = $weather;

	$fh = fopen($cacheFile, 'w');
	fwrite($fh, time() . "\n");
	fwrite($fh, $dataWeather);
	fclose($fh);
}

echo json_encode($return);
?>
