'use strict'

const express = require('express');
const app = express();

const superagent = require('superagent')

require('dotenv').config();
const cors = require('cors')
const client = require('./client');


app.use(cors());

const PORT = process.env.PORT || 3001;

app.get('/location', (request, response) => {
  const city = request.query.data;
  try {
    searchLatToLong(city, response);
  }
  catch (error) {
    console.error(error);
    response.status(500).send('so sorry, something is not working on our end')
  }
})

function searchLatToLong(location, response) {
  let url = `https://maps.googleapis.com/maps/api/geocode/json?address=${location}&key=${process.env.GEOCODE_API_KEY}`

  return superagent.get(url)
    .then(results => {
      const locationObj = new Location(location, results.body);
      response.send(locationObj);
    });
}

app.get('/weather', (request, response) => {
  let latitude = request.query.data.latitude
  let longitude = request.query.data.longitude

  const url = `https://api.darksky.net/forecast/${process.env.WEATHER_API_KEY}/${latitude},${longitude}`

  superagent.get(url)
    .then(results => {
      let dailyArray = results.body.daily.data
      const dailyWeatherArray = dailyArray.map(day => {
        return new Weather(day.summary, day.time);
      })
      console.log(dailyWeatherArray)
      response.send(dailyWeatherArray);
    })
    .catch(error => console.error(error));
})

function Location(request, geoData) {
  this.search_query = request;
  this.formatted_query = geoData.results[0].formatted_address;
  this.latitude = geoData.results[0].geometry.location.lat;
  this.longitude = geoData.results[0].geometry.location.lng;
}

function Weather(forecast, time) {
  this.time = new Date(time * 1000).toDateString();
  this.forecast = forecast
}

app.get('/events', (request, response) => {
  let locationObj = request.query.data;
  getEventsData(locationObj, response);
}
)

function getEventsData(locationObj, response) {
  let url = `http://api.eventful.com/json/events/search?location=${locationObj.search_query}&app_key=${process.env.EVENTFUL_API_KEY}`

  superagent.get(url)
    .then(results => {
      let eventsArr = JSON.parse(results.text).events.event
      const finalEventsArr = eventsArr.map(value => new Event(value))
      response.send(finalEventsArr);
    })
    .catch(error => console.error(error));
}

function Event(obj) {
  this.link = obj.url
  this.name = obj.title
  this.event_date = obj.start_time
  this.summary = obj.description
}

app.get('/movies', (request, response) => {
  let locationObj = request.query.data;
  getMoviesData(locationObj, response);
})

function getMoviesData(locationObj, response) {
  let url = `https://api.themoviedb.org/3/search/movie?api_key=${process.env.MOVIEDB_API_KEY}&query=${locationObj.search_query}`
  superagent.get(url)
    .then(superResults => {
      let moviesArr = superResults.body.results;
      let finalArr = moviesArr.slice(0, 20).map(value => new Movie(value));

      response.send(finalArr)

    })
    .catch(error => console.error(error));
}

function Movie(obj) {
  this.title = obj.title
  this.overview = obj.overview
  this.average_votes = obj.vote_average
  this.total_votes = obj.vote_count
  this.image_url = `https://image.tmdb.org/t/p/w500${obj.poster_path}`
  this.popularity = obj.popularity
  this.released_on = obj.release_date
}

app.get('/yelp', (request, response) => {
  let locationObj = request.query.data;
  getYelpData(locationObj, response);
})

function getYelpData(locationObj, response) {
  const url = `https://api.yelp.com/v3/businesses/search?latitude=${locationObj.latitude}&longitude=${locationObj.longitude}`;
  superagent.get(`${url}`).set('Authorization', `Bearer ${process.env.YELP_API_KEY}`)
    .then(yelpResults => {
      let yelpArr = yelpResults.body.businesses;
      let finalYelpArr = yelpArr.slice(0, 20).map(value => new Yelp(value))
      response.send(finalYelpArr)

    })
    .catch(error => console.error(error));
}

function Yelp(obj) {
  this.name = obj.name
  this.image_url = obj.image_url
  this.price = obj.price
  this.rating = obj.rating
  this.url = obj.url
}

app.get('*', (request, response) => {
  response.status(404).send('Page not found');
})

app.listen(PORT, () => console.log(`Example app listening on port ${PORT}!`))

