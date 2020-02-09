const PhotofeelerBot = require('./bot');
const CONSTANTS = require('./constants');

jest.mock()

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
})
