const Signal = require('../models/Signal');
const { getDistanceFromLatLonInM, getBearing, getGatewayFromBearing } = require('./trafficLogic');

function handleSocketConnection(io) {
  io.on('connection', (socket) => {
    console.log('New client connected:', socket.id);

    // Driver joins a room (optional, but good for direct messaging if needed)
    socket.on('joinDriver', (driverId) => {
      socket.join(`driver_${driverId}`);
      console.log(`Driver ${driverId} joined`);
    });

    // Admin/Signal view joins a room to listen for updates
    socket.on('joinSignalMonitor', () => {
      socket.join('signalMonitor');
      console.log('Admin joined signal monitor');
    });

    // Driver updates location
    socket.on('driverLocationUpdate', async (data) => {
      // data: { driverId, lat, lng }
      const { driverId, lat, lng } = data;
      
      // Broadcast to admin for live tracking
      io.to('signalMonitor').emit('driverLocationUpdate', data);

      // Check proximity to all signals
      try {
        const signals = await Signal.find();
        
        for (const signal of signals) {
          const distance = getDistanceFromLatLonInM(lat, lng, signal.location.lat, signal.location.lng);
          
          if (distance <= signal.radius) {
            // Ambulance is within range!
            const bearing = getBearing(lat, lng, signal.location.lat, signal.location.lng);
            const targetGateway = getGatewayFromBearing(bearing, signal.gateways);
            
            // Emit event to freeze signal and open specific gateway
            io.emit('emergencyOverride', {
              signalId: signal.signalId,
              targetGateway: targetGateway,
              distance: distance,
              bearing: bearing
            });
            
            console.log(`Emergency at Signal ${signal.name}: Distance ${distance}m, Opening Gate ${targetGateway}`);
          } else {
             // Check if it was previously active and now out of range?
             // For now, the client handles the "reset" logic if no emergency event is received,
             // or we can emit a "clear" event if we track state.
             // But the requirements say: "once ambulance signal-a cross paneeruchunu arththam... signal 10 seconds ku reset aagi"
             // We can detect "crossing" if distance starts increasing after being very small.
             
             // For simplicity, let's just emit the distance updates and let the frontend logic handle the "freeze" state 
             // or emit a "normalOperation" event if far away.
             
             // Actually, to be robust, we should emit "clearEmergency" if out of radius.
             io.emit('clearEmergency', { signalId: signal.signalId });
          }
        }
      } catch (err) {
        console.error('Error processing driver location:', err);
      }
    });

    socket.on('disconnect', () => {
      console.log('Client disconnected:', socket.id);
    });
  });
}

module.exports = { handleSocketConnection };
