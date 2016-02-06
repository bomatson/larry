showInfo('info_start');
var final_transcript = '';
var recognizing = false;
var ignore_onend;
var start_timestamp;

if (!('webkitSpeechRecognition' in window)) {
  upgrade();
} else {
  start_button.style.display = 'inline-block';
  var recognition = new webkitSpeechRecognition();
  recognition.continuous = false;
  recognition.interimResults = true;
  recognition.onstart = function() {
    recognizing = true;
    showInfo('info_speak_now');
    start_img.src = 'mic-animate.gif';
  };
  recognition.onerror = function(event) {
    if (event.error == 'no-speech') {
      start_img.src = 'mic.gif';
      showInfo('info_no_speech');
      ignore_onend = true;
    }
    if (event.error == 'audio-capture') {
      start_img.src = 'mic.gif';
      showInfo('info_no_microphone');
      ignore_onend = true;
    }
    if (event.error == 'not-allowed') {
      if (event.timeStamp - start_timestamp < 100) {
        showInfo('info_blocked');
      } else {
        showInfo('info_denied');
      }
      ignore_onend = true;
    }
  };
  recognition.onend = function() {
    recognizing = false;
    if (ignore_onend) {
      return;
    }
    start_img.src = 'mic.gif';
    if (!final_transcript) {
      showInfo('info_start');
      return;
    }

    // ************************************************/
    //console.log(final_transcript);
    var millis = new Date().getMilliseconds();
    if((millis%3)==0){
      var responses = ["NO I don't feel like it","Fuck you","Nope not doing that","Hey have you tried this game called Boom Beach it's pretty amazing","Maybe not, but I could really use me a soilent dick right now"];
      respond(responses[Math.floor(Math.random() * responses.length)]);
    } else {
      findAnswerTo(final_transcript);
    }

    showInfo('');
    if (window.getSelection) {
      window.getSelection().removeAllRanges();
      var range = document.createRange();
      range.selectNode(document.getElementById('final_span'));
      window.getSelection().addRange(range);
    }
  };
  recognition.onresult = function(event) {
    console.log(event)
    var interim_transcript = '';
    // if(event.resultIndex > 0) {
    //   recognizing = false;
    //   console.log('IM DONE')
    //   recognition.stop();
    // }
    for (var i = event.resultIndex; i < event.results.length; ++i) {
      if (event.results[i].isFinal) {
        final_transcript += larry_parse(event.results[i][0].transcript);
      } else {
        interim_transcript += larry_parse(event.results[i][0].transcript);
      }
    }
    final_transcript = capitalize(final_transcript);
    final_span.innerHTML = linebreak(final_transcript);
    interim_span.innerHTML = linebreak(interim_transcript);
    if (final_transcript || interim_transcript) {
      showButtons('inline-block');
    }
  };
}
function larry_parse(text_in) {
  var text_split = text_in.split(" ");
  var text_out = "";

  var additions = ["shit","stupid","helpful","crap"];
  
  for(var i=0; i<text_split.length; i++){
    text_out += text_split[i]+" ";
    //text_out += text_split[i] + " " + additions[Math.floor(Math.random() * additions.length)] + " ";
  }

  return text_out;
}
function upgrade() {
  start_button.style.visibility = 'hidden';
  showInfo('info_upgrade');
}
var two_line = /\n\n/g;
var one_line = /\n/g;
function linebreak(s) {
  return s.replace(two_line, '<p></p>').replace(one_line, '<br>');
}
var first_char = /\S/;
function capitalize(s) {
  return s.replace(first_char, function(m) { return m.toUpperCase(); });
}
function copyButton() {
  if (recognizing) {
    recognizing = false;
    recognition.stop();
  }
  copy_button.style.display = 'none';
  copy_info.style.display = 'inline-block';
  showInfo('');
}
function startButton(event) {
  if (recognizing) {
    recognition.stop();
    return;
  }
  final_transcript = '';
  recognition.start();
  ignore_onend = false;
  final_span.innerHTML = '';
  interim_span.innerHTML = '';
  start_img.src = 'mic-slash.gif';
  showInfo('info_allow');
  showButtons('none');
  /* start_timestamp = event.timeStamp; */
}
function showInfo(s) {
  if (s) {
    for (var child = info.firstChild; child; child = child.nextSibling) {
      if (child.style) {
        child.style.display = child.id == s ? 'inline' : 'none';
      }
    }
    info.style.visibility = 'visible';
  } else {
    info.style.visibility = 'hidden';
  }
}
var current_style;
function showButtons(style) {
  if (style == current_style) {
    return;
  }
  current_style = style;
  copy_button.style.display = style;
  copy_info.style.display = 'none';
}

function findAnswerTo(text) {
  function reqListener () {
    var response = JSON.parse(this.response);
    var text = response.output[0].actions.say.text;
    var send;

    if (text)
      send = text;
    else
      send = "Sure. I'm LARRY!"
    respond(send);
  }

  var requestText = text.replace(' ' , '+');
  var oReq = new XMLHttpRequest();
  oReq.addEventListener("load", reqListener);
  oReq.open("GET", "https://jeannie.p.mashape.com/api?input="+text+"&locale=en&page=1&timeZone=%2B120");
  oReq.setRequestHeader("X-Mashape-Key", "fyZW6PH24XmshnvJjBR5BZtQVlo3p1imUVajsnQU3DYTfLKUN6")
  oReq.setRequestHeader("Accept", "application/json")
  oReq.send();
}

function respond(text) {
  var msg = new SpeechSynthesisUtterance(text);
  var voice;

  window.speechSynthesis.onvoiceschanged = function() {
    var voices = window.speechSynthesis.getVoices();
    voice = voices[21];
    msg.voice = voice;
  }

  msg.volume = 1; // 0 to 1
  msg.rate = 0.68; // 0.1 to 10
  msg.pitch = 0.78; //0 to 2
  msg.lang = 'en-US';

  msg.onend = function(event) {
    startButton()
    console.log('Finished in ' + event.elapsedTime + ' seconds.');
  };

  console.log(msg)
  window.speechSynthesis.speak(msg);
}
startButton()
