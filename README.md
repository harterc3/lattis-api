# Lattis API

## Context
Your API could be used for Lattis’ android and iOS application. It allows to manage lock(s) of an
user and do bike-lock sharing feature.

- You will implement the following actions:
- You can sign up to your API with a username, password, email and phone number.
- You can sign in to your API using his username and password.
- You can retrieve and update the authenticated user’s informations.
- You can list the locks (owned and shared) of an user.
- You can add a lock with a name and a mac id to an user’s account.
- You can update the name of a lock.
- You can delete a lock.
- You can share a lock to an other person using his phone number.

The models will have the following attributes:

##### User:
- username
- password
- email
- phone_number

##### Lock:
- name
- mac_id

## Setup
You will need NodeJS (I use v7.8.0), and mySQL to run this project. If you're on Mac OSX I recommend using Homebrew to download these.

Fork this project to create your own repository in GitHub. Then clone your repo locally.

`git clone git@github.com:<YOUR-USERNAME>/lattis-api.git`

Navigate into the newly created graffiti-api directory and run `npm i` to install the dependencies in package.json.

`cd graffiti-api`
`npm i`

One of those dependencies is Sequelize. This is the ORM we are using. It helps us with data migrations. Make sure your mySQL is running locally. Create a database called `lattis`. If you are prompted for which character encoding you want for your database, use `utf8mb4`.

Now that you have an empty database, install the Sequelize CLI and use it to run our migration:

`npm install -g sequelize-cli`
`sequelize db:migrate`

You should now have database tables for users, drawings, and reports. Now you should be able to run the API.

`npm run start`

## Tests
Tests in this project are run using `mocha`:

`npm run test`

(If this doesn't work, you may need to run `npm install -g mocha` first.)

## Endpoints
  ##### Register new user
  - Url: `/users`
  - Method: `POST`
  - Params:
    - `username` (required, string)
    - `password` (required, string)
    - `email` (required, string)
    - `phone_number` (required, string)
    
  ##### Authenticate an existing user
  - Url: `/authenticate`
  - Method: `POST`
  - Params:
    - `username` (required, string)
    - `password` (required, string)
  - __Endpoint will return access token to be used on future calls__
  
  ##### Get current user's info
  - Url: `/me`
  - Method: `GET`
  - Headers:
    - `x-access-token` (required, (comes from authentication endpoint))
    
  ##### Update current user's info
  - Url: `/me`
  - Method: `PUT`
  - Headers:
    - `x-access-token` (required, (comes from authentication endpoint))
  - Params:
    - `username` (optional, string)
    - `password` (optional, string)
    - `email` (optional, string)
    - `phone_number` (optional, string)
  - __Endpoint will return access token to be used on future calls__
    
  ##### Get current user's locks (owned and shared)
  - Url: `/locks`
  - Method: `GET`
  - Headers:
    - `x-access-token` (required, (comes from authentication endpoint))
    
  ##### Create new lock for current user
  - Url: `/locks`
  - Method: `POST`
  - Headers:
    - `x-access-token` (required, (comes from authentication endpoint))
  - Params:
    - `mac_id` (required, string)
    - `name` (required, string)
    
  ##### Update a lock
  - Url: `/locks/:id`
  - Method: `PUT`
  - Headers:
    - `x-access-token` (required, (comes from authentication endpoint))
  - Params:
    - `name` (required, string)
    
  ##### Delete a lock
  - Url: `/locks/:id`
  - Method: `DELETE`
  - Headers:
    - `x-access-token` (required, (comes from authentication endpoint))
    
  ##### Share lock with phone number
  - Url: `/locks/:id/share`
  - Method: `PUT`
  - Headers:
    - `x-access-token` (required, (comes from authentication endpoint))
  - Params:
    - `phone_number` (required, string)

## Project Organization
The API is divided into middleware, controllers, helpers, and models.

#### Middleware
These are classes/functions that are typically run before an API action is called. For example, if a user is requesting to update their user information, we use our `Authenticator` middleware class to verify the user before allowing any modifications.

#### Controllers
These classes contain the functions for actually completing the actions requested by the end-users. Using my user info update example again, this would be the function that actually finds the user's record (in model form) and updates it.

#### Helpers
Currently, there is only one helper class: `JwtHelper`. This was made to wrap the `jsonwebtoken` library to decouple it from the rest of the project.

#### Models
We are using the [Sequelize](http://docs.sequelizejs.com/en/v3/) ORM for models and migrations for interacting with our database.
