const express = require("express");
const bodyParser = require("body-parser");
const { Wit } = require("node-wit");
const axios = require("axios");
const cors = require("cors");
require("dotenv").config();

const app = express();
const port = process.env.PORT || 3000;
app.use(cors());
const witClient = new Wit({
  accessToken: process.env.WIT_TOKEN,
});

const restaurantsData = [
  { name: "Restaurant A", route: "NH 44", location: "Chennai" },
  { name: "Restaurant B", route: "NH 44", location: "Madurai" },
  { name: "Restaurant C", route: "Main Road", location: "Chennai" },
  { name: "Restaurant D", route: "Highway 66", location: "Madurai" },
  { name: "Restaurant E", route: "NH 44", location: "Madurai" },
  { name: "Restaurant F", route: "NH 48", location: "Bangalore" },
  { name: "Restaurant G", route: "NH 83", location: "Madurai" },
  { name: "Restaurant H", route: "NH 38", location: "Madurai" },
  { name: "Restaurant I", route: "ECR", location: "Pondicherry" },
  { name: "Restaurant J", route: "NH 48", location: "Chennai" },
  { name: "Restaurant K", route: "NH 544", location: "Chennai" },
  { name: "Restaurant L", route: "NH 83", location: "Coimbatore" },
  { name: "Restaurant M", route: "NH 48", location: "Coimbatore" },
  { name: "Ashwin's Restaurant", route: "NH 45", location: "Perambalur" },
  { name: "Manoj Bhavan", route: "NH 45", location: "Mamandur" },
  { name: "Murugan Idly", route: "NH 45", location: "Maduranthakam" },
];

const city_routes = {
  Chennai: {
    Madurai: "NH 44",
    Coimbatore: "NH 544",
    Bangalore: "NH 48",
    Pondicherry: "ECR",
    Trichy: "NH 45",
  },
  Madurai: {
    Chennai: "NH 44",
    Coimbatore: "NH 83",
    Trichy: "NH 38",
  },
  Coimbatore: {
    Chennai: "NH 544",
    Madurai: "NH 83",
  },
  Trichy: {
    Chennai: "NH 45",
  },
};

app.use(bodyParser.json());

function findRestaurantsAlongRoute(startCity, endCity) {
  const route = city_routes[startCity][endCity];
  const restaurants = [];

  for (const restaurant of restaurantsData) {
    if (restaurant.route === route) {
      restaurants.push({
        name: restaurant.name,
        location: restaurant.location,
      });
    }
  }

  return restaurants;
}

app.post("/process-message", async (req, res) => {
  try {
    const witResponse = await witClient.message(req.body.message);
    const { entities } = witResponse;

    const startCityEntity = entities["start_city:start_city"];
    const endCityEntity = entities["end_city:end_city"];

    if (!startCityEntity || !endCityEntity) {
      throw new Error("Start city or end city not found in the message");
    }

    const startCity = startCityEntity[0].value;
    const endCity = endCityEntity[0].value;

    const restaurants = findRestaurantsAlongRoute(startCity, endCity);

    res.json({ restaurants });
  } catch (error) {
    console.error("Error processing message:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

app.listen(port, () => {
  console.log(`Server is running on ${port} port.`);
});
