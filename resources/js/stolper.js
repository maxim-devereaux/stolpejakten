
var gmap;
var sjtoken;
var fylkeareas = {};

const mapOptions = {
    // Center on Holmlia, Oslo
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

function dynamicSort(property) {
    var sortOrder = 1;

    if(property[0] === "-") {
        sortOrder = -1;
        property = property.substr(1);
    }

    return function (a,b) {
        if(sortOrder == -1){
            return b[property].localeCompare(a[property]);
        } else{
            return a[property].localeCompare(b[property]);
        }
    }
}

processDoLogout = function() {
    window.location.href = '/home'
};

doLogout = function(text, level) {
    sessionStorage.clear();

    if (text !== null) {
        let fd = new FormData();
        fd.append('level', level );
        fd.append('message', text);
        $.ajax({
            data: fd,
            type: 'POST',
            contentType: false,
            processData: false,
            dataType: "text",
            url: "/flash",
            async: true,
            success: function (text) {
                processDoLogout()
            },
            error: function (text) {
                processDoLogout()
            }
        });
    }
    else { processDoLogout() }
};

processGetAreas = function(jsontext) {
    let markup = '';
    var jsondata = JSON.parse(jsontext);
    if (jsondata.STATUS === 200 ) {
        jsondata = JSON.parse(jsondata.CONTENT);
        jsondata.results.sort(dynamicSort("name"));
        let cnt = Object.keys( jsondata.results ).length;
        if( cnt>0 ) {
            for( let i=0; i<cnt; i++ ) {
                markup += '<div class="row"><div class="col fylke" data-id="' + jsondata.results[i].id + '" data-total="0" data-visited="0" data-name="' +
                    jsondata.results[i].name + '">' + jsondata.results[i].name + '</div></div>';
                let cnt2 = Object.keys( jsondata.results[i].kommuner ).length;
                if( cnt2>0 ) {
                    jsondata.results[i].kommuner.sort(dynamicSort("name"));
                    for( let j=0; j<cnt2; j++ ) {
                        markup += '<div class="row"><div class="offset-1 col-11 kommune" data-fetched="0" data-id="' + jsondata.results[i].kommuner[j].id +
                            '" data-fylkeid="' + jsondata.results[i].id + '" data-total="0" data-visited="0" data-name="' +
                            jsondata.results[i].kommuner[j].name + '">' + jsondata.results[i].kommuner[j].name + '</div></div>';
                    }
                }
            }
        }
        $('#sjinfo').empty().append(markup);
        $('div.kommune').off().on('click', function() { getKommune( $(this)) });
        $('div.fylke').off().on('click', function() { getFylke( $(this)) });
    }
    else {
        doLogout('Klarte ikke å hente data (mulig utløpt sesjon). Du ble logget ut.', 'error');
    }
};

processGetPerson = function(jsontext) {
    var jsondata = JSON.parse(jsontext);
    if (jsondata.STATUS === 200 ) {
        jsondata = JSON.parse(jsondata.CONTENT);
        $('#sjuser').empty().append( jsondata.name );
    }
    else {
        doLogout('Klarte ikke å hente data (mulig utløpt sesjon). Du ble logget ut.', 'error');
    }
};

getFylke = function( jqfylke ) {
    let fylkeid = jqfylke.data('id');
    let jqkomm = $('div.kommune').filter(function() { return ( $(this).data('fylkeid') === fylkeid ) });
    if( jqkomm && jqkomm.length > 0 ) {
        let jqkommp = jqkomm.filter(function () {
            return (parseInt( $(this).data('fetched')) === 1 )
        });
        let jqkomma = jqkomm.filter(function () {
            return (parseInt( $(this).data('fetched')) === 0 )
        });
        let jqkommd = jqkomm.filter(function () {
            return (parseInt( $(this).data('fetched')) === 2 )
        });
        // If no in-progress kommuner
        if( jqkommp === null || jqkommp.length === 0 ) {
            if( jqkomma && jqkomma.length > 0 ) {
                jqkomma.each( function( index, element ) {
                    getKommune( $(this) );
                });
            }
            else if ( jqkommd && jqkommd.length > 0 ) {
                jqkommd.each( function( index, element ) {
                    getKommune( $(this) );
                });
            }
        }
    }
};

setFylke = function( fylkeid ) {
    let jqobj = $('div.fylke').filter(function() { return ( $(this).data('id') === fylkeid ) });
    if( jqobj && jqobj.length > 0 ) {
        let jqkomm = $('div.kommune').filter(function() { return ( $(this).data('fylkeid') === fylkeid ) });
        let tot = 0, vst = 0, fetches = [ 0, 0, 0 ], fval, fnts = '', fnte = '';
        if( jqkomm && jqkomm.length > 0 ) {
            jqkomm.each( function( index, element ) {
                fval = parseInt($(this).data('fetched'));
                fetches[fval] = fetches[fval] + 1;
                tot = tot + parseInt($(this).data('total'));
                vst = vst + parseInt($(this).data('visited'));
            });

            // If no queries in progress
            if (fetches[1] === 0) {
                if (fetches[0] === 0) {
                    fnts = '<b>'; fnte = '</b>';
                }
                else if (fetches[0] > 0 && fetches[2] > 0) {
                    fnts = '<em>'; fnte = '</em>';
                }
                jqobj.data('total', tot.toString());
                jqobj.data('visited', vst.toString());
                if( tot === 0 ) {
                    jqobj.html( fnts + jqobj.data('name') + fnte );
                }
                else {
                    jqobj.html( fnts + jqobj.data('name') + ' (' + jqobj.data('visited') + '/' + jqobj.data('total') + ')' + fnte );
                }
            }
        }
    }
};

processDeleteKommune = function( jqobj ) {
    let kommid = jqobj.data( 'id' );
    for( let i=0; i<fylkeareas[kommid].length; i++) {
        fylkeareas[kommid][i].marker.setMap( null );
        fylkeareas[kommid][i] = null;
    }
    delete fylkeareas[kommid];
    jqobj.html( jqobj.data('name'));
    jqobj.data('fetched', '0');
    jqobj.data('total', '0');
    jqobj.data('visited', '0');
    var jqarea = $('div.kart').filter(function() { return ( $(this).data('kommuneid') === kommid )});
    jqarea.each( function( index, element ) {
        $(this).parent().remove(); });
    setFylke( jqobj.data('fylkeid'));
};

processFailKommune = function( jqobj ) {
    jqobj.html( jqobj.data('name'));
    jqobj.data('fetched', '0');
    jqobj.data('total', '0');
    jqobj.data('visited', '0');
};

processGetKommune = function( jsontext, jqobj ) {
    let kommid = jqobj.data( 'id' );
    fylkeareas[kommid] = [];
    let markup = '';
    var img, jsondata = JSON.parse(jsontext);
    if (jsondata.STATUS === 200 ) {
        jsondata = jsondata.CONTENT;
        let cnt = Object.keys( jsondata.poles ).length;
        let vcnt = Object.keys( jsondata.visits ).length;
        let maps = Object.keys( jsondata.areas ).length;
        if( maps>0 ) {
            jsondata.areas.sort(dynamicSort("name"));
            for( let j=0; j<maps; j++ ) {
                markup += '<div class="row"><div class="offset-2 col-10 kart" data-kommuneid="' + jsondata.areas[j].kommune + '" data-total="0" data-visited="0" data-name="' +
                    jsondata.areas[j].name + '" data-visible="1">' + jsondata.areas[j].name + '</div></div>';
            }
            $(markup).insertAfter(jqobj.parent());
        }
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
                fylkeareas[kommid].push( { marker: newMarker, area: jsondata.poles[i].area_name } );
                var jqarea = $('div.kart').filter(function() { return ( $(this).data('kommuneid') === kommid && $(this).data('name') === jsondata.poles[i].area_name ) });
                if( jqarea && jqarea.length > 0 ) {
                    jqarea.data('total', parseInt( jqarea.data('total')) + 1 );
                    if( jsondata.poles[i].visited ) {
                        jqarea.data('visited', parseInt( jqarea.data('visited')) + 1 );
                    }
                }
                var jqarea = $('div.kart').filter(function() { return ( $(this).data('kommuneid') === kommid )});
                jqarea.each( function( index, element ) {
                    $(this).html( '<b>' + $(this).data('name') + ' (' + $(this).data('visited') + '/' + $(this).data('total') + ')</b>' );
                });
            }
        }
        jqobj.data('fetched', '2');
        jqobj.data('total', cnt.toString());
        jqobj.data('visited', vcnt.toString());
        jqobj.html( '<b>' + jqobj.data('name') + ' (' + jqobj.data('visited') + '/' + jqobj.data('total') + ')</b>' );
        $('div.kart').off().on('click', function() { toggleKart( $(this)) });
        setFylke( jqobj.data('fylkeid'));
    }
    else {
        doLogout('Klarte ikke å hente data (mulig utløpt sesjon). Du ble logget ut.', 'error');
    }
};

processLogin = function( jsontext ) {
    var jsondata = JSON.parse(jsontext);
    if (jsondata.STATUS === 200 ) {
        jsondata = JSON.parse(jsondata.CONTENT);
        sessionStorage.setItem('sjtoken', jsondata.token );
        window.location.href = '/map';
    }
    else {
        doLogout('Klarte ikke å logge inn. Sjekk brukernavn/passord.', 'error');
    }
};

toggleKart = function( jqkart ) {
    let kartvis = parseInt( jqkart.data( 'visible' ));
    let kommid = jqkart.data( 'kommuneid' );
    let kname = jqkart.data( 'name' );
    if( kartvis === 1 ) {
        for( let i=0; i<fylkeareas[kommid].length; i++) {
            if( fylkeareas[kommid][i].area === kname ) {
                fylkeareas[kommid][i].marker.setMap( null );
            }
        }
        jqkart.data( 'visible', '0' );
        jqkart.html( jqkart.data('name') + ' (' + jqkart.data('visited') + '/' + jqkart.data('total') + ')' );
    }
    else {
        for( let i=0; i<fylkeareas[kommid].length; i++) {
            if( fylkeareas[kommid][i].area === kname ) {
                fylkeareas[kommid][i].marker.setMap( gmap );
            }
        }
        jqkart.data( 'visible', '1' );
        jqkart.html( '<b>' + jqkart.data('name') + ' (' + jqkart.data('visited') + '/' + jqkart.data('total') + ')</b>' );
    }
};

getKommune = function( jqkomm ) {
    let kommid = jqkomm.data( 'id' );
    let fetch = parseInt( jqkomm.data( 'fetched' ));
    if( fetch === 0 ) {
        jqkomm.data( 'fetched', '1' );
        jqkomm.html( jqkomm.data('name') + '&nbsp;<div class="spinner-border spinner-border-sm" role="status"><span class="sr-only">Laster...</span></div>' );
        $.ajax({
            dataType: "text", url: "/api/getVisits?kommuner=" + kommid + "&token=" + sjtoken, async: true, success: function (text) {
                processGetKommune(text, jqkomm );
            }, error: function (text) {
            processFailKommune(jqkomm );
        }
        });
    }
    else if( fetch === 2 ) {
        processDeleteKommune( jqkomm );
    }
};

getAreas = function() {
    $.ajax({
        dataType: "text", url: "/api/getAreas", async: true, success: function (text) {
            processGetAreas(text);
        }, error: function (text) {
            doLogout('Klarte ikke å hente data (mulig utløpt sesjon). Du ble logget ut.', 'error');
        }
    });
};

getPerson = function() {
    $.ajax({
        dataType: "text", url: "/api/getPerson?token=" + sjtoken, async: true, success: function (text) {
            processGetPerson(text);
        }, error: function (text) {
            doLogout('Klarte ikke å hente data (mulig utløpt sesjon). Du ble logget ut.', 'error');
        }
    });
};

doLogin = function() {
    let sjusr = $('#username').val();
    let sjpwd = $('#password').val();
    $.ajax({
        dataType: "text", url: "/api/getToken?username=" + sjusr + "&password=" + sjpwd + "&version=2", async: true, success: function (text) {
            processLogin(text);
        }, error: function (text) {
        doLogout('Klarte ikke å logge inn. Sjekk brukernavn/passord.', 'error');
        }
    });
};

$(document).ready(function(){
    $('#btn_login').on('click', function() { doLogin() });
    $('#btn_logout').on('click', function() { doLogout('Logget ut.', 'success') });

    let sjmap = document.getElementById("sjmap");
    if( sjmap ) {
        let gkey = $('#gmap_key').text();
        const loader = new GoogleMaps.Loader({
            apiKey: gkey, version: "weekly", libraries: [] });

        // Callback
        loader.loadCallback((e) => {
            if (e) {
                console.log(e);
                doLogout('Klarte ikke å laste Google-kart. Du ble logget ut.', 'error');
            } else {
                let sjmap = document.getElementById("sjmap");
                if (sjmap) {
                    sjtoken = window.sessionStorage.getItem('sjtoken');
                    if (!sjtoken) {
                        window.location.href = '/home';
                    }
                    gmap = new google.maps.Map(sjmap, mapOptions);
                    getPerson();
                    getAreas();
                }
            }
        });
    }
});
