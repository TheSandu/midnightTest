const fetch = require("node-fetch");

const functions = require('firebase-functions');
const admin = require('firebase-admin');

const { validateEmail } = require("./utils");
const config = require("./config.json");
const serviceAccount = require('./serviceAccountKey.json');

admin.initializeApp({
    credential: admin.credential.cert(serviceAccount)
});

const db = admin.firestore();

exports.register = functions.https.onRequest(async (request, response) => {

    if( request.method !== "POST") {
        response.status(403).send('Error: Bad request');
        return;
    }

    let { username, password, name, email } = request.body;

    if( username === undefined || password === undefined || name === undefined || email === undefined ) {
        response.status(403).send('Error: No data');
        return;
    }

    if( !validateEmail( email ) ) {
        response.status(403).send('Error: Bad email');
        return;
    }

    let userRef = await db.collection("users").add({
        username: username,
        password: password,
        name: name,
        email: email
    });

    if( !userRef.id ) {
        response.status(403).send('Error: User not added');
        return;
    }

    response.status(500).send( `Success: UserId ${userRef.id}` );
});