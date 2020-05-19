require('dotenv').config();
const puppeteer = require('puppeteer');
const { LOGIN_MODE, URLS } = require('./constants');
const { getAtRandomIndex, setTimeoutPromise, parseBool } = require('./utils');

let pfCookies;

if (process.env.LOGIN_MODE === LOGIN_MODE.BY_COOKIES) {
  pfCookies = require('../cookies.js');
}

exports.submitRate = async function submitRate(page) {
  await setTimeoutPromise(1000);
  await page.evaluate(() => {
    document.querySelector('.vote-button .submit').click();
  });
  return page;
}

exports.getRateButtons = async function getRateButtons(page) {
  const smart = await page.$$('.score-column.smart .btn');
  const trustWorthy = await page.$$('.score-column.trustworthy .btn');
  const attractive = await page.$$('.score-column.attractive .btn');

  return {
    smart,
    trustWorthy,
    attractive,
  };
}

exports.randomlyRate = async function randomlyRate(page) {
  const rateButtons = await exports.getRateButtons(page);
  const buttonsToClick = Object.values(rateButtons).map(getAtRandomIndex);

  const finishedRating = !await buttonsToClick[0].isIntersectingViewport();
  const reachedMaxKarma = await page.$eval('.karma-value', (element) => {
    return element.innerHTML.includes('Max');
  });

  if (finishedRating || reachedMaxKarma)
    return page;
  }

  await Promise.all(buttonsToClick.map((button) => button.click()));
  await exports.submitRate(page);
  await setTimeoutPromise(2000);

  return randomlyRate(page);
}

exports.getBrowser = async function getBrowser(p, { headless }) {
  return p.launch({args: ['--no-sandbox', '--disable-setuid-sandbox'], headless });
}

exports.getNewPage = async function getNewPage(browser) {
  return browser.newPage();
}

function takeScreenshot(path) {
  return async (page) => {
    await page.screenshot({ path, type: 'png', fullPage: true });
    return page;
  }
}

exports.closePageBrowser = async function closePageBrowser(page) {
  return page.browser().close();
}

exports.fillCredentials = function fillCredentials(credentials) {
  return async (page) => {
    await page.type('input[type="email"]', credentials.email);
    await page.type('input[type="password"]', credentials.password);
    return page;
  };
}

exports.setCookies = function setCookies(cookies) {
  return async (page) => {
    await page.setCookie(...cookies);
    return page;
  };
}

exports.doLogin = async function doLogin(page) {
  await page.click('input[type="submit"]');
  await page.waitForNavigation({ waitUntil: 'networkidle2' });
  return page;
}

exports.gotoPage = function gotoPage(url) {
  return async (page) => {
    await page.goto(url, { waitUntil: 'networkidle2' });
    return page;
  };
}

exports.loginWithCredentials = async function loginWithCredentials(credentials, page) {
  return Promise.resolve(page)
    .then(exports.gotoPage(URLS.LOGIN))
    .then(exports.fillCredentials(credentials))
    .then(exports.doLogin);
}

exports.loginWithCookies = function loginWithCookies(cookies) {
  return async (page) => Promise.resolve(page)
    .then(exports.gotoPage(URLS.MY_TESTS))
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

exports.finish = function finish () {
  console.log('All rates done! Cheers!');
  process.exit(0);
}

exports.onError = function onError(error) {
  console.error(error);
  process.exit(1);
}

exports.start = function start() {
  exports.getBrowser(puppeteer, { headless: parseBool(process.env.HEADLESS) })
    .then(exports.getNewPage)
    .then(exports.login({
      loginMode: process.env.LOGIN_MODE,
      credentials: { email: process.env.PF_EMAIL, password: process.env.PF_PASSWORD },
      cookies: pfCookies,
    }))
    .then(exports.gotoPage(URLS.VOTE_DATING))
    .then(exports.randomlyRate)
    .then(exports.closePageBrowser)
    .then(exports.finish)
    .catch(exports.onError);
}
