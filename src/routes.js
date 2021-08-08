import { Router } from 'express';
import PDFPrinter from 'pdfmake';
import fs from 'fs';
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
    const docsDefinitions = {
      defaultStyle: { font: 'Helvetica' },
      content: [{ text: 'Meu Primeiro Relatório' }],
    };
    const pdfDoc = printer.createPdfKitDocument(docsDefinitions);
    pdfDoc.pipe(fs.createWriteStream('Relatorio.pdf'));

    pdfDoc.end();
    res.json('Realtorio concluído');
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
