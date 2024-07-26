document.addEventListener('DOMContentLoaded', function () {
  const apiKey = '3a0aab383df26c3bb7b99cedaedd0e18'; // Replace with your OpenWeatherMap API key
  const cityForm = document.getElementById('city-form');
  const cityInput = document.getElementById('city-input');

  cityForm.addEventListener('submit', function (event) {
      event.preventDefault();
      const city = cityInput.value.trim();
      if (city) getWeatherData(`q=${city}`);
  });

  function getWeatherData(query) {
      const apiUrl = `https://api.openweathermap.org/data/2.5/weather?${query}&appid=${apiKey}&units=metric`;

      fetch(apiUrl)
          .then(response => {
              if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
              return response.json();
          })
          .then(data => displayWeatherData(data))
          .catch(error => {
              console.error('Unable to fetch weather data:', error);
              alert('Unable to fetch weather data. Please try another location.');
          });
  }

  function displayWeatherData(data) {
      const { name: location, weather, main, rain } = data;
      const description = weather[0].description;
      const temperature = main.temp;
      const humidity = main.humidity;
      const precipitation = rain ? rain['1h'] : 0;

      document.getElementById('location').textContent = `Location: ${location}`;
      document.getElementById('description').textContent = `Description: ${description}`;
      document.getElementById('temperature').textContent = `Temperature: ${temperature}°C`;
      document.getElementById('humidity').textContent = `Humidity: ${humidity}%`;
      document.getElementById('precipitation').textContent = `Precipitation (last hour): ${precipitation}mm`;
  }

  if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(position => {
          const { latitude: lat, longitude: lon } = position.coords;
          getWeatherData(`lat=${lat}&lon=${lon}`);
      }, error => {
          console.error('Error getting current location:', error);
          alert('Unable to get your current location. Please enter your city name to check the weather.');
      });
  } else {
      alert('Geolocation is not supported by this browser. Please enter a city name.');
  }
});
