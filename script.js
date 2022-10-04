'use strict';

// BANKIST APP - this is an application for a bank called "Bankist"
// DIFFERENT DATA! Contains movement dates, currency and locale

const account1 = {
  owner: 'Jonas Schmedtmann',
  movements: [200, 455.23, -306.5, 25000, -642.21, -133.9, 79.97, 1300],
  interestRate: 1.2, // %
  pin: 1111,

  movementsDates: [
    '2019-11-18T21:31:17.178Z',
    '2019-12-23T07:42:02.383Z',
    '2020-01-28T09:15:04.904Z',
    '2020-04-01T10:17:24.185Z',
    '2020-05-08T14:11:59.604Z',
    '2022-08-27T17:01:17.194Z',
    '2022-09-10T23:36:17.929Z',
    '2022-09-12T10:51:36.790Z',
  ],
  currency: 'EUR',
  locale: 'pt-PT', // de-DE
};

const account2 = {
  owner: 'Jessica Davis',
  movements: [5000, 3400, -150, -790, -3210, -1000, 8500, -30],
  interestRate: 1.5,
  pin: 2222,

  movementsDates: [
    '2019-11-01T13:15:33.035Z',
    '2019-11-30T09:48:16.867Z',
    '2019-12-25T06:04:23.907Z',
    '2020-01-25T14:18:46.235Z',
    '2020-02-05T16:33:06.386Z',
    '2020-04-10T14:43:26.374Z',
    '2020-06-25T18:49:59.371Z',
    '2020-07-26T12:01:20.894Z',
  ],
  currency: 'USD',
  locale: 'en-US',
};

const accounts = [account1, account2];

/////////////////////////////////////////////////
// Elements
const labelWelcome = document.querySelector('.welcome');
const labelDate = document.querySelector('.date');
const labelBalance = document.querySelector('.balance__value');
const labelSumIn = document.querySelector('.summary__value--in');
const labelSumOut = document.querySelector('.summary__value--out');
const labelSumInterest = document.querySelector('.summary__value--interest');
const labelTimer = document.querySelector('.timer');

const containerApp = document.querySelector('.app');
const containerMovements = document.querySelector('.movements');

const btnLogin = document.querySelector('.login__btn');
const btnTransfer = document.querySelector('.form__btn--transfer');
const btnLoan = document.querySelector('.form__btn--loan');
const btnClose = document.querySelector('.form__btn--close');
const btnSort = document.querySelector('.btn--sort');

const inputLoginUsername = document.querySelector('.login__input--user');
const inputLoginPin = document.querySelector('.login__input--pin');
const inputTransferTo = document.querySelector('.form__input--to');
const inputTransferAmount = document.querySelector('.form__input--amount');
const inputLoanAmount = document.querySelector('.form__input--loan-amount');
const inputCloseUsername = document.querySelector('.form__input--user');
const inputClosePin = document.querySelector('.form__input--pin');

//// CREATING DOM ELEMENTS:
// Functions

const formatMovementDate = function (date, locale) {
  const calcDaysPassed = (date1, date2) =>
    Math.round(Math.abs(date2 - date1) / (1000 * 60 * 60 * 24));
  //this function calculates the number of days that have passed since the movement was made

  const daysPassed = calcDaysPassed(new Date(), date);
  console.log(daysPassed);

  if (daysPassed === 0) return 'Today';
  if (daysPassed === 1) return 'Yesterday';
  if (daysPassed <= 7) return `${daysPassed} days ago`;//this shows up in the page as "days ago"

  /* const day = `${date.getDate()}`.padStart(2, 0); //this returns the day of the month that the movement was made
  const month = `${date.getMonth() + 1}`.padStart(2, 0);//this returns the month that the movement was made
  const year = date.getFullYear();//this returns the year that the movement was made
  return `${day}/${month}/${year}`;//this returns the date that the movement was made */

  //the above commented out code just typed differently:
  return new Intl.DateTimeFormat(locale).format(date);
};

const formatCurrency = function (value, locale, currency) {
  return new Intl.NumberFormat(locale, {
    style: 'currency',
    currency: currency,
  }).format(value);
};

function displayMovements(/*movements*/ account, sort = false) {
  containerMovements.innerHTML = ""; //this empties the entire "movements" container where you see deposits and withdrawals, and only then we start adding new elements.


  //innerHTML is similar to textContent. textContent returns only text; innterHTML returns text+html code
  const movementss = sort ? account.movements.slice().sort((a, b) => a - b) : account.movements; //if sort is true, we sort the movements array. If sort is false, we don't sort the movements array.

  movementss.forEach(function (movement, index) {
    const type = movement > 0 ? 'deposit' : 'withdrawal'; //if movement is bigger than 0, it's a deposit, otherwise - withdrawal

    const date = new Date(account.movementsDates[index]);
    const displayDate = formatMovementDate(date, account.locale);

    const formattedMovement = formatCurrency(movement, account.locale, account.currency);

    /* new Intl.NumberFormat(account.locale, {
      style: 'currency',
      currency: account.currency,
    }).format(movement); <-- this code does the same as const formattedMovement */

    const html = `<div class="movements__row">
      <div class="movements__type movements__type--${type}">${index + 1} ${type}</div>
      <div class="movements__date">${displayDate}</div>
      <div class="movements__value">${formattedMovement}</div>
      </div>`; //this shows up in the page as money deposits and withdrawals

    //toFixed(2) rounds the number to 2 decimal places, which means there are 2 numbers after the comma.. we later change "${movement.toFixed(2)}€" to "${formattedMovement}" because we want to use the Intl.NumberFormat method to format the numbers
    containerMovements.insertAdjacentHTML('afterbegin', html); //adding html right after the container start
  });
}

// THE REDUCE METHOD:
const calcDisplayBalance = function (acc) {
  acc.balance = acc.movements.reduce((acc, movement) => acc + movement, 0);//reduce method takes an array and a function. The function takes two arguments: the first is the accumulator, the second is the current value. The function returns the new accumulator.)

  labelBalance.textContent = /* `${acc.balance.toFixed(2)}€`; */
    /* new Intl.NumberFormat(acc.locale, {
      style: 'currency',
      currency: acc.currency,
    }).format(acc.balance); */
    formatCurrency(acc.balance, acc.locale, acc.currency);
};

// CREATING TOTALS THAT SHOW UP IN THE BOTTOM OF THE PAGE: TOTAL DEPOSITS AND TOTAL WITHDRAWALS AND BANK INTEREST
const calcDisplaySummary = function (acc) {
  const incomes = acc.movements//movements is an array with all deposits and withdrawals
    .filter(movement => movement > 0)//filters out all deposits (movements that are bigger than 0)
    .reduce((acc, movement) => acc + movement, 0);//Reduce method takes all positive values&adds them up. We get the total amount of deposits.
  labelSumIn.textContent = formatCurrency(incomes, acc.locale, acc.currency); // `${incomes.toFixed(2)}€`;//this shows up in the page as total amount of deposits

  const expenses = acc.movements//movements is an array with all deposits and withdrawals
    .filter(movement => movement < 0)//filters out all withdrawals (movements that are smaller than 0)
    .reduce((acc, movement) => acc + movement, 0);//Reduce method takes all negative values&adds them up. We get the total amount of withdrawals.
  labelSumOut.textContent = formatCurrency(Math.abs(expenses), acc.locale, acc.currency); // `${Math.abs(expenses).toFixed(2)}€`;//this shows up in the page as total amount of withdrawals. Math.abs is used to get the absolute value of the number(get rid of the minus sign).

  const interest = acc.movements//movements is an array with all deposits and withdrawals
    .filter(movement => movement > 0)//filters out all deposits (movements that are bigger than 0)
    .map(deposit => deposit * acc.interestRate / 100)//here we multiply each deposit by 1.2% and divide it by 100 to get the interest.
    .filter((interest, index, array) => {//filters out all interests that are smaller than 0
      console.log(array);
      return interest >= 1;//if the interest is bigger than 1, it's an interest, otherwise - not an interest, and won't be added to the total interest amount
    })
    .reduce((acc, interest) => acc + interest, 0);//Reduce method takes all positive values&adds them up. We get the total amount of interest.
  labelSumInterest.textContent = formatCurrency(interest, acc.locale, acc.currency); // `${interest.toFixed(2)}€`;//this shows up in the page as total amount of interest
};

// COMPUTING USERNAMES:
const createUsernames = function (accs) {
  accs.forEach(function (acc) {//for each account we want to do what's written in next lines
    acc.username = acc.owner.toLowerCase()//takes whole bank account user name,makes all letters lowercase
      .split(" ")//then separates all words(name and last name) with a space
      .map(name => name[0])//then maps the function that returns only the first letter of each word(name and last name first letters) and puts them in an array
      .join("");//with this we join all array elements & get just a string with each word's first letters
  });
};
createUsernames(accounts);//with this we make every accounts(we have 4 accounts) usernames.

// UPDATE UI:
const updateUI = function (currentAccount) {
  //display movements:
  displayMovements(currentAccount);
  //display balance:
  calcDisplayBalance(currentAccount);
  //display summary:
  calcDisplaySummary(currentAccount);
};

// TIMER: we want a 5min timer on the app that logs user out after 5mins
const startLogOutTimer = function () {
  const tick = function () { //setInterval method calls a function or evaluates an expression at specified intervals(in this case - every second)
    //reminder to myself: everything after setInterval and before 1000) is a callback function that we pass into setInterval
    
        // calculate minutes and seconds: we want the timer to show minutes and seconds
        const minutes = String(Math.trunc(time / 60)).padStart(2, 0);//Math.trunc method returns the integer part of a number. We divide time by 60 to get minutes. We use String method to convert the number to a string. We use padStart method to add 0 to the beginning of the number if it's smaller than 10. We use 2 as the first argument because we want the number to be 2 digits long. We use 0 as the second argument because we want to add 0 to the beginning of the number if it's smaller than 10.
        const seconds = String(time % 60).padStart(2, 0);//Math.trunc method returns the integer part of a number. We divide time by 60 to get seconds. We use String method to convert the number to a string. We use padStart method to add 0 to the beginning of the number if it's smaller than 10. We use 2 as the first argument because we want the number to be 2 digits long. We use 0 as the second argument because we want to add 0 to the beginning of the number if it's smaller than 10.
        
        // in each callback call, print the remaining time to UI: we want the timer to show up in the UI
        labelTimer.textContent = `${minutes}:${seconds}`;
    
        // when 0 seconds, stop timer and log out user:
        if (time === 0) {
          clearInterval(timer);//clearInterval method clears a timer set with the setInterval() method
          labelWelcome.textContent = "Log in to get started";
          containerApp.style.opacity = 0;
        }

        // decrease 1s: we want the timer to count down every second
        time--;
      };

  // set time to 5 minutes:
  let time = 300;

  // call timer every second: we want the timer to count down every second
  tick();//we call the tick function here so that the timer starts counting down immediately when we log in
  
  const timer = setInterval(tick, 1000); // 1000ms = 1s
  
  return timer;
};
// TIMER END

///////////////////////////////////////
// Event handlers
// IMPLEMENTING LOGIN:
let currentAccount, timer;//this is a variable that will hold the current account that is logged in, and the timer that will log out the user after 5mins

/* FAKE ALWAYS LOGGED IN: (for testing purposes)
this is a function that logs in the first account in the array and
it's always logged in when you open the page: */
//currentAccount = account1;
//updateUI(currentAccount);
//containerApp.style.opacity = 100;
// FAKE ALWAYS LOGGED IN END

btnLogin.addEventListener("click", function (event) {
  event.preventDefault();//this prevents the page from reloading when we click the button
  currentAccount = accounts.find(acc => acc.username === inputLoginUsername.value);
  console.log(currentAccount);
  //"Number(inputLoginPin.value)" is the same as "+inputLoginPin.value"
  if (currentAccount?.pin === +inputLoginPin.value) {//if the pin is correct, we show the "form"
    //display UI and message:
    labelWelcome.textContent = `Welcome back, ${currentAccount.owner.split(" ")[0]}`;
    containerApp.style.opacity = 100;

    /* TIME: create current date and time:
    const now = new Date();
    //labelDate.textContent = now;//this shows up as the current date like this: Mon Sep 12 2022 18:20:54 GMT+0300 (Eastern European Summer Time)
    // we want the date to show up as day/month/year:
    const day = `${now.getDate()}`.padStart(2, 0); //this returns the day of the month with two digits
    const month = `${now.getMonth() + 1}`.padStart(2, 0); //this returns the month of the year. We add 1 because months start counting from 0
    const year = now.getFullYear(); //this returns the year
    const hour = `${now.getHours()}`.padStart(2, 0); //this returns the hour
    const minute = `${now.getMinutes()}`.padStart(2, 0); //this returns the minute
    labelDate.textContent = `${day}/${month}/${year}, ${hour}:${minute}`;//this shows up as the current date like this: 12/9/2022, 18:20
    // TIME END */

    // UPDATED TIME: create current date and time:
    // experiment with API:
    const now = new Date();
    const options = {
      hour: 'numeric',
      minute: 'numeric',
      day: 'numeric',
      month: /*'long'*/ 'numeric',
      year: 'numeric',
      //weekday: 'long',
    };
    /* const locale = navigator.language; /*this is a browser API that returns the language of the browser,
    so it'll have different languages for different browsers(people). */

    labelDate.textContent = new Intl.DateTimeFormat(/*en-US*/currentAccount.locale, options).format(now);
    // lv-LV for Latvia ... but if we put currentAccount.locale, it'll be the language of the account owner
    // TIME END

    //clear input fields:
    inputLoginUsername.value = inputLoginPin.value = "";
    inputLoginPin.blur();

    if(timer) clearInterval(timer); // if there's a timer from another user, we clear it
    timer = startLogOutTimer(); // this starts the 5min timer

    //update UI:
    updateUI(currentAccount);
  }
});

// const accounts = accounts.find(acc => acc.owner === "Jessica Davis");//this finds the object with the owner name "Jessica Davis"

// IMPLEMENTING TRANSFERRING MONEY FROM ONE PERSONS ACCOUNT TO ANOTHER PERSONS ACCOUNT:
btnTransfer.addEventListener("click", function (event) {
  event.preventDefault();//this prevents the page from reloading when we click the button
  const amount = +inputTransferAmount.value;
  const receiverAcc = accounts.find(account => account.username === inputTransferTo.value);
  inputTransferAmount.value = inputTransferTo.value = ""; // this leaves all transfer money fields empty after the transfer is done

  /* checking if the receiver account exists and current account(sender) has enough money to send,
  also user should not be able to send money to themselves: "?." means if the receiver account doesn't exist,
  money should not be sent. So if the "receiverAcc" doesn't exist, then "receiverAcc?.username" becomes undefined
  and the whole && operation will fail. */
  if (
    amount > 0 &&
    receiverAcc &&
    currentAccount.balance >= amount &&
    receiverAcc?.username !== currentAccount.username) {
    currentAccount.movements.push(-amount); // when doing transfer operation, sender account should lose money
    receiverAcc.movements.push(amount); // when doing transfer operation, receiver account should receive money

    // Add transfer date:
    currentAccount.movementsDates.push(new Date().toISOString());
    receiverAcc.movementsDates.push(new Date().toISOString());

    //update UI:
    updateUI(currentAccount);

    //reset timer: we want the timer to reset and not log us out when we do a transfer or request a loan.
    clearInterval(timer);
    timer = startLogOutTimer();//this starts the 5min timer
  }
});

/* IMPLEMENTING REQUESTING A LOAN: */
btnLoan.addEventListener("click", function (event) {
  event.preventDefault();//this prevents the page from reloading when we click the button
  // Rounding decimals: 
  const amount = Math.floor(inputLoanAmount.value);//this rounds the number to the nearest integer, so that loan isn't 10.14EUR, but just 10EUR

  // When user requests a loan, we check if the user has any deposit that is bigger than 10% of the requested loan amount:
  // SOME method:
  if (amount > 0 && currentAccount.movements.some(movement => movement >= amount * 0.1)) {
    // Set timeout so that loan is not given right away
    setTimeout(function () {
      //add movement
      currentAccount.movements.push(amount);

      // Add loan date:
      currentAccount.movementsDates.push(new Date().toISOString());

      //update UI:
      updateUI(currentAccount);

      //reset timer: we want the timer to reset and not log us out when we do a transfer or request a loan.
      clearInterval(timer);
      timer = startLogOutTimer(); //this starts the 5min timer
    }, 2500); // loan is accepted and given after 2.5 seconds
  }
  //clear input field:
  inputLoanAmount.value = "";
});

/* Close the account feature (person closes their bank account & in code it disappears from
the accounts array - the account object is deleted from the accounts array): */
btnClose.addEventListener("click", function (event) {
  event.preventDefault(); // this prevents the page from reloading when we click the button

  // checiking if the credentials are correct:
  if (inputCloseUsername.value === currentAccount.username &&
    +inputClosePin.value === currentAccount.pin) {
    const index = accounts.findIndex(acc => acc.username === currentAccount.username);//this finds the index of the current account in the accounts array    

    // delete account:
    accounts.splice(index, 1);//this deletes the account from the accounts array

    // hide UI:
    containerApp.style.opacity = 0;//this hides the UI when the account is deleted from the accounts array
  }
  inputCloseUsername.value = inputClosePin.value = ""; // this leaves all close account fields empty after the account is closed
});

// SORTING THE MOVEMENTS:
let sorted = false; // this is a variable that will hold the boolean value of whether the movements are sorted or not

btnSort.addEventListener("click", function (event) {
  event.preventDefault(); // this prevents the page from reloading when we click the button
  displayMovements(currentAccount, !sorted);
  sorted = !sorted; // this changes the value of the "sorted" variable from false to true and vice versa
});

// ROUND REQUESTED LOAN AMOUNT TO 2 DECIMAL PLACES:
const requestedLoanAmount = 5.1;

/*///////////////////////////////////////////////////////////////////////////////////////////////////////
JUST FOR FUN TO SEE HOW %[reminder operator] WORKS: */
labelBalance.addEventListener("click", function () {
  [...document.querySelectorAll(".movements__row")].forEach(function (currentRow, currentIndex) {
    if (currentIndex % 2 === 0) currentRow.style.backgroundColor = "orangered";
    if (currentIndex % 3 === 0) currentRow.style.backgroundColor = "blue";
  });
});
/* ABOVE CODE BLOCK EXPLAINED:
we select all rows of movements[money incomes and outgoings] with querySelectorAll and then
we convert the node list into an array with the spread operator and square brackets [...].
Then we loop over the array with forEach and for each row we check if the current index is divisible by 2!
If it is, we change the background color of the row to orangered. If the current index is divisible by 3,
we change the background color of the row to blue.
///////////////////////////////////////////////////////////////////////////////////////////////////////*/

