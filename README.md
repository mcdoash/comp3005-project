# COMP 3005 Final Project
By Ashley McDonald (101119938) 

## Running the application
- Run `npm install` in same folder to install required modules
- Edit data in `/db/connection.json` for your postgres setup (user, password, port, etc.)
- `/db/init.js` can be used to create the schema and populate it with fake data
    - Set `rebuildDb` true to drop all tables, functions, etc. from provided database (public schema) and build new ones
    - Set `rebuildData` true to delete all previous data and add fake info
    - Run via `npm run init`
    - It may take ~20 seconds to insert all the data if many rows are created
- Run server with `npm start` and view at `localhost:3000`

- Note: fake data book covers retrieve a random photo link and will change on reload. In the actual application, owners would add cover links to a specific cover image.