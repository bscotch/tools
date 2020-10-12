import fs from "fs";
import path from "path";
import {sortedPaths} from "./paths";

export interface ListPathOptions {
  /** By default the .git folder is skipped */
  includeDotGit?: boolean,
  /** By default the node_modules folder is skipped */
  includeNodeModules?: boolean,
}

/**
 * List all files and folders in a directory. If `dir` is a
 * path, return it in an array.
 */
export function listPathsSync(dir:string,recursive=false,options?:ListPathOptions){
  if(fs.statSync(dir).isFile()){
    return [dir];
  }
  else if(!fs.existsSync(dir)){
    return [];
  }
  const excludedDirs:string[] = [];
  if(!options?.includeDotGit){
    excludedDirs.push('.git');
  }
  if(!options?.includeNodeModules){
    excludedDirs.push('node_modules');
  }
  const paths = fs.readdirSync(dir)
    .filter(aPath=>!excludedDirs.includes(path.basename(aPath)))
    .map(aPath=>path.join(dir,aPath));
  if(recursive){
    const morePaths = paths
      .filter(path=>fs.statSync(path).isDirectory())
      .map(dir=>listPathsSync(dir,true))
      .flat(3);
    paths.push(...morePaths);
  }
  return sortedPaths(paths);
}

/**
 * List all folders in a directory.
 */
export function listFoldersSync(dir:string,recursive=false,options?:ListPathOptions){
  return listPathsSync(dir,recursive,options)
    .filter(pathName=>fs.statSync(pathName).isDirectory());
}

/**
 * List all files in a directory or, if 'dir' is already a file,
 * just return that filename as an array.
 */
export function listFilesSync(dir:string,recursive=false,options?:ListPathOptions){
  if(fs.statSync(dir).isFile()){
    return [dir];
  }
  return listPathsSync(dir,recursive,options)
    .filter(filePath=>fs.statSync(filePath).isFile());
}

/**
 * List all files in a directory or, if 'dir' is already a file,
 * just return that filename as an array.
 */
export function listFilesByExtensionSync(dir:string,extension:string|string[],recursive=false,options?:ListPathOptions){
  const extensions = Array.isArray(extension) ? extension : [extension];
  return listFilesSync(dir,recursive,options)
    .filter(fileName=>{
      const ext = path.parse(fileName).ext.slice(1);
      return extensions.includes(ext);
    });
}
