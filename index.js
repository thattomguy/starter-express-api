const express = require('express')
const app = express()
const axios = require('axios');
const { parseString, Builder } = require('xml2js');

// Signals from the Other Side endpoint
app.all('/signals', async (req, res) => {
    // console.log("Just got a request!")
    const url = 'https://podcasts.gtmanfred.com/podcasts/jasoncordova/podcast.xml';

    try {
        const response = await axios.get(url);
        const xmlData = response.data;

        parseString(xmlData, (err, result) => {
            if (err) {
                console.error('Error parsing XML:', err);
                return;
            }

            if (!result.rss || !result.rss.channel || !result.rss.channel[0].item) {
                console.error('Invalid XML format');
                return;
            }

            const filteredItems = result.rss.channel[0].item.filter(item =>
                item.title && item.title[0].includes('Signals from the Other Side')
            );

            result.rss.channel[0].item = filteredItems;

            const xmlBuilder = new Builder({ xmldec: { version: '1.0', encoding: 'UTF-8' } });
            const modifiedXml = xmlBuilder.buildObject(result);

            res.set('Content-Type', 'text/xml');
            res.send(modifiedXml);
        });
    } catch (error) {
        console.error('Error fetching XML:', error);
        res.status(500).send('Error fetching XML.');
    }
})
app.listen(process.env.PORT || 3000)