const prod = process.env.NODE_ENV === "production";
const port = process.env.PORT || 3000;

if (prod) {
  if (!process.env.SYSTEM_PASSWORD) throw Error("api password not set");
}

const config = {};

Object.assign(config, {
  api: {
    port,
    external_url: process.env.EXTERNAL_URL || `http://localhost:${port}`,
    auth: {
      username: "system",
      password: process.env.SYSTEM_PASSWORD || "secret"
    }
  },
  mongo: {
    host: process.env.MONGO_HOST || "mongo",
    port: process.env.MONGO_PORT || 27017,
    db: process.env.MONGO_DB || "txjs"
  },
  action: {
    plugin_dir:
      process.env.ACTION_DIR || prod
        ? "/actions"
        : `${__dirname}/action/plugins`
  }
});

Object.assign(config.mongo, {
  url: `mongodb://${config.mongo.host}:${config.mongo.port}/${config.mongo.db}`
});

module.exports = config;
