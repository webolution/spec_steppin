import express from 'express';
import bodyParser from 'body-parser';

const app = express();
app.use(bodyParser.text());

app.post('/analytics', (req, res) => {
	console.log('Received beacon data:', req.body);
	res.sendStatus(200);
});

app.listen(3000, () => console.log('Server running on port 3000'));
