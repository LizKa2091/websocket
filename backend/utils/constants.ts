const PORT = 8082;

const CLIENT = {
   MESSAGE: {
      NEW_USER: 'NEW_USER',
      NEW_MESSAGE: 'NEW_MESSAGE'
   }
};

// const SERVER = {

// };

// This check allows the module to be used in the client and the server
if (typeof module !== "undefined" && module.exports) {
   module.exports = exports = {
      PORT,
      CLIENT
   }
}