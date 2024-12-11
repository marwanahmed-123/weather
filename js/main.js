const navbarLink = document.querySelectorAll(".nav-link");
let cityInput = document.getElementById("search-cities");
var isGeolocationSupported;
var state;
let weather = []; // carries the weather data of 3 days
var day;
let weekDays = [
  "Sunday",
  "Monday",
  "Tuesday",
  "Wednesday",
  "Thursday",
  "Friday",
  "Saturday",
];
let months = [
  "January",
  "February",
  "March",
  "April",
  "May",
  "June",
  "July",
  "August",
  "September",
  "October",
  "November",
  "December",
];
cityInput.addEventListener("input", async function () {
  const autoCompleteData = await autoCompleteResult(cityInput.value);
  if (autoCompleteData != false) {
    state = autoCompleteData;
    setLocation(autoCompleteData);
  }
});
let activeLink = 0;
for (let i = 0; i < navbarLink.length; i++) {
  navbarLink[i].addEventListener("click", function () {
    navbarLink[i].classList.add("active");
    navbarLink[activeLink].classList.remove("active");
    activeLink = i;
  });
}
if ("geolocation" in navigator) {
  navigator.geolocation.getCurrentPosition(
    async (position) => {
      const latitude = position.coords.latitude;
      const longitude = position.coords.longitude;
      setLocation(latitude, longitude);
    },
    (error) => {
      alert(`ERROR(${error.code}): ${error.message}`);
    }
  );
}
async function setLocation(latitude, longitude) {
  try {
    let location = await fetch(
      `https://api.opencagedata.com/geocode/v1/json?q=${latitude}+${longitude}&key=afdbe82c15b148b8b40a1b76ff84a2d1&pretty=1`
    );
    location = await location.json();
    state = location.results[0].components.state;
    getWeather(state);
  } catch (error) {
    console.log("an error has occurred fetching location results");
  }
}
async function autoCompleteResult(word) {
  try {
    let searchResult = await fetch(
      `https://api.weatherapi.com/v1/search.json?key=ed9afd004def4744bab73043240412&q=${word}`
    );
    searchResult = await searchResult.json();
    return searchResult[0].region;
  } catch (error) {
    console.log("error occurred finding city", error);
    return false;
  }
}
autoCompleteResult("cai");
async function getWeather(location) {
  try {
    let weatherJSON = await fetch(
      `https://api.weatherapi.com/v1/forecast.json?key=ed9afd004def4744bab73043240412&q=${location}&days=3`
    );
    let weatherJS = await weatherJSON.json();
    let date = weatherJS.forecast.forecastday[0].date;
    let currentTemperature = weatherJS.current.temp_c;
    let forecastCondition = weatherJS.current.condition.text;
    let forecastConditionIcon = weatherJS.current.condition.icon;
    let forecastWindkph = weatherJS.current.wind_kph;
    let forecastWindDirection = weatherJS.current.wind_dir;
    let forecastRainCondition =
      weatherJS.forecast.forecastday[0].day.daily_chance_of_rain;
    let dayMonthYear = new Date(date);
    let day = weekDays[dayMonthYear.getDay()];
    let month = months[dayMonthYear.getMonth()];
    let todayWeather = {
      state,
      weekDay: day,
      monthDay: dayMonthYear.getDate(),
      month,
      currentTemperature,
      forecastCondition,
      forecastConditionIcon,
      forecastWindkph,
      forecastWindDirection,
      forecastRainCondition,
    };
    weather[0] = todayWeather;
    for (let i = 1; i < 3; i++) {
      let date_ = weatherJS.forecast.forecastday[i].date;
      let celsiusMaxTemperature =
        weatherJS.forecast.forecastday[i].day.maxtemp_c;
      let celsiusMinTemperature =
        weatherJS.forecast.forecastday[i].day.mintemp_c;
      let forecastCondition =
        weatherJS.forecast.forecastday[i].day.condition.text;
      let forecastConditionIcon =
        weatherJS.forecast.forecastday[i].day.condition.icon;
      weather[i] = {
        day: weekDays[new Date(date_).getDay()],
        celsiusMaxTemperature,
        celsiusMinTemperature,
        forecastCondition,
        forecastConditionIcon,
      };
    }
    displayWeather();
  } catch (error) {
    console.log(error);
  }
}
async function displayWeather() {
  let dayOne = document.querySelector(".today-forecast");
  dayOne.innerHTML = `
  <div class="date d-flex justify-content-between">
    <p>${weather[0].weekDay}</p>
    <p>${weather[0].monthDay}${weather[0].month}</p>
  </div>
  <h4 class="city">${state}</h4>
  <h2 class="temp">${weather[0].currentTemperature}&degC</h2>
  <img class="forecastConditionIcon" src="${weather[0].forecastConditionIcon}" alt="${weather[0].forecastCondition}">
  <p class="condition">${weather[0].forecastCondition}</p>
  <span><i class="fa-solid fa-umbrella"></i> ${weather[0].forecastRainCondition}%</span>
  <span><i class="fa-solid fa-wind"></i> ${weather[0].forecastWindkph}kph</span>
  <span><i class="fa-regular fa-compass"></i> ${weather[0].forecastWindDirection}</span>
  `;
  for (let i = 1; i < weather.length; i++) {
    let newDay = document.querySelector(`.day-${i}-forecast`);
    newDay.innerHTML = `
    <div class="date"><p>${weather[i].day}</p></div>
    <div class="weather">
      <img class="forecastConditionIcon" src="${weather[i].forecastConditionIcon}" alt="${weather[i].forecastCondition}">
      <p class="max-temp">${weather[i].celsiusMaxTemperature}&degC</p>
      <p class="min-temp">${weather[i].celsiusMinTemperature}&degC</p>
      <p class="condition">${weather[i].forecastCondition}</p>
    </div>
    `;
  }
}
