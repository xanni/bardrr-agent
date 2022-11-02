const config = {
  MAX_IDLE_TIME: 60 * 1000,
  recordOptions: {
    blockClass: "rr-block",
    blockSelector: null,
    ignoreClass: "rr-ignore",
    ignoreCSSAttributes: null,
    maskTextClass: "rr-mask",
    maskTextSelector: null,
    maskAllInputs: true,
    maskInputOptions: { password: true },
    maskInputFn: undefined,
    maskTextFn: undefined,
  },
  recordConsolePlugin: {
    level: ["error"],
    lengthThreshold: Number.POSITIVE_INFINITY,
    stringifyOptions: {
      stringLengthLimit: Number.POSITIVE_INFINITY,
      numOfKeysLimit: Number.POSITIVE_INFINITY,
      depthOfLimit: Number.POSITIVE_INFINITY,
    },
  },
};

export default config;
