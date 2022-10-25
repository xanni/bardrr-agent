# issues

- select event issue
- what if the page has something that is constantly changing the dom (e.g. a live clock) - then the session would last forever... do we need a max time limit for our sessions? even that wouldn't help i think...

# pseudocode

## objects

- agent
  - session interface
  - recording manager
    - recorder
    - stasher
  - sender
  - timer

## workflow

- page loads
- agent gets initialized
  - agent makes session interface and starts it
    - session interface checks if we're already in a session (e.g. could still be in a session if user navigated to this page from another page of the app), if we aren't then it makes a session id and puts it into local storage
  - agent makes recording manager and starts it
    - recording manager makes a new recorder and starts it
      - recorder is set up to just initialize an rrweb recorder that just calls the recording manager's `handle` method with every event

- something in the dom happens
- rrweb recorder calls emit with that event
- all that does is call the recording manager's `handle` method with that event
- recording manager checks whether or not its `stasher` is running. if the stasher is not running, then the event gets published. otherwise, the event is passed on to the stasher instead.
- after page load, the stasher is initially inactive, so let's deal with that case first
- so the recording manager sees stasher is inactive, so event gets published
- publishing means that two things happen
  - 1: the event gets passed on to the sender
  - 2: the timer gets restarted

- what happens when sender gets event?
  - sender has a buffer
  - sender pushes event into buffer
  - sender checks if buffer is full, if it is then sender sends events

- how does sender send events?
  - flushes the buffer, puts those contents of buffer into fetch request

- what does a timer restart do?
  - clears the current timeout
  - sets a new timeout with time MAX_IDLE_TIME and saves id for potential future clearing
  - what is the callback to that timeout? it is just the agent's handle timeout method
  - what is the agent's handle timeout method?
    - tells the sender to send (any events still in its partially full buffer)
    - tells the session interface to end the session
    - tells the recording manager to handle timeout
      - stops the current recorder
      - starts the stasher
      - creates a new recorder and starts it

- now that the stasher is active, how is a new event handled?
  - recording manager sees that stasher is active, so instead of publishing the event, it passes the event to the stasher
    - stasher checks if the event it got is an initializing event.
      - if it is, then the stasher stashes it
      - if it isn't (i.e. it is new activity), then the stasher
        - tells session interface to start a new session
        - stamps the initalizing events with this event's timestamp - 1
        - publishes the initializing events and this event
        - shuts down






(the point of the stasher is to stash the initial rrweb events (i.e. initial full dom snapshot and meta event) when the recorder is restarted after inactivity, and then only pass those events along to the sender once there is more activity. so, the stasher is initially inactive, and only becomes active after there is enough inactivity and the recorder is reset)