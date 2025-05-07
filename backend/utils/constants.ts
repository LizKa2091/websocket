const PORT = 8082;

const CLIENT = {
   MESSAGE: {
      NEW_USER: 'NEW_USER',
      NEW_MESSAGE: 'NEW_MESSAGE',
      JOIN_ROOM: 'JOIN_ROOM',
   }
};

const SERVER = {
   MESSAGE: {
      PLAYER_ASSIGNMENT: 'PLAYER_ASSIGNMENT',
      ROOM_FULL: 'ROOM_FULL',
      NEW_MESSAGE: 'NEW_MESSAGE',
      USER_LIST: 'USER_LIST',
      USER_JOINED: 'USER_JOINED',
      USER_LEFT: 'USER_LEFT',
   }
};

// This check allows the module to be used in the client and the server
if (typeof module !== "undefined" && module.exports) {
   module.exports = exports = {
      PORT,
      CLIENT
   }
}