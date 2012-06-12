/**
 * PUSH Notification server V 0.2
 * (c) Telefonica Digital, 2012 - All rights reserver
 * Fernando Rodríguez Sela <frsela@tid.es>
 * Guillermo Lopez Leal <gll@tid.es>
 */

var redis = require("redis");
var server_info = require("./config.js").server_info;

function datastore() {
  console.log("REDIS based data store loaded.");

  this.redis = redis.createClient();
  this.nodesTable = {};
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
    this.redis.set("node_" + token, server_info.key);
  },

  /**
   * Gets a node connector
   */
  getNode: function (token) {
    console.log("Server: " + this.redis.get("node_" + token));
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
    this.redis.sadd("app_" + appToken, nodeToken);
  },

  /**
   * Gets an application node list
   */
  getApplication: function (token) {
    this.redis.smembers("app_" + token, function(err, replies) {
        console.log(replies.length + " replies:");
        replies.forEach(function (reply, i) {
            console.log("    " + i + ": " + reply);
        });
    });
/*
    if(this.appsTable[token]) {
      return this.appsTable[token];
    }
    return false;    
  }
*/
    return false;
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
