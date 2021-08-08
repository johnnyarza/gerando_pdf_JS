import Sequelize, { Model } from 'sequelize';
import { v4 as uuid } from 'uuid';

class Product extends Model {
  static init(sequelize) {
    super.init(
      {
        description: Sequelize.STRING,
        price: Sequelize.DECIMAL(10, 2),
        quantity: Sequelize.INTEGER,
      },
      {
        hooks: {
          beforeCreate: (prod, _) => {
            prod.id = uuid();
          },
        },
        sequelize,
        tableName: 'products',
        updatedAt: false,
        createdAt: false,
      }
    );
    return this;
  }
}

export default Product;
