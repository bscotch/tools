import { expect } from 'chai';
import {
  waitForMillis,
  waitForSeconds,
} from '@bscotch/utility/app/lib/wait.js';
import {
  dateIsInThePast,
  dateIsOlderThanMillisAgo,
} from '@bscotch/utility/app/lib/dates.js';

describe('Waits', function () {
  it('can wait', async function () {
    let now = new Date();
    const resetNow = () => {
      now = new Date();
      return now;
    };
    const waitTimeMillis = 100;
    const expectInPast = () =>
      expect(dateIsOlderThanMillisAgo(now, waitTimeMillis * 0.95)).to.be.true;

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
