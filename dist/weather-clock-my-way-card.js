class WeatherClockMyWayCard extends HTMLElement {
  setConfig(config) {
    this.config = config;
    this.innerHTML = `<ha-card id="weather-clock-my-way-card">
      <style>
        #weather-clock-my-way-card {
          background: #222;
          color: #fff;
          font-family: 'Arial', sans-serif;
          display: flex;
          flex-direction: row;
          align-items: center;
          justify-content: space-between;
          padding: 16px;
        }
        .weather-info {
          display: flex;
          flex-direction: column;
          justify-content: center;
        }
        .day {
          text-transform: uppercase;
          font-size: 1rem;
          letter-spacing: 1px;
          margin-bottom: 0.5rem;
        }
        .time {
          font-size: 3.5rem;
          font-weight: bold;
          margin-bottom: 0.5rem;
        }
        .condition {
          font-size: 1.1rem;
          margin-bottom: 0.2rem;
        }
        .temp {
          font-size: 2.7rem;
          font-weight: bold;
          margin-bottom: 0.4rem;
        }
        .winds {
          font-size: 1.1rem;
          opacity: 0.85;
        }
        .weather-icon {
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 5rem;
          margin-left: 2rem;
        }
        @media (max-width: 600px) {
          #weather-clock-my-way-card {
            flex-direction: column;
            align-items: flex-start;
          }
          .weather-icon {
            margin-left: 0;
            margin-top: 1rem;
            font-size: 3.5rem;
          }
        }
      </style>
      <div class="weather-info">
        <div class="day" id="day"></div>
        <div class="time" id="time"></div>
        <div class="condition" id="condition"></div>
        <div class="temp" id="temp"></div>
        <div class="winds" id="winds"></div>
      </div>
      <div class="weather-icon" id="icon"></div>
    </ha-card>`;
    this.updateCard();
    if (!this._interval) {
      this._interval = setInterval(() => this.updateTime(), 1000);
    }
  }

  set hass(hass) {
    this._hass = hass;
    this.updateCard();
  }

  updateTime() {
    const now = new Date();
    const day = now.toLocaleDateString('fi-FI', {
      weekday: 'long',
      day: 'numeric',
      month: 'long'
    });
    const time = now.toLocaleTimeString('fi-FI', {
      hour: '2-digit',
      minute: '2-digit'
    });
    this.querySelector('#day').innerText = day.toUpperCase();
    this.querySelector('#time').innerText = time;
  }

  updateCard() {
    // Päivämäärä ja aika
    this.updateTime();

    // Sääentiteetti (muuta tarvittaessa)
    const weatherEntity = this.config.weather || 'weather.home';
    const windSpeedEntity = this.config.wind_speed || '';
    const windGustEntity = this.config.wind_gust || '';
    const tempEntity = this.config.temperature || '';
    const weatherState = this._hass?.states[weatherEntity];
    const tempValue = tempEntity ? this._hass?.states[tempEntity]?.state : weatherState?.attributes.temperature;
    const tempUnit = weatherState?.attributes.temperature_unit || '°C';
    const condition = weatherState?.state || '';
    const windSpeed = windSpeedEntity ? this._hass?.states[windSpeedEntity]?.state : weatherState?.attributes.wind_speed;
    const windGust = windGustEntity ? this._hass?.states[windGustEntity]?.state : weatherState?.attributes.wind_gust_speed;

    // Sääkuvake
    const conditionIcon = this.getWeatherIcon(condition);

    // Tekstit
    this.querySelector('#condition').innerText = this.getConditionText(condition);
    this.querySelector('#temp').innerText = tempValue ? `${Math.round(tempValue)}${tempUnit}` : '-';
    this.querySelector('#winds').innerText =
      (windSpeed ? `↘ ${windSpeed} m/s ` : '') +
      (windGust ? `🌬️ ${windGust} m/s` : '');

    // Kuvake
    this.querySelector('#icon').innerHTML = conditionIcon;
  }

  getWeatherIcon(condition) {
    const iconMap = {
      'clear': 'clear-day.svg',
      'cloudy': 'cloudy.svg',
      'rainy': 'rain.svg',
      // lisää muut
    };
    const iconFile = iconMap[(condition || '').toLowerCase()] || 'rain.svg';
    // HACS:in kautta oikea polku on /hacsfiles/<repo-nimi>/<kansio>/<kuva>
    return `<img src="/hacsfiles/weather-clock-my-way-card/icons/meteocons/${iconFile}" alt="${condition}" style="height:72px;">`;
  }
  /*
  getWeatherIcon(condition) {
    // Yksinkertainen ikonitulkinta, voit laajentaa
    switch ((condition || '').toLowerCase()) {
      case 'clear-night':
        return '🌕';
      case 'clear':
      case 'sunny':
        return '☀️';
      case 'cloudy':
        return '☁️';
      case 'partlycloudy':
      case 'partly-cloudy':
      case 'partly_cloudy':
        return '⛅️';
      case 'rainy':
      case 'rain':
        return '🌧️';
      case 'snowy':
      case 'snow':
        return '❄️';
      case 'fog':
        return '🌫️';
      case 'windy':
        return '💨';
      default:
        return '🌥️';
    }
  }
  */

  getConditionText(condition) {
    // Suomentaa säätilan
    switch ((condition || '').toLowerCase()) {
      case 'cloudy': return 'ENIMMÄKSEEN PILVISTÄ';
      case 'clear': return 'SELKEÄÄ';
      case 'rainy': return 'SATEISTA';
      case 'fog': return 'SUMUISTA';
      case 'snowy': return 'LUMISTA';
      case 'partlycloudy': return 'PUOLIPILVISTÄ';
      default: return condition ? condition.toUpperCase() : '';
    }
  }

  getCardSize() {
    return 3;
  }
}
customElements.define('weather-clock-my-way-card', WeatherClockMyWayCard);