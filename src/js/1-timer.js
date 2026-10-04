import flatpickr from 'flatpickr';
import 'flatpickr/dist/flatpickr.min.css';
import iziToast from 'izitoast';
import 'izitoast/dist/css/iziToast.min.css';

const refs = {
  days: document.querySelector('span[data-days]'),
  hours: document.querySelector('span[data-hours]'),
  minutes: document.querySelector('span[data-minutes]'),
  seconds: document.querySelector('span[data-seconds]'),
  startButton: document.querySelector('button[data-start]'),
  dateInput: document.querySelector('#datetime-picker'),
};

let userSelectedDate = null;
let timerId = null;

const options = {
  enableTime: true,
  time_24hr: true,
  defaultDate: new Date(),
  minuteIncrement: 1,
  onClose(selectedDates) {
    const selectedDate = selectedDates[0];

    if (!selectedDate || selectedDate <= Date.now()) {
      userSelectedDate = null;
      refs.startButton.disabled = true;
      iziToast.error({
        title: 'Error',
        message: 'Please choose a date in the future',
        position: 'topRight',
        timeout: 3000,
        closeOnClick: true,
      });
      return;
    }

    userSelectedDate = selectedDate;
    refs.startButton.disabled = false;
  },
};

flatpickr(refs.dateInput, options);
refs.startButton.disabled = true;
refs.startButton.addEventListener('click', onStartButtonClick);

function onStartButtonClick() {
  if (!userSelectedDate) {
    return;
  }

  refs.startButton.disabled = true;
  refs.dateInput.disabled = true;

  tick();
  timerId = setInterval(tick, 1000);
}

function tick() {
  const msLeft = userSelectedDate - Date.now();

  if (msLeft <= 0) {
    stopTimer();
    return;
  }

  updateTimerUI(convertMs(msLeft));
}

function stopTimer() {
  clearInterval(timerId);
  timerId = null;
  userSelectedDate = null;

  updateTimerUI({ days: 0, hours: 0, minutes: 0, seconds: 0 });
  refs.dateInput.disabled = false;
  refs.startButton.disabled = true;

  iziToast.success({
    title: 'Done',
    message: 'Time is up!',
    position: 'topRight',
    timeout: 5000,
    closeOnClick: true,
  });
}

function updateTimerUI({ days, hours, minutes, seconds }) {
  refs.days.textContent = addLeadingZero(days);
  refs.hours.textContent = addLeadingZero(hours);
  refs.minutes.textContent = addLeadingZero(minutes);
  refs.seconds.textContent = addLeadingZero(seconds);
}

function addLeadingZero(value) {
  return String(value).padStart(2, '0');
}

function convertMs(ms) {
  // Number of milliseconds per unit of time
  const second = 1000;
  const minute = second * 60;
  const hour = minute * 60;
  const day = hour * 24;

  // Remaining days
  const days = Math.floor(ms / day);
  // Remaining hours
  const hours = Math.floor((ms % day) / hour);
  // Remaining minutes
  const minutes = Math.floor(((ms % day) % hour) / minute);
  // Remaining seconds
  const seconds = Math.floor((((ms % day) % hour) % minute) / second);

  return { days, hours, minutes, seconds };
}
