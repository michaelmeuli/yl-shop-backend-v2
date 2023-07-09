import { bootstrap, VendureConfig, DefaultJobQueuePlugin } from '@vendure/core';
import { populate } from '@vendure/core/cli';
import path from 'path';

import { config } from './vendure-config';

const initialData = path.join(__dirname, '../assets/initial-data.json');
const productsCsvFile = path.join(__dirname, '../assets/products.csv');
const importDir = path.join(__dirname, '../assets/images');

const populateConfig: VendureConfig = {
  ...config,
  plugins: (config.plugins || []).filter(
    // Remove your JobQueuePlugin during populating to avoid
    // generating lots of unnecessary jobs as the Collections get created.
    plugin => plugin !== DefaultJobQueuePlugin,
  ),
}

populate(
  () => bootstrap({
    ...populateConfig,
    importExportOptions: {
      importAssetsDir: importDir,
    },
    dbConnectionOptions: { ...populateConfig.dbConnectionOptions, synchronize: true }
  }),
  initialData,
  productsCsvFile
)

  .then(app => {
    return app.close();
  })
  .then(
    () => process.exit(0),
    err => {
      console.log(err);
      process.exit(1);
    },
  );