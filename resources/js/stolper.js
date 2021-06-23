
var gmap;
var sjtoken;

const loader = new GoogleMaps.Loader({
    apiKey: "AIzaSyDJtzIuguDyk__zpqYwytdDs5DwxYh9WwE",
    version: "weekly",
    libraries: []
});

const mapOptions = {
    center: {
        lat: 59.8,
        lng: 10.8
    },
    zoom: 12
};

const postColours = [
    '',
    './img/green.png',
    './img/blue.png',
    './img/red.png',
    './img/black.png',
];

processGetAreas = function(jsontext) {
    let markup = '';
    var jsondata = JSON.parse(jsontext);
    if (jsondata.STATUS === 200 ) {
        jsondata = JSON.parse(jsondata.CONTENT);
        let cnt = Object.keys( jsondata.results ).length;
        if( cnt>0 ) {
            markup = '<table><tbody>';
            for( let i=0; i<cnt; i++ ) {
                markup += '<tr><td colspan="2"><b>' + jsondata.results[i].name + '</b></td></tr>';
                let cnt2 = Object.keys( jsondata.results[i].kommuner ).length;
                if( cnt2>0 ) {
                    for( let j=0; j<cnt2; j++ ) {
                        markup += '<tr><td></td><td colspan="2" class="kommune" data-fetched="0" data-id="' + jsondata.results[i].kommuner[j].id + '">' + jsondata.results[i].kommuner[j].name + '</td></tr>';
                    }
                }
            }
            markup += '</tbody></table>';
        }
        $('#sjinfo').empty().append(markup);
        $('td.kommune').off();
        $('td.kommune').on('click', function() { getKommune( $(this)) });
    }
    else {
        window.location.href = '/home';
    }
};

processGetKommune = function( jsontext, jqobj ) {
    var img, jsondata = JSON.parse(jsontext);
    if (jsondata.STATUS === 200 ) {
        jqobj.data('fetched', '1');
        jsondata = jsondata.CONTENT;
        let cnt = Object.keys( jsondata.poles ).length;
        let vcnt = Object.keys( jsondata.visits ).length;
        if( cnt>0 ) {
            for( let i=0; i<cnt; i++ ) {
                if( jsondata.poles[i].visited ) {
                    img = './img/yellow.png';
                }
                else {
                    img = postColours[ jsondata.poles[i].difficulty ];
                }
                var newMarker = new google.maps.Marker({
                    position: { lat: jsondata.poles[i].location[1], lng: jsondata.poles[i].location[0] }, icon: img,
                    title: jsondata.poles[i].area_name + ': ' + jsondata.poles[i].name });
                newMarker.setMap( gmap );
            }
        }
        jqobj.html( '<b>' + jqobj.text() + ' (' + vcnt.toString() + '/' + cnt.toString() + ')</b>' );
    }
    else {
        window.location.href = '/home';
    }
};

processLogin = function( jsontext ) {
    var jsondata = JSON.parse(jsontext);
    if (jsondata.STATUS === 200 ) {
        jsondata = JSON.parse(jsondata.CONTENT);
        console.log( jsondata );
        sessionStorage.setItem('sjtoken', jsondata.token );
        window.location.href = '/map';
    }
    else {
        window.location.href = '/home';
    }
};

getKommune = function( jqkomm ) {
    let kommid = jqkomm.data( 'id' );
    let fetch = parseInt( jqkomm.data( 'fetched' ));
    if( fetch === 0 ) {
        $.ajax({
            dataType: "text", url: "/api/getVisits?kommuner=" + kommid + "&token=" + sjtoken, async: true, success: function (text) {
                processGetKommune(text, jqkomm );
            }
        });
    }
};

getAreas = function() {
    $.ajax({
        dataType: "text", url: "/api/getAreas", async: true, success: function (text) {
            processGetAreas(text);
        }
    });
};

doLogin = function() {
    let sjusr = $('#username').val();
    let sjpwd = $('#password').val();
    $.ajax({
        dataType: "text", url: "/api/getToken?username=" + sjusr + "&password=" + sjpwd + "&version=2", async: true, success: function (text) {
            processLogin(text);
        }
    });
};

// Callback
loader.loadCallback((e) => {
    if (e) {
        console.log(e);
    } else {
        let sjmap = document.getElementById("sjmap");
        if( sjmap )
        {
            gmap = new google.maps.Map(document.getElementById("sjmap"), mapOptions);
            sjtoken = window.sessionStorage.getItem('sjtoken');
            if( !sjtoken ) {
                window.location.href = '/home';
            }
            getAreas();
        }
    }
});

$(document).ready(function(){
    $('#btn_login').on('click', function() { doLogin() });
});
