const functions = require('firebase-functions');

// Firebase database functionality
const admin = require('firebase-admin');
// We need to enable cors functionality
const cors = require('cors')({origin: true});

admin.initializeApp();

/**************************/
/*        addUser         */
/**************************/

exports.addUser = functions.https.onRequest((req, res) => {
  const first_name = req.query.first_name;
  const last_name = req.query.last_name;
  const date_of_birth = req.query.dob;

  const userRef = admin.database().ref('user');
  userRef.push().set({
    'first_name': first_name,
    'last_name': last_name,
    'date_of_birth': date_of_birth,
  });

  return res.status(200).send('OK');
});

/**************************/
/*       authUser         */
/**************************/

exports.authUser = functions.https.onRequest((req, res) => {
  cors(req, res, () => {
    const first_name = req.query.first_name;
    const last_name = req.query.last_name;
    const date_of_birth = req.query.dob;

    const query = admin.database().ref('user');
    let userId = '';

    return query.once('value')
      .then((snapshot) => {
        // iterate through all the entries
        snapshot.forEach(entry => {
          if(entry.child('date_of_birth').val() === date_of_birth
            &&
            entry.child('first_name').val() === first_name
            &&
            entry.child('last_name').val() === last_name
          ) {
            return res.status(200).send({'id': entry.key});
          }
        });

        // return 422 if cannot find given user
        return res.status(422).send({'message': 'Fail to auth given user'});
      }).catch(error => {
        // return 422 for any other reason
        return res.status(422).send({'message': 'Fail to auth given user'});
      });
  });
});

/**************************/
/*       getUserId        */
/**************************/

exports.getUserId = functions.https.onRequest((req, res) => {
  cors(req, res, () => {
    const first_name = req.query.first_name;
    const last_name = req.query.last_name;
    const date_of_birth = req.query.dob;

    const query = admin.database().ref('user');
    let userId = '';

    return query.once('value')
      .then(snapshot => {
        // iterate through all the entries
        snapshot.forEach((entry) => {
          if(entry.child('date_of_birth').val() === date_of_birth
            &&
            entry.child('first_name').val() === first_name
            &&
            entry.child('last_name').val() === last_name
          ) {
            return res.status(200).send({'id': entry.key});
          }
        });

        // return 422 if cannot find given user
        return res.status(422).send({'message': 'Fail to get user id'});
      }).catch(error => {
        // return 422 for any other reason
        return res.status(422).send({'message': 'Fail to get user id'});
      });
  });
});

/**************************/
/*      getUserInfo       */
/**************************/

exports.getUserInfo = functions.https.onRequest((req, res) => {
  cors(req, res, () => {
    const userId = req.query.user_id;

    const getUserInfo = admin.database().ref('user').child(userId);
    getUserInfo.once('value')
      .then(snapshot => {
        // check whether user id exits
        if(!snapshot.exists()) {
          return res.status(422).send({'message': 'User id not found'});
        }
        return res.status(200).send(snapshot.toJSON());
      }).catch(error => {
        res.status(422).send({'message': 'Fail to get user info'});
      });
  });
});

