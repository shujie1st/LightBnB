# LightBnB Project
LightBnB is a simple multi-page Airbnb clone that uses a server-side Javascript to display the information from queries to web pages via SQL queries.

This project is built on the [LightBnB web app](https://github.com/lighthouse-labs/LightBnB_WebApp) template by Lighthouse Labs.

# Final Product
## Features
- View property information.
- Search properties by city, cost, or rating.
- Create listings.
- View listings & reservations.

## Screenshots
### My Listings Page
!["My Listings Page"](/docs/my_listings.png)
### My Reservations Page
!["My Reservations Page"](/docs/my_reservations.png)
### Create Listing Page
!["Create Listing Page"](/docs/create_listing.png)
### Search Properties Page
!["Search Properties Page"](/docs/search_properties.png)

## Getting Started
1. Clone this repository onto your local device.
2. In your PostgreSQL server, create database `lightbnb`:
     - Run `migrations/01_schema.sql` to create tables.
     - Run `seeds/01_seeds.sql`, `seeds/02_seeds.sql` to insert data.
     - Go to [database.js](/LightBnB_WebApp/db/database.js) to confirm your PostgreSQL connection.
3. Install dependencies using the `npm install` command.
4. Start the web server using the `npm run local` command. The app will be served at <http://localhost:3000/>.
5. Go to <http://localhost:3000/> in your browser.


## Dependencies
    "bcrypt": "^3.0.6",
    "cookie-session": "^1.3.3",
    "express": "^4.17.1",
    "nodemon": "^1.19.1",
    "pg": "^8.10.0"