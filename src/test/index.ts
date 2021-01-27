import {expect} from "chai";
import { oneline, undent } from "../lib/strings";
import path from "path";
import {toPosixPath,sortedPaths,parentPaths} from "../lib/paths";
import {
  listFilesByExtensionSync,
  listFilesSync,
  listFoldersSync,
  listPathsSync,
  removeEmptyDirsSync
} from "../lib/files";
import {asObjectIfArray, flattenObjectPaths, getValueAtPath, transformValueByPath, objectPathsFromWildcardPath, setValueAtPath, objectPaths} from "../lib/objects";
import fs from "fs-extra";
import { decrypt, encrypt, md5, sha256 } from "../lib/crypto";

const sandboxRoot = "sandbox";

function resetSandbox() {
  fs.ensureDirSync(sandboxRoot);
  try {
    fs.emptyDirSync(sandboxRoot);
  }
  catch (err) {
    console.log(err);
  }
}


describe("Bscotch Utilities", function () {

  describe("Crypto", function(){
    it('can create an md5 checksum', function(){
      const sourceText = 'hello world';
      expect({
        hex: md5(sourceText),
        b64: md5(sourceText,'base64')
      }).to.eql({
        hex: '5eb63bbbe01eeed093cb22bb8f5acdc3',
        b64: 'XrY7u+Ae7tCTyyK7j1rNww=='
      });
    });
    it('can create an sha256 checksum', function(){
      const sourceText = 'hello world';
      expect({
        hex: sha256(sourceText),
        b64: sha256(sourceText,'base64')
      }).to.eql({
        hex: 'b94d27b9934d3e08a52e52d7da7dabfac484efe37a5380ee9088f7ace2efcde9',
        b64: 'uU0nuZNNPgilLlLX2n2r+sSE7+N6U4DukIj3rOLvzek='
      });
    });
    it("can encrypt/decrypt a string or buffer",function(){
      const key = "00000000000000000000000000000000";
      const string = "Hello World";
      const buffer = Buffer.from(string);
      expect(decrypt(encrypt(string,key),key).toString()).to.equal(string);
      expect(decrypt(encrypt(buffer,key),key).toString()).to.equal(string);
    });
  });

  describe("Objects", function(){

    const createTestObject = ()=>{
      return {
        hello: 'world',
        nested: {
          layer: 1,
          array: [
            4,
            6,
            7
          ]
        }
      };
    };

    const createDeepTestObject = ()=>{
      return {
        sequence: {
          tracks: [
            {
              keyframes: {
                Keyframes: [
                  {
                    Key: 0,
                    Length: 1,
                  },
                  {
                    Key: 1,
                    Length: 1
                  }
                ]
              }
            }
          ]
        }
      };
    };

    it("can create a map from an array", function(){
      expect(asObjectIfArray(['hello','world'])).to.eql({'0':'hello','1':'world'});
      expect(asObjectIfArray(['root',['nested']])).to.eql({'0':'root','1':['nested']});
    });

    it("can flatten nested data structures",function(){
      expect(flattenObjectPaths(createTestObject())).to.eql({
        hello:'world',
        'nested.layer': 1,
        'nested.array.0': 4,
        'nested.array.1': 6,
        'nested.array.2': 7,
      });
      expect(flattenObjectPaths(createDeepTestObject())).to.eql({
        'sequence.tracks.0.keyframes.Keyframes.0.Key':0,
        'sequence.tracks.0.keyframes.Keyframes.0.Length':1,
        'sequence.tracks.0.keyframes.Keyframes.1.Key':1,
        'sequence.tracks.0.keyframes.Keyframes.1.Length':1
      });
    });

    it("can get values using paths", function(){
      const object = createTestObject();
      expect(getValueAtPath(object,'hello')).to.equal('world');
      expect(getValueAtPath(object,'hello.invalid')).to.be.undefined;
      expect(getValueAtPath(object,'nested.array.3')).to.be.undefined;
      expect(getValueAtPath(object,'nested.array.2')).to.equal(7);

      const deepObject = createDeepTestObject();
      expect(getValueAtPath(deepObject,'sequence.tracks.0.keyframes.Keyframes.1.Key')).to.equal(1);
    });

    it("can set values using paths", function(){
      const object = createTestObject();
      setValueAtPath(object,'hello','goodbye');
      expect(object.hello).to.equal('goodbye');
      setValueAtPath(object,'nested.array.1',5);
      expect(object.nested.array[1]).to.equal(5);
      setValueAtPath(object,'nested.array.4',3);
      expect(object.nested.array).to.eql([4,5,7,undefined,3]);
      setValueAtPath(object,'new.0.hello.world','weee');
      expect((object as any).new[0].hello.world).to.eql('weee');

      const deepObject = createDeepTestObject();
      const deepKey = 'sequence.tracks.0.keyframes.Keyframes.0.Key';
      setValueAtPath(deepObject,deepKey,2);
      expect(getValueAtPath(deepObject,deepKey)).to.eql(2);
    });

    it("can convert a wildcard path into all matching paths", function(){
      const object = createTestObject();
      expect(objectPathsFromWildcardPath('*',object)).to.eql(['hello','nested']);
      expect(objectPathsFromWildcardPath('*.*',object)).to.eql(['nested.layer','nested.array']);
      expect(objectPathsFromWildcardPath('nested.*',object)).to.eql(['nested.layer','nested.array']);
      expect(objectPathsFromWildcardPath('nested.array.*',object)).to.eql(['nested.array.0','nested.array.1','nested.array.2']);

      const deepObject = createDeepTestObject();
      expect(objectPathsFromWildcardPath('*',deepObject)).to.eql(['sequence']);
      expect(objectPathsFromWildcardPath('sequence.tracks.*.keyframes.Keyframes.*.Key',deepObject)).to.eql([
        'sequence.tracks.0.keyframes.Keyframes.0.Key',
        'sequence.tracks.0.keyframes.Keyframes.1.Key',
      ]);
      expect(objectPathsFromWildcardPath('sequence.tracks.*.keyframes.Keyframes.1.Key',deepObject)).to.eql([
        'sequence.tracks.0.keyframes.Keyframes.1.Key',
      ]);
    });

    it("can transform paths with wildcards",function(){
      const object = createTestObject();
      transformValueByPath(object,'nested.layer',(n:number)=>++n);
      transformValueByPath(object,'nested.array.0',(n:number)=>++n);
      transformValueByPath(object,'nested.array.*',(n:number)=>++n);
      expect(object.nested.layer).to.eql(2);
      expect(object.nested.array).to.eql([6,7,8]);
      // Transforming a missing field should cause nothing to happen
      transformValueByPath(object,'nested.array.3',(n:number)=>++n);
      expect(object.nested.array).to.eql([6,7,8]);
      // Should also be able to apply transforms to all fiels of an object.
      transformValueByPath(object,'nested.*',()=>9);
      expect(object.nested).to.eql({layer:9,array:9});
    });

  });

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

    it('can recursively delete empty folders',function(){
      resetSandbox();
      fs.ensureDirSync(path.join(sandboxRoot,'dir','subdir','subsubdir'));
      removeEmptyDirsSync(path.join(sandboxRoot,'dir'));
      expect(fs.existsSync(path.join(sandboxRoot,'dir'))).to.be.false;
    });
  });
});
