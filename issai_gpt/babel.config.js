module.exports = function (api) {
  api.cache(true);
  return {
    presets: ["babel-preset-expo"],
    plugins: [
      "nativewind/babel",
      [
        "module-resolver",
        {
          alias: {
            "@screens": "./src/screens",
            "@components": "./src/components",
            "@utils": "./src/utils",
            "@store": "./src/store",
            "@constants": "./src/constants",
            "@types": "./src/types",
            "@hooks": "./src/hooks",
            "@context": "./src/context",
            "@assets": "./assets",
          },
        },
      ],
    ],
  };
};
