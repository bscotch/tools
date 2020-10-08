import fs from "fs";
import path from "path";
import {sortedPaths} from "./paths";

/**
 * List all files and folders in a directory. If `dir` is a
 * path, return it in an array.
 */
export function listPathsSync(dir:string,recursive=false){
  if(fs.statSync(dir).isFile()){
    return [dir];
  }
  const paths = fs.readdirSync(dir)
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
export function listFoldersSync(dir:string,recursive=false){
  return listPathsSync(dir,recursive)
    .filter(pathName=>fs.statSync(pathName).isDirectory());
}

/**
 * List all files in a directory or, if 'dir' is already a file,
 * just return that filename as an array.
 */
export function listFilesSync(dir:string,recursive=false){
  if(fs.statSync(dir).isFile()){
    return [dir];
  }
  return listPathsSync(dir,recursive)
    .filter(filePath=>fs.statSync(filePath).isFile());
}

/**
 * List all files in a directory or, if 'dir' is already a file,
 * just return that filename as an array.
 */
export function listFilesByExtensionSync(dir:string,extension:string|string[],recursive=false){
  const extensions = Array.isArray(extension) ? extension : [extension];
  return listFilesSync(dir,recursive)
    .filter(fileName=>{
      const ext = path.parse(fileName).ext.slice(1);
      return extensions.includes(ext);
    });
}
