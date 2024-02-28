const express = require('express');
const cors = require('cors');
const { google } = require("googleapis");
const app = express();
const port = 3000;

app.use(express.json());
app.use(cors());




app.post("/", ( req, res) => {
    const data = req.body.data;
    NodeGoogleSheets('gefest.json', '1ffP-WgroNDZAe_quSbANlUTocbL7JSpryuq5JZm-xY4', {append: 'BootcampIlyat', 
        change: [[data['firstName'], data['email'], data['number'], new Date]]}, (data) => {
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
