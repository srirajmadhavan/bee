var currentLocation,
    lastCriticalPoint,
    lastValidPoint,
    MAX_WALKING_SPEED = 5,
    ANGLE_THRESHOLD = 30,
    SPEED_THRESHOLD = 5,
    mode,
    counter = 3000,
    id = 0,
    go = 1,
    locationOptions = {
        enableHighAccuracy: true,
        timeout: 5000,
        maximumAge: 0,
        desiredAccuracy: 0,
        frequency: 1
    };

function Evaluate(currentSpeed)
{
    go = 0;
    var callServer = false;
    if (currentSpeed > MAX_WALKING_SPEED)
    {
        mode = "MOVING";
        if (!lastCriticalPoint && !lastValidPoint)
        {
            lastCriticalPoint = currentLocation;
            lastValidPoint = currentLocation;
            callServer = true;
            $('#result').append("currentLocation:" + currentLocation.lattitude + ", " + currentLocation.longitude+ ", " + currentSpeed);
            CallServer(currentLocation.lattitude, currentLocation.longitude, currentSpeed);
        }
        else
        {
            var lastValidBearing = bearingInitial(lastCriticalPoint.lattitude, lastCriticalPoint.longitude, lastValidPoint.lattitude, lastValidPoint.longitude);
            var currentPointBearing = bearingInitial(lastCriticalPoint.lattitude, lastCriticalPoint.longitude, currentLocation.lattitude, currentLocation.longitude);
            var changeInDirection = currentPointBearing - lastValidBearing;

            if (Math.abs(changeInDirection) > ANGLE_THRESHOLD && currentSpeed > SPEED_THRESHOLD)
            {
                lastCriticalPoint = lastValidPoint;
                lastValidPoint = currentLocation;
                callServer = true;
            	$('#result').append("currentLocation:" + currentLocation.lattitude + ", " + currentLocation.longitude+ ", " + currentSpeed);
                CallServer(currentLocation.lattitude, currentLocation.longitude, currentSpeed);
            }
            else
            {
                lastValidPoint = currentLocation;
                console.log("no call");
            }
        }
    }
    else
    {
        mode = "STATIC";
    }
    go = 1;
    return;
}
function CallServer(la, lg, sp)
{
    var args = JSON.stringify({ device: "test Phone", lattitude: la, longitude: lg, speed: sp });
    $.ajax({
        type: 'POST',
        url: 'http://locationbee-frostballs.rhcloud.com/api/location',
        cache: false,
        data: { device: "test Phone", lattitude: la, longitude: lg, speed: sp, description: "8.14" },
        dataType: 'json',
        contentType: 'application/x-www-form-urlencoded; charset=UTF-8',
        success: function (data, textStatus, xhr)
        {
          $('#result').append("Logged:" + la + ", " + lg + ", " + sp);
            go = 1;
        },
        error: function (data, textStatus, xhr)
        {
            $('#result').append("Error:" + la + ", " + lg + ", " + sp);
            go = 1;
        }
    });
}
function bearingInitial(lat1, long1, lat2, long2)
{
    return (bearingDegrees(lat1, long1, lat2, long2) + 360) % 360;
}

function bearingDegrees(lat1, long1, lat2, long2)
{
    var degToRad = Math.PI / 180.0;

    var phi1 = lat1 * degToRad;
    var phi2 = lat2 * degToRad;
    var lam1 = long1 * degToRad;
    var lam2 = long2 * degToRad;

    return Math.atan2(Math.sin(lam2 - lam1) * Math.cos(phi2),
        Math.cos(phi1) * Math.sin(phi2) - Math.sin(phi1) * Math.cos(phi2) * Math.cos(lam2 - lam1)
    ) * 180 / Math.PI;
}

function Run()
{
    id = navigator.geolocation.watchPosition(setPosition, errorPosition, locationOptions);
}


function setPosition(position)
{
    console.log(position);
    var crd = position.coords;
    currentLocation = { lattitude: crd.latitude, longitude: crd.longitude };
    $('#result').append("currentLocation:" + currentLocation.lattitude + ", " + currentLocation.longitude+ ", " + crd.speed);
    if (go == 1)
    {
        Evaluate(position.coords.speed == null ? 40 : position.coords.speed);
    }
}


function errorPosition(error)
{
    console.log(error);
}


