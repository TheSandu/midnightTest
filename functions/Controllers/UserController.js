const admin = require('firebase-admin');
const serviceAccount = require('../serviceAccountKey.json');

admin.initializeApp({
    credential: admin.credential.cert(serviceAccount)
});

const db = admin.firestore();

class UserController {

    constructor() {
        this.collection = db.collection('users');
    }

    async getUser( username, password ) {
        const usersSnapshot = await this.collection.where('username', '==', username)
                                                   .where('password', '==', password).limit(1).get();

        if( usersSnapshot.empty )
            return undefined;

        return usersSnapshot.docs.pop().data()
    }

    async addUser( data ) {
        let userRef = await this.collection.add(data);
        return userRef.id;
    }
}

module.exports.UserController = UserController;