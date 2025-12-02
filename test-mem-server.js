const { MongoMemoryServer } = require('mongodb-memory-server');

(async () => {
  try {
    console.log('Starting MongoMemoryServer...');
    const mongod = await MongoMemoryServer.create();
    console.log('MongoMemoryServer started at:', mongod.getUri());
    process.exit(0);
  } catch (err) {
    console.error('Error starting MongoMemoryServer:', err);
    process.exit(1);
  }
})();
