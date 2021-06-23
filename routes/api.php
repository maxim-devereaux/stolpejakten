<?php

use Illuminate\Http\Request;

/*
|--------------------------------------------------------------------------
| API Routes
|--------------------------------------------------------------------------
|
| Here is where you can register API routes for your application. These
| routes are loaded by the RouteServiceProvider within a group which
| is assigned the "api" middleware group. Enjoy building your API!
|
*/

Route::get('/getToken', ['uses' => 'Controller@getToken']);
Route::get('/getPerson', ['uses' => 'Controller@getPerson']);
Route::get('/getAreas', ['uses' => 'Controller@getAreas']);
Route::get('/getVisits', ['uses' => 'Controller@getVisits']);
