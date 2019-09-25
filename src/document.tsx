/**
 * document.tsx
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


import * as path                                                 from 'path';
import { createElement, Component, ReactElement, ReactFragment } from 'react';

interface DocumentProps
{
  body:       string;
  files:      string[];
	nonce?:     string;
	rootId?:    string; 
  assetHost?: string;
  styles?:    ReactElement[] | ReactFragment;
}

class Document extends Component<DocumentProps>
{
  /**
   * Render document basis for
   * use on the serverside. */
  public render ()
  {
    return (
      <html>
        <head>
          <meta charSet="utf-8" />
          <meta name="viewport" content="width=device-width,minimum-scale=1,initial-scale=1" />
        </head>
        <body>
					{ this.renderRoot() }
					{ this.renderScripts() }
				</body>
      </html>
    );
  }

	private renderRoot ()
	{
		const { body, rootId } = this.props;
		return <div id={rootId || 'root'} dangerouslySetInnerHTML={{ __html: body }} />;
	}

  private renderScripts ()
  {
    const { files, nonce, assetHost } = this.props;
    if (!files || files.length === 0)
      return null

    return files.map((file: string) => {
      // Only render .js files here
      if (!/\.js$/.exec(file))
				return null;

			const src = path.join(assetHost || '/', encodeURI(file));
      return <script async key={file} src={src} nonce={nonce} />;
    });
  }
}

export { Document };

