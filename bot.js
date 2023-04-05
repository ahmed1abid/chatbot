const RiveScript = require('rivescript');

const rs = new RiveScript();
rs.loadFile('standard.rive', () => {
  console.log('RiveScript file loaded!');
  rs.sortReplies();
});

const reply = async (message) => {
  const response = await rs.replyAsync('localuser', message);
  return response;
};

module.exports = {
  reply,
};
