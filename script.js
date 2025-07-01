// ----------------------------------------
// App settings (default)
// ----------------------------------------

// save key HTML elements

const site = document.querySelector('.site');
const clock = document.querySelector('countdown-clock');

let pomodoroSettings;
const pomodoroSettingsDefault = {
  themeFont: 'sans',
  themeColor: 'red',
  timePomodoro: 25,
  timeShortBreak: 5,
  timeLongBreak: 15,
};

const localStorageId = 'pomodoro';

function applyThemeSettings() {
  if (site && clock) {
    site.dataset.themeColor = pomodoroSettings.themeColor;
    site.dataset.themeFont = pomodoroSettings.themeFont;
    clock.setAttribute('total-time', `${pomodoroSettings.timePomodoro}:00`);
  }
}

function setupStage(stage) {
  let stageTotalTime = '01';
  if (stage === 'pomodoro') stageTotalTime = pomodoroSettings.timePomodoro;
  if (stage === 'short-break') stageTotalTime = pomodoroSettings.timeShortBreak;
  if (stage === 'long-break') stageTotalTime = pomodoroSettings.timeLongBreak;
  clock.setAttribute('total-time', `${stageTotalTime}:00`);
}

function updateLocalStorage(settings, storageId) {
  localStorage.setItem(storageId, JSON.stringify(settings));
}

function retrieveFromLocalStorage(storageId) {
  return (
    JSON.parse(localStorage.getItem(storageId)) || {
      ...pomodoroSettingsDefault,
    }
  );
}

// ----------------------------------------
// Stages controls
// ----------------------------------------

if (site && clock) {
  const stages = document.querySelectorAll('input[name="stage"]');

  if (stages) {
    function handleStageChange(event) {
      // console.log(this.value);
      setupStage(this.value);
    }

    stages.forEach((stage) =>
      stage.addEventListener('change', handleStageChange)
    );
  }
}

// ----------------------------------------
// Settings controls
// ----------------------------------------

const settingsOpenButton = document.querySelector('.settings-open-button');
const settingsDialog = document.querySelector('dialog');

// only do this if the settings open button and the dialog are present on the page
if (settingsOpenButton && settingsDialog) {
  // Get HTML elements
  const settingsForm = document.querySelector('#settings-form');
  const settingsCloseButton = settingsForm.querySelector(
    '.settings-cancel-button'
  );
  const settingsTimePomodoroInput = settingsForm.querySelector(
    '#settings-input-time-pomodoro'
  );
  const settingsTimeShortBreakInput = settingsForm.querySelector(
    '#settings-input-time-short-break'
  );
  const settingsTimeLongBreakInput = settingsForm.querySelector(
    '#settings-input-time-long-break'
  );
  const settingsThemeFontInputs = settingsForm.querySelectorAll(
    'input[name="settings-input-theme-font"]'
  );
  const settingsThemeColorInputs = settingsForm.querySelectorAll(
    'input[name="settings-input-theme-color"]'
  );

  // define handler functions

  function handleOpenSettings(event) {
    // Populate the form with the current settings
    settingsTimePomodoroInput.value = pomodoroSettings.timePomodoro;
    settingsTimeShortBreakInput.value = pomodoroSettings.timeShortBreak;
    settingsTimeLongBreakInput.value = pomodoroSettings.timeLongBreak;

    const themeFontSelection = Array.from(settingsThemeFontInputs).find(
      (input) => input.value === pomodoroSettings.themeFont
    );
    if (themeFontSelection) themeFontSelection.checked = true;

    const themeColorSelection = Array.from(settingsThemeColorInputs).find(
      (input) => input.value === pomodoroSettings.themeColor
    );
    if (themeColorSelection) themeColorSelection.checked = true;

    // Make the modal visible
    settingsDialog.showModal();
  }

  function handleFormSubmit(event) {
    event.preventDefault();
    // console.log('new settings applied');

    // save form input values into the settings
    pomodoroSettings.timePomodoro = settingsTimePomodoroInput.value;
    pomodoroSettings.timeShortBreak = settingsTimeShortBreakInput.value;
    pomodoroSettings.timeLongBreak = settingsTimeLongBreakInput.value;
    const themeFontSelection = Array.from(settingsThemeFontInputs).find(
      (input) => input.checked
    );
    pomodoroSettings.themeFont = themeFontSelection.value;
    const themeColorSelection = Array.from(settingsThemeColorInputs).find(
      (input) => input.checked
    );
    pomodoroSettings.themeColor = themeColorSelection.value;

    // save the settings to local storage
    updateLocalStorage(pomodoroSettings, localStorageId);

    // apply those (updated) settings to the site
    applyThemeSettings();

    // clost the settings dialog
    settingsDialog.close();
  }

  function handleDialogClick(event) {
    // console.log(event.target, event.currentTarget);
    // if clicked outside the dialog container OR clicked the close button, then close the settings dialog (without saving the new settings)
    if (
      event.target === event.currentTarget ||
      event.target === settingsCloseButton
    )
      settingsDialog.close();
  }

  // Add event listeners
  settingsDialog.addEventListener('click', handleDialogClick);
  settingsForm.addEventListener('submit', handleFormSubmit);
  settingsOpenButton.addEventListener('click', handleOpenSettings);
}

// ----------------------------------------
// Form input controls
// ----------------------------------------

function handleNumberInputFocus(event) {
  this.select();
}

// const numberInputs = document.querySelectorAll('.form input[type=number]');
const numberInputs = document.querySelectorAll(
  '.numeric input[inputmode=numeric]'
);
if (numberInputs)
  numberInputs.forEach((input) =>
    input.addEventListener('focusin', handleNumberInputFocus)
  );

function handleInputControl(event) {
  // event.preventDefault();
  const container = this.closest('.numeric');
  const input = container.querySelector('input[inputmode=numeric]');

  const newValue = parseInt(input.value) + parseInt(this.dataset.step);

  // check if max or min value specified, and only update the value if the newValue is within the acceptable range
  if (input.max && newValue > parseInt(input.max)) return;
  if (input.min && newValue < parseInt(input.min)) return;

  input.value = newValue;
  // input.select();
}

const numberInputControls = document.querySelectorAll('.numeric__stepper');
if (numberInputControls)
  numberInputControls.forEach((input) =>
    input.addEventListener('click', handleInputControl)
  );

// ----------------------------------------
// Utility functions
// ----------------------------------------

function timeStringToMsec(timeString) {
  const timeTokens = timeString.split(':');
  return Number(timeTokens[0]) * 60 * 1000 + Number(timeTokens[1]) * 1000;
}

function timeToString(timeInMsec) {
  let mins = Math.floor(timeInMsec / (1000 * 60));
  let secs = Math.floor((timeInMsec % (1000 * 60)) / 1000);
  return `${mins.toString().padStart(2, '0')}:${secs
    .toString()
    .padStart(2, '0')}`;
}

function timeStringToHtml(timeString) {
  const timeTokens = timeString.split(':');
  return `<time datetime="PT${Number(timeTokens[0])}M${Number(
    timeTokens[1]
  )}S">${timeTokens[0].padStart(2, '0')}:${timeTokens[1].padStart(
    2,
    '0'
  )}</time>`;
}

function delay(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

// ----------------------------------------
// Countdown Clock
// ----------------------------------------

class CountdownClock extends HTMLElement {
  constructor() {
    super();

    // Attach an ElementInternals to get states property
    this._internals = this.attachInternals();

    // Basic (default) internal parameters
    this.intervalId = null;
    this.intervalDelay = 250;

    // Calculate the circle radius and the normalised version which is radius minus the stroke width
    const viewBoxSize = 100;
    const radius = viewBoxSize / 2;
    const normalisedRadius = radius - this.stroke / 2;
    this.calculatedCircumference = normalisedRadius * 2 * Math.PI;

    this.totalTimeMsec = timeStringToMsec(this.totalTime);
    this.remainingTimeMsec = timeStringToMsec(this.remainingTime);

    // console.log(this.id, this.totalTime, this.remainingTime);

    // Set the default aria role states
    this.setAttribute('aria-label', this.label);
    this.setAttribute('role', 'progressbar');

    // Render the component with all the data ready
    this.innerHTML = `
    <div class="countdown-clock__inner">
      <div class="countdown-clock__visual">
        <svg 
          fill="none" 
          viewBox="0 0 ${viewBoxSize} ${viewBoxSize}"
          focusable="false"
          class="countdown-clock__circle"
        >
          <circle 
            class="countdown-clock__progress-circle"
            data-progress-circle
            r="${normalisedRadius}"
            cx="${radius}"
            cy="${radius}"
            stroke-linecap="round"
            stroke-dasharray="${this.calculatedCircumference} ${this.calculatedCircumference}"
            stroke-width="${this.stroke}"
          />
        </svg>
      </div>
      <div class="countdown-clock__text">
        <div class="countdown-clock__time text-preset1" data-progress-time></div>
        <button class="countdown-clock__control-button text-preset2" value="start"><span>start</span></button>
      </div>
    </div>
    `;

    // set up the control button
    this.controlButton = this.querySelector('button');
    this.controlButton.addEventListener(
      'click',
      this.handleControlButtonClick.bind(this)
    );

    // initialize the remaining time (in case was not set)
    this.setRemainingTime(this.remainingTime);
  }

  setState(newState) {
    if (newState === 'finish') {
      // console.log(this.id, 'new state FINISH');
      this.state = 'finished';
      this.finished = true;

      // clear any existing interval
      this.stopTimer();
      // change button text to 'restart'
      this.controlButton.innerHTML = '<span>restart</span>';
      this.controlButton.value = 'restart';
      return;
    }

    if (newState === 'pause') {
      // console.log(this.id, 'new state PAUSE');
      this.state = 'paused';
      this.finished = false;

      // clear any existing interval
      this.stopTimer();
      // if not completed, then change button text to 'start'
      this.controlButton.innerHTML = '<span>start</span>';
      this.controlButton.value = 'start';
      // else, change button text to 'restart'
      return;
    }

    if (newState === 'start') {
      // console.log(this.id, 'new state START');
      this.state = 'started';
      this.finished = false;

      // start up a new interval
      this.startTimer();
      // change button text to 'pause'
      this.controlButton.innerHTML = '<span>pause</span>';
      this.controlButton.value = 'pause';
      return;
    }

    if (newState === 'restart') {
      // console.log(this.id, 'new state RESTART');
      this.state = 'started';
      this.finished = false;

      // reset remaining time to the total time
      this.setRemainingTime(this.totalTime);
      // start up a new interval
      this.startTimer();
      // change button text to 'pause'
      this.controlButton.innerHTML = '<span>pause</span>';
      this.controlButton.value = 'pause';
      return;
    }
  }

  handleControlButtonClick(event) {
    const buttonText = this.controlButton.value;
    this.setState(buttonText);
  }

  setTotalTime(timeString) {
    // console.log('setting total time:', timeString);

    this.totalTimeMsec = timeStringToMsec(timeString);

    // if the clock is currently running, pause it and reset the remaining time
    if (this.state === 'started') {
      this.setState('pause');
      // reset the progress
      this.setRemainingTime(this.totalTime);
    } else {
      // if the clock is in other states,
      //   this.state === 'finished'
      //   this.state === 'paused'
      // then ...
      //   no need to pause the timer
      //   not 100% about what to do with the remaining time
      //   want to keep the feature of being able to set the remaining time as an initial HTML attribute

      // reset the progress
      this.setRemainingTime(
        this.remainingTimeMsec <= 0 ? this.totalTime : this.remainingTime
      );
    }

    // if not set to auto start, then end here
    if (!this.autoStart) return;

    // otherwise, start the timer up
    this.setState('start');
  }

  setRemainingTime(timeString) {
    let timeMsec = timeStringToMsec(timeString);

    // Remaining time should never exceed max (total time)
    if (timeMsec > this.totalTimeMsec) {
      timeString = this.totalTime;
      timeMsec = this.totalTimeMsec;
    }
    // Remaining time should never fall below min (0)
    if (timeMsec < 0) {
      timeString = '0:00';
      timeMsec = 0;
    }

    this.remainingTimeMsec = timeMsec;

    // calculate a percent of time remaining
    const percent = (100 * timeMsec) / this.totalTimeMsec;

    // Set the aria role value for screen readers
    this.setAttribute('aria-valuenow', percent);

    const progressCircle = this.querySelector('[data-progress-circle]');
    const progressTime = this.querySelector('[data-progress-time]');

    // Calculate a dash offset value based on the calculated circumference and the current percentage
    progressCircle.style.strokeDashoffset =
      this.calculatedCircumference -
      (percent / 100) * this.calculatedCircumference;

    // A human readable version for the text label
    progressTime.innerHTML = timeStringToHtml(timeString);

    // Set a complete or pending state based on progress
    if (percent === 0) {
      this.setAttribute('data-progress-state', 'complete');
      this.setState('finish');
    } else {
      this.setAttribute('data-progress-state', 'pending');
    }
  }

  stopTimer() {
    if (this.intervalId) {
      clearInterval(this.intervalId);
      this.intervalId = null;
    }
  }

  async startTimer() {
    await delay(1000); // Wait for 1 second (1000 milliseconds)

    // Calculate new end time
    this.endTimeMsec = Date.now() + this.remainingTimeMsec;

    // create new interval for the timer
    this.intervalId = setInterval(() => {
      // calculate new remaining time compared to current time
      const newRemainingTime = timeToString(this.endTimeMsec - Date.now());

      // if no time has passed, then skip doing any updating
      if (newRemainingTime === this.remainingTime) return;

      // else update the remaining time
      // console.log(
      //   this.id,
      //   this.totalTime,
      //   this.remainingTime,
      //   this.remainingTimeMsec,
      //   newRemainingTime
      // );
      this.setAttribute('remaining-time', newRemainingTime);
    }, this.intervalDelay);
  }

  // GETTERS

  get finished() {
    return this._internals.states.has('finished');
  }

  set finished(flag) {
    if (flag) {
      // Existence of identifier corresponds to "true"
      this._internals.states.add('finished');
    } else {
      // Absence of identifier corresponds to "false"
      this._internals.states.delete('finished');
    }
  }

  get label() {
    return this.getAttribute('label') || 'Countdown clock';
  }

  get stroke() {
    return this.getAttribute('stroke') || 3.25;
  }

  get totalTime() {
    return this.getAttribute('total-time') || '01:00';
  }

  get remainingTime() {
    return (
      this.getAttribute('remaining-time') ||
      this.getAttribute('total-time') ||
      '01:00'
    );
  }

  get autoStart() {
    // --- false
    // auto-start (equivalent to auto-start="") --- true
    // auto-start="true" --- true
    // auto-start="false" --- false
    const value = this.getAttribute('auto-start');
    return value === 'true' || value === '';
  }

  // Observe changes on the following attributes
  static get observedAttributes() {
    return ['total-time', 'remaining-time'];
  }

  // Handle the changes on those observed attributes
  attributeChangedCallback(name, oldValue, newValue) {
    if (name === 'total-time') {
      this.setTotalTime(newValue);
    }
    if (name === 'remaining-time') {
      this.setRemainingTime(newValue);
    }
  }
}

customElements.define('countdown-clock', CountdownClock);

// ----------------------------------------
// Main program
// ----------------------------------------

// 1. Read in settings from local storage (or set to default)
pomodoroSettings = retrieveFromLocalStorage(localStorageId);

// 2. Initialize the page with the theme font and color, the countdown timer with the pomodoro time
applyThemeSettings();
