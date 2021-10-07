const { Server } = require("socket.io");
const { createAdapter } = require("@socket.io/redis-adapter");
const { createClient } = require("redis");

const io = new Server();

const pubClient = createClient({ host: "10.161.9.160", port: 6379, "password": "manusio" });
const subClient = pubClient.duplicate();

io.adapter(createAdapter(pubClient, subClient));
io.listen(3000, () => {
  console.log('Listening');
});
io.in('5ec3cf8695105bbd41dcfe64').fetchSockets().then((res) => console.log(res.map(s => [s.constructor.name, s.data.user] )));