<?php
/**
 * Created by PhpStorm.
 * User: maxde
 * Date: 17/03/2019
 * Time: 18:35
 */

namespace App;

use GuzzleHttp\Client;
use GuzzleHttp\Exception\ClientException;

trait ConsumesExternalServices
{
    /**
     * Send a request to any service
     * @return array
     */
    public function makeRequest($method, $requestUrl, $queryParams = [], $auth, $formParams = [], $headers = [], $isJson = false )
    {
        $client = new Client($auth);
        $bodyType = 'form_params';
        $data = $formParams;

        if ($isJson) {
            $bodyType = 'json';
            $headers[ 'Content-Type' ] = 'application/json';
        }

        try {
            $response = $client->request( $method, $requestUrl, [ 'query' => $queryParams, $bodyType => $data, 'headers' => $headers ]);
            $resp['STATUS'] = $response->getStatusCode();
            $resp['CONTENT'] = $response->getBody()->getContents();
        }
        catch (ClientException $e ) {
            $resp['STATUS'] = $e->getCode();
            $resp['CONTENT'] = null;
        }
        return $resp;
    }
}
