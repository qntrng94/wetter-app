const API_BASE_URL = "http://api.weatherapi.com/v1";
const API_KEY = "a4a5bd13b1db4728b23121600261303";

export async function getForecastWeather(location, days = 3) {
  const response = await fetch(
    `${API_BASE_URL}/forecast.json?key=${API_KEY}&q=${location}&lang=de&days=${days}`,
  );

  const weatherData = await response.json();

  console.log(weatherData);

  return weatherData;
}

export async function searchCity(query) {
  const response = await fetch(
    `${API_BASE_URL}/search.json?key=${API_KEY}&q=${query}`,
  );
  const data = await response.json();
  return data;
}
