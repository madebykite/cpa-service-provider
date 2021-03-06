"use strict";

exports.db = {
  host: '',
  port: 3306,
  user: '',
  password: '',
  type: '',
  database: '',

  // Database filename for SQLite
  filename: '',

  // For debugging, log SQL statements to the console
  debug: true
};

exports.authorization_provider = {
  name:              "Example AP",
  authorization_uri: "https://ap.example.com/authorized",
  base_uri:          "https://ap.example.com",
  modes:             ["client", "user"]
};

exports.service_provider = {
  name:   process.env.SERVICE_PROVIDER_ID || "STATION_NAME",
  scope:  "https://sp.example.com/"
};
