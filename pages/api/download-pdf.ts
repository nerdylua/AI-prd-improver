import type { NextApiRequest, NextApiResponse } from "next";
import puppeteer from 'puppeteer';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { prdContent } = req.body;

  if (!prdContent) {
    return res.status(400).json({ error: 'Missing PRD content' });
  }

  try {
    const browser = await puppeteer.launch({ 
      headless: true,
      args: ['--no-sandbox', '--disable-setuid-sandbox']
    });
    
    const page = await browser.newPage();

    // Convert text content to HTML with proper line breaks
    const formattedContent = prdContent
      .split('\n')
      .map((line: string) => {
        // Handle headers
        if (line.startsWith('# ')) {
          return `<h1>${line.substring(2)}</h1>`;
        }
        if (line.startsWith('## ')) {
          return `<h2>${line.substring(3)}</h2>`;
        }
        // Handle empty lines
        if (line.trim() === '') {
          return '<br>';
        }
        // Regular lines
        return `<p>${line}</p>`;
      })
      .join('\n');
    
    await page.setContent(`
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="UTF-8">
          <style>
            body {
              font-family: Arial, sans-serif;
              line-height: 1.6;
              margin: 40px;
              color: #333;
            }
            .content {
              max-width: 100%;
              word-wrap: break-word;
            }
            h1 {
              font-size: 24px;
              margin-top: 24px;
              margin-bottom: 16px;
              font-weight: bold;
              color: #000;
            }
            h2 {
              font-size: 20px;
              margin-top: 20px;
              margin-bottom: 12px;
              font-weight: bold;
              color: #333;
            }
            p {
              margin: 8px 0;
            }
            br {
              display: block;
              margin: 8px 0;
            }
          </style>
        </head>
        <body>
          <div class="content">
            ${formattedContent}
          </div>
        </body>
      </html>
    `);

    const pdf = await page.pdf({
      format: 'A4',
      margin: {
        top: '40px',
        right: '40px',
        bottom: '40px',
        left: '40px'
      },
      printBackground: true
    });

    await browser.close();

    res.writeHead(200, {
      'Content-Type': 'application/pdf',
      'Content-Length': Buffer.from(pdf).length,
      'Content-Disposition': 'attachment; filename="final-prd.pdf"'
    });
    
    res.end(pdf);
  } catch (error) {
    console.error('PDF generation error:', error);
    res.status(500).json({ error: 'Failed to generate PDF' });
  }
} 