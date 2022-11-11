<img src="https://github.com/bard-rr/.github/blob/main/profile/logo2.png?raw=true" width="300">

[![Version](https://img.shields.io/npm/v/bardrr)](https://www.npmjs.com/package/bardrr)
[![Downloads/week](https://img.shields.io/npm/dt/bardrr)](https://npmjs.org/package/bardrr)
[![License](https://img.shields.io/npm/l/monsoon-load-testing.svg)](https://github.com/minhphanhvu/bardrr/blob/master/package.json)

# Bardrr

### Recording Agent for Bard

Bardrr is a node.js package for recording browser events for the bard session replay and analysis tool.

### Installation

This is a Node.js module available through the npm registry. Installation is done using the npm install command:

```
$ npm install bardrr
```

### Configuring the Agent

In order to use the bardrr agent to collect browser events, you must import the Agent from bardrr. Then in your app you need to call the `start` method on the agent passing in an object with an `appName`, `endpoint` and `MAX_IDLE_TIME`. `endpoint` is where the agent will send the events. `MAX_IDLE_TIME` is the amount of idle time (in milliseconds) after which a session ends. Example:

```javascript
import Agent from "bardrr"

new Agent().start({appName: "Party App", endpoint: "http://www.myfancyapp.com", MAX_IDLE_TIME: 60000});
```

### Custom Events

To create custom events you will need to import the agent and execute the `handleCustomEvent` method with a custom event name passed in as an argument.

```
import Agent from "bardrr"

Agent.handleCustomEvent("myCustomEvent")
```

### Additional Configuration

Additional configuration is available through the `recordOptions` and `recordConsolePlugin` properties of the object exported by `config.js`, which are preset to reasonable defaults. Detailed documentation for `recordOptions` and `recordConsolePlugin` is available on the rrweb GitHub page, specifically [here](https://github.com/rrweb-io/rrweb/blob/master/guide.md#options) and [here](https://github.com/rrweb-io/rrweb/blob/master/docs/recipes/console.md#console-recorder-and-replayer), respectively.
