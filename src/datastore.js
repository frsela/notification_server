/**
 * PUSH Notification server V 0.2
 * (c) Telefonica Digital, 2012 - All rights reserver
 * Fernando Rodríguez Sela <frsela@tid.es>
 * Guillermo Lopez Leal <gll@tid.es>
 */

var redis = require("redis");
var mongodb = require("mongodb");
var server_info = require("./config.js").server_info;

function datastore() {
  console.log("MONGO/REDIS based data store loaded.");

  // In-Memory storage
  this.nodesTable = {};

  // Connection to REDIS
  this.redis = redis.createClient();

  // Connection to MongoDB
  this.db = new mongodb.Db(
    "push_notification_server",
    new mongodb.Server(
      "127.0.0.1",
      27017,
      {auto_reconnect: true, poolSize: 4}
    ),
    {native_parser: false}
  );

  // Establish connection to db
  this.db.open(function(err, db) {
    if(err == null) {
      console.log("Connected to MongoDB !");
    } else {
      console.log("Error connecting to MongoDB !");
      // TODO: Cierre del servidor? Modo alternativo?
    }
  });
}

datastore.prototype = {
  /**
   * Register a new node. As a parameter, we receive the connector object
   */
  registerNode: function (token, connector) {
    if(this.nodesTable[token]) {
      console.log("Removing old node token " + token);
      delete(this.nodesTable[token]);
    }

    // Register a new node
    this.nodesTable[token] = connector;

    // Register in REDIS that this server manages this node
    this.redis.set("node_" + token, server_info.id);

    // Register in MONGO that this server manages this node
    this.db.collection("nodes", function(err, collection) {
      collection.insert( { 'token': token, 'serverId': server_info.id }, function(err,d) {
        if(err != null)
          console.log("Node inserted into MongoDB");
        else
          console.log("Error inserting node into MongoDB");
      });
    });
  },

  /**
   * Gets a node connector
   */
  getNode: function (token) {
    if(this.nodesTable[token]) {
      return this.nodesTable[token];
    }
    return false;
  },

  // TODO: Verify that the node exists before add the application
  /**
   * Register a new application
   */
  registerApplication: function (appToken, nodeToken) {
    // Store in REDIS
    this.redis.sadd("app_" + appToken, nodeToken);

    // Store in MongoDB
    this.db.collection("apps", function(err, collection) {
      collection.insert( { 'token': appToken, 'node': nodeToken }, function(err,d) {
        if(err != null)
          console.log("Application inserted into MongoDB");
        else
          console.log("Error inserting application into MongoDB");
      });
    });

  },

  /**
   * Gets an application node list
   */
  getApplication: function (token, cbfunc) {
    // Get from REDIS
    this.redis.smembers("app_" + token, cbfunc);

    // Get from MongoDB
    // TODO
  }
}

///////////////////////////////////////////
// Singleton
///////////////////////////////////////////
var ds = new datastore();
function getDataStore() {
  return ds;
}

exports.getDataStore = getDataStore;
