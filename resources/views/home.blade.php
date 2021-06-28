
@extends('layouts.main')

@section('content');

<div class="container">
    <div class="row full-height">
        <div class="col my-auto">
            <div class="row pb-4">
                <div class="col text-center">
                    <h1>Stolpejakten Norgeskart</h1>
                </div>
            </div>
            <div class="alert-heading" id="alertdisp">
                @if( $errors->any())
                    <div class="alert alert-danger alert-dismissible"><span class="fa fa-times-circle"></span><em> {!! $errors -> first() !!}</em>
                        <button type="button" class="close" data-dismiss="alert" aria-label="Close"><span aria-hidden="true">&times;</span></button>
                    </div>
                @else
                    @if(Session::has('flash_error'))
                        <div class="alert alert-danger alert-dismissible"><span class="fa fa-times-circle"></span><em> {!! session('flash_error') !!}</em>
                            <button type="button" class="close" data-dismiss="alert" aria-label="Close"><span aria-hidden="true">&times;</span></button>
                        </div>
                    @endif
                    @if(Session::has('flash_warning'))
                        <div class="alert alert-warning alert-dismissible"><span class="fa fa-warning"></span><em> {!! session('flash_warning') !!}</em>
                            <button type="button" class="close" data-dismiss="alert" aria-label="Close"><span aria-hidden="true">&times;</span></button>
                        </div>
                    @endif
                    @if(Session::has('flash_success'))
                        <div class="alert alert-success alert-dismissible"><span class="fa fa-check-circle"></span><em> {!! session('flash_success') !!}</em>
                            <button type="button" class="close" data-dismiss="alert" aria-label="Close"><span aria-hidden="true">&times;</span></button>
                        </div>
                    @endif
                @endif
            </div>
            <div class="row">
                <div class="col-8 offset-2">
                    <form>
                        <div class="form-group">
                            <label for="username">Din Stolpejakten brukernavn</label>
                            <input type="text" class="form-control" id="username" placeholder="Brukernavn">
                        </div>
                        <div class="form-group">
                            <label for="password">Passord</label>
                            <input type="password" class="form-control" id="password" placeholder="Passord">
                        </div>
                        <div class="pt-3 text-center">
                            <button type="button" id="btn_login" class="btn btn-primary">Logg inn</button>
                        </div>
                    </form>
                </div>
            </div>
            <div class="row pt-5">
                <div class="col-10 offset-1">
                    <h5><span class="text-danger">OBS!</span> Denne tjenesten er IKKE en offisiell del av stolpejakten.no, men er utviklet av en uavhengig IT-konsulent og ivrig stolpejeger.
                        Den gir mulighet til å bruke din Stolpejakten-innlogging (epost/mobilnummer, ikke Facebook) til å hente ut dine besøk og vise dem på et Google-kart,
                        men du bør være inneforstått med at dette innebærer at du sender dine innloggingsdetaljer til en tredjepart, som benytter dem mot Stolpejaktens API.
                        Innloggingsdetaljene dine sendes via sikker HTTPS-kobling både til tredjepartsserveren, og videre mot Stolpejakten, og vil ikke brukes til noe annet
                        formål enn å vise besøkene dine på denne nettsiden.</h5>
                </div>
            </div>
        </div>
    </div>
</div>

@endsection
