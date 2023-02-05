'use strict';

// prettier-ignore
const months = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];

const form = document.querySelector('.form');
const containerWorkouts = document.querySelector('.workouts');
const inputType = document.querySelector('.form__input--type');
const inputDistance = document.querySelector('.form__input--distance');
const inputDuration = document.querySelector('.form__input--duration');
const inputCadence = document.querySelector('.form__input--cadence');
const inputElevation = document.querySelector('.form__input--elevation');
class Workout {
  date = new Date();
  id = (Date.now() + '').slice(-10);
  constructor(coords, distance, duration) {
    this.coords = coords;
    this.distance = distance;
    this.duration = duration;
    this.calcPace;
  }
  getDescrption() {
    // prettier-ignore
    const months = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];

    this.descrption = `${this.type[0].toUpperCase()}${this.type.slice(1)} on ${
      months[this.date.getMonth()]
    } ${this.date.getDate()}`;
  }
}

class Running extends Workout {
  type = 'running';
  constructor(coords, distance, duration, cadence) {
    super(coords, distance, duration);
    this.cadence = cadence;
    this.calcPace();
   this.getDescrption();
  }
  calcPace() {
    this.pace = this.distance / this.duration;
    return this.pace;
  }
}
class Cycling extends Workout {
  type = 'cycling';
  constructor(coords, distance, duration, elevation) {
    super(coords, distance, duration);
    this.elevation = elevation;
    this.calcSpeed();
    this.getDescrption()
  }
  calcSpeed() {
    this.speed = this.distance / (this.duration / 60);
    return this.speed;
  }
}
class App {
  #map;
  #mapEvent;
  #workout = [];
  constructor() {
    this._getLocalStorage()
    this._getPosition();
    form.addEventListener('submit', this._newWorkout.bind(this));
    inputType.addEventListener('change', this._toggleElevationField.bind(this));
 containerWorkouts.addEventListener('click',this._moveToView.bind(this))
  }
  _getPosition() {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        this._loadMap.bind(this),
        function () {
          alert('could not find your location');
        }
      );
    }
  }

  _loadMap(position) {
    const { latitude } = position.coords;
    const { longitude } = position.coords;
    const coords = [latitude, longitude];
    this.#map = L.map('map').setView(coords, 13);

    L.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution:
        '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
    }).addTo(this.#map);

    this.#map.on('click', this._showForm.bind(this));
     this.#workout.forEach(work => {
       this._Marker(work);
     });
 
  }

  _showForm(mapE) {
    this.#mapEvent = mapE;
    form.classList.remove('hidden');
    inputDistance.focus();
  }
  _toggleElevationField() {
    inputCadence.closest('.form__row').classList.toggle('form__row--hidden');
    inputElevation.closest('.form__row').classList.toggle('form__row--hidden');
  }

  _newWorkout(e) {
    e.preventDefault();

    // const form = document.querySelector('.form');
    // const containerWorkouts = document.querySelector('.workouts');
    // const inputType = document.querySelector('.form__input--type');
    // const inputDistance = document.querySelector('.form__input--distance');
    // const inputDuration = document.querySelector('.form__input--duration');
    // const inputCadence = document.querySelector('.form__input--cadence');
    // const inputElevation = document.querySelector('.form__input--elevation');
    const isNumber = (...input) => input.every(inp => Number.isFinite(inp));
    const isPositive = (...input) => input.every(inp => inp > 0);

    const type = inputType.value;
    const distance = +inputDistance.value;
    const duration = +inputDuration.value;
    const { lat, lng } = this.#mapEvent.latlng;
    let workout;

    if (type === 'running') {
      const cadence = +inputCadence.value;
      if (
        !isNumber(distance, duration, cadence) ||
        !isPositive(distance, duration, cadence)
      )
        return alert('enter positive distance');
      workout = new Running([lat, lng], distance, duration, cadence);
    }
    if (type === 'cycling') {
      const elevation = +inputElevation.value;
      if (
        !isNumber(distance, duration, elevation) ||
        !isPositive(distance, duration)
      )
        return alert('enter positive distance');

      workout = new Cycling([lat, lng], distance, duration, elevation);
    }
    this.#workout.push(workout);
 
    this._generateWorkout(workout);
       this._Marker(workout);
 this._hideForm()
this._setLocalStorage() 
}

  _hideForm() {
    // Empty inputs
    inputDistance.value =
      inputDuration.value =
      inputCadence.value =
      inputElevation.value =
        '';

    form.style.display = 'none';
    form.classList.add('hidden');
    setTimeout(() => (form.style.display = 'grid'), 1000);
  }
  _Marker(workout) {
    L.marker(workout.coords)
      .addTo(this.#map)
      .bindPopup(
        L.popup({
          maxWidth: 250,
          minWidth: 100,
          autoClose: false,
          closeOnClick: false,
          className: `${workout.type}-popup`,
        })
      )
      .setPopupContent(
        `${workout.type === 'running' ? '🏃‍♂️' : '🚴‍♀️'} ${workout.descrption}`
      )
      .openPopup();
  }

  _generateWorkout(workout) {
    let html = `<li class="workout workout--${workout.type}" data-id="${
      workout.id
    }">
          <h2 class="workout__title"></h2>
          <div class="workout__details">
            <span class="workout__icon">${
              workout.type === 'running' ? '🏃‍♂️' : '🚴‍♀️'
            }</span>
            <span class="workout__value">${workout.distance}</span>
            <span class="workout__unit">km</span>
          </div>
          <div class="workout__details">
            <span class="workout__icon">⏱</span>
            <span class="workout__value">${workout.duration}</span>
            <span class="workout__unit">min</span>
          </div>
        `;
    if (workout.type === 'running') {
      html += `
  <div class="workout__details">
    <span class="workout__icon">⚡️</span>
    <span class="workout__value">${workout.pace.toFixed()}</span>
    <span class="workout__unit">min/km</span>
  </div>
  <div class="workout__details">
    <span class="workout__icon">🦶🏼</span>
    <span class="workout__value">${workout.cadence}</span>
    <span class="workout__unit">spm</span>
  </div>
</li>`;
    }

    if (workout.type === 'cycling') {
      html += `
  <div class="workout__details">
    <span class="workout__icon">⚡️</span>
    <span class="workout__value">${workout.speed.toFixed(1)}</span>
    <span class="workout__unit">km/h</span>
  </div>
  <div class="workout__details">
    <span class="workout__icon">⛰</span>
    <span class="workout__value">${workout.elevation}</span>
    <span class="workout__unit">m</span>
  </div>
</li>`;
    }
  form.insertAdjacentHTML("afterend",html)
  }
_moveToView(e){
const workoutE=e.target.closest('.workout')
const search=this.#workout.find(work=>work.id==workoutE.dataset.id)
this.#map.setView(search.coords,13,
  { animate: true,
      pan: {
        duration: 1,
      },
    });
}
_setLocalStorage(){
  localStorage.setItem("workout",JSON.stringify(this.#workout))
}
_getLocalStorage(){
  let data =JSON.parse( localStorage.getItem("workout"))
  if(!data) return
data.forEach(work=>this._generateWorkout(work))
}
}


// <li class="workout workout--cycling" data-id="1234567891">
//   <h2 class="workout__title">Cycling on April 5</h2>
//   <div class="workout__details">
//     <span class="workout__icon">🚴‍♀️</span>
//     <span class="workout__value">27</span>
//     <span class="workout__unit">km</span>
//   </div>
//   <div class="workout__details">
//     <span class="workout__icon">⏱</span>
//     <span class="workout__value">95</span>
//     <span class="workout__unit">min</span>
//   </div>
//   <div class="workout__details">
//     <span class="workout__icon">⚡️</span>
//     <span class="workout__value">16</span>
//     <span class="workout__unit">km/h</span>
//   </div>
//   <div class="workout__details">
//     <span class="workout__icon">⛰</span>
//     <span class="workout__value">223</span>
//     <span class="workout__unit">m</span>
//   </div>
// </li>
const map1 = new App();
