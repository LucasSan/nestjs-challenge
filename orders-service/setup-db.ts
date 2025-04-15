import * as mongoose from 'mongoose';
import * as fs from 'fs';
import { AppConfig } from './src/app.config';
import * as readline from 'readline';
import { Orders, OrdersSchema } from 'src/modules/orders/schemas/orders.schema';

async function setupDatabase() {
  try {
    const rl = readline.createInterface({
      input: process.stdin,
      output: process.stdout,
    });

    rl.question(
      'Do you want to clean up the existing orders collection? (Y/N): ',
      async (answer) => {
        rl.close();

        const data = JSON.parse(fs.readFileSync('data.json', 'utf-8'));
        const ordersModel: mongoose.Model<Orders> = mongoose.model<Orders>(
          'Orders',
          OrdersSchema,
        );

        await mongoose.connect(AppConfig.mongoUrl);

        if (answer.toLowerCase() === 'y') {
          await ordersModel.deleteMany({});
          console.log('Existing collection cleaned up.');
        }

        const orders = await ordersModel.insertMany(data);
        console.log(`Inserted ${orders.length} orders successfully!`);

        mongoose.disconnect();
      },
    );
  } catch (error) {
    console.error('Error setting up the database:', error);
    mongoose.disconnect();
  }
}

setupDatabase();
