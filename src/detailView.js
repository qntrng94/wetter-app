import { rootElement } from "./main";
import { getForecastWeather, searchCity } from "./api";
import { getConditionImagePath } from "./conditions";

export async function loadDetailView(city = "Nauen") {
  rootElement.innerHTML = `<div class="loader">
      <div class="lds-roller"><div></div><div></div><div></div><div></div><div></div><div></div><div></div><div></div></div>
    </div>`;
  const weatherData = await getForecastWeather(city);
  renderDetailview(weatherData);
  registerSearchListener();
}

function renderDetailview(data) {
  const code = data.current.condition.code;
  const isNight = data.current.is_day === 0;
  const imagePath = getConditionImagePath(code, isNight);

  rootElement.style.backgroundImage = `url(${imagePath})`;
  rootElement.style.backgroundSize = "cover";
  rootElement.style.backgroundPosition = "center";
  rootElement.innerHTML =
    getSearchHtml() +
    getHeaderHtml(data) +
    getHourlyHtml(data) +
    getDailyHtml(data) +
    getStatsHtml(data);
}

function getHeaderHtml(data) {
  return `<div class="current-weather">
            <h2 class="current-weather__location">${data.location.name}</h2>
            <h1 class="current-weather__current-temperature">${data.current.temp_c}°</h1>
            <p class="current-weather__condition">${data.current.condition.text}</p>
            <div class="current-weather__day-temperatures">
                <span class="current-weather__max-temperatures">H:${data.forecast.forecastday[0].day.maxtemp_c}°</span>
                <span class="current-weather__min-temperatures">T:${data.forecast.forecastday[0].day.mintemp_c}°</span>
             </div>
        </div>

`;
}

function getHourlyHtml(data) {
  const hours = data.forecast.forecastday[0].hour;

  const itemsHtml = hours
    .map(function (hour) {
      return `<div class="hourly__item">
      <span class="hourly__time">${hour.time.split(" ")[1]}</span>
      <img class="hourly__icon" src="${hour.condition.icon}">
      <span class="hourly__temp">${hour.temp_c}°</span>
    </div>`;
    })
    .join("");

  return `<div class="hourly">${itemsHtml}</div>`;
}

function getDailyHtml(data) {
  const days = data.forecast.forecastday;

  const itemsHtml = days
    .map(function (day, index) {
      const date = new Date(day.date);
      const dayName =
        index === 0
          ? "Heute"
          : date.toLocaleDateString("de-DE", { weekday: "short" });

      return `
      <div class="daily__item">
      <span class="daily__name">${dayName}</span>
      <img class="daily__icon" src="${day.day.condition.icon}">
      <span class="daily__max">H:${day.day.maxtemp_c}°</span>
      <span class="daily__min">T:${day.day.mintemp_c}°</span>
      <span class="daily__wind">${day.day.maxwind_kph} km/h</span>
    </div>`;
    })
    .join("");

  return `<div class="daily">
    <h3 class="daily__title">Vorhersage für die nächsten 3 Tage</h3>
    ${itemsHtml}
  </div>`;
}

function getStatsHtml(data) {
  const current = data.current;
  const astro = data.forecast.forecastday[0].astro;

  return `<div class="stats">
    <div class="stats__item">
      <span class="stats__label">Feuchtigkeit</span>
      <span class="stats__value">${current.humidity}%</span>
    </div>
    <div class="stats__item">
      <span class="stats__label">Gefühlt</span>
      <span class="stats__value">${current.feelslike_c}°</span>
    </div>
    <div class="stats__item">
      <span class="stats__label">Sonnenaufgang</span>
      <span class="stats__value">${astro.sunrise}</span>
    </div>
    <div class="stats__item">
      <span class="stats__label">Sonnenuntergang</span>
      <span class="stats__value">${astro.sunset}</span>
    </div>
    <div class="stats__item">
      <span class="stats__label">Niederschlag</span>
      <span class="stats__value">${current.precip_mm}mm</span>
    </div>
    <div class="stats__item">
      <span class="stats__label">UV-Index</span>
      <span class="stats__value">${current.uv}</span>
    </div>
  </div>`;
}

function getSearchHtml() {
  return `<div class="search">
  <input class="search__input" type="text" placeholder="Stadt suchen...">
  <button class="search__favorite-btn">☆</button>
  <ul class="search__suggestions"></ul>
  </div>`;
}

function registerSearchListener() {
  const input = document.querySelector(".search__input");
  const suggestions = document.querySelector(".search__suggestions");
  const favoriteBtn = document.querySelector(".search__favorite-btn");

  favoriteBtn.addEventListener("click", function () {
    const cityName = document.querySelector(
      ".current-weather__location",
    ).textContent;
    addFavorite(cityName);
  });

  input.addEventListener("input", async function () {
    const query = input.value;
    if (query.length < 2) {
      suggestions.innerHTML = "";
      return;
    }
    const cities = await searchCity(query);
    suggestions.innerHTML = cities
      .map(function (city) {
        return `<li class="search__suggestion-item" data-name="${city.name}">
        ${city.name}, ${city.region}, ${city.country}
      </li>`;
      })
      .join("");

    suggestions
      .querySelectorAll(".search__suggestion-item")
      .forEach(function (item) {
        item.addEventListener("click", function () {
          loadDetailView(item.dataset.name);
        });
      });
  });
}
