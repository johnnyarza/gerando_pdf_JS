import express from 'express';
import cors from 'cors';
import Youch from 'youch';
import routes from './routes';
import './database/index';

class App {
  constructor() {
    this.server = express();
    this.middlewares();
    this.routes();
  }

  middlewares() {
    this.server.use(cors());
    this.server.use(express.json());
  }

  routes() {
    this.server.use(routes);
    this.server.use(this.defaultErrorHandler);
  }

  async defaultErrorHandler(err, req, res, next) {
    const errors = await new Youch(err, req).toJSON();
    console.log(errors);

    if (res.headersSent) {
      return next(errors);
    }
    return res.status(500).json(errors);
  }
}

export default new App().server;
