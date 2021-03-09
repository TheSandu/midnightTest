const fetch = require("node-fetch");

const functions = require('firebase-functions');
const admin = require('firebase-admin');

const { validateEmail, getToken, getDataFromToken } = require("./utils");
const config = require("./config.json");
const serviceAccount = require('./serviceAccountKey.json');

admin.initializeApp({
    credential: admin.credential.cert(serviceAccount)
});

const db = admin.firestore();

exports.register = functions.https.onRequest(async (request, response) => {

    if( request.method !== "POST") {
        response.status(403).json({status:"Error", message: 'RegisterService Error: Bad request'});
        return;
    }

    let { username, password, name, email } = request.body;

    if( username === undefined || password === undefined || name === undefined || email === undefined ) {
        response.status(403).json({status:"Error", message: 'RegisterService Error: No data'});
        return;
    }

    if( !validateEmail( email ) ) {
        response.status(403).json({status:"Error", message: 'RegisterService Error: Bad email'});
        return;
    }

    let userRef = await db.collection("users").add({
        username: username,
        password: password,
        name: name,
        email: email
    });

    if( !userRef.id ) {
        response.status(403).json({status:"Error", message: 'RegisterService Error: User not added'});
        return;
    }

    response.status(500).json({status: "Success", message: `Success: UserId ${userRef.id}`});
});

exports.login = functions.https.onRequest(async (request, response) => {

    if( request.method !== "POST") {
        response.status(403).json({status:"Error", message: 'LoginService Error: Bad request'});
        return;
    }

    let token = request.headers['authorization'];

    let { username, password } = token ? await getDataFromToken( token ) : request.body;

    if( username === undefined || password === undefined ) {
        response.status(403).json({status:"Error", message: 'LoginService Error: No username of password'});
        return;
    }

    const usersRef = db.collection('users');
    const usersSnapshot = await usersRef.where('username', '==', username)
                                        .where('password', '==', password).limit(1).get();

    if (usersSnapshot.empty) {
        response.status(403).json({status:"Error", message: 'LoginService Error: User not found'});
        return;
    }

    let user = usersSnapshot.docs.pop().data();

    response.status(500).json({status:"Succes", user: user});
});

// Can be some issues with functions becouse of proxy server, can test it fast sorry
exports.userData = functions.https.onRequest(async (request, response) => {

    const ip = request.headers['x-forwarded-for'] || request.connection.remoteAddress;

    if( !ip ) {
        response.status(403).json({status:"Error", message: 'UserDataService Error: Ip undefined'});
        return;
    }

    const userInfo = await fetch(`https://geo.ipify.org/api/v1?apiKey=${config.ipifyAPIKey}&ipAddress=${ip}`);
    const data = await userInfo.json();

    if( data.hasOwnProperty('code') && data.code !== 500 ) {
        response.status(403).json({status:"Error", message: `UserDataService Error: ${data.messages}`});
        return;
    }

    response.status(500).json({status:"Success", ...data});
});