var EventEmitter = require('events').EventEmitter,
    util = require('util'),
    spawn = require('child_process').spawn,
    MemoryStream = require('memorystream'),
    request = require('request'),
    fs = require('fs'),
    http = require('http');

var soundFilePath = "./recording.wav";

var Speakable = function Speakable(options) {
  EventEmitter.call(this);

//TODO: add default settings.
  options = options || {}

  this.writeStream = null;
  this.cmd = 'sox';
  this.cmdArgs = [
    '-q',
    '-c', '1',
    '-b','16',
    '-d',
    '-t','wav',
    'recording.wave',
    'rate','16000','channels','1',
    'silence','1','0.1',(options.threshold || '3')+'%','1','1.0',(options.threshold || '3')+'%'
  ];
};

util.inherits(Speakable, EventEmitter);

Speakable.prototype.recordVoice = function() {
  var self = this;

  var rec = spawn(self.cmd, self.cmdArgs);

  rec.stderr.setEncoding('utf8');
  rec.stderr.on('data', function(data) {
    console.log(data)
  });

  rec.on('close', function(code) {
    if(code) {
      self.emit('error', 'sox exited with code ' + code);
    }else{
      self.emit('speechStop',soundFilePath);
    }
  });
};

module.exports = Speakable;

