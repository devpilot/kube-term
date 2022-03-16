const express = require("express");
const { createServer } = require("http");
const { Server } = require("socket.io");
const os = require('os');
const pty = require('node-pty');

const shell = os.platform() === 'win32' ? 'powershell.exe' : 'bash';

const app = express();
const httpServer = createServer(app);

// init socket.io connection
const io = new Server(httpServer, {
    cors: '*'
});

// serve index file
app.get('/', function (req, res) {
    res.sendFile(__dirname + '/index.html');
});

// Expose the node_modules folder as static resources
app.use('/xterm', express.static('node_modules/xterm'));
app.use('/socket.io', express.static('node_modules/socket.io/client-dist'));

// The server should start listening
httpServer.listen(3443, '0.0.0.0', () => console.log('Server started on http:// 0.0.0.0:3443'));

// listen for connection
io.on("connection", (socket) => {
    console.log('New connection:', socket.id);

    // init shell process
    const ptyProcess = pty.spawn(shell,
        [
            "./pty.sh",
            socket.handshake.query.user || '',
            socket.handshake.query.host || ''
        ], {
        name: 'xterm-256color',
        cols: 100,
        rows: 30,
        // cwd: process.env.HOME,
        env: process.env
    });

    ptyProcess.onData(data => {
        // process.stdout.write(data);
        socket.emit('resp', data)
    });

    socket.on('keystroke', data => {
        ptyProcess.write(data);
    });

    socket.on('disconnect', reason => {
        console.log(reason, socket.id);
        ptyProcess.kill();
    });

    ptyProcess.onExit(e => {
        console.log(e);
    });
});
