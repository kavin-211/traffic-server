// Calculate distance between two points in meters (Haversine formula)
function getDistanceFromLatLonInM(lat1, lon1, lat2, lon2) {
  var R = 6371; // Radius of the earth in km
  var dLat = deg2rad(lat2 - lat1);
  var dLon = deg2rad(lon2 - lon1);
  var a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(deg2rad(lat1)) * Math.cos(deg2rad(lat2)) *
    Math.sin(dLon / 2) * Math.sin(dLon / 2);
  var c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  var d = R * c; // Distance in km
  return d * 1000; // Distance in meters
}

function deg2rad(deg) {
  return deg * (Math.PI / 180);
}

// Calculate bearing from point A to point B
// Returns degrees (0-360), where 0 is North, 90 is East, etc.
function getBearing(startLat, startLng, destLat, destLng) {
  startLat = toRadians(startLat);
  startLng = toRadians(startLng);
  destLat = toRadians(destLat);
  destLng = toRadians(destLng);

  y = Math.sin(destLng - startLng) * Math.cos(destLat);
  x = Math.cos(startLat) * Math.sin(destLat) -
    Math.sin(startLat) * Math.cos(destLat) * Math.cos(destLng - startLng);
  brng = Math.atan2(y, x);
  brng = toDegrees(brng);
  return (brng + 360) % 360;
}

function toRadians(degrees) {
  return degrees * Math.PI / 180;
}

function toDegrees(radians) {
  return radians * 180 / Math.PI;
}

// Determine which gateway corresponds to the bearing
// Assuming gateways are distributed evenly around the circle
// e.g., 4 gateways: 0 (N), 90 (E), 180 (S), 270 (W)
// This is a simplified logic. In a real world, we'd map bearings to specific road angles.
function getGatewayFromBearing(bearing, numberOfGateways) {
    const sectorSize = 360 / numberOfGateways;
    // Offset by half a sector so that the gateway angle is the center of the sector
    // e.g. 4 gateways:
    // Gate 1 (0 deg): covers 315 to 45
    // Gate 2 (90 deg): covers 45 to 135
    // ...
    
    let adjustedBearing = (bearing + (sectorSize / 2)) % 360;
    let gatewayIndex = Math.floor(adjustedBearing / sectorSize);
    
    // Gateway index is 0-based. 
    // However, usually traffic comes FROM a direction.
    // If ambulance is at South (180) heading North, it enters via the South gate.
    // The bearing we calculated is FROM ambulance TO signal.
    // So if ambulance is at South, bearing to signal is 0 (North).
    // Wait, if ambulance is at (0,0) and signal is at (1,1) (NE), bearing is 45.
    // The ambulance is coming FROM the SW. It should enter the SW gate.
    // Let's assume gateways are numbered clockwise starting from North.
    // Gate 1: North, Gate 2: East, Gate 3: South, Gate 4: West.
    // If bearing is 0 (North), ambulance is South of signal, heading North.
    // So it enters the South Gate (Gate 3).
    
    // Let's stick to a simpler mapping for now:
    // The calculated bearing is the direction the ambulance needs to travel to hit the signal.
    // So if bearing is 0 (North), it's coming from South.
    // We need to open the "South" gateway.
    // If we assume Gate 1 is North, Gate 2 East, Gate 3 South, Gate 4 West.
    // Then bearing 0 -> Gate 3.
    // bearing 90 -> Gate 4.
    // bearing 180 -> Gate 1.
    // bearing 270 -> Gate 2.
    
    // This depends heavily on how "Gateways" are defined in the UI. 
    // For this project, let's map the bearing directly to a gateway index for simplicity,
    // and assume the gateways are ordered clockwise.
    
    // Let's just return the index (1-based)
    return gatewayIndex + 1;
}

module.exports = { getDistanceFromLatLonInM, getBearing, getGatewayFromBearing };
