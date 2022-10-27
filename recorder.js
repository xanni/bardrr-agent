/*
todo:
  - extract classes into their own files
  - give things direct references to what they need, i.e. no need to go through agent for everything
  - eliminate unnecessary collaborator objects
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

import * as rrweb from "rrweb";
import { v4 as uuidv4 } from "uuid";
import config from "./config";

export default class Agent {
  constructor() {
    this.sessionInterface = new SessionInterface();
    this.recordingManager = new RecordingManager(this);
    this.sender = new Sender(this);
    this.timer = new Timer(this, config.MAX_IDLE_TIME);
  }

  start() {
    this.sessionInterface.start();
    this.sender.start();
    this.recordingManager.start();
  }

  handleTimeout() {
    this.recordingManager.recorder.stop();
    this.sender.send();
    this.sessionInterface.endSession();
    this.recordingManager.startRecorderWithStasher();
  }
}

class SessionInterface {
  constructor() {
    this.SESSION_ID_KEY = "sessionId";
  }

  start() {
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
  }

  endSession() {
    sessionStorage.removeItem("sessionId");
  }
}

class RecordingManager {
  constructor(agent) {
    this.agent = agent;
    this.recorder = new Recorder(this.handleEvent.bind(this));
    this.stasher = new Stasher(this);
  }

  start() {
    this.recorder.start();
  }

  handleEvent(event) {
    if (this.#isClick(event)) {
      let clickedNode = rrweb.record.mirror.getNode(event.data.id);
      if (this.#nodeIsInteresting(clickedNode)) {
        event["conversionData"] = {};
        event.conversionData.eventType = "click";
        event.conversionData.textContent = clickedNode.textContent;
      }
    }

    if (this.stasher.isRunning) {
      this.stasher.handle(event);
      return;
    }

    this.publishEvent(event);
  }

  publishEvent(event) {
    this.agent.sender.handle(event);
    this.agent.timer.restart();
  }

  startRecorderWithStasher() {
    this.stasher.start();
    this.recorder = new Recorder(this.handleEvent.bind(this));
    this.recorder.start();
  }

  #isClick(event) {
    return (
      event.type === 3 && //incremental snapshot event
      event.data.source === 2 && //source of incremental snapshot is a mouse action
      event.data.type === 2 //mouse action is a click
    );
  }

  #nodeIsInteresting(clickedNode) {
    return (
      clickedNode.nodeName === "BUTTON" || clickedNode.nodeName === "ANCHOR"
    );
  }
}

class Recorder {
  constructor(handleEvent) {
    this.configuration = {
      emit: handleEvent,
      plugins: [rrweb.getRecordConsolePlugin(config.recordConsolePlugin)],
    }
    this.stop = null;
  }

  start() {
    this.stop = rrweb.record(this.configuration);
  }
}

class Stasher {
  constructor(recordingManager) {
    this.recordingManager = recordingManager;
    this.isRunning = false;
    this.events = [];
  }

  start() {
    this.isRunning = true;
  }

  handle(event) {
    this.isInitializingEvent(event)
      ? this.events.push(event)
      : this.stop(event);
  }

  isInitializingEvent(event) {
    return (
      [2, 4].includes(event.type)
      || this.isSelectionEvent(event)
      || this.isConsoleEvent(event)
    );
  }

  isSelectionEvent(event) {
    return event.type === 3 && event.data.source === 14;
  }

  isConsoleEvent(event) {
    return event.type === 6;
  }

  stop(event) {
    this.recordingManager.agent.sessionInterface.startSession();
    this.stamp(this.events, event.timestamp - 1);
    this.publish(...this.events, event);
    this.events = [];
    this.isRunning = false;
  }

  stamp(events, timestamp) {
    events.forEach((event) => (event.timestamp = timestamp));
  }

  publish(...events) {
    events.forEach((event) => {
      this.recordingManager.publishEvent(event);
    });
  }
}

class Sender {
  constructor(agent) {
    this.agent = agent;
    this.eventBuffer = new EventBuffer();
  }

  start() {
    document.addEventListener("visibilitychange", () => {
      if (document.visibilityState === "hidden") this.send();
    });
  }

  handle(event) {
    this.eventBuffer.push(event);
    if (this.eventBuffer.isFull()) this.send();
  }

  send() {
    if (this.eventBuffer.isEmpty()) return;

    const resource = `${config.endpoint}/record`;
    const options = {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        sessionId: this.agent.sessionInterface.getSessionId(),
        events: this.eventBuffer.flush(),
      }),
    };

    fetch(resource, options);
  }
}

class EventBuffer extends Array {
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
    this.timeoutId = setTimeout(
      this.agent.handleTimeout.bind(this.agent),
      this.MAX_IDLE_TIME
    );
  }
}
