<?php

namespace App\Http\Controllers;

use App\ConsumesExternalServices;
use Illuminate\Foundation\Bus\DispatchesJobs;
use Illuminate\Http\Request;
use Illuminate\Routing\Controller as BaseController;
use Illuminate\Foundation\Validation\ValidatesRequests;
use Illuminate\Foundation\Auth\Access\AuthorizesRequests;

class Controller extends BaseController
{
    use AuthorizesRequests, DispatchesJobs, ValidatesRequests, ConsumesExternalServices;

    public function getToken( Request $request ) {
        $headers = [ 'Accept' => 'application/json' ];
        return $this->makeRequest('POST', 'https://apiv9.stolpejakten.no/auth', [],  [], $request->all(), $headers, true );
    }

    public function getPerson( Request $request ) {
        $token = $request->get('token');
        $headers = [ 'Authorization' => 'Bearer ' . $token, 'Accept' => 'application/json' ];
        return $this->makeRequest('GET', 'https://apiv9.stolpejakten.no/users/me', [], [], [], $headers );
    }

    public function getAreas( Request $request ) {
        $headers = [ 'Accept' => 'application/json' ];
        return $this->makeRequest('GET', 'https://apiv9.stolpejakten.no/fylker/app', [], [], [], $headers );
    }

    public function getVisits( Request $request ) {
        $token = $request->get('token');
        $kommuner = explode( ',', $request->get('kommuner'));
        $headers = [ 'Authorization' => 'Bearer ' . $token, 'Accept' => 'application/json' ];
        $result = [];

        foreach($kommuner as $kommune) {
            $kres = $this->makeRequest('GET', 'https://apiv9.stolpejakten.no/visits/kommune', [ 'kommune' => $kommune ], [], [], $headers );
            if( $result === [] ) {
                $result['STATUS'] = $kres['STATUS'];
                $result['CONTENT'] = json_decode( $kres['CONTENT'], true );
            } else {
                $result['STATUS'] = $kres['STATUS'];
                $result['CONTENT'] = array_merge_recursive( $result['CONTENT'], json_decode( $kres['CONTENT'], true ));
            }

            if( $result['STATUS'] !== 200 ) {
                break;
            }
        }

        return $result;
    }

    public function flashInfo( Request $request ) {

        $request->session()->flash( 'flash_' . $request->input('level'), $request->input('message'));
        return '{}';
    }

    public function home( Request $request ) {
        return view( 'home');
    }

    public function map( Request $request ) {
        return view( 'map');
    }
}
