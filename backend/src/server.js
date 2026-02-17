const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '../.env') });

const app = require('./app');
const connectDB = require('./config/db');

const PORT = process.env.PORT || 3000;

// Connect to MongoDB and start server
const startServer = async () => {
    try {
        await connectDB();

        app.listen(PORT, '127.0.0.1', () => {
            console.log('========================================');
            console.log('   Dev-Journal Server Started');
            console.log('========================================');
            console.log(`   Port: ${PORT}`);
            console.log(`   Mode: ${process.env.NODE_ENV || 'development'}`);
            console.log(`   URL: http://localhost:${PORT}`);
            console.log('========================================');
        });
    } catch (error) {
        console.error('Failed to start server:', error.message);
        process.exit(1);
    }
};

startServer();
