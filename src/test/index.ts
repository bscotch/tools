import {expect} from "chai";
import { oneline, undent } from "../lib/strings";

describe("Bscotch Utilities", function () {
  describe("Strings", function () {

    it("can dedent string literals", function () {
      const interp1 = 'hello';
      const interp2 = 'goodbye';
      const dedented = undent`
        Here is a:
          multine string ${interp1}
          look
      at it goooo ${interp2}
              weeee!
      
      `;
      const expected = `  Here is a:
    multine string ${interp1}
    look
at it goooo ${interp2}
        weeee!`;
      expect(expected).to.equal(dedented);
    });

    it("can oneline string literals", function () {
      const interp1 = 'hello';
      const interp2 = 'goodbye';
      const onelined = oneline`
        Here is a:
          multine string ${interp1}
          look
      at it goooo ${interp2}
              weeee!
      
      `;
      const expected = `Here is a: multine string ${interp1} look at it goooo ${interp2} weeee!`;
      expect(expected).to.equal(onelined);
    });
  });
});
