const express = require("express"),
  bodyParser = require("body-parser"),
  { urlencoded, json } = require("body-parser"),
  app = express().use(bodyParser.json());
  
 
app.post("/webhook", (req, res) => {
	let body = req.body;
  
	console.log(`\u{1F7EA} Received webhook:`);
	console.dir(body, { depth: null });
	if (body.object === "page") {
		// Returns a '200 OK' response to all requests
		res.status(200).send("EVENT_RECEIVED");
	} else {

	}
});

app.get("/messaging-webhook", (req, res) => {
  
	// Parse the query params
	  let mode = req.query["hub.mode"];
	  let token = req.query["hub.verify_token"];
	  let challenge = req.query["hub.challenge"];
	
	  // Check if a token and mode is in the query string of the request
	  if (mode && token) {
		// Check the mode and token sent is correct
		if (mode === "subscribe" && token === config.verifyToken) {
		  // Respond with the challenge token from the request
		  console.log("WEBHOOK_VERIFIED");
		  res.status(200).send(challenge);
		} else {
		  // Respond with '403 Forbidden' if verify tokens do not match
		  res.sendStatus(403);
		}
	  }
	});





	function verifyRequestSignature(req, res, buf) {
		var signature = req.headers["x-hub-signature-256"];
	  
		if (!signature) {
		  console.warn(`Couldn't find "x-hub-signature-256" in headers.`);
		} else {
		  var elements = signature.split("=");
		  var signatureHash = elements[1];
		  var expectedHash = crypto
			.createHmac("sha256", config.appSecret)
			.update(buf)
			.digest("hex");
		  if (signatureHash != expectedHash) {
			throw new Error("Couldn't validate the request signature.");
		  }
		}
	  }















app.use(cors());

// app.post("/dimash", ( req, res) => {
//     const data = req.body.data;
//     NodeGoogleSheets('gefest.json', '1PL8ZJvqyhrbjFU71UDopAPqA7847Rq2yFIVEW6OcbbA', {append: 'door', 
//         change: [[data['name'], data['number'],  data['city'], data['message'], new Date]]}, (data) => {
//         console.log(data);
//     })
// });


app.post("/", ( req, res) => {
    const data = req.body.data;
    NodeGoogleSheets('gefest.json', '1ffP-WgroNDZAe_quSbANlUTocbL7JSpryuq5JZm-xY4', {append: 'BootcampIlyat', 
        change: [[data['name'], data['number'], data['age'], data['city'] new Date]]}, (data) => {
        console.log(data);
	res.json({ success: true, message: 'Data added successfully' });
    })
});

app.get("/", (req, res) => {
	res.json({ message: 'Hello World!' });
});

app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).json({ success: false, message: 'Internal Server Error' });
});


app.listen(port, () => {
	console.log(`Server is running on port ${port}`);
});




function NodeGoogleSheets(file, sheetId, keyMass, fun) {
	const auth = new google.auth.GoogleAuth({
		keyFile: file,
		scopes: "https://www.googleapis.com/auth/spreadsheets",
	});
	//
	(async () => {
		const client = await auth.getClient();
		//
		const googleSheets = google.sheets({ version: "v4", auth: client });
		//
		const spreadsheetId = sheetId;
		//
		const metaData = await googleSheets.spreadsheets.get({
			auth,
			spreadsheetId,
		});
		//
		const data = {
			auth,
			spreadsheetId,
			valueInputOption: "USER_ENTERED",
			resource: {
				values: keyMass.change,
			},
		}
		//
		if(keyMass.append) {
			data['range'] = keyMass.append;
			//
			const append = await googleSheets.spreadsheets.values.append(data);
			//
			fun(append);
		} else if(keyMass.values) {
			data['range'] = keyMass.values;
			//
			delete data.valueInputOption; delete data.resource;
			//
			const values = await googleSheets.spreadsheets.values.get(data);
			//
			fun(values); 
		} else if(keyMass.update) {
			data['range'] = keyMass.update;
			//
			const update = await googleSheets.spreadsheets.values.update(data);
			//
			fun(update);
		}
	})();
}
//
// NodeGoogleSheets('gefest.json', '1zaLPRFEvmWHo9X5h5g4m82OR-1054RRVcBw9pslhgvM', {append: 'betaList', 
// change: [['Ulan', 'Abdikadyr', '8 777 77 77 777']]}, (data) => {
// 	console.log(data);
// })
