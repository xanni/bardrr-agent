const config = {
  endpoint: 'http://localhost:3001',
  MAX_IDLE_TIME: 5 * 1000,
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

export default config;
