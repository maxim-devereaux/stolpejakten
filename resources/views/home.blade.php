
@extends('layouts.main')

@section('content');

<div class="container">
    <div class="row">
        <div class="col full-height">
            <form>
                <div class="form-group">
                    <label for="username">Brukernavn</label>
                    <input type="text" class="form-control" id="username" placeholder="Stolpejakt brukernavn">
                </div>
                <div class="form-group">
                    <label for="password">Passord</label>
                    <input type="password" class="form-control" id="password" placeholder="Passord">
                </div>
                <button type="button" id="btn_login" class="btn btn-primary">Logg inn</button>
            </form>
        </div>
    </div>
</div>

@endsection
