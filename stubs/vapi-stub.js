// Stub de @vapi-ai/react-native para web
// TutorScreen usa: new Vapi(key), vapi.start(), vapi.stop(), vapi.on(), vapi.off()
class VapiStub {
  constructor() {}
  start() { return Promise.resolve(); }
  stop() {}
  send() {}
  on() { return this; }
  once() { return this; }
  off() { return this; }
  removeAllListeners() { return this; }
}

module.exports = VapiStub;
module.exports.default = VapiStub;
