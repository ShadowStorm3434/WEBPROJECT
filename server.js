const express = require('express');
const axios = require('axios'); // Importing axios
const app = express();
const path = require('path');
const cors = require('cors');


app.use(express.static(path.join(__dirname, '../frontend'))); // Serve static files

app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, '../frontend/index.html'));
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));

app.use(cors());  // Enable CORS
app.use(express.json());  // Parse incoming JSON bodies

const URLSCAN_API_KEY = '0196540e-302f-7709-a1b2-efaaef0c1b84'; // Replace with your real API key

// Route to submit a scan request
app.post('/api/scan', async (req, res) => {
  const urlToScan = req.body.urlToScan;

  try {
    const response = await axios.post(
      'https://urlscan.io/api/v1/scan/',
      { url: urlToScan },
      {
        headers: {
          'API-Key': URLSCAN_API_KEY,
        },
      }
    );

    // Check if the scan started successfully and return the UUID
    if (response.data && response.data.uuid) {
      console.log('Scan initiated with UUID:', response.data.uuid);
      res.json({ uuid: response.data.uuid });
    } else {
      res.status(400).json({ error: 'Failed to start scan' });
    }
  } catch (error) {
    console.error('Scan request failed:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

// Route to get scan result using the UUID
app.get('/api/result/:uuid', async (req, res) => {
  const { uuid } = req.params;

  try {
    const response = await axios.get(`https://urlscan.io/api/v1/result/${uuid}/`, {
      headers: {
        'API-Key': URLSCAN_API_KEY,
      },
    });

    // Log the response to see if we're getting the result correctly
    console.log('Scan result response:', response.data);

    if (response.data) {
      res.json(response.data);
    } else {
      res.status(404).json({ error: 'Scan result not found' });
    }
  } catch (error) {
    console.error('Error fetching scan result:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

// Start the server
app.listen(3000, () => {
  console.log('Server running on http://localhost:3000');
});

