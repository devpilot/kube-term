const { Server } = require("socket.io");

const io = new Server(3444,{
    cors: '*'
});

io.on("connection", (socket) => {
    console.log('New connection:',socket.id);
});
