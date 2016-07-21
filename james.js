var witToken = "ITFQFWF2B2RPTC473JQG2SK7ITX7UZ3S";
 
var Speakable = require('./node-speakable'),
    request = require('request'),
    fs = require('fs');



var speakable = new Speakable();

speakable.on('speechStart', function() {
  console.log('onSpeechStart');
});

speakable.on('speechStop', function(soundFileStream) {
  console.log('onSpeechStop');
  var source = fs.createReadStream('./recording.wave');

  source.pipe(request.post(  
    {
      url: 'https://api.wit.ai/speech', //URL to hit
      qs: {}, //Query string data
      method: 'POST', //Specify the method
      headers: { //We can define headers too
          'Authorization': 'Bearer ' + process.env.WITAITOKEN,
          'Content-Type': 'audio/wav',
          'Transfer-encoding': 'chunked'
      }
    }, 
    function(error, response, body){
      if(error) {
        console.log(error);
      } else {
        console.log(response.statusCode, body);
      }
    }
  ));
  //speakable.recordVoice();
});

speakable.on('speechReady', function() {
  console.log('onSpeechReady');
});

speakable.on('error', function(err) {
  console.log('onError:');
  console.log(err);
  //speakable.recordVoice();
});

speakable.recordVoice();
