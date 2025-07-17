class WeatherClockMyWayCard extends HTMLElement {
  setConfig(config) {
    this.config = config;
    this.innerHTML = `<ha-card id="weather-clock-my-way-card">
      <style>
        #wcmw-card {
          
        }
        .wcmw-card-container {
          display: flex; 
          padding: 1rem 1.5rem; 
          justify-content: space-between; 
          align-items: center; 
        }
        
        .wcmw-card-info {
          display: flex; 
          padding-bottom: 1rem; 
          flex-direction: column; 
        }
        
        .wcmw-card-day {
          font-weight: 700; 
          text-transform: uppercase; 
        }
        
        .wcmw-card-time {
          font-weight: 900; 
          line-height: 1; 
          font-size: 60px;
        }
        
        .wcmw-card-row {
          display: flex; 
          justify-content: space-between; 
          align-items: center; 
        }
        
        .wcmw-card-condition {
          font-weight: 700; 
          text-transform: uppercase; 
        }
        
        .wcmw-card-temp {
          font-weight: 900; 
          line-height: 1; 
          font-size: 40px;
        }
        
        .wcmw-card-winds {
          font-weight:700;
          font-size:14px;
        }
        
        .wcmw-card-icon-container {
        }
        
        .wcmw-card-icon img {
          width:150px;
          height:150px;
        }
      </style>
      <div class="wcmw-card-container">
      <div>
        <div class="wcmw-card-info">
          <div class="wcmw-card-day" id="wcmw-card-day"></div>
          <div class="wcmw-card-time" id="wcmw-card-time"></div>
        </div>
        <div class="wcmw-card-row">
          <div>
            <div>
              <div class="wcmw-card-condition" id="wcmw-card-condition"></div>
              <div class="wcmw-card-temp" id="wcmw-card-temp"></div>
              <div class="wcmw-card-winds" id="wcmw-card-winds"></div>
            </div>
          </div>
        </div>
      </div>
      <div class="wcmw-card-icon-container">
        <div class="wcmw-card-icon" id="wcmw-card-icon"></div>
      </div>
    </div>
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
    this.querySelector('#wcmw-card-day').innerText = day.toUpperCase();
    this.querySelector('#wcmw-card-time').innerText = time;
  }

  updateCard() {
    // Päivämäärä ja aika
    this.updateTime();

    // Sääentiteetti (muuta tarvittaessa)
    const weatherEntity = this.config.weather || '';
    const windSpeedEntity = this.config.wind_speed || '';
    const windBearingEntity = this.config.wind_bearing || '';
    const windGustEntity = this.config.wind_gust || '';
    const tempEntity = this.config.temperature || '';
    const windSpeedUnitEntity = this.config.wind_speed_unit || 'm/s';
    const debug = this.config.debug || false;

    const weatherState = this._hass?.states[weatherEntity];
    const tempValue = tempEntity ? this._hass?.states[tempEntity]?.state : weatherState?.attributes.temperature;
    const tempUnit = weatherState?.attributes.temperature_unit || '°C';
    const condition = weatherState?.state || '';
    const windSpeed = windSpeedEntity ? this._hass?.states[windSpeedEntity]?.state : weatherState?.attributes.wind_speed;
    const windSpeedUnit = windSpeedUnitEntity ? this._hass?.states[windSpeedUnitEntity]?.state : weatherState?.attributes.wind_speed_unit;
    const windBearing = windBearingEntity ? this._hass?.states[windBearingEntity]?.state : weatherState?.attributes.wind_bearing;
    const windGust = windGustEntity ? this._hass?.states[windGustEntity]?.state : weatherState?.attributes.wind_gust_speed;

    // Sääkuvake
    const conditionIcon = this.getWeatherIcon(condition);
    const windDirectionIcon = this.getWindDirectionIcon(windBearing);

    // Tekstit
    this.querySelector('#wcmw-card-condition').innerText = this.getConditionText(condition);
    this.querySelector('#wcmw-card-temp').innerText = tempValue ? `${Math.round(tempValue)}${tempUnit}` : '-';
    this.querySelector('#wcmw-card-winds').innerText =
      (windDirectionIcon ? `${windDirectionIcon} ` : '') +
      (windSpeed ? `${windSpeed} ${windSpeedUnit}` : '') +
      (windGust ? `🌬️ ${windGust} ${windSpeedUnit}` : '');

    // Kuvake
    this.querySelector('#wcmw-card-icon').innerHTML = conditionIcon;

    if(debug){
      console.log(`[WCMW DEBUG] Weather entity:`);
      console.log(weatherEntity);
      console.log(`[WCMW DEBUG] Weather state:`);
      console.log(weatherState);
      console.log(`[WCMW DEBUG] Weather condition:`);
      console.log(condition);
    }
  }

  getWeatherIcon(condition) {
    const iconMap = {
      'clear-night': 'clear-night.svg',
      'cloudy': 'cloudy.svg',
      'exceptional': 'exceptional.svg',
      'fog': 'fog.svg',
      'hail': 'hail.svg',
      'lightning': 'thunderstorms.svg',
      'lightning-rainy': 'thunderstorms-rain.svg',
      'partlycloudy': 'partly-cloudy-day.svg',
      'pouring': 'extreme-rain.svg',
      'rainy': 'rain.svg',
      'snowy': 'snow.svg',
      'snowy-rainy': 'sleet.svg',
      'sunny': 'clear-day.svg',
      'windy': 'wind.svg',
      'windy-variant': 'wind.svg',
    };
    const iconFile = iconMap[(condition || '').toLowerCase()] || 'not-available.svg';
    // HACS:in kautta oikea polku on /hacsfiles/<repo-nimi>/<kansio>/<kuva>
    return `<img src="/hacsfiles/weather-clock-my-way-card/icons/meteocons/${iconFile}" alt="${condition}">`;
  }

  getConditionText(condition) {
    // Suomentaa säätilan
    switch ((condition || '').toLowerCase()) {
      case 'clear-night':      return 'Selkeä yö';
      case 'cloudy':           return 'Paljon pilviä';
      case 'exceptional':      return 'Poikkeuksellinen';
      case 'fog':              return 'Sumu';
      case 'hail':             return 'Rakeita';
      case 'lightning':        return 'Ukkonen';
      case 'lightning-rainy':  return 'Ukkosta ja sadetta';
      case 'partlycloudy':     return 'Vähän pilviä';
      case 'pouring':          return 'Kaatosade';
      case 'rainy':            return 'Sade';
      case 'snowy':            return 'Lumi';
      case 'snowy-rainy':      return 'Lunta ja sadetta / räntää';
      case 'sunny':            return 'Auringonpaistetta';
      case 'windy':            return 'Tuulista';
      case 'windy-variant':    return 'Tuulta ja pilviä';
      default: return condition ? condition : '';
    }
  }

  getWindDirectionIcon(degree) {
    if ((degree >= 337.5 && degree <= 360) || (degree >= 0 && degree <= 22.5)) {
      return '↓';
    }
    if (degree > 22.5 && degree <= 67.5) {
      return '↙';
    }
    if (degree > 67.5 && degree <= 112.5) {
      return '←';
    }
    if (degree > 112.5 && degree <= 157.5) {
      return '↖';
    }
    if (degree > 157.5 && degree <= 202.5) {
      return '↑';
    }
    if (degree > 202.5 && degree <= 247.5) {
      return '↗';
    }
    if (degree > 247.5 && degree <= 292.5) {
      return '→';
    }
    if (degree > 292.5 && degree < 337.5) {
      return '↘';
    }
    return '';
  }

  getCardSize() {
    return 3;
  }
}
customElements.define('weather-clock-my-way-card', WeatherClockMyWayCard);