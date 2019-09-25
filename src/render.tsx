/**
 * render.tsx
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


import { createElement }                        from 'react';
import { renderToString, renderToStaticMarkup } from 'react-dom/server';
import { ServerStyleSheet, StyleSheetManager }  from 'styled-components';
import { Router, ServerLocation }               from '@reach/router';
import { Document }                             from './document';

function render (page: any, files: string[], props: any = {})
{
  const { body, styles } = renderBody(page, props);
  const pageHtml         = renderToStaticMarkup(<Document body={body} files={files} styles={styles} />);
  return `<!DOCTYPE html>${pageHtml}`;
}

function renderBody (Page: any, props: any)
{
  const sheet  = new ServerStyleSheet();
  try
  {
    const Route = (_: any) => <Page {...props} />;
    const body = (
      <StyleSheetManager sheet={sheet.instance}>
        <ServerLocation url={props.url}>
          <Router>
            <Route path="/*" />
          </Router>
        </ServerLocation>
      </StyleSheetManager>
    );

    return {
      body:   renderToString(body),
      styles: sheet.getStyleElement()
    };
  }
  finally { sheet.seal(); }
}

export { render };
