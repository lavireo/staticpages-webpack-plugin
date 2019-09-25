/**
 * compiler.ts
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


import { Compiler }            from 'webpack';
import * as ExternalsPlugin    from 'webpack/lib/ExternalsPlugin';
import * as NodeTargetPlugin   from 'webpack/lib/node/NodeTargetPlugin';
import * as NodeTemplatePlugin from 'webpack/lib/node/NodeTemplatePlugin';
import * as LoaderTargetPlugin from 'webpack/lib/LoaderTargetPlugin';
import * as SingleEntryPlugin  from 'webpack/lib/SingleEntryPlugin';
import { getModules }          from './utils';

class ChildCompiler
{
  /**
   * Extract helpers from the compiler
   * list etc. */
  extract (entries: string[], compilation: Compiler, childCompilation: Compiler)
  {
    const helperAssets = entries.map((chunk: string, i: number) => {
      return compilation.mainTemplate.hooks.assetPath.call('__child-[name]', {
        chunk,
        hash: childCompilation.hash,
        name: `static-${i}`
      });
    });

    helperAssets.forEach((f: string) => { delete compilation.assets[f] });
    return helperAssets.map((f: string) => childCompilation.assets[f].source());
  }


  /**
   * Compile pages */
  async compilePages (compilation: Compiler, pages: any)
  {
    const output = {
      filename: '__child-[name]',
      publicPath: compilation.outputOptions.publicPath
    };

    const externals                = await getModules();
    const childCompiler            = compilation.createChildCompiler('StaticPages', output);
    childCompiler.context          = compilation.compiler.context;
    childCompiler.inputFileSystem  = compilation.inputFileSystem;
    childCompiler.outputFileSystem = compilation.outputFileSystem;

    new NodeTargetPlugin().apply(childCompiler);
    new ExternalsPlugin('commonjs', [externals]).apply(childCompiler);
    new NodeTemplatePlugin(output).apply(childCompiler);
    new LoaderTargetPlugin('node').apply(childCompiler);

    /**
     * Add a new entry for each page */
    const keys = Object.keys(pages);
    keys.forEach((p, i) => {
      new SingleEntryPlugin(childCompiler.context, pages[p], `static-${i}`).apply(childCompiler);
    });

    /**
     * Create a new promise that will return
     * the compilation results. */
    return new Promise((res, rej) => {
      childCompiler.runAsChild((err: Error, entries: string[], childCompilation: Compiler) => {
        if (err) return rej(err);
        if (childCompilation.errors && childCompilation.errors.length)
        {
          const errorDetails = childCompilation.errors.map((e: any) => e.message + (e.error ? ':\n' + e.error : '')).join('\n');
          return rej(new Error('Child compilation failed:\n' + errorDetails));
        }

        const pages        = entries ? this.extract(entries, compilation, childCompilation) : [];
        const dependencies = entries ? Array.from(childCompilation.fileDependencies) : [];

        const results: any = {};
        pages.map((source: string, i: number) => {
          results[keys[i]] = {
            hash:    childCompilation.hash,
            entry:   entries[i],
            content: source
          };
        });

        res(results);
      });
    });
  } 
}

export { ChildCompiler };
