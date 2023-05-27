const RiveScript = require('rivescript');

class Classchatbot {
  constructor(name, personality) {
    this.name = name;
    this.personality = personality;
    this.chatlog = [];
    this.brain = new RiveScript();
  }

  loadBrainFile(file) {
    return new Promise((resolve, reject) => {
      this.brain.loadFile(file, () => {
        this.brain.sortReplies();
        resolve();
      }, reject);
    });
  }
  sendMessage(message) {
    const reply = this.brain.reply('localuser', message);
    this.addToChatLog(message, true);
    this.addToChatLog(reply, false);
    return reply;
  }

  addInterface(interfaces) {
    this.interfaces.push(interfaces);
  }

  removeInterface(interfaces) {
    const index = this.interfaces.indexOf(interfaces);
    if (index > -1) {
      this.interfaces.splice(index, 1);
    }
  }

  addPersonality(personality) {
    this.personality.push(personality);
  }

  removePersonality(personality) {
    const index = this.personality.indexOf(personality);
    if (index > -1) {
      this.personality.splice(index, 1);
    }
  }

  addToChatLog(message, isUser) {
    this.chatlog.push({ message: message, isUser: isUser });
  }

  getChatLog() {
    return this.chatlog;
  }
  
}
module.exports = Classchatbot;
