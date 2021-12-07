import { expect } from 'chai';
import { waitForMillis, waitForSeconds } from '../lib/wait';
import { dateIsInThePast, dateIsOlderThanMillisAgo } from '../lib/dates';

describe('Waits', function () {
  it('can wait', async function () {
    let now = new Date();
    const resetNow = () => {
      now = new Date();
      return now;
    };
    const waitTimeMillis = 100;
    const expectInPast = () =>
      expect(dateIsOlderThanMillisAgo(now, waitTimeMillis)).to.be.true;

    resetNow();
    await waitForMillis(waitTimeMillis);
    expectInPast();

    resetNow();
    await waitForSeconds(waitTimeMillis / 1000);
    expectInPast();

    resetNow();
    expect(dateIsInThePast(now)).to.be.false;
  });
});
