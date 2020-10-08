import {expect} from "chai";
import { oneline, undent } from "../lib/strings";
import path from "path";
import {toPosixPath,sortedPaths,parentPaths} from "../lib/paths";
import {
  listFilesByExtensionSync,
  listFilesSync,
  listFoldersSync,
  listPathsSync
} from "../lib/files";

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

  describe('Paths',function(){
    it('can sort paths by directory',function(){
      const pathList = [
        'hello/world',
        'hello',
        'h/another',
        'hello/world/goodbye'
      ];
      const expectedOrder = [
        'hello',
        'h/another',
        'hello/world',
        'hello/world/goodbye'
      ];
      const sorted = sortedPaths(pathList);
      expect(sorted).to.eql(expectedOrder);
    });

    it('can generate all paths leading up to a target path',function(){
      const targetPath = '/hello/world/foo/bar.txt';
      const expectedPaths = ['/','/hello','/hello/world','/hello/world/foo','/hello/world/foo/bar.txt'];
      expect(parentPaths(targetPath)).to.eql(expectedPaths);
    });

    it('can convert paths to posix',function(){
      expect(toPosixPath('C:\\hello')).to.equal('/c/hello');
      expect(toPosixPath('/HELLO/world')).to.equal('/HELLO/world');
      expect(toPosixPath('hello\\world\\')).to.equal('hello/world/');
    });
  });

  describe('Files',function(){

    const samplePathsRoot = path.join('src','test','sample-paths');

    function fullSamplePaths(relativeSamplePaths:string[]){
      return relativeSamplePaths.map(p=>path.join(samplePathsRoot,p));
    }

    it('can list all paths in a directory',function(){
      const recursive = false;
      const expected = fullSamplePaths([
        'root-file.txt',
        'subdir',
      ]);
      expect(listPathsSync(samplePathsRoot,recursive),'cannot list non-recursive').to.eql(expected);
    });

    it('can list all paths in a directory recursively',function(){
      const recursive = true;
      const expected = fullSamplePaths([
        'root-file.txt',
        'subdir',
        path.join('subdir','sub-file.json'),
        path.join('subdir','subsubdir'),
        path.join('subdir','subsubdir','sub-sub-file.md')
      ]);
      expect(listPathsSync(samplePathsRoot,recursive),'cannot list recursive').to.eql(expected);
    });

    it('can list all files in a directory', function(){
      const recursive = false;
      const expected = fullSamplePaths([
        'root-file.txt'
      ]);
      expect(listFilesSync(samplePathsRoot,recursive),'cannot list non-recursive').to.eql(expected);
    });

    it('can list all files in a directory recursively',function(){
      const recursive = true;
      const expected = fullSamplePaths([
        'root-file.txt',
        path.join('subdir','sub-file.json'),
        path.join('subdir','subsubdir','sub-sub-file.md')
      ]);
      expect(listFilesSync(samplePathsRoot,recursive),'cannot list recursive').to.eql(expected);
    });

    it('can list all dirs in a directory', function(){
      const recursive = false;
      const expected = fullSamplePaths([
        'subdir'
      ]);
      expect(listFoldersSync(samplePathsRoot,recursive),'cannot list non-recursive').to.eql(expected);
    });

    it('can list all dirs in a directory recursively',function(){
      const recursive = true;
      const expected = fullSamplePaths([
        'subdir',
        path.join('subdir','subsubdir')
      ]);
      expect(listFoldersSync(samplePathsRoot,recursive),'cannot list recursive').to.eql(expected);
    });

    it('can list files in a directory by extension', function(){
      const recursive = false;
      const expected = fullSamplePaths([
        'root-file.txt'
      ]);
      expect(listFilesByExtensionSync(samplePathsRoot,'txt',recursive),'cannot list non-recursive').to.eql(expected);
      expect(listFilesByExtensionSync(samplePathsRoot,'md',recursive),'finds md files when it should not').to.eql([]);
    });

    it('can list all files in a directory by extension recursively',function(){
      const recursive = true;
      const expected = fullSamplePaths([
        path.join('subdir','sub-file.json'),
        path.join('subdir','subsubdir','sub-sub-file.md')
      ]);
      expect(listFilesByExtensionSync(samplePathsRoot,['json','md'],recursive),'cannot list recursive').to.eql(expected);
    });
  });
});
