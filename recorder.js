/*
todo:
  - give things direct references to what they need, i.e. no need to go through agent for everything
  - eliminate unnecessary collaborator objects
  - think of a better name for metarecorder and recorder (and subclasses of recorder) (observer? relayer?)
  - make properties private
  - fill out conifg file (e.g. with more rrweb options)
  - wrap ugly rrweb recorder initialization (i.e. have it take a callback directly if possible)
  - change hardcoded event types
  - change how session start request is sent...?
  - change backend routes and reformat messages accordingly?
  - take out console.log / comments
  - make into npm package
ideas:
  - change names of backend routes to be restful?
  - maybe:
    - post to sessions to start session
    - post to sessions/:id/events to add event (then session id would be part of url)
*/

"use strict";

import { record } from 'rrweb';
import { v4 as uuidv4 } from "uuid";
import config from './config';

export default class Agent {
  constructor() {
    this.sessionInterface = new SessionInterface();
    this.sender = new Sender(this);
    this.metaRecorder = new MetaRecorder(this);
    new Timer(this, config.MAX_IDLE_TIME);
  }

  initialize() {
    this.sessionInterface.initialize();
    this.sender.initialize();
    this.metaRecorder.start();
  }

  handleTimeout() {
    this.sender.send();
    this.sessionInterface.endSession();
    this.metaRecorder.reset();
  }
}

class SessionInterface {
  constructor() {
    this.SESSION_ID_KEY = 'sessionId';
  }

  initialize() {
    if (!this.sessionExists()) this.startSession();
  }

  sessionExists() {
    return !!this.getSessionId();
  }

  getSessionId() {
    return sessionStorage.getItem(this.SESSION_ID_KEY);
  }

  startSession() {
    sessionStorage.setItem(this.SESSION_ID_KEY, uuidv4());

    const resource = `${config.endpoint}/start-session`;
    const options = {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        sessionId: this.getSessionId(),
        timestamp: Date.now(),
      })
    };

    // todo
    // fetch(resource, options);
    console.log('sent:', JSON.parse(options.body));
  }

  endSession() {
    sessionStorage.removeItem('sessionId');
  }
}

class MetaRecorder {
  constructor(agent) {
    this.agent = agent;
    this.recorder = new ImmediatelySharingRecorder(this);
  }

  start() {
    this.recorder.start();
  }

  reset() {
    this.recorder.stop();
    this.recorder = new InitiallyHoardingRecorder(this);
    this.recorder.start();
  }
}

class Recorder {
  constructor(metaRecorder) {
    this.metaRecorder = metaRecorder;
    this.stop = null;
  }

  share(event) {
    this.metaRecorder.agent.sender.handle(event);
    this.metaRecorder.agent.timer.restart();
  }
}

class ImmediatelySharingRecorder extends Recorder {
  constructor(metaRecorder) {
    super(metaRecorder);
  }

  start() {
    this.stop = record({
      emit: super.share.bind(this),
    });
  }
}

class InitiallyHoardingRecorder extends Recorder {
  constructor(metaRecorder) {
    super(metaRecorder);
  }

  start() {
    const recorder = this;
    const interceptor = new Interceptor(this);

    this.stop = record({
      emit(event) {
        if (interceptor.isActive) {
          interceptor.handle(event);
        } else {
          recorder.share(event);
        }
      },
    });
  }
}

class Interceptor {
  constructor(recorder) {
    this.recorder = recorder;
    this.isActive = true;
    this.events = [];
  }

  handle(event) {
    this.isInitializingEvent(event) ? this.events.push(event) : this.shutdown(event);
  }

  isInitializingEvent({ type }) {
    return [2, 4].includes(type);
  }

  shutdown(event) {
    this.recorder.metaRecorder.agent.sessionInterface.startSession();
    this.stamp(this.events, event.timestamp - 1);
    this.share(...this.events, event);
    this.isActive = false;
  }

  stamp(events, timestamp) {
    events.forEach(event => event.timestamp = timestamp)
  }

  share(...events) {
    events.forEach(event => {
      this.recorder.share(event);
    });
  }
}

class Sender {
  constructor(agent) {
    this.agent = agent;
    this.messageBuffer = new MessageBuffer();
  }

  initialize() {
    document.addEventListener('visibilitychange', () => {
      if (document.visibilityState === 'hidden') this.send();
    });
  }

  handle(event) {
    this.messageBuffer.push(event);
    if (this.messageBuffer.isFull()) this.send();
  }

  send() {
    if (this.messageBuffer.isEmpty()) return;

    const resource = `${config.endpoint}/record`;
    const options = {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        sessionId: this.agent.sessionInterface.getSessionId(),
        events: this.messageBuffer.flush(),
      })
    };

    // todo
    // fetch(resource, options);
    console.log('sent:', JSON.parse(options.body));
  }
}

class MessageBuffer extends Array {
  constructor() {
    super();
  }

  isEmpty() {
    return this.length === 0;
  }

  isFull() {
    // todo
    return this.length === 10;
  }

  flush() {
    return this.splice(0, this.length);
  }
}

class Timer {
  constructor(agent, MAX_IDLE_TIME) {
    this.agent = agent;
    this.MAX_IDLE_TIME = MAX_IDLE_TIME;
    this.timeoutId = null;
  }

  restart() {
    this.stop();
    this.start();
  }

  stop() {
    clearTimeout(this.timeoutId);
  }

  start() {
    this.timeoutId = setTimeout(this.agent.handleTimeout.bind(this.agent), this.MAX_IDLE_TIME);
  }
}
