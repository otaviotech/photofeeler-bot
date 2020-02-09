require('dotenv').config();
const puppeteer = require('puppeteer');
const { LOGIN_MODE, URLS } = require('./constants');
const { getAtRandomIndex, setTimeoutPromise } = require('./utils');

let pfCookies;

if (process.env.LOGIN_MODE === LOGIN_MODE.BY_COOKIES) {
  pfCookies = require('../cookies.js');
}

async function submitRate(page) {
  await setTimeoutPromise(1000);
  await page.evaluate(() => {
    document.querySelector('.vote-button .submit').click();
  });
  return page;
}

async function getRateButtons(page) {
  const smart = await page.$$('.score-column.smart .btn');
  const trustWorthy = await page.$$('.score-column.trustworthy .btn');
  const attractive = await page.$$('.score-column.attractive .btn');

  return {
    smart,
    trustWorthy,
    attractive,
  };
}

async function randomlyRate(page) {
  const rateButtons = await getRateButtons(page);
  const buttonsToClick = Object.values(rateButtons).map(getAtRandomIndex);

  const finishedRating = !await buttonsToClick[0].isIntersectingViewport();

  if (finishedRating) {
    return page;
  }

  await Promise.all(buttonsToClick.map((button) => button.click()));
  await submitRate(page);
  await setTimeoutPromise(2000);

  return randomlyRate(page);
}

async function getBrowser() {
  return puppeteer.launch({ headless: false });
  // return puppeteer.launch({args: ['--no-sandbox', '--disable-setuid-sandbox'], headless: false});
}

async function getNewPage(browser) {
  return browser.newPage();
}

function takeScreenshot(path) {
  return async (page) => {
    await page.screenshot({ path, type: 'png', fullPage: true });
    return page;
  }
}

async function closePageBrowser(page) {
  return page.browser().close();
}

function fillCredentials(credentials) {
  return async (page) => {
    await page.type('input[type="email"]', credentials.email);
    await page.type('input[type="password"]', credentials.password);
    return page;
  };
}

function setCookies(cookies) {
  return async (page) => {
    await page.setCookie(...cookies);
    return page;
  };
}

async function doLogin(page) {
  await page.click('input[type="submit"]');
  await page.waitForNavigation({ waitUntil: 'networkidle2' });
  return page;
}

function gotoPage(url) {
  return async (page) => {
    await page.goto(url, { waitUntil: 'networkidle2' });
    return page;
  };
}

exports.loginWithCredentials = async function loginWithCredentials(credentials, page) {
  return Promise.resolve(page)
    .then(gotoPage(URLS.LOGIN))
    .then(fillCredentials(credentials))
    .then(doLogin);
}

exports.loginWithCookies = function loginWithCookies(cookies) {
  return async (page) => Promise.resolve(page)
    .then(gotoPage(URLS.MY_TESTS))
    .then(setCookies(cookies));
}

exports.login = function login({ loginMode, cookies, credentials }) {
  return (page) => {
    if (loginMode === LOGIN_MODE.BY_COOKIES) {
      return exports.loginWithCookies(cookies)(page);
    }

    if (loginMode === LOGIN_MODE.BY_CREDENTIALS) {
      return exports.loginWithCredentials(credentials, page);
    }

    return Promise.reject();
  }
}

function finish () {
  console.log('All rates done! Cheers!');
  process.exit(0);
}

function onError(error) {
  console.error(error);
  process.exit(1);
}

exports.start = function start() {
  getBrowser()
    .then(getNewPage)
    .then(exports.login({
      loginMode: process.env.LOGIN_MODE,
      credentials: { email: process.env.PF_EMAIL, password: process.env.PF_PASSWORD },
      cookies: pfCookies,
    }))
    .then(gotoPage(URLS.VOTE_DATING))
    .then(randomlyRate)
    .then(closePageBrowser)
    .then(finish)
    .catch(onError);
}