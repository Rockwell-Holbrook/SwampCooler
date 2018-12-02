var http = require('http').createServer(requestResponseHandler);
var fs = require('fs');
const path = require('path');
var io = require('socket.io')(http)                                         //require socket.io module and pass the http object (server)
const Gpio = require('onoff').Gpio;

const pump_output = new Gpio(9, 'out');
const fan_low_speed = new Gpio(10, 'out');
const fan_high_speed = new Gpio(11, 'out');

const pump_button = new Gpio(17, 'in', 'rising', {debounceTimeout: 10});
const fan_button = new Gpio(18, 'in', 'rising', {debounceTimeout: 10});

//----WEB SERVER STUFF ------------------------------------------------------------------------------------------------

http.listen(80);

function requestResponseHandler(request, response){
  console.log(`Request came: ${request.url}`);
  if(request.url === '/'){
    sendResponse('View/swampCooler.html', 'text/html', response)
  }else{
    sendResponse(request.url, getContentType(request.url), response);
  }
}

function sendResponse(url, contentType, res){
  let file = path.join(__dirname, url);
  fs.readFile(file, (err, content) => {
    if(err){
      res.writeHead(404);
      res.write(`File '${file}' Not Found!`);
      res.end();
      console.log("Response: 404 ${file}, err");
    }else{
      res.writeHead(200, {'Content-Type': contentType});
      res.write(content);
      res.end();
      console.log(`Response: 200 ${file}`);
    }
  })
}

function getContentType(url){
  switch (path.extname(url)) {
    case '.html':
      return 'text/html';
    case '.css':
      return 'text/css';
    case '.js':
      return 'text/javascript';
    case '.json':
      return 'application/json';
    default:
      return 'application/octate-stream';
  }
}

//---------------------------------------------------------------------------------------------------------------------

var fan_state = "off", pump_state = 0;

function change_fan_state_toggle() {

  if (fan_state == "off") {                               //If the fan is currently off,
    fan_high_speed.writeSync(0);                          //Make sure the high speed relay is off
    setTimeout(turn_fan_state_on("low"), 500);            //Wait 0.5 sec and turn on the low speed relay
  }
  if (fan_state == "low") {                               //if the fan is currently low,
    fan_low_speed.writeSync(0);                           //Make sure the low speed relay is off
    setTimeout(turn_fan_state_on("high"), 500);           //Wait 0.5 sec and turn on the high speed relay
  }
  if (fan_state == "high") {                              //if the fan is currently high,
    fan_high_speed.writeSync(0);                          //Make sure the high speed relay is off
    fan_low_speed.writeSync(0);                           //Also make sure the low speed relay is off
    fan_state = "off";                                    //set fan_state to the new current state
  }
}

function change_fan_state_directly(new_fan_state) {
  if (new_fan_state == 0) {
    fan_high_speed.writeSync(0);                          //Make sure the high speed relay is off
    fan_low_speed.writeSync(0);                           //Also make sure the low speed relay is off
    fan_state = "off";                                    //set fan_state to the new current state
  }
  if (new_fan_state == 1) {
    fan_high_speed.writeSync(0);                          //Make sure the high speed relay is off
    setTimeout(function() {turn_fan_state_on("low");}, 500); //Wait 1 sec and turn on the low speed relay
  }
  if (new_fan_state == 2) {
    fan_low_speed.writeSync(0);                           //Make sure the low speed relay is off
    setTimeout(function() {turn_fan_state_on("high")}, 500); //Wait 1 sec and turn on the high speed relay
  }
}


function change_pump_state_toggle() {
  pump_output.writeSync(pump_output.readSync() ^ 1);      //Read the current value of pump_output (either 0 or 1) and XOR it with 1 to toggle state
  pump_state = !pump_state;
}

function change_pump_state_directly(new_pump_state) {
  if (new_pump_state == "0") {
    pump_output.writeSync(0);
    pump_state = 0;
  }
  if (new_pump_state == "1") {
    pump_output.writeSync(1);
    pump_state = 1;
  }
}

function turn_fan_state_on(input_state) {                 //Helper function to turn fan relays on
  if (input_state == "low") {                             //required to be a separate function for timeout commands
    fan_low_speed.writeSync(1);                           //turns input relay on and updates the current fan state  
    fan_state = input_state;
  }
  else if (input_state == "high") {
    fan_high_speed.writeSync(1);
    fan_state = input_state;
  }
};


//----SOCKETS (WEB CONTROL) STUFF --------------------------------------------------------------------------------
io.sockets.on('connection', function (socket) {
  socket.emit('synchronize client', pump_state, fan_state);
  console.log("client connected, pump and fan state info sent");

  socket.on('pump_state_change', function(data) {                            //get new pump status from client
    change_pump_state_directly(data);
    console.log("Pump State: " + pump_state);
    socket.broadcast.emit('synchronize client', pump_state, fan_state);
  });

  socket.on('fan_state_change', function(data) {
    change_fan_state_directly(data);
    setTimeout(function() {console.log("Fan State: " + fan_state)}, 500); 
    setTimeout(function() {socket.broadcast.emit('synchronize client', pump_state, fan_state)}, 500);
  });

});

//---------------------------------------------------------------------------------------------------------------------



//----BUTTON PRESS (PHYSICAL CONTROL) STUFF ----------------------------------------------------------------------


function startState() {                               //startState resets all values to 0 (default)
  pump_output.writeSync(0);
  fan_low_speed.writeSync(0);
  fan_high_speed.writeSync(0);
  fan_state = "off";
  pump_state = 0;
}

pump_button.watch((err, value) => {                       //Pump Button Listener Function
  if (err) { throw err; }

  change_pump_state_toggle();
});

fan_button.watch((err, value) => {                        //When Fan Button is Pressed
  if (err) { throw err; }

  change_fan_state_toggle();
});