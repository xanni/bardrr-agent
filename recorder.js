/*
todo:
  - put more configuration (e.g. rrweb options) in configuration file
  - refactor?
  - take out console.log / comments
*/

/*
page loads
0

timeout
  delete the session id
  send batch

on visibility hidden, send the batch


two cases: page load vs. timeout

page load
  if not in session then start session
  start recorder normally
    receive event
      send event to batch manager
      reset timeout
timeout
  end session
  start recorder in priming mode
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
        send event to batch manager

timeout
  delete the session id
  send batch
 */

"use strict";

import { record as startRecorder } from 'rrweb';
import { v4 as uuidv4 } from "uuid";
import config from 'config';

function handleEvent(event) {
  if ()
}

/*
page loads
receive event
are we in session?
  yes:
    send event
    reset inactivity timeout
  no:
    has the recorder been primed?
      yes:
        start session
        stamp the initial events
        send initial events AND event to batch
        is batch big enough?
          yes: send
          no: continue
      no:
        collect initial events

timeout
  delete the session id
  send batch

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
