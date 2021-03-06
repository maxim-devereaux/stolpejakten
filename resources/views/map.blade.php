
@extends('layouts.main')

@section('content')

<div class="container-fluid">
    <div class="row">
        <div class="col-12 order-0 col-lg-9 order-lg-1 px-0 px-lg-2">
            <div class="vh-60-100 d-flex flex-column">
                <div class="row flex-grow-1" id="sjmap"></div>
            </div>
        </div>
        <div class="col-12 order-1 col-lg-3 order-lg-0 px-0 px-lg-2">
            <div class="vh-40-100 d-flex flex-column">
                <div class="row flex-shrink-0 m-2 m-lg-3">
                    <div id="sjuser" class="col-10 h4"></div>
                    <div class="col-2 text-right">
                        <span id="btn_logout" data-toggle="tooltip" title="Logg ut"><i class="fas fa-door-open fa-2x"></i></span>
                    </div>
                </div>
                <div class="row flex-shrink-0 pt-lg-2">
                    <div class="col text-center">
                        <h4>Fylker og kommuner/områder</h4>
                        <div>Trykk på et navn for å aktivere/deaktivere</div>
                    </div>
                </div>
                <div class="row flex-shrink-0 py-1 py-lg-3">
                    <div class="col-4 col-lg-9 offset-2 offset-lg-3">
                        <div class="form-check">
                            <input type="checkbox" class="form-check-input" id="pinPositions">
                            <label class="form-check-label" for="pinPositions">Vis markører</label>
                        </div>
                    </div>
                    <div class="col-6 col-lg-9 offset-lg-3">
                        <div class="form-check">
                            <input type="checkbox" class="form-check-input" id="mapOutline" checked="checked">
                            <label class="form-check-label" for="mapOutline">Vis områdegrense</label>
                        </div>
                    </div>
                </div>
                <div class="row flex-fill flex-grow-1 overflow-auto">
                    <div class="col mx-3" id="sjinfo"></div>
                </div>
            </div>
        </div>
    </div>
</div>

<div id="gmap_key" class="invisible">{{ Config::get('map.api_key') }}</div>
@endsection
