/**
 * PUSH Notification server V 0.2
 * (c) Telefonica Digital, 2012 - All rights reserver
 * Fernando Rodríguez Sela <frsela@tid.es>
 * Guillermo Lopez Leal <gll@tid.es>
 */

var dgram = require('dgram');

function connector_udp(data,conn) {
  this.data = data;
  this.connection = conn;
  this.connection.close();
}

connector_udp.prototype = {
  notify: function(msgList) {
    // Notify the hanset with the associated Data
    console.log("Connector UDP: Notify to " + this.data.iface.ip);

    // UDP Notification Message
    var message = new Buffer("NOTIFY " + JSON.stringify(msgList));
    var client = dgram.createSocket("udp4");
    client.send(message, 0, message.length, this.data.iface.port, this.data.iface.ip, function(err, bytes) {
      client.close();
    });
  }
}

exports.connector_udp = connector_udp;