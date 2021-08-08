import { Router } from 'express';
import PDFPrinter from 'pdfmake';
import Product from './database/models/Product';
import mockData from './database/mockData';
import fonts from './config/pdfFonts';

const routes = new Router();

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

    const docsDefinitions = {
      pageSize: 'A4',
      pageOrientation: 'landscape',
      defaultStyle: {
        font: 'Helvetica',
      },
      content: [
        {
          columns: [
            { text: 'Produtos', style: 'header' },
            { text: `${new Date().toDateString()}\n\n`, style: 'header' },
          ],
        },
        {
          table: {
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
        { image: '' },
      ],
      styles: {
        header: {
          fontSize: 18,
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
