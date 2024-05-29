const express = require("express");
const bodyParser = require("body-parser");
const cors = require("cors");
const { google } = require("googleapis");

const app = express();
const port = 3000;

// Настройка CORS
app.use(cors({
  origin: 'https://accessible-others-000198.framer.app',
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Origin', 'X-Requested-With', 'Content-Type', 'Accept']
}));

app.use(bodyParser.json());

app.post("/", (req, res) => {
  const data = req.body.data;
  NodeGoogleSheets('gefest.json', '1COhLngcTL7CMx0Mc6Tvrud3NqxNShKQISaBAv4DZxQw', {
    append: 'city',
    change: [[data['name'], data['email'], data['number'], data['apartment'], data['time'], new Date()]]
  }, (result) => {
    console.log(result);
    res.json({ success: true, message: 'Data added successfully' });
  });
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

  (async () => {
    try {
      const client = await auth.getClient();
      const googleSheets = google.sheets({ version: "v4", auth: client });
      const spreadsheetId = sheetId;

      const data = {
        auth,
        spreadsheetId,
        valueInputOption: "USER_ENTERED",
        resource: {
          values: keyMass.change,
        },
      };

      if (keyMass.append) {
        data['range'] = keyMass.append;
        const append = await googleSheets.spreadsheets.values.append(data);
        fun(append);
      } else if (keyMass.values) {
        data['range'] = keyMass.values;
        delete data.valueInputOption;
        delete data.resource;
        const values = await googleSheets.spreadsheets.values.get(data);
        fun(values);
      } else if (keyMass.update) {
        data['range'] = keyMass.update;
        const update = await googleSheets.spreadsheets.values.update(data);
        fun(update);
      }
    } catch (error) {
      console.error('Error accessing Google Sheets:', error);
      fun({ error });
    }
  })();
}
