const PhotofeelerBot = require('./bot');
const CONSTANTS = require('./constants');

describe('Photofeeler Bot', () => {
  describe('login()', () => {
    it('Should call the correct login implementation. (BY_COOKIES)', async (done) => {
      PhotofeelerBot.loginWithCookies = jest.fn(() => jest.fn(async () => Promise.resolve()));

      await PhotofeelerBot.login({
        loginMode: CONSTANTS.LOGIN_MODE.BY_COOKIES,
        cookies: { c: 1 },
      })('call 0');

      expect(PhotofeelerBot.loginWithCookies).
        toHaveBeenCalledWith({ c: 1 });

      PhotofeelerBot.loginWithCookies.mockRestore();

      done();
    });

    it('Should call the correct login implementation. (BY_CREDENTIALS)', async (done) => {
      PhotofeelerBot.loginWithCredentials = jest.fn(async () => jest.fn(async () => Promise.resolve()));

      const credentials = { email: 'johndoe@email.com', password: '123456' };

      await PhotofeelerBot.login({
        loginMode: CONSTANTS.LOGIN_MODE.BY_CREDENTIALS,
        credentials,
      })('page');

      expect(PhotofeelerBot.loginWithCredentials).
        toHaveBeenCalledWith(credentials, 'page');

      done();
    });

    it('Should reject if no login mode was passed.', async (done) => {
      PhotofeelerBot.login({})().catch(() => {
        expect(true).toBeTruthy();
        done();
      })
    });
  });

  describe('gotoPage()', () => {
    it('should return page if success.', async (done) => {
      const pageMock = {
        goto: jest.fn(() => Promise.resolve()),
      }

      const url = 'url'
      const result = await PhotofeelerBot.gotoPage(url)(pageMock);

      expect(result).toEqual(pageMock);
      expect(pageMock.goto).toHaveBeenCalledWith(url, { waitUntil: 'networkidle2' });

      done();
    });
  });

  describe('fillCredentials()', () => {
    it('should fill the credentials correctly and return the page if success.', async (done) => {
      const pageMock = {
        type: jest.fn(() => Promise.resolve()),
      }

      const credentials = { email: 'johndoe@email.com', password: '123456' }
      const result = await PhotofeelerBot.fillCredentials(credentials)(pageMock);

      expect(result).toEqual(pageMock);
      expect(pageMock.type).toHaveBeenCalledWith('input[type="email"]', credentials.email);
      expect(pageMock.type).toHaveBeenCalledWith('input[type="password"]', credentials.password);

      done();
    });
  });

  describe('setCookies()', () => {
    it('should set browser cookies', async (done) => {
      const pageMock = {
        setCookie: jest.fn(() => Promise.resolve()),
      }

      const cookies = [{ a: 'a' }, { b: 'b' }];
      const result = await PhotofeelerBot.setCookies(cookies)(pageMock);

      expect(pageMock.setCookie).toHaveBeenCalledWith(...cookies);
      done();
    });
  });

  describe('submitRate()', () => {
    it('should call evaluate to click the button.', async (done) => {
      const pageMock = {
        evaluate: jest.fn(() => Promise.resolve()),
      }
      const result = await PhotofeelerBot.submitRate(pageMock);
      expect(pageMock.evaluate).toHaveBeenCalled();
      done();
    });
  });

  describe('getRateButtons()', () => {
    it('should bring the rating buttons.', async (done) => {
      const pageMock = {
        '$$': jest.fn(() => Promise.resolve([])),
      }
      const result = await PhotofeelerBot.getRateButtons(pageMock);
      expect(result).toEqual({
        smart : [],
        trustWorthy: [],
        attractive: [],
      });
      done();
    });
  });

  describe('getNewPage()', () => {
    it('should return a new page.', async (done) => {
      const pageMock = { type: () => {} };
      const browserMock = {
        newPage: jest.fn(() => Promise.resolve(pageMock)),
      }
      const result = await PhotofeelerBot.getNewPage(browserMock);
      expect(result).toEqual(pageMock);
      done();
    });
  });

  describe('closePageBrowser()', () => {
    it('should close the browser from the passed page.', async (done) => {
      const browserMock = {
        close: jest.fn(),
      }
      const pageMock = { browser: () => browserMock };

      const result = await PhotofeelerBot.closePageBrowser(pageMock);
      expect(browserMock.close).toHaveBeenCalled();
      done();
    });
  });

  describe('getBrowser()', () => {
    it('should return a puppeteer browser', async (done) => {
      const browserMock = { close: () => {} };
      const puppeteerMock = { launch: jest.fn(() => Promise.resolve(browserMock)) };
      const result = await PhotofeelerBot.getBrowser(puppeteerMock);
      expect(result).toEqual(browserMock);
      done();
    });
  });

  describe('randomlyRate()', () => {
    it('should return the page if finished rating', async (done) => {
      const buttonsMock = [{
        isIntersectingViewport: () => false,
      }];

      PhotofeelerBot.getRateButtons = jest.fn(() => Promise.resolve({
        smart : buttonsMock,
        trustWorthy: buttonsMock,
        attractive: buttonsMock,
      }));

      const pageMock = { type: () => {} };

      const result = await PhotofeelerBot.randomlyRate(pageMock);

      expect(result).toEqual(pageMock);

      PhotofeelerBot.getRateButtons.mockRestore();
      done();
    });

    it('should click the rate buttons', async (done) => {
      const buttonsMock = [{
        isIntersectingViewport: () => true,
        click: jest.fn(() => Promise.resolve()),
      }];

      PhotofeelerBot.getRateButtons = jest.fn(() => Promise.resolve({
        smart : buttonsMock,
        trustWorthy: buttonsMock,
        attractive: buttonsMock,
      }));

      PhotofeelerBot.submitRate = jest.fn(() => Promise.resolve());

      const pageMock = { type: () => {} };
      setTimeout(() => {
        buttonsMock[0].isIntersectingViewport = () => false;
      }, 2000)

      const result = await PhotofeelerBot.randomlyRate(pageMock);

      expect(buttonsMock[0].click).toHaveBeenCalledTimes(3);
      expect(PhotofeelerBot.submitRate).toHaveBeenCalledWith(pageMock);
      expect(result).toEqual(pageMock);


      PhotofeelerBot.getRateButtons.mockRestore();
      PhotofeelerBot.submitRate.mockRestore();

      done();
    });
  });
})
