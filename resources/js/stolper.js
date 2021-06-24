
var gmap;
var sjtoken;
var fylkeareas = {};

const loader = new GoogleMaps.Loader({
    apiKey: "AIzaSyDJtzIuguDyk__zpqYwytdDs5DwxYh9WwE",
    version: "weekly",
    libraries: []
});

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

doLogout = function() {
    sessionStorage.clear();
    window.location.href = '/home';
};

processGetAreas = function(jsontext) {
    let markup = '';
    var jsondata = JSON.parse(jsontext);
    if (jsondata.STATUS === 200 ) {
        jsondata = JSON.parse(jsondata.CONTENT);
        jsondata.results.sort(dynamicSort("name"));
        let cnt = Object.keys( jsondata.results ).length;
        if( cnt>0 ) {
            markup = '<table><tbody>';
            for( let i=0; i<cnt; i++ ) {
                markup += '<tr><td colspan="2" class="fylke" data-id="' + jsondata.results[i].id + '" data-total="0" data-visited="0" data-name="' +
                    jsondata.results[i].name + '">' + jsondata.results[i].name + '</td></tr>';
                let cnt2 = Object.keys( jsondata.results[i].kommuner ).length;
                if( cnt2>0 ) {
                    jsondata.results[i].kommuner.sort(dynamicSort("name"));
                    for( let j=0; j<cnt2; j++ ) {
                        markup += '<tr><td></td><td colspan="2" class="kommune" data-fetched="0" data-id="' + jsondata.results[i].kommuner[j].id +
                            '" data-fylkeid="' + jsondata.results[i].id + '" data-total="0" data-visited="0" data-name="' +
                            jsondata.results[i].kommuner[j].name + '">' + jsondata.results[i].kommuner[j].name + '</td></tr>';
                    }
                }
            }
            markup += '</tbody></table>';
        }
        $('#sjinfo').empty().append(markup);
        $('td.kommune').off().on('click', function() { getKommune( $(this)) });
        $('td.fylke').off().on('click', function() { getFylke( $(this)) });
    }
    else {
        doLogout();
    }
};

processGetPerson = function(jsontext) {
    let markup = '';
    var jsondata = JSON.parse(jsontext);
    if (jsondata.STATUS === 200 ) {
        jsondata = JSON.parse(jsondata.CONTENT);
        $('#sjuser').empty().append( jsondata.name );
    }
    else {
        doLogout();
    }
};

getFylke = function( jqfylke ) {
    let fylkeid = jqfylke.data('id');
    let jqkomm = $('td.kommune').filter(function() { return ( $(this).data('fylkeid') === fylkeid ) });
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
        // If no in progress kommuner
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
    let jqobj = $('td.fylke').filter(function() { return ( $(this).data('id') === fylkeid ) });
    if( jqobj && jqobj.length > 0 ) {
        let jqkomm = $('td.kommune').filter(function() { return ( $(this).data('fylkeid') === fylkeid ) });
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
        fylkeareas[kommid][i].setMap( null );
        fylkeareas[kommid][i] = null;
    }
    delete fylkeareas[kommid];
    jqobj.html( jqobj.data('name'));
    jqobj.data('fetched', '0');
    jqobj.data('total', '0');
    jqobj.data('visited', '0');
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
    var img, jsondata = JSON.parse(jsontext);
    if (jsondata.STATUS === 200 ) {
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
                fylkeareas[kommid].push( newMarker );
            }
        }
        jqobj.data('fetched', '2');
        jqobj.data('total', cnt.toString());
        jqobj.data('visited', vcnt.toString());
        jqobj.html( '<b>' + jqobj.data('name') + ' (' + jqobj.data('visited') + '/' + jqobj.data('total') + ')</b>' );
        setFylke( jqobj.data('fylkeid'));
    }
    else {
        doLogout();
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
        doLogout();
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
            doLogout();
        }
    });
};

getPerson = function() {
    $.ajax({
        dataType: "text", url: "/api/getPerson?token=" + sjtoken, async: true, success: function (text) {
            processGetPerson(text);
        }, error: function (text) {
            doLogout();
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
            getPerson();
            getAreas();
        }
    }
});

$(document).ready(function(){
    $('#btn_login').on('click', function() { doLogin() });
    $('#btn_logout').on('click', function() { doLogout() });
});
