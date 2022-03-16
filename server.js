const express = require("express");
const { createServer } = require("http");
const { WebSocketServer } = require("ws");
const os = require('os');
const pty = require('node-pty');

const shell = os.platform() === 'win32' ? 'powershell.exe' : 'bash';

const app = express();
const server = createServer(app);

// init socket connection
const wss = new WebSocketServer({ server })

// serve index file
app.get('/', function (req, res) {
    res.sendFile(__dirname + '/index.html');
});

// Expose the node_modules folder as static resources
app.use('/xterm', express.static('node_modules/xterm'));
// app.use('/socket.io', express.static('node_modules/socket.io/client-dist'));

// The server should start listening
server.listen(3443, '0.0.0.0', () => console.log('Server started on http:// 0.0.0.0:3443'));

// listen for connection
wss.on("connection", (ws, req) => {
    console.log('New connection: ', req.socket.remoteAddress);

    // init shell process
    const ptyProcess = pty.spawn(shell,
        ["./pty.sh"], {
        name: 'xterm-256color',
        cols: 100,
        rows: 30,
        // cwd: process.env.HOME,
        env: process.env
    });

    ptyProcess.onData(data => {
        // process.stdout.write(data);
        ws.send(data)
    });

    ws.on('message', data => {
        ptyProcess.write(data);
    });

    ws.on('disconnect', reason => {
        console.log(reason);
        ptyProcess.kill();
    });

    ptyProcess.onExit(e => {
        console.log(e);
    });
});
