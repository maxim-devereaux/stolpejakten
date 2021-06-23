
@extends('layouts.main')

@section('content')

<div class="container-fluid overflow-hidden">
    <div class="row">
        <div class="col-12 order-0 col-lg-9 order-lg-1 px-2">
            <div class="vh-100 d-flex flex-column">
                <div class="row flex-grow-1" id="sjmap"></div>
            </div>
        </div>
        <div class="col-12 order-1 col-lg-3 order-lg-0 px-2">
            <div class="vh-100 d-flex flex-column">
                <div class="row flex-shrink-0 m-3">
                    <div id="sjuser" class="col-10 h4"></div>
                    <div class="col-2 text-right">
                        <span id="btn_logout" data-toggle="tooltip" title="Logg ut"><i class="fas fa-door-open fa-2x"></i></span>
                    </div>
                </div>
                <div class="row flex-shrink-0 p-3">
                    <div class="col text-center">
                        <h4>Fylker og kommuner/områder</h4>
                        <p>Trykk på et navn for å aktivere/deaktivere</p>
                    </div>
                </div>
                <div class="row flex-fill flex-grow-1 overflow-auto">
                    <div class="col mx-3" id="sjinfo"></div>
                </div>
            </div>
        </div>
    </div>
</div>

@endsection
