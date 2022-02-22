const { Server } = require("socket.io");
const os = require('os');
const pty = require('node-pty');

const shell = os.platform() === 'win32' ? 'powershell.exe' : 'bash';

// init socket.io connection
const io = new Server(3444, {
    cors: '*'
});

// listen for connection
io.on("connection", (socket) => {
    console.log('New connection:', socket.id);

    // init shell process
    const ptyProcess = pty.spawn(shell, [], {
        name: 'xterm-color',
        cols: 80,
        rows: 30,
        cwd: process.env.HOME,
        env: process.env
    });
    ptyProcess.on('data', function (data) {
        // process.stdout.write(data);
        socket.emit('resp', data)
    });

    socket.on('keystroke', data => {
        ptyProcess.write(data);
    });
   socket.on('disconnect',reason => {
       console.log(reason, socket.id);
        ptyProcess.kill();
   });
});
