/**
 * index.ts
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




const EXT               = ['js', 'ts', 'jsx', 'tsx'];
const EXT_REG           = new RegExp(`\\.+(${EXT.join('|')})$`);

import * as _                      from 'underscore';
import * as vm                     from 'vm';
import * as path                   from 'path';
import { Compiler }                from 'webpack';
import { RawSource }               from 'webpack-sources';

import { stat, readdir, asyncFor, asyncMap } from './utils';
import { render }                  from './render';
import { ChildCompiler }           from './compiler';

const ERROR_PAGE                         = '_error';
const ERRORS: { [code: number]: string } = {
  400: 'Bad Request',
  404: 'This page could not be found',
  500: 'Internal Server Error'
}

interface StaticPagesOpts
{
  errors?:    number[];
  inputDir?:  string;
  outputDir?: string;
}

class StaticPages
{
  private errors:     number[];
  private inputDir?:  string;
  private outputDir?: string;

  private child:      ChildCompiler;


  /**
   * Constructor */
  constructor (opts: StaticPagesOpts = {})
  {
    this.errors    = opts.errors || [400, 404, 500];
    this.child     = new ChildCompiler();
    this.inputDir  = opts.inputDir;
    this.outputDir = opts.outputDir;
  }


  /**
   * Enter the webpack compilation */
  apply (compiler: Compiler)
  {
    /**
     * Collect files */
    let   pages: any = {};
    const pagesPath  = path.resolve(compiler.context, this.inputDir || 'src/pages');

    /**
     * Hook in right before the compilation finished. */
    compiler.hooks.make.tapPromise('WebpackStaticPages', async (c: Compiler) => {
      const entrypoints: any = {};
      const paths = await this.collectPages(pagesPath);
      paths.map(p => {
        //const fileName  = p.replace(EXT_REG, '');
        //const fileInput = path.join(pagesPath, `${fileName}.js`);
        //const fileOutput     = `${fileName}.html`; 
        //c.assets[fileOutput] = new RawSource("Hello World!");

        const fileName = p.replace(EXT_REG, '');
        entrypoints[fileName] = path.join(pagesPath, fileName);
      });

      pages = await this.child.compilePages(c, entrypoints);
    });

    /**
     * Hook in right before the assets are
     * put into the output dir */
    compiler.hooks.emit.tapPromise('WebpackStaticPages', async (c: Compiler) => {
      /**
       * Collect required chunks... */
      const entryFiles: string[] = [];
      c.chunkGroups.forEach((g: any) => {
        if (!g.isInitial()) return;
        for (const chunk of g.chunks)
        {
          /**
           * If there's no name or no files
           * we'll just skip the chunk. */
          if (!chunk.name || !chunk.files)
            continue;

          for (const file of chunk.files) {
            /**
             * For now only include .js files */
            if (/\.js$/.test(file)) entryFiles.push(file);
          }
        }
      });

      /**
       * Evaluate compiled pages
       * and add the html sources to the output. */
      return asyncFor(Object.keys(pages), async page => {
        const key     = page.replace(/^\//g, '');
        const factory = await this.evaluateCompilationResult(pages[page].content);

        /**
         * Check if page matches the error page constant as
         * we have to process this template. */
        if (key === ERROR_PAGE)
        {
          return asyncFor (this.errors, async (code: number) => {
            const props  = { static: true, code, status: ERRORS[code] };
            const source = await render(factory, entryFiles, props);
            c.assets[`${code}.html`] = new RawSource(source);
          });
        }

        /**
         * Handle templates */
        const props  = { static: true, url: page };
        const source = await render(factory, entryFiles, props);
        c.assets[`${key}.html`] = new RawSource(source);
      });
    });
  }

  async collectPages (path: string)
  {
    const entries  = await this.readDirRecursive(path);
    const filtered = entries.filter(e => EXT_REG.test(e));
    const pages    = filtered.map(e => e.replace(path, ''));
    return pages;
  }

  async readDirRecursive (dir: string, array: string[] = [])
  {
    const entries = await readdir(dir);
		await Promise.all(entries.map(async e => {
				const absolutePath = path.join(dir, e);
				const pathStat     = await stat(absolutePath);

        if (pathStat.isDirectory())
        {
					await this.readDirRecursive(absolutePath, array);
					return;
				}

				array.push(absolutePath);
			})
		)

		return array.sort();
  }

  async evaluateCompilationResult (source?: string)
  {
    if (!source) throw new Error('The child compilation didn\'t provide a result');
    const vmContext = vm.createContext(_.extend({ require: require }, global));
    const vmScript  = new vm.Script(source);

    let result = vmScript.runInContext(vmContext);
    if (typeof result === 'object' && result.__esModule && result.default)
      result = result.default;
    return result;
  }
}

export = StaticPages;

