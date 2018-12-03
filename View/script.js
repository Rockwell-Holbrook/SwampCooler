      var socket = io(); //load socket.io-client and connect to the host that serves the page

      $( document ).ready(function() {
      	console.log("We need to add a GET request here to a server running on the pi to tell current temp and timestamp");
      });

      $("#pump_on").click(function() {
        pump_new_state = 1;
		console.log("pump_new_state = " + pump_new_state);
	
        socket.emit("pump_state_change", pump_new_state);

		$("#pump_on").addClass("bttn-primary");
		$("#pump_off").removeClass("bttn-primary");
      });

      $("#pump_off").click(function() {
        pump_new_state = 0;
		console.log("pump_new_state = " + pump_new_state);
	
        socket.emit("pump_state_change", pump_new_state);

		$("#pump_off").addClass("bttn-primary");
		$("#pump_on").removeClass("bttn-primary");
      });

      $("#fan_low").click(function() {
        fan_new_state = "low";
		console.log("fan_new_state = " + fan_new_state);
	
        socket.emit("fan_state_change", 1); 

		$("#fan_low").addClass("bttn-primary");
		$("#fan_off").removeClass("bttn-primary");
		$("#fan_high").removeClass("bttn-primary");

      });

       $("#fan_high").click(function() {
        fan_new_state = "high";
		console.log("fan_new_state = " + fan_new_state);
	
        socket.emit("fan_state_change", 2); 

		$("#fan_high").addClass("bttn-primary");
		$("#fan_off").removeClass("bttn-primary");
		$("#fan_low").removeClass("bttn-primary");

       });

       $("#fan_off").click(function() {
        fan_new_state = "off";
		console.log("fan_new_state = " + fan_new_state);
	
        socket.emit("fan_state_change", 0); 

		$("#fan_off").addClass("bttn-primary");
		$("#fan_high").removeClass("bttn-primary");
		$("#fan_low").removeClass("bttn-primary");

       });



      socket.on('synchronize client', function(pump_state, fan_state, json_data) {
      	if (pump_state == 1) {
      		$("#pump_on").addClass("bttn-primary");
			$("#pump_off").removeClass("bttn-primary");
      	}
      	else if (pump_state == 0) {
      		$("#pump_off").addClass("bttn-primary");
			$("#pump_on").removeClass("bttn-primary");
      	}
      	else {
      		$("#pump_on").removeClass("bttn-primary");
      		$("#pump_off").removeClass("bttn-primary");
      	}


      	if (fan_state == 0) {
      		$("#fan_off").addClass("bttn-primary");
			$("#fan_low").removeClass("bttn-primary");
			$("#fan_high").removeClass("bttn-primary");
      	}
      	else if (fan_state == 1) {
      		$("#fan_off").removeClass("bttn-primary");
			$("#fan_low").addClass("bttn-primary");
			$("#fan_high").removeClass("bttn-primary");
      	}
      	else if (fan_state == 2) {
      		$("#fan_off").removeClass("bttn-primary");
			$("#fan_low").removeClass("bttn-primary");
			$("#fan_high").addClass("bttn-primary");
      	}
      	else {
      		$("#fan_off").removeClass("bttn-primary");
			$("#fan_low").removeClass("bttn-primary");
			$("#fan_high").removeClass("bttn-primary");
      	}

      	//$("#current_temp").text = jsonData[0].temp;
      	//$("#timestamp").text = jsonData[0].temp;

      });