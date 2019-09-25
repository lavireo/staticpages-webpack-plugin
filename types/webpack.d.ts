/**
 * webpack.d.ts
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


/**
 * Webpack 'n' stuff */
declare module 'webpack'
{
  export type Chunk = any;
  export type Compiler = any;

  export interface Plugin
  {
    apply (c: Compiler) : any;
  }
}

/**
 * Internal Plug-Ins */
declare module 'webpack/lib/ExternalsPlugin';
declare module 'webpack/lib/node/NodeTargetPlugin';
declare module 'webpack/lib/node/NodeTemplatePlugin';
declare module 'webpack/lib/LoaderTargetPlugin';
declare module 'webpack/lib/LibraryTemplatePlugin';
declare module 'webpack/lib/SingleEntryPlugin';