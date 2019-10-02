/**
 * utils.ts
 *
 * Author: Maurice T. Meyer
 * E-Mail: maurice@lavireo.com
 *
 * (c) Laviréo. All rights reserved.
 *
 * Permission is hereby granted, free of charge, to any person obtaining a copy
 * of this software and associated documentation files (the "Software"), to deal
 * in the Software without restriction, including without limitation the rights
 * to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
 * copies of the Software, and to permit persons to whom the Software is
 * furnished to do so, subject to the following conditions:
 *
 * The above copyright notice and this permission notice shall be included in all
 * copies or substantial portions of the Software.
 *
 * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
 * IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
 * FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
 * AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
 * LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
 * OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
 * SOFTWARE.
 */


import * as fs       from 'fs';
import * as path     from 'path';
import { promisify } from 'util';

const stat     = promisify(fs.stat);
const readdir  = promisify(fs.readdir);
const readfile = promisify(fs.readFile);
const SECTIONS = ['dependencies', 'devDependencies', 'peerDependencies', 'optionalDependencies'];

type IteratorFn<T> = (v: T, i: number, arr: T[]) => Promise<any>;
async function asyncFor<T> (arr: T[], fn: IteratorFn<T>)
{
  for (let i = 0; i < arr.length; i++)
    await fn(arr[i], i, arr);
}

async function asyncMap<T> (arr: T[], fn: IteratorFn<T>)
{
  const results = [];
  for (let i = 0; i < arr.length; i++)
    results.push(await fn(arr[i], i, arr));
  return results;
}

async function parallelFor<T> (arr: T[], fn: IteratorFn<T>)
{
  await parallelMap(arr, fn);
}

async function parallelMap<T> (arr: T[], fn: IteratorFn<T>)
{
  const results = [];
  for (let i = 0; i < arr.length; i++)
    results.push(fn(arr[i], i, arr));
  return Promise.all(results);
}

async function getModules ()
{
  const utils = {}
  try {
    const packagePath   = path.join(process.cwd(), './package.json');
    const packageString = await readfile(packagePath, 'utf8');
    const packageJson   = JSON.parse(packageString);

    const deps: Set<string> = new Set<string>();
    SECTIONS.forEach(s => {
      Object.keys(packageJson[s] || {}).forEach(d => (deps.add(d)));
    });

    return [...deps];
  } catch (e)
  {
    return [];
  }
}


export { getModules, stat, readdir, readfile, asyncFor, asyncMap, parallelFor, parallelMap };
