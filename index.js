const express = require('express');
const request = require('request');
const bodyParser = require('body-parser');

const { getCampground } = require('./campy');

const CLIENTID = '429006506085.557284316289';
const CLIENTSECRET = 'ef2706efc58a636071b44777a46c99a5';
const PORT = 4390;

// Instantiates Express and assigns our app variable to it
let app = express();

app.use(bodyParser.json()); 
app.use(bodyParser.urlencoded({ extended: true })); 

app.listen(PORT, () => {
    console.log(`App Listening on port ${ PORT }`);
});

app.get('/', (req, res) => {
    res.send(`Ngrok is working! Path Hit: ${ req.url }`);
});

// handles get reqests to a /oauth endpoint.
// for handling the logic of the Slack oAuth process behind our app.
app.get('/oauth', (req, res) => {
    // When a user authorizes an app, a code query parameter is passed on the oAuth endpoint
    // If that code is not there, we respond with an error message
    if (!req.query.code) {
        res.status(500);
        res.send({"Error": "Looks like we're not getting code."});
        console.log("Looks like we are not getting code.");
    } else {
        // If code is there, we'll do a GET call to Slack's `oauth.access` endpoint, passing our app's client ID, client secret, and the code we just got as query parameters.
        request({
            url: 'https//slack.com/api/oauth.access',
            qs: {   // query string data
                    code: req.query.code,
                    client_id: CLIENTID,
                    client_secret: CLIENTSECRET
                },
            method: 'GET'
        }, (err, res, body) => {
            if (err) {
                console.log(err);
            } else {
                res.json(body);
            }
        });
    }
});

app.post('/checkngrok', (req, res) => {
    res.send('Your ngrok tunnel is up and running!');
});

app.post('/campgrounds', async (req, res) => {
    res.status(200);
    res.send("Finding available campgrounds for you...")

    let rs = await getCampground(req.body.text);

    let text = rs
                ? `Found your next adventure: <https://www.google.com/search?q=${ rs.facilityName.replace(/ /g, '+') }|${ rs.facilityName }>`
                : 'Unable to find anything available, please try again';

    request({
        url: req.body.response_url,
        body: {
            type: 'mrkdwn',
            text
        },
        json: true,
        method: 'POST'
    }, (err, res, body) => {
        if (err) {
            console.log(err);
        }
    });

    console.log(rs);
});
