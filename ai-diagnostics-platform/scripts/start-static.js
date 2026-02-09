/* eslint-disable no-console */
const httpServer = require('http-server');

const root = 'public';
const requestedPort = Number(process.env.PORT || 8080);
const maxAttempts = 20;

function startOn(port, attemptsLeft) {
    const server = httpServer.createServer({ root });
    server.server.on('error', (err) => {
        if (err && err.code === 'EADDRINUSE' && attemptsLeft > 0) {
            console.warn(`[start] Port ${port} is in use. Trying ${port + 1}...`);
            startOn(port + 1, attemptsLeft - 1);
            return;
        }
        console.error('[start] Failed to start server:', err && err.message ? err.message : err);
        process.exit(1);
    });
    server.server.listen(port, '0.0.0.0', () => {
        console.log(`[start] Serving "${root}" at http://127.0.0.1:${port}`);
    });
}

startOn(requestedPort, maxAttempts);
