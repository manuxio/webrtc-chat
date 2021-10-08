import config from '../main/libs/config.js';
import io from 'socket.io-client';
import axios from 'axios';
import yargs from 'yargs';

const { argv } = yargs
  .option("c", {
    alias: "channel",
    describe: "The channel id",
    demandOption: "Channel id is required",
    type: "string",
  })
  .option("m", {
    alias: "message",
    describe: "The message",
    demandOption: "Message is required",
    type: "string",
  })
  .option("t", {
    alias: "tag",
    describe: "Tag a user",
    type: "string",
  });

const {
  channel,
  message,
  tag
} = argv;


const start = async () => {
  if (!config?.scripts?.sendmessage?.credentials) {
    throw new Error('No autoLogin section found in config (path: scripts.sendmessage.credentials). Please check your config file.')
  }
  const credentials = config.scripts.sendmessage.credentials;
  if (!credentials) {
    throw new Error('No autoLogin section found in config. Please check your config file.')
  }
  const {
    username,
    password
  } = credentials;
  const token = await axios.post(`${config.roomsApiServer}/user/authenticate`,
    { username, password }
  )
  .then((res) => {
    return res.data;
  })
  .then((res) => {
    // console.log('res', res);
    if (res && !res.error) {
      return res.result;
    }
    throw new Error(res.errorMessage);
  });

  // console.log('token', token);
  const socket = io(config.roomsApiServer, {
    transports: ['websocket'],
    'query': 'token=' + token + '&mode=agent',
    reconnection: false
  });
  socket.once('connect', () => {
    console.log('Connected!');
    const mytag = 'messages:sendto:request';
    socket.emit('user:me', ({ result: from }) => {
      const newMessage = {
        channel,
        message,
        mentions: tag ? [
          {
            "_id" : tag.split(':')[0],
            "name" : tag.split(':')[1],
          }
        ] : [],
        from,
        date: (new Date()).toISOString()
      };
      socket.emit(mytag, newMessage, (reply) => {
        console.log('Got reply', reply);
        process.exit();
      });
    })
  });
}
try {
  start();
} catch(e) {
  console.error(e);
}
