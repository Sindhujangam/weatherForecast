document.addEventListener('DOMContentLoaded', function () {
    const cityForm = document.getElementById('city-form');
    const cityInput = document.getElementById('city-input');
    const suggestionsContainer = document.getElementById('suggestions');
    let cityList = [];

    // Fetch city list
    fetch('city.list.json')
        .then(response => {
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            return response.json();
        })
        .then(data => {
            cityList = data;
            enableAutocomplete(cityList);
        })
        .catch(error => {
            console.error('Error loading city list:', error);
        });

    // Autocomplete function
    function enableAutocomplete(cityList) {
        cityInput.addEventListener('input', function () {
            const value = this.value.trim().toLowerCase();
            suggestionsContainer.innerHTML = ''; // Clear previous suggestions
            if (value) {
                const filteredCities = cityList.filter(city => city.name.toLowerCase().startsWith(value));
                filteredCities.slice(0, 10).forEach(city => {
                    const div = document.createElement('div');
                    div.textContent = city.name;
                    div.addEventListener('click', () => {
                        cityInput.value = city.name;
                        suggestionsContainer.innerHTML = ''; // Clear suggestions
                        findCity(city.name); // Fetch weather data for selected city
                    });
                    suggestionsContainer.appendChild(div);
                });
            }
        });

        // Hide suggestions when clicking outside
        document.addEventListener('click', function(event) {
            if (!suggestionsContainer.contains(event.target) && event.target !== cityInput) {
                suggestionsContainer.innerHTML = '';
            }
        });
    }

    cityForm.addEventListener('submit', function (event) {
        event.preventDefault();
        const cityName = cityInput.value.trim();
        if (cityName) {
            findCity(cityName);
        }
    });

    function findCity(cityName) {
        const city = cityList.find(item => item.name.toLowerCase() === cityName.toLowerCase());
        console.log(`Searching for city: ${cityName}`); // Debugging log
        if (city) {
            console.log(`Found city: ${city.name}, ID: ${city.id}, Country: ${city.country || 'IN'}`);
            
            // Construct the API URL based on whether the country code is provided
            const apiUrl = `https://api.openweathermap.org/data/2.5/weather?id=${city.id}&appid=3a0aab383df26c3bb7b99cedaedd0e18&units=metric`;
    
            getWeatherData(apiUrl);
        } else {
            console.error('City not found');
            alert('City not found. Please try another location.');
        }
    }
    
    function getWeatherData(apiUrl) {
        fetch(apiUrl)
            .then(response => {
                if (!response.ok) {
                    throw new Error(`HTTP error! status: ${response.status}`);
                }
                return response.json();
            })
            .then(data => {
                console.log(data);
                displayWeatherData(data);
                cityInput.value = ''; // Clear input after fetching weather data
                suggestionsContainer.innerHTML = ''; // Clear suggestions after fetching data
                enableAutocomplete(cityList); // Re-enable autocomplete after fetching data
            })
            .catch(error => {
                console.error('Unable to fetch weather data:', error);
                alert('Unable to fetch weather data. Please try another location.');
            });
    }
    
    function displayWeatherData(data) {
        const { name: location, sys, weather, main, rain, wind } = data;
        const description = weather[0].description;
        const temperature = main.temp;
        const humidity = main.humidity;
        const precipitation = rain ? rain['1h'] : 0;
        const country = sys.country;
        const windSpeed = wind ? wind.speed : 'N/A';
        const windDirection = wind ? wind.deg : 'N/A';
        const iconCode = weather[0].icon;

        let temperatureFeel;
        if (temperature < 0) {
            temperatureFeel = "freezing cold";
        } else if (temperature < 10) {
            temperatureFeel = "cold";
        } else if (temperature < 20) {
            temperatureFeel = "cool";
        } else if (temperature < 30) {
            temperatureFeel = "warm";
        } else {
            temperatureFeel = "hot";
        }

        const detailedDescription = `Currently, it's ${description}.<br>
        The temperature is ${temperature}°C and feels ${temperatureFeel}.<br>
        The humidity level is ${humidity}%.<br>
        There has been ${precipitation}mm of precipitation in the last hour.<br>
        Wind is blowing at ${windSpeed} m/s from ${windDirection}° direction.`;

        document.getElementById('location').textContent = `Location: ${location}, ${country}`;
        document.getElementById('completedescription').innerHTML = `${detailedDescription}`;
        document.getElementById('description').textContent = `Weather: ${description}`;
        document.getElementById('temperature').textContent = `Temperature: ${temperature}°C`;
        document.getElementById('humidity').textContent = `Humidity: ${humidity}%`;
        document.getElementById('precipitation').textContent = `Precipitation (last hour): ${precipitation}mm`;

        const iconUrl = `https://openweathermap.org/img/wn/${iconCode}.png`;
        document.getElementById('weather-icon').innerHTML = `<img src="${iconUrl}" alt="${description}" />`;
    }

    if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(position => {
            const { latitude: lat, longitude: lon } = position.coords;
            const apiUrl = `https://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${lon}&appid=3a0aab383df26c3bb7b99cedaedd0e18&units=metric`;
            getWeatherData(apiUrl);
        }, error => {
            alert('Unable to get your current location. Please enter your city name to check the weather.');
        });
    } else {
        alert('Geolocation is not supported by this browser. Please enter a city name.');
    }
});
