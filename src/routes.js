import { Router } from 'express';
import PDFPrinter from 'pdfmake';
import QuickChart from 'quickchart-js';
import { format } from 'date-fns';
import fs from 'fs';
import Product from './database/models/Product';
import mockData from './database/mockData';
import fonts from './config/pdfFonts';

const routes = new Router();

function imgToBuffer(file) {
  const bitmap = fs.readFileSync(file);
  return Buffer.from(bitmap);
}

routes.get('/', (req, res) => res.json({ message: 'Hello' }));
routes.get('/products', async (req, res) => {
  const products = await Product.findAll();
  res.json(products);
});
routes.get('/products/report', async (req, res) => {
  try {
    const printer = new PDFPrinter(fonts);
    const products = await Product.findAll();

    const body = products.map(({ id, description, price, quantity }, index) => {
      const isOdd = index % 2 === 1;
      return [id, description, price, quantity].map((text) => {
        if (isOdd) return { text, style: 'oddRows' };
        return { text };
      });
    });
    const myChart = new QuickChart();
    myChart
      .setConfig({
        type: 'bar',
        data: {
          labels: ['Hello world', 'Foo bar'],
          datasets: [{ label: 'Foo', data: [1, 2] }],
        },
      })
      .setWidth(400)
      .setHeight(400)
      .setBackgroundColor('transparent');

    const chartBuffer = await myChart.toBinary();
    const docsDefinitions = {
      pageSize: 'A4',
      pageOrientation: 'landscape',
      pageMargins: [40, 100, 40, 60],
      defaultStyle: {
        font: 'Helvetica',
      },
      footer(currentPage, pageCount) {
        return {
          margin: [40, 20, 40, 20],
          text: `${currentPage.toString()} / ${pageCount}`,
          alignment: 'center',
        };
      },
      header: {
        // alignment: 'center',
        // columns: [
        //   { text: 'HJVA', style: 'header', alignment: 'center' },
        //   {
        //     image: imgToBuffer('src/assets/HJVA-logo.png'),
        //     fit: [100, 100],
        //   },
        // ],
        margin: [40, 20, 40, 20],
        table: {
          heights: [100],
          widths: ['*', '*', '*'],

          body: [
            [
              {
                layout: 'noBorders',
                table: {
                  body: [
                    [
                      {
                        image: imgToBuffer('src/assets/HJVA-logo.png'),
                        fit: [120, 120],
                      },
                    ],
                    [{ text: 'RELATORIO', style: 'header' }],
                  ],
                },
              },
              { text: 'RELATORIO', style: 'header', alignment: 'center' },
              {
                text: `HJVA \n ${format(
                  new Date(),
                  'dd-MM-yyyy HH:mm'
                )} \n rua`,
                style: 'header',
                alignment: 'right',
              },
            ],
          ],
        },
        layout: 'noBorders',
      },
      content: [
        {
          table: {
            headerRows: 1,
            body: [
              ['ID', 'Descrição', 'Preço', 'Quantidade'].map((text) => ({
                text,
                style: 'columnTitles',
              })),
              ...body,
            ],
          },
        },
        { qr: 'http://www.kkreco.duckdns.org:3000' },
        { image: chartBuffer },
      ],
      styles: {
        header: {
          fontSize: 14,
          bold: true,
        },
        oddRows: { fillColor: '#ebebeb' },
        columnTitles: {
          fontSize: 12,
          bold: true,
          fillColor: '#2ecc71',
          lineHeight: 1.5,
        },
      },
    };
    const pdfDoc = printer.createPdfKitDocument(docsDefinitions);
    // pdfDoc.pipe(fs.createWriteStream('Relatorio.pdf'));

    const chuncks = [];
    pdfDoc.on('data', (chunk) => chuncks.push(chunk));
    pdfDoc.end();

    pdfDoc.on('end', () => {
      const result = Buffer.concat(chuncks);
      // res.setHeader('Content-Type', 'application/pdf');
      res.end(result);
    });
  } catch (error) {
    console.log(error);
  }
});

routes.get('/insertMockData', async (req, res) => {
  try {
    await Promise.all(
      mockData.map(({ description, price, quantity }) =>
        Product.create({ description, price, quantity })
      )
    );
    res.json({ message: 'data inserted' });
  } catch (error) {
    res.json(error);
  }
});

export default routes;
