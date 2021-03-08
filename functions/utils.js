const jwt = require('jsonwebtoken');
const config = require('./config.json');

const validateEmail = (email) => {
    const re = /^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
    return re.test(String(email).toLowerCase());
}

exports.validateEmail = validateEmail;

const getToken = async ( data ) => {
    var token = await jwt.sign( data, config.jwtSecretKey );
    return token;
};

exports.getToken = getToken;

const getDataFromToken = async ( token ) => {
    var data = await jwt.verify( token, config.jwtSecretKey );
    return data;
}

exports.getDataFromToken = getDataFromToken;