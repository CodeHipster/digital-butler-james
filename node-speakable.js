var EventEmitter = require('events').EventEmitter,
    util = require('util'),
    spawn = require('child_process').spawn,
    http = require('http');

var Speakable = function Speakable(options) {
  EventEmitter.call(this);

  options = options || {}

  this.recBuffer = [];
  this.recRunning = false;
  this.apiResult = {};
  this.apiLang = options.lang || "en-US";
  this.cmd = 'sox';
  this.cmdArgs = [
    '-q',
    '-b','16',
    '-d','-t','flac','-',
    'rate','16000','channels','1',
    'silence','1','0.1',(options.threshold || '0.1')+'%','1','1.0',(options.threshold || '0.1')+'%'
  ];

};

util.inherits(Speakable, EventEmitter);
module.exports = Speakable;

Speakable.prototype.recordVoice = function() {
  var self = this;

  var rec = spawn(self.cmd, self.cmdArgs);

  // Process stdout

  rec.stdout.on('readable', function() {
    self.emit('speechReady');
  });

  rec.stdout.setEncoding('binary');
  rec.stdout.on('data', function(data) {
    if(! self.recRunning) {
      self.emit('speechStart');
      self.recRunning = true;
    }
    self.recBuffer.push(data);
  });

  // Process stdin

  rec.stderr.setEncoding('utf8');
  rec.stderr.on('data', function(data) {
    console.log(data)
  });

  rec.on('close', function(code) {
    self.recRunning = false;
    if(code) {
      self.emit('error', 'sox exited with code ' + code);
    }
    self.emit('speechStop');
  });
};

Speakable.prototype.resetVoice = function() {
  var self = this;
  self.recBuffer = [];
}

Speakable.prototype.parseResult = function() {
  var recognizedWords = [], apiResult = this.apiResult;
  if(apiResult.hypotheses && apiResult.hypotheses[0]) {
    recognizedWords = apiResult.hypotheses[0].utterance.split(' ');
    this.emit('speechResult', recognizedWords);
  } else {
    this.emit('speechResult', []);
  }
}
