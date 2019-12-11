'use strict'

const express = require('express');
require('dotenv').config();
const cors = require('cors')

const app = express();
const PORT = process.env.PORT || 3001;
app.use(cors());

app.get('/location', (request, response) => {
  let city = request.query.data;

  let locationObj = searchLatToLong(city);

  response.send(locationObj);
})

function searchLatToLong(city) {
  const geoData = require('./data/geo.json');
  const geoDataResults = geoData.results[0]

  const locationObj = new Location(city, geoDataResults);
  return locationObj;
}

function Location(city, geoDataResults) {
  this.search_query = city;
  this.formatted_query = geoDataResults.formatted_query;
  this.latitude = geoDataResults.geometry.location.lat;
  this.longitude = geoDataResults.geometry.location.lng;
}

// weather

app.get('/weather', (request, response) => {

  let weatherObj = searchWeather();

  response.send(weatherObj);
})

function searchWeather() {
  const darkskyData = require('./data/darksky.json');
  const darkskyDataResults = darkskyData.daily.data
  const weatherArray = []

  for (let i = 0; i < darkskyDataResults.length; i++) {

    weatherArray.push(new Weather(darkskyDataResults[i]))
  }
  return weatherArray;
}

function Weather(darkskyDataResults) {
  this.time = darkskyDataResults.time
  this.forecast = darkskyDataResults.summary
}

// 500
// app.get('*', (request, response) => {
//   response.status(500).send('Sorry, something went wrong');

//   let errorQuery = error()
// }

// function error() { }

// 404
app.get('*', (request, response) => {
  response.status(404).send('Page not found');
})

app.listen(PORT, () => console.log(`Example app listening on port ${PORT}!`))

