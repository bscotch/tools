import { expect } from 'chai';
import fs from 'fs-extra';
import path from 'path';
import {
  listFilesByExtensionSync,
  listFilesSync,
  listFoldersSync,
  listPathsSync,
  removeEmptyDirsSync,
} from '../lib/files';
import { resetSandbox, sandboxRoot } from './utility';

describe('Files', function () {
  const samplePathsRoot = path.join('sample-paths');

  function fullSamplePaths(relativeSamplePaths: string[]) {
    return relativeSamplePaths.map((p) => path.join(samplePathsRoot, p));
  }

  it('can list all paths in a directory', function () {
    const recursive = false;
    const expected = fullSamplePaths(['root-file.txt', 'subdir']);
    expect(
      listPathsSync(samplePathsRoot, recursive),
      'cannot list non-recursive',
    ).to.eql(expected);
  });

  it('can list all paths in a directory recursively', function () {
    const recursive = true;
    const expected = fullSamplePaths([
      'root-file.txt',
      'subdir',
      path.join('subdir', 'sub-file.json'),
      path.join('subdir', 'subsubdir'),
      path.join('subdir', 'subsubdir', 'sub-sub-file.md'),
    ]);
    expect(
      listPathsSync(samplePathsRoot, recursive),
      'cannot list recursive',
    ).to.eql(expected);
  });

  it('can list all files in a directory', function () {
    const recursive = false;
    const expected = fullSamplePaths(['root-file.txt']);
    expect(
      listFilesSync(samplePathsRoot, recursive),
      'cannot list non-recursive',
    ).to.eql(expected);
  });

  it('can list all files in a directory recursively', function () {
    const recursive = true;
    const expected = fullSamplePaths([
      'root-file.txt',
      path.join('subdir', 'sub-file.json'),
      path.join('subdir', 'subsubdir', 'sub-sub-file.md'),
    ]);
    expect(
      listFilesSync(samplePathsRoot, recursive),
      'cannot list recursive',
    ).to.eql(expected);
  });

  it('can list all dirs in a directory', function () {
    const recursive = false;
    const expected = fullSamplePaths(['subdir']);
    expect(
      listFoldersSync(samplePathsRoot, recursive),
      'cannot list non-recursive',
    ).to.eql(expected);
  });

  it('can list all dirs in a directory recursively', function () {
    const recursive = true;
    const expected = fullSamplePaths([
      'subdir',
      path.join('subdir', 'subsubdir'),
    ]);
    expect(
      listFoldersSync(samplePathsRoot, recursive),
      'cannot list recursive',
    ).to.eql(expected);
  });

  it('can list files in a directory by extension', function () {
    const recursive = false;
    const expected = fullSamplePaths(['root-file.txt']);
    expect(
      listFilesByExtensionSync(samplePathsRoot, 'txt', recursive),
      'cannot list non-recursive',
    ).to.eql(expected);
    expect(
      listFilesByExtensionSync(samplePathsRoot, 'md', recursive),
      'finds md files when it should not',
    ).to.eql([]);
  });

  it('can list all files in a directory by extension recursively', function () {
    const recursive = true;
    const expected = fullSamplePaths([
      path.join('subdir', 'sub-file.json'),
      path.join('subdir', 'subsubdir', 'sub-sub-file.md'),
    ]);
    expect(
      listFilesByExtensionSync(samplePathsRoot, ['json', 'md'], recursive),
      'cannot list recursive',
    ).to.eql(expected);
  });

  it('can recursively delete empty folders', function () {
    resetSandbox();
    fs.ensureDirSync(path.join(sandboxRoot, 'dir', 'subdir', 'subsubdir'));
    removeEmptyDirsSync(path.join(sandboxRoot, 'dir'));
    expect(fs.existsSync(path.join(sandboxRoot, 'dir'))).to.be.false;
  });
});
