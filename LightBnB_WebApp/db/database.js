const { Pool } = require('pg');

const pool = new Pool({
  user: 'vagrant',
  password: '123',
  host: 'localhost',
  database: 'lightbnb'
});

/// Users

/**
 * Get a single user from the database given their email.
 * @param {String} email The email of the user.
 * @return {Promise<{}>} A promise to the user.
 */
const getUserWithEmail = function (email) {
  return pool
    .query(`
    SELECT *
    FROM users
    WHERE lower(email) = $1;
    `, [email.toLowerCase()]) // treat email as case insensitive
    .then((result) => {
      return result.rows[0] ?? null; // return a user object, or null if that user does not exist
    });
  };

/**
 * Get a single user from the database given their id.
 * @param {string} id The id of the user.
 * @return {Promise<{}>} A promise to the user.
 */
const getUserWithId = function (id) {
  return pool
    .query(`
    SELECT *
    FROM users
    WHERE id = $1;
    `, [id])
    .then((result) => {
      return result.rows[0] ?? null;
    });
  };

/**
 * Add a new user to the database.
 * @param {{name: string, password: string, email: string}} user
 * @return {Promise<{}>} A promise to the user.
 */
const addUser = function (user) {
  return pool
    .query(`
    INSERT INTO users(name, email, password) VALUES($1, $2, $3)
    RETURNING *;
    `, [user.name, user.email, user.password])
    .then((result) => {
      return result.rows[0];
    });
  };

/// Reservations

/**
 * Get all reservations for a single user.
 * @param {string} guest_id The id of the user.
 * @return {Promise<[{}]>} A promise to the reservations.
 */
const getAllReservations = function (guest_id, limit = 10) {
  return pool
    .query(`
    SELECT start_date, end_date, properties.*, AVG(rating) AS average_rating
    FROM reservations
    JOIN properties ON reservations.property_id = properties.id
    JOIN property_reviews ON properties.id = property_reviews.property_id
    WHERE reservations.guest_id = $1
    GROUP BY properties.id, reservations.id
    ORDER BY reservations.start_date
    LIMIT $2;
    `, [guest_id, limit])
    .then((result) => {
      return result.rows;
    });
  };

/// Properties

/**
 * Get all properties.
 * @param {{}} options An object containing query options.
 * @param {*} limit The number of results to return.
 * @return {Promise<[{}]>}  A promise to the properties.
 */
const getAllProperties = function (options, limit = 10) {
  // 1: setup an array to hold parameters for the query
  const queryParams = [];
  // 2: start the query with all the information before the WHERE clause
  let queryString = `
  SELECT properties.*, AVG(property_reviews.rating) AS average_rating
  FROM properties
  JOIN property_reviews ON properties.id = property_id
  `;

  // 3: if city has been passed in as an option, add the city to queryParams and create a WHERE clause
  if (options.city) {
    queryParams.push(`%${options.city}%`);
     // use ILIKE to treat city as case insensitive
     // use the length of the array to dynamically get the $n placeholder number
    queryString += `WHERE city ILIKE $${queryParams.length} `;
  }

  // 4: if owner_id or price ranger passed in as options
  //    use a WHERE clause if the queryParams array is empty
  //    otherwise, use AND for the filter
  if (options.owner_id) {
    queryString += queryParams.length === 0 ? 'WHERE ' : 'AND ';
    queryParams.push(options.owner_id);
    queryString += `owner_id = $${queryParams.length} `;
  }

  if (options.minimum_price_per_night && options.maximum_price_per_night) {
    let minPrice = options.minimum_price_per_night * 100;
    let maxPrice = options.maximum_price_per_night * 100;
    queryString += queryParams.length === 0 ? 'WHERE ' : 'AND ';
    queryParams.push(minPrice, maxPrice);
    queryString += `cost_per_night BETWEEN $${queryParams.length - 1} AND $${queryParams.length} `; 
  }

  // 5: add any query that comes after the WHERE clause
  queryString += `GROUP BY properties.id `;

  if (options.minimum_rating) {
    queryParams.push(options.minimum_rating);
    queryString += `HAVING AVG(property_reviews.rating) >= $${queryParams.length} `;
  }

  queryParams.push(limit);
  queryString += `
  ORDER BY cost_per_night
  LIMIT $${queryParams.length};
  `;

  // 6
  console.log(queryString, queryParams);

  // 7
  return pool.query(queryString, queryParams).then((res) => res.rows);
};

/**
 * Add a property to the database
 * @param {{}} property An object containing all of the property details.
 * @return {Promise<{}>} A promise to the property.
 */
const addProperty = function (property) {
  let queryString = `
  INSERT INTO properties(owner_id, title, description, thumbnail_photo_url, cover_photo_url, cost_per_night, street, city, province, post_code, country, parking_spaces, number_of_bathrooms, number_of_bedrooms)
  VALUES($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14)
  RETURNING *;
  `;
  let queryParams = [property.owner_id, property.title, property.description, property.thumbnail_photo_url, property.cover_photo_url, property.cost_per_night, property.street, property.city, property.province, property.post_code, property.country, property.parking_spaces, property.number_of_bathrooms, property.number_of_bedrooms];
  
  return pool.query(queryString, queryParams)
    .then((result) => {
      return result.rows[0];
    });
  };

module.exports = {
  getUserWithEmail,
  getUserWithId,
  addUser,
  getAllReservations,
  getAllProperties,
  addProperty,
};
