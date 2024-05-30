const express = require("express");
const crypto = require("crypto");
const cors = require("cors");
const { google } = require("googleapis");

const app = express();
const port = 3000;

app.use(express.json());
app.use(cors());

function decrypt(text, key, iv) {
	const decipher = crypto.createDecipheriv('aes-256-cbc', Buffer.from(key, 'hex'), Buffer.from(iv, 'hex'));
	let decrypted = decipher.update(text, 'base64', 'utf8');
	decrypted += decipher.final('utf8');
	return decrypted;
}

app.listen(port, () => {
	console.log(`Server is running on port ${port}`);
});

app.get("/", (req, res) => {
	res.json({ message: 'Hello World!' });
});

app.post("/", (req, res) => {
	const { data: encryptedData, key, iv } = req.body;

	try {
        const decryptedData = decrypt(encryptedData, key, iv);
        const parsedData = JSON.parse(decryptedData);
		NodeGoogleSheets('gefest.json', '1COhLngcTL7CMx0Mc6Tvrud3NqxNShKQISaBAv4DZxQw', {
			append: 'city',
			change: [[parsedData['name'], parsedData['email'], parsedData['number'], parsedData['apartment'], parsedData['time'], new Date()]]
		}, (result) => {
			console.log(result);
			res.json({ success: true, message: 'Data added successfully' });
		});

    } catch (error) {
        console.error("Error decrypting data:", error);
        res.status(400).send('Failed to decrypt data');
    }
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
// //
// NodeGoogleSheets('google_file.json', '1PMlOeHs1H2E1v7pk7OSVYBSk1dozcbBR5rIuokAscYs', {append: 'list',
// change: [['Привет', 'Как дела?']]}, (data) => {
// 	console.log(data);
// })