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

// The server should start listening
server.listen(3444, '0.0.0.0', () => console.log('Server started on http:// 0.0.0.0:3444'));

// listen for connection
wss.on("connection", (ws, req) => {
    console.log('New connection: ', req.socket.remoteAddress);

    // init shell process
    const ptyProcess = pty.spawn("rlwrap", ["-H", "/tmp/command_history", "./pty.sh", "john", "supercomputer", "config"], {
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
    let isAuthenticated = false
    const token = "eyJhbGciOiJSUzI1NiIsInR5cCIgOiAiSldUIiwia2lkIiA6ICJkQlN3Y1pZeUE5dFRLWUU2QVRkR0FERFZtVl9oMm51UzFtZVF4UDh4bG1BIn0.eyJleHAiOjE2NDc1MjEwMDUsImlhdCI6MTY0NzUyMDcwNSwiYXV0aF90aW1lIjoxNjQ3NDkxMTY4LCJqdGkiOiIwZWZlODU1OC0zMWZkLTRiZDEtOGY5ZC00N2M5ZTM4NDJjYzgiLCJpc3MiOiJodHRwOi8vMTkyLjE2OC4xMDAuMTAzOjMxMjAyL2F1dGgvcmVhbG1zL2t1YmVndWFyZGlhbiIsImF1ZCI6Imt1YmVndWFyZGlhbiIsInN1YiI6IjA2ODdiOTA1LTlkZDAtNDQ3NC05MzQ3LTNkYjhhNWRlNTQ0OCIsInR5cCI6IklEIiwiYXpwIjoia3ViZWd1YXJkaWFuIiwibm9uY2UiOiIxOTMzMjEyMC0yZWZhLTQwYmMtODI4Mi01MzZjMzQ5ZTM4YWIiLCJzZXNzaW9uX3N0YXRlIjoiNGE1YmUwZWItOGM0OS00YTNmLTgxMGEtMmZmZjhjY2M0MmZhIiwiYXRfaGFzaCI6IlpCSV9fZ0pQMFFVUHNyRHhRVGtMT1EiLCJhY3IiOiIwIiwic2lkIjoiNGE1YmUwZWItOGM0OS00YTNmLTgxMGEtMmZmZjhjY2M0MmZhIiwiZW1haWxfdmVyaWZpZWQiOmZhbHNlLCJuYW1lIjoiS3ViZWd1YXJkaWFuIEFkbWluIiwicHJlZmVycmVkX3VzZXJuYW1lIjoia2dhZG1pbiIsImdpdmVuX25hbWUiOiJLdWJlZ3VhcmRpYW4iLCJmYW1pbHlfbmFtZSI6IkFkbWluIn0.Duq07ZyP0Ub308T49z0SkwOoaROxY6zNtY3dtrpVK76H4svh5jVQWrnAXgFTyfpxat91DLtgg8o4x4v4fba_SQZq1bjcVWPiHxrEOFoR5CqQoPSixx6V1oOUSxxibK8psW1Jh5yNFSecUM0lT7nJv7tY-G76h9cT0vKLiOmrcV45Gggm3T_OYDm6wqeRjREpOnq18MBsbBzV_40yOeAKTHEI7iLo72vBG3PRQ8V46Uk6Gn-Zn26pPLE6qprQaBDHHbpqOCFsUZbD9f9DWckR9wbVmkpVPKkaN9ZskYy-vomvFwwmIHC1FHI1ifFWX2OC4LLQ6y3lhwPBY_SVSXsskg"
    ws.on('message', data => {
        if (!isAuthenticated) {
            console.log('not auth');
            // match token here
            if (data.toString() === token) {
                isAuthenticated = true
                console.log('token match');
                return
            } else {
                ws.close(1011, "authentication failed")
                console.log('auth failed');
                return
            }
        }
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
