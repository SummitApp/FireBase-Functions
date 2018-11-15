## Firebase Functions for Summit App

To deploy functions to FireBase, run `firebase deploy --only functions`

To test functions before deployment, run `firebase serve`

### `\user`

#### addUser

Add a new customer to `\user`

##### params:

`first_name`: First name

`last_name`: Last name

`dob`: Date of birth

##### return value:

200 upon successful requests with `ok`

#### authUser

Authenticate a user by first name, last name, and date of birth

##### params:

`first_name`: First name

`last_name`: Last name

`dob`: Date of birth

##### return value:

200 upon successful requests with user id.

422 upon failed requests with `message: 'Fail to auth given user'`

#### getUserId

Return user id of an existing user

##### params:

`first_name`: First name

`last_name`: Last name

`dob`: Date of birth

##### return value:

200 upon successful requests with user id.

422 upon failed requests with `message: 'Fail to get user id'`

### getUserInfo

Retrieve user information by user id.

##### params:

`user_id`: ID token returned by `getUserId` function

#### return value:

200 upon successful requests with user information
422 upon failed requests with `message: 'User id not found` when `user_id` does not exist

### getAllUserNames

#### params:

N/A

#### return value:

200 upon successful requests with all user names

422 upon failed requests with `message: 'Fail to get user info'`

### setGeneralMedInfo

#### POST data:

```
{
  user_id: USER_ID,
  val: COMMENT
}
```

#### return value:

200 upon successful requests

422 upon unknown id with `message: 'unknown user'`

422 upon failed requests with `message: 'Cannot set general medical info'`

### setMedInfo

#### POST data:

```
{
  user_id: USER_ID,
  val: COMMENT
}
```

#### return value:

200 upon successful requests

422 upon unknown id with `message: 'unknown user'`

422 upon failed requests with `message: 'Cannot set medical info'`
