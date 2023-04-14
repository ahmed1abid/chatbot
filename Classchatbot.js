class Classchatbot {
  
    constructor(name, personality, interfaces) {
    this.name = name;
    this.personality = personality;
    this.interfaces = interfaces;
    this.chatlog = [];
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
