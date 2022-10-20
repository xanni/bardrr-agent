/*
todo:
  - make properties private
  - put more configuration (e.g. rrweb options) in configuration file
  - refactor?
  - take out console.log / comments
*/

"use strict";

import { record } from 'rrweb';
import { v4 as uuidv4 } from "uuid";
import config from 'config';

// maybe how to handle session will become clearer as we interact with it, i.e. send it, destroy it etc.
// first lets implement the no timeout path (i.e. the page load path)

// how do all of the classes know about one another?
// maybe make the agent be the orchestrator? so each class has a reference to the agent and reaches the other classes that way

// methods on an object can signify doing something to the object (e.g. recorder.start) or asking the object to do something (e.g. batcher.handle(event)). both are ok i think

// where should i put the ttl?
// i feel like it should be in the config...
// so after we import the config, do we want to keep it there, or put it in the agent?
// i think it doesn't really matter functionally, but style-wise maybe it's nicer in the agent or a collaborator class e.g. reaper...

// restart is different than start, cause restart implies shut down followed by start...
// is it ok to use restart when start is the correct thing?

// thing is, restart has start in it...

// you might start the recorder but not get any events... so reaper shouldn't be started until first event...
// but actually, starting the recorder always triggers an event... so you should start the reaper right away
// it's also a nice distinction between active and dormant mode.

export default class Agent {
  constructor() {
    this.sessionInterface = new SessionInterface();
    this.recorder = new Recorder(this);
    this.batcher = new Batcher();
    this.timer = new Timer(this, config.MAX_IDLE_TIME);
  }

  initialize() {
    this.sessionInterface.initialize();
    this.recorder.start();
  }

  inSession() {
    return !!sessionStorage.getItem('sessionId');
  }
}

class SessionInterface {
  initialize() {
    this.id = sessionStorage.getItem('sessionId') ||
  }

  #exists() {
    return !!sessionStorage.getItem('sessionId');
  }

  #start() {

  }

  #end() {

  }
}

class Recorder {
  constructor(agent) {
    this.#agent = agent;
    this.#stop = null;
    this.#status = null;
  }

  start() {
    this.agent.timer.start();

    this.#stop = record({
      emit(event) {
        this.agent.batcher.handle(event);
        this.agent.timer.restart();
      },
    });
  }

  sleep() {
    this.#stop();
    this.#startInDormantMode();
  }

  #startInDormantMode() {
    this.#status = 'priming';

    this.#stop = record({

    })
  }
}

/*
what mode are we in?
priming
  add event to initial events
  if initial events are ready, change state to primed
primed
  start session
  send initial events and event to batch manager
  change state to running
running
  add session id to event
  send event to batch manager
  reset timeout
*/

class Batcher {
}

class Timer {
  constructor(agent, MAX_IDLE_TIME) {
    this.#agent = agent;
    this.#MAX_IDLE_TIME = MAX_IDLE_TIME;
    this.#timeoutId = null;
  }

  restart() {
    this.#stop();
    this.start();
  }

  #stop() {
    clearTimeout(this.#timeoutId);
  }

  start() {
    this.#timeoutId = setTimeout(this.#beep, MAX_IDLE_TIME);
  }

  #beep() {
    this.agent.recorder.restartInDormantMode();
  }
}

/*

two cases: page load vs. timeout

  page load
    if not in session then start session
    create active recorder
      receive event
        add session id to event
        send event to batch manager
        reset timeout
  timeout
    end session
    create dormant recorder
      receive event
        what mode are we in?
          priming
            add event to initial events
            if initial events are ready, change state to primed
          primed
            start session
            send initial events and event to batch manager
            change state to running
          running
            add session id to event
            send event to batch manager
            reset timeout

timeout
  delete the session id
  tell batch manager to send batch
  start a dormant recorder

batch manager
  handle event
    add event to batch
    if batch ready then send
  on visibility hidden, send the batch
*/

// "use strict";

// import { record } from "rrweb";
// import { v4 as uuidv4 } from "uuid";
// import config from "./config";

// const TTL = 10 * 1000;

// export default function start() {
//   let initialEventsManager = {};
//   if (!sessionStorage.getItem("sessionId")) {
//     setSessionId();
//     initialEventsManager = new InitialEventsManager();
//   }

//   record({
//     emit(event) {
//       switch (initialEventsManager.status) {
//         case "collecting":
//           initialEventsManager.collect(event);
//           return;
//         case "collected":
//           initialEventsManager.sendStartSessionRequest(event.timestamp - 1);
//           initialEventsManager.stampAndSend(event.timestamp - 1);
//           break;
//       }

//       send(event);
//       resetTimeout();
//     },
//   });
// }

// function setSessionId() {
//   sessionStorage.setItem("sessionId", uuidv4());
// }

// class InitialEventsManager {
//   constructor() {
//     this.initialEvents = [];
//     this.status = "collecting";
//   }

//   collect(initialEvent) {
//     this.initialEvents.push(initialEvent);
//     if (this.#isDoneCollecting()) this.status = "collected";
//   }

//   #isDoneCollecting() {
//     return (
//       this.initialEvents.some(({ type }) => type === 4) &&
//       this.initialEvents.some(({ type }) => type === 2)
//     );
//   }

//   sendStartSessionRequest(timestamp) {
//     fetch(`${config.endpoint}/start-session`, {
//       method: "POST",
//       headers: {
//         "Content-Type": "application/json",
//       },
//       body: JSON.stringify({
//         sessionId: sessionStorage.getItem("sessionId"),
//         timestamp,
//       }),
//     });
//     // console.log('sent this:', JSON.stringify({
//     //   sessionId: sessionStorage.getItem('sessionId'),
//     //   timestamp,
//     // }));
//   }

//   stampAndSend(timestamp) {
//     this.initialEvents.forEach((initialEvent) =>
//       send({ ...initialEvent, timestamp })
//     );
//     this.status = "sent";
//   }
// }

// function send(event) {
//   let events = [event];
//   fetch(`${config.endpoint}/record`, {
//     method: "POST",
//     headers: {
//       "Content-Type": "application/json",
//     },
//     body: JSON.stringify({
//       sessionId: sessionStorage.getItem("sessionId"),
//       events,
//     }),
//   });
//   // console.log('sent this:', JSON.stringify({
//   //   sessionId: sessionStorage.getItem('sessionId'), event
//   // }));
// }

// function resetTimeout() {
//   clearTimeout(sessionStorage.getItem("timeoutId"));
//   sessionStorage.setItem(
//     "timeoutId",
//     setTimeout(() => {
//       sendEndSessionRequest();
//       sessionStorage.removeItem("sessionId");
//       start();
//     }, TTL)
//   );
// }

// function sendEndSessionRequest() {
//   fetch(`${config.endpoint}/end-session`, {
//     method: "POST",
//     headers: {
//       "Content-Type": "application/json",
//     },
//     body: JSON.stringify({
//       sessionId: sessionStorage.getItem("sessionId"),
//       timestamp: Date.now(),
//     }),
//   });
//   // console.log('sent this:', JSON.stringify({
//   //   sessionId: sessionStorage.getItem('sessionId'),
//   //   timestamp: Date.now(),
//   // }));
// }
