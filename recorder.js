/*
todo:
  - session end - how to detect closing tab / leaving origin
  - timestamp of session end
    - in case of expiration due to inactivity, should be timestamp of last event, or timestamp or last event plus ttl?
    - in case of expiration due to closing tab or leaving origin, should be timestamp of last event, or timestamp or closing tab / leaving origin?
  - import configuration from configuration file
  - refactor?
  - take out console.log / comments
*/

"use strict";

import { record } from 'rrweb';
import { v4 as uuidv4 } from 'uuid';
import config from './config';

const TTL = 10 * 1000;

export default function start() {
  let initialEventsManager = {};
  if (!sessionStorage.getItem('sessionId')) {
    setSessionId();
    initialEventsManager = new InitialEventsManager();
  }

  record({
    emit(event) {
      switch (initialEventsManager.status) {
        case 'collecting':
          initialEventsManager.collect(event);
          return;
        case 'collected':
          initialEventsManager.sendStartSessionRequest(event.timestamp - 1)
          initialEventsManager.stampAndSend(event.timestamp - 1);
          break;
      }

      send(event);
      resetTimeout();
    },
  });
}

function setSessionId() {
  sessionStorage.setItem('sessionId', uuidv4());
}

class InitialEventsManager {
  constructor() {
    this.initialEvents = [];
    this.status = 'collecting';
  }

  collect(initialEvent) {
    this.initialEvents.push(initialEvent);
    if (this.#isDoneCollecting()) this.status = 'collected';
  }

  #isDoneCollecting() {
    return (
      this.initialEvents.some(({ type }) => type === 4) &&
      this.initialEvents.some(({ type }) => type === 2)
    );
  }

  sendStartSessionRequest(timestamp) {
    fetch(`${config.endpoint}/start-session`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        sessionId: sessionStorage.getItem('sessionId'),
        timestamp,
      }),
    });
    // console.log('sent this:', JSON.stringify({
    //   sessionId: sessionStorage.getItem('sessionId'),
    //   timestamp,
    // }));
  }

  stampAndSend(timestamp) {
    this.initialEvents.forEach(initialEvent => send({ ...initialEvent, timestamp }));
    this.status = 'sent';
  }
}

function send(event) {
  fetch(`${config.endpoint}/record`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      sessionId: sessionStorage.getItem('sessionId'), event
    }),
  });
  // console.log('sent this:', JSON.stringify({
  //   sessionId: sessionStorage.getItem('sessionId'), event
  // }));
}

function resetTimeout() {
  clearTimeout(sessionStorage.getItem('timeoutId'));
  sessionStorage.setItem('timeoutId', setTimeout(() => {
    sendEndSessionRequest();
    sessionStorage.removeItem('sessionId');
    start();
  }, TTL));
}

function sendEndSessionRequest() {
  fetch(`${config.endpoint}/end-session`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      sessionId: sessionStorage.getItem('sessionId'),
      timestamp: Date.now(),
    }),
  });
  // console.log('sent this:', JSON.stringify({
  //   sessionId: sessionStorage.getItem('sessionId'),
  //   timestamp: Date.now(),
  // }));
}
