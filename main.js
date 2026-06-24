const units = document.querySelector(".units");
let unitsBox = document.querySelector(".units-box");
units.addEventListener('click', function() {
    units.classList.toggle("active");
    unitsBox.classList.toggle("active");
});

let switchBtn = document.querySelector("#imperial");

let fahrenheitOption = document.querySelector("#fahrenheit");
let inchesOption = document.querySelector("#inches");

let celsiusOption = document.querySelector("#celsius");
let millimetersOption = document.querySelector("#millimeters");

let isImperial = false;
let currentSearchedCity = "";

switchBtn.addEventListener("click", () => {
    isImperial = !isImperial;

    let currentCity = currentSearchedCity || "";

    if (isImperial) {
        fahrenheitOption.classList.add("active");
        inchesOption.classList.add("active");
        celsiusOption.classList.remove("active");
        millimetersOption.classList.remove("active");

        switchBtn.textContent = "Switch To Metric";
        
        searchAndGetWeather(currentCity, "imperial");

    } else {
        celsiusOption.classList.add("active");
        millimetersOption.classList.add("active");
        fahrenheitOption.classList.remove("active");
        inchesOption.classList.remove("active");

        switchBtn.textContent = "Switch To Imperial";

        searchAndGetWeather(currentCity, "metric");
    }
});

let dropdownDayIcon = document.querySelector(".dropdown-day");
let daySwitch = document.querySelector(".days-switch");
dropdownDayIcon.addEventListener('click', function() {
    dropdownDayIcon.classList.toggle("active");
    daySwitch.classList.toggle("active");
});


function getWeatherIconPath(weatherCode) {
    const config = {
        0: './images/icon-sunny.webp',
        1: './images/icon-sunny.webp',
        2: './images/icon-partly-cloudy.webp',
        3: './images/icon-overcast.webp',
        45: './images/icon-fog.webp',
        48: './images/icon-fog.webp',
        51: './images/icon-drizzle.webp',
        53: './images/icon-drizzle.webp',
        55: './images/icon-drizzle.webp',
        61: './images/icon-rain.webp',
        63: './images/icon-rain.webp',
        65: './images/icon-rain.webp',
        71: './images/icon-snow.webp',
        73: './images/icon-snow.webp',
        75: './images/icon-snow.webp',
        80: './images/icon-rain.webp',
        81: './images/icon-rain.webp',
        82: './images/icon-rain.webp',
        95: './images/icon-storm.webp',
        96: './images/icon-storm.webp',
        99: './images/icon-storm.webp'
    };
    return config[weatherCode] || './images/icon-partly-cloudy.webp';
}


function searchAndGetWeather(cityName, unitType = (isImperial ? "imperial" : "metric")) {

    if (!cityName || cityName.trim() === "") return;

    const currentCardContainer = document.querySelector(".current-weather-card");
    if (currentCardContainer) {
        currentCardContainer.innerHTML = `
            <div class="loading-container">
                <div class="loading-dots"><div></div><div></div><div></div><div></div></div>
                <p>Loading...</p>
            </div>
        `;
    }

    const metricsGridContainer = document.querySelector(".weather-metrics-grid");
    if (metricsGridContainer) {
        metricsGridContainer.innerHTML = `
            <div class="metric-card"><span class="metric-title">Feels Like</span><span class="metric-value">—</span></div>
            <div class="metric-card"><span class="metric-title">Humidity</span><span class="metric-value">—</span></div>
            <div class="metric-card"><span class="metric-title">Wind</span><span class="metric-value">—</span></div>
            <div class="metric-card"><span class="metric-title">Precipitation</span><span class="metric-value">—</span></div>
        `;
    }

    const forecastContainer = document.querySelector(".forecast-days-container");
    if (forecastContainer) {
        forecastContainer.innerHTML = `<div class="forecast-day-card skeleton-card"></div>`.repeat(7);
    }
    
    const hourlyList = document.querySelector(".hourly-list");
    if (hourlyList) {
        hourlyList.innerHTML = `<div class="hourly-item skeleton-hourly"></div>`.repeat(6);
    }

    const dropdownSpan = document.querySelector(".dropdown-day span");
    if (dropdownSpan) dropdownSpan.textContent = "—";

    const geoUrl = `https://geocoding-api.open-meteo.com/v1/search?name=${encodeURIComponent(cityName)}&count=1&language=en&format=json`;

    fetch(geoUrl)
        .then(response => response.json())
        .then(geoData => {
            if (!geoData.results || geoData.results.length === 0) {
                const alertBox = document.getElementById("custom-alert");
                alertBox.classList.add("show");
    
                setTimeout(() => {
                    alertBox.classList.remove("show");
                }, 3000);

                return;
            }

            const { latitude, longitude, name, country, country_code, admin1 } = geoData.results[0];
            const locationCountry = country || admin1 || country_code || "";
            const fullLocationName = locationCountry ? `${name}, ${locationCountry}` : name;
            currentSearchedCity = cityName;

            let tempUnit = "celsius";
            let windUnit = "kmh";
            let precipUnit = "mm";
            let tempSign = "°C";
            let windSign = "km/h";
            let precipSign = "mm";
            
            if (unitType === "imperial") {
                tempUnit = "fahrenheit";
                windUnit = "mph";
                precipUnit = "inch";
                tempSign = "°F";
                windSign = "mph";
                precipSign = "in";
            }

            const weatherUrl = `https://api.open-meteo.com/v1/forecast?latitude=${latitude}&longitude=${longitude}&current=temperature_2m,relative_humidity_2m,apparent_temperature,precipitation,weather_code,wind_speed_10m&hourly=temperature_2m,weather_code&daily=weather_code,temperature_2m_max,temperature_2m_min,precipitation_sum&timezone=auto&temperature_unit=${tempUnit}&wind_speed_unit=${windUnit}&precipitation_unit=${precipUnit}`;

            return fetch(weatherUrl)
                .then(res => res.json())
                .then(weatherData => {
                    
                    const current = weatherData.current;
                    const currentIcon = getWeatherIconPath(current.weather_code);
                    
                    const dateOptions = { weekday: 'long', month: 'short', day: 'numeric', year: 'numeric' };
                    const formattedDate = new Date().toLocaleDateString('en-US', dateOptions);

                    const currentCardContainer = document.querySelector(".current-weather-card");
                    currentCardContainer.innerHTML = `
                        <div class="location-info">
                            <h1 class="city-name">${fullLocationName}</h1>
                            <p class="current-date">${formattedDate}</p>
                        </div>
                        <div class="weather-display">
                            <img src="${currentIcon}" alt="weather-icon" class="big-weather-icon">
                            <span class="main-temp">${Math.round(current.temperature_2m)}${tempSign}</span>
                        </div>
                    `;

                    const metricsGridContainer = document.querySelector(".weather-metrics-grid");
                    metricsGridContainer.innerHTML = `
                        <div class="metric-card">
                            <span class="metric-title">Feels Like</span>
                            <span class="metric-value">${Math.round(current.apparent_temperature)}${tempSign}</span>
                        </div>
                        <div class="metric-card">
                            <span class="metric-title">Humidity</span>
                            <span class="metric-value">${current.relative_humidity_2m}%</span>
                        </div>
                        <div class="metric-card">
                            <span class="metric-title">Wind</span>
                            <span class="metric-value">${current.wind_speed_10m} ${windSign}</span>
                        </div>
                        <div class="metric-card">
                            <span class="metric-title">Precipitation</span>
                            <span class="metric-value">${weatherData.daily.precipitation_sum ? weatherData.daily.precipitation_sum[0] : current.precipitation} ${precipSign}</span>
                        </div>
                    `;

                    const daily = weatherData.daily;
                    const forecastContainer = document.querySelector(".forecast-days-container");
                    const daySwitchContainer = document.querySelector(".days-switch"); 

                    forecastContainer.innerHTML = "";
                    daySwitchContainer.innerHTML = ""; 

                    daily.time.forEach((timeValue, index) => {
                        const dayNameLong = new Date(timeValue).toLocaleDateString('en-US', { weekday: 'long' });
                        const dayNameShort = new Date(timeValue).toLocaleDateString('en-US', { weekday: 'short' });
                        
                        const dayIcon = getWeatherIconPath(daily.weather_code[index]);
                        const maxTemp = Math.round(daily.temperature_2m_max[index]);
                        const minTemp = Math.round(daily.temperature_2m_min[index]);

                        const isActive = index === 0 ? "active-day" : "";
                        const isDropdownActive = index === 0 ? "active" : "";

                        const dayCardHtml = `
                            <div class="forecast-day-card ${isActive}" style="cursor: pointer;" data-date="${timeValue}">
                                <span class="day-name">${dayNameShort}</span>
                                <img src="${dayIcon}" alt="forecast-icon" class="small-weather-icon">
                                <div class="day-temps">
                                    <span class="max-temp">${maxTemp}°</span>
                                    <span class="min-temp">${minTemp}°</span>
                                </div>
                            </div>
                        `;
                        forecastContainer.insertAdjacentHTML("beforeend", dayCardHtml);

                        const dropdownDayHtml = `
                            <div class="${isDropdownActive}" style="cursor: pointer;" data-date="${timeValue}" data-short-name="${dayNameShort}">
                                ${dayNameLong}
                            </div>
                        `;
                        daySwitchContainer.insertAdjacentHTML("beforeend", dropdownDayHtml);
                    });

                    document.querySelectorAll(".forecast-day-card").forEach(card => {
                        card.addEventListener("click", (e) => {
                            const selectedCard = e.currentTarget;
                            const targetDate = selectedCard.dataset.date;

                            document.querySelectorAll(".forecast-day-card").forEach(c => c.classList.remove("active-day"));
                            selectedCard.classList.add("active-day");
                            
                            const dayNameText = selectedCard.querySelector(".day-name").textContent;
                            document.querySelector(".dropdown-day span").textContent = dayNameText;

                            document.querySelectorAll(".days-switch div").forEach(div => {
                                div.classList.remove("active");
                                if (div.dataset.date === targetDate) div.classList.add("active");
                            });

                            updateHourlySection(targetDate);
                        });
                    });

                    document.querySelectorAll(".days-switch div").forEach(div => {
                        div.addEventListener("click", (e) => {
                            const selectedDiv = e.currentTarget;
                            const targetDate = selectedDiv.dataset.date;
                            const shortName = selectedDiv.dataset.shortName;

                            document.querySelectorAll(".days-switch div").forEach(d => d.classList.remove("active"));
                            selectedDiv.classList.add("active");

                            document.querySelector(".dropdown-day span").textContent = shortName;

                            document.querySelectorAll(".forecast-day-card").forEach(c => {
                                c.classList.remove("active-day");
                                if (c.dataset.date === targetDate) c.classList.add("active-day");
                            });

                            updateHourlySection(targetDate);

                            document.querySelector(".dropdown-day").classList.remove("active");
                            document.querySelector(".days-switch").classList.remove("active");
                        });
                    });
                    
                    window.hourlyData = weatherData.hourly;
                    
                    document.querySelector(".dropdown-day span").textContent = new Date(daily.time[0]).toLocaleDateString('en-US', { weekday: 'short' });
                    updateHourlySection(daily.time[0]);
                });
        })
        .catch(error => {
            console.error("Error updating weather data:", error);
            window.location.href = "error.html";
        });
}


function updateHourlySection(targetDate) {
    if (!window.hourlyData) return;

    const hourly = window.hourlyData;
    const hourlyList = document.querySelector(".hourly-list");
    hourlyList.innerHTML = "";

    hourly.time.forEach((timeString, index) => {
        const currentDatePart = timeString.split("T")[0];

        if (currentDatePart === targetDate) {
            const timePart = timeString.split("T")[1];
            
            let hourInt = parseInt(timePart.split(":")[0]);
            const ampm = hourInt >= 12 ? 'PM' : 'AM';
            hourInt = hourInt % 12;
            hourInt = hourInt ? hourInt : 12; 
            const formattedTime = `${hourInt} ${ampm}`;

            const hourIcon = getWeatherIconPath(hourly.weather_code[index]);
            const hourTemp = Math.round(hourly.temperature_2m[index]);

            const hourItemHtml = `
                <div class="hourly-item">
                    <div class="time-info">
                        <img src="${hourIcon}" alt="weather-icon"> <span>${formattedTime}</span>
                    </div>
                    <span class="temp">${hourTemp}°</span>
                </div>
            `;
            hourlyList.insertAdjacentHTML("beforeend", hourItemHtml);
        }
    });
}

const searchInput = document.querySelector(".search-bar input");
const searchButton = document.querySelector(".search-bar button");

searchButton.addEventListener("click", () => {
    if (searchInput.value.trim() !== "") {
        searchAndGetWeather(searchInput.value.trim());
    }
});

searchInput.addEventListener("keypress", (e) => {
    if (e.key === "Enter") {
        e.preventDefault(); 
        
        if (searchInput.value.trim() !== "") {
            searchAndGetWeather(searchInput.value.trim());
        }
    }
});

searchAndGetWeather();
