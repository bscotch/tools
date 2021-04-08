import { expect } from 'chai';
import { waitForMillis, waitForSeconds, waitForTick } from '../lib/wait';
import { dateIsInThePast, dateIsOlderThanMillisAgo } from '../lib/dates';

describe('Arrays', function () {
  it('can wait', async function () {
    let now = new Date();
    const resetNow = () => (now = new Date());
    const expectInPast = () =>
      expect(dateIsOlderThanMillisAgo(now, waitTimeMillis)).to.be.true;
    const waitTimeMillis = 100;

    resetNow();
    await waitForMillis(waitTimeMillis);
    expectInPast();

    resetNow();
    await waitForSeconds(waitTimeMillis / 1000);
    expectInPast();

    resetNow();
    await waitForTick();
    // (Will be faster than a ms, so should be at the "same time")
    expect(dateIsInThePast(now)).to.be.false;
  });
});
