<img src="https://github.com/bard-rr/.github/blob/main/profile/logo2.png?raw=true" width="300">

[![Version](https://img.shields.io/npm/v/bardrr)](https://www.npmjs.com/package/bardrr)
[![Downloads/week](https://img.shields.io/npm/dt/bardrr)](https://npmjs.org/package/bardrr)
[![License](https://img.shields.io/npm/l/monsoon-load-testing.svg)](https://github.com/minhphanhvu/bardrr/blob/master/package.json)

# Bardrr

### Recording Agent for Bard

Bardrr is a node.js package for recording browser events for the bard session replay and anyalysis tool.

### Installation

This is a Node.js module available through the npm registry. Installation is done using the npm install command:

```
$ npm install bardrr
```

### Configuring the Agent

In order to use the bardrr agent to collect browser events, you must import the Agent from bardrr. Then in you app you need to call the `start` method on the agent passing in an object with an `appName` and `endpoint`. This endpoint is where the agent will send the events. Example:

```javasciprt
import Agent from "bardrr"

new Agent().start({appName: "Party App", endpoint: "http://www.myfancyapp.com"});
```

### Custom Events

To create custom events you will need to import the agent and execute the `handleCustomEvent` method with a custom event name passed in as an argument.

```
import Agent from "bardrr"

Agent.handleCustomEvent("myCustomEvent")
```

### Configuration Options

MAX_IDLE_TIME: The maximum amout of idle time in ms before a session ends.

blockClass: A class name the recorder will block from being recorded.

ignoreClass: A class name the recorder will ignore changes to.

maskTextClass: A class name the recorder will not collect the text from but will use '\*'.

maskAllInputs: A boolean for when true will mask all inputs with '\*' and false will allow all inputs to be recorded.

#### Example of config.js

```
const config = {
  MAX_IDLE_TIME: 60 * 1000,
  recordOptions: {
    blockClass: 'rr-block',
    blockSelector: null,
    ignoreClass: 'rr-ignore',
    ignoreCSSAttributes: null,
    maskTextClass: 'rr-mask',
    maskTextSelector: null,
    maskAllInputs: true,
    maskInputOptions: { password: true },
    maskInputFn: undefined,
    maskTextFn: undefined,
  },
  recordConsolePlugin: {
    level: ['error'],
    lengthThreshold: Number.POSITIVE_INFINITY,
    stringifyOptions: {
      stringLengthLimit: Number.POSITIVE_INFINITY,
      numOfKeysLimit: Number.POSITIVE_INFINITY,
      depthOfLimit: Number.POSITIVE_INFINITY,
    },
  },
}
```
