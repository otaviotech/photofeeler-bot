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
})
