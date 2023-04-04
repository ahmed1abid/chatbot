class ChatBot {
    constructor(name, personality, interfaces) {
      this.name = name;
      this.personality = personality;
      this.interfaces = interfaces;
    }
  
    addInterface(interface) {
      this.interfaces.push(interface);
    }
  
    removeInterface(interface) {
      const index = this.interfaces.indexOf(interface);
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
  }
  