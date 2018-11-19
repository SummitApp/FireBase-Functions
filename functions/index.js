const functions = require('firebase-functions');

// Firebase database functionality
const admin = require('firebase-admin');
// We need to enable cors functionality
const cors = require('cors')({origin: true});

admin.initializeApp();

// ============ User Functions ===============

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

  return cors(req, res, () => {
    res.status(200).send('OK');
  });
});

/**************************/
/*       authUser         */
/**************************/

exports.authUser = functions.https.onRequest((req, res) => {
  const first_name = req.query.first_name;
  const last_name = req.query.last_name;
  const date_of_birth = req.query.dob;

  const query = admin.database().ref('user');

  query.once('value')
    .then((snapshot) => {
      let userId;

      // iterate through all the entries
      snapshot.forEach(entry => {
        if(entry.child('date_of_birth').val() === date_of_birth
          &&
          entry.child('first_name').val() === first_name
          &&
          entry.child('last_name').val() === last_name
        ) {
          userId = entry.key;
        }
      });

      // return user id if given user is found
      if(userId) {
        return cors(req, res, () => {
          res.status(200).send({'id': userId});
        });
      }

      // return 422 if cannot find given user
      return cors(req, res, () => {
        res.status(422).send({'message': 'Fail to auth given user'});
      });
    }).catch(error => {
      // return 422 for any other reason
      return cors(req, res, () => {
        res.status(422).send({'message': 'Fail to auth given user'});
      });
    });
});

/**************************/
/*       getUserId        */
/**************************/

exports.getUserId = functions.https.onRequest((req, res) => {
  const first_name = req.query.first_name;
  const last_name = req.query.last_name;
  const date_of_birth = req.query.dob;

  const query = admin.database().ref('user');

  query.once('value')
    .then(snapshot => {
      let userId;

      // iterate through all the entries
      snapshot.forEach((entry) => {
        // check all entries
        if(entry.child('date_of_birth').val() === date_of_birth
          &&
          entry.child('first_name').val() === first_name
          &&
          entry.child('last_name').val() === last_name
        ) {
          userId = entry.key;
        }
      });

      // return user id if user is valid
      if(userId) {
        return cors(req, res, () => {
          res.status(200).send({'id': userId});
        });
      }

      // return 422 if cannot find given user
      return cors(req, res, () => {
        res.status(422).send({'message': 'Fail to get user id'});
      });
    }).catch(error => {
      // return 422 for any other reasons
      return cors(req, res, () => {
        res.status(422).send({'message': 'Fail to get user id'});
      });
    });
});

/**************************/
/*      getUserInfo       */
/**************************/

exports.getUserInfo = functions.https.onRequest((req, res) => {
  const userId = req.query.user_id;

  // Prevent injection
  if(userId === '/') {
    return cors(req, res, () => {
      res.status(422).send({'message': 'User id not found'});
    });
  }

  const getUserInfo = admin.database().ref('user').child(userId);
  return getUserInfo.once('value')
    .then(snapshot => {
      // check whether user id exits
      if(!snapshot.exists()) {
        return cors(req, res, () => {
          res.status(422).send({'message': 'User id not found'});
        });
      }

      // return all user informations
      return cors(req, res, () => {
        res.status(200).send(snapshot.toJSON());
      });
    }).catch(error => {
      return cors(req, res, () => {
        res.status(422).send({'message': 'Fail to get user info'});
      });
    });

});

// fetch all user names from database
exports.getAllUserNames = functions.https.onRequest((req, res) => {
  const allUsers = admin.database().ref('user');

  allUsers.once('value')
    .then(snapshot => {
      const names = [];
      
      snapshot.forEach((entry) => {
        //get user info
        const userInfo = entry.val();
        //push fullname
        names.push(userInfo.first_name + ' ' + userInfo.last_name);
      });

      // return all user names
      return cors(req, res, () => {
        res.status(200).send(JSON.stringify(names));
      });
    }).catch(error => {
      return cors(req, res, () => {
        res.status(422).send({'message': 'Fail to get user info'});
      });
    });
});

exports.userCheckIn = functions.https.onRequest((req, res) => {
   // return if method is not post
  if(req.method !== 'POST') {
    return cors(req, res, () => {
      res.status(422).send({'message': 'Not POST'});
    });
  }

  const userId = req.body.user_id;

  const userRoot = admin.database().ref('user').child(userId);

  userRoot.once('value')
    .then((snapshot) => {
      //check whether user exists
      if(!snapshot.exists()) {
        // return 422 for medical info
        return cors(req, res, () => {
          res.status(422).send('{message: user does not exist}');
        });
      }

      // get key and timestamp
      const key = userRoot.push().key;
      const timestamp = new Date().getTime();
      const updates = {};

      updates['check_in/' + key] = timestamp;
      updates['last_check_in'] = timestamp;
      userRoot.update(updates);

      return null;
    }).catch(error => {
      return cors(req, res, () => {
        res.status(422).send('{"message": "cannot check in"}');
      });
    });

  return cors(req, res, () => {
    res.status(200).send('{"message": "ok"}');
  });
});

// ============ Medical Questionnaire Functions ===============

/**************************/
/*    setGeneralMedInfo   */
/**************************/
exports.setGeneralMedInfo = functions.https.onRequest((req, res) => {
  // return if method is not post
  if(req.method !== 'POST') {
    return cors(req, res, () => {
      res.status(422).send({'message': 'Not POST'});
    });
  }

  // get user id and val
  const userId = req.body.user_id;
  const val = req.body.val;

  // can user doc tree
  const userRoot = admin.database().ref('user').child(userId);

  userRoot.once('value')
    .then((snapshot) => {
      //check whether user exists
      if(!snapshot.exists()) {
        // return 422 for medical info
        return cors(req, res, () => {
          res.status(422).send('{"message": "user does not exist"}');
        });
      }

      // set general info
      var updates = {};
      updates['medical_info/general'] = val;
      userRoot.update(updates);

      // promise always needs to return something
      return null;
    }).catch(error => {
      // handle other errors
      return cors(req, res, () => {
       res.status(422).send('{"message": "Cannot set general medical info"}');
      });
    });

    // return success
    return cors(req, res, () => {
      res.status(200).send('{"message": "ok"}');
    });
});

/**************************/
/*       setMedInfo       */
/**************************/
exports.setMedInfo = functions.https.onRequest((req, res) => {
  // return if method is not post
  if(req.method !== 'POST') {
    return cors(req, res, () => {
      res.status(422).send({'message': 'Not POST'});
    });
  }

  // get user id and val
  const userId = req.body.user_id;
  const val = req.body.val;

  // can user doc tree
  const userRoot = admin.database().ref('user').child(userId);

  userRoot.once('value')
    .then((snapshot) => {
      //check whether user exists
      if(!snapshot.exists()) {
        // return 422 for medical info
        return cors(req, res, () => {
          res.status(422).send('{message: user does not exist}');
        });
      }

      // set general info
      var updates = {};
      updates['medical_info/medical'] = val;
      userRoot.update(updates);

      // promise always needs to return something
      return null;
    }).catch(error => {
      // handle other errors
      return cors(req, res, () => {
       res.status(422).send('{message: Cannot set medical info}');
      });
    });

    // return success
    return cors(req, res, () => {
      res.status(200).send('{message: ok}');
    });
});

// ============ Alert Functions ===============

/**************************/
/*      createAlert       */
/**************************/
exports.createAlert = functions.https.onRequest((req, res) => {
   // return if method is not post
  if(req.method !== 'POST') {
    return cors(req, res, () => {
      res.status(422).send({'message': 'Not POST'});
    });
  }

  // get user id and val
  const name = req.body.name;
  const dates_effective = req.body.dates_effective;
  const description= req.body.description;
  const ttl = req.body.ttl;

  const alertRoot = admin.database().ref('alert');
  const alertId = alertRoot.push().key;

  var updates = {};
  updates[alertId + '/name'] = name;
  updates[alertId + '/dates_effective'] = dates_effective;
  updates[alertId + '/description'] = description;
  updates[alertId + '/ttl'] = ttl;

  alertRoot.update(updates);

  return cors(req, res, () => {
    res.status(200).send('{message: ok}');
  });
});

