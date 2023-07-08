// populate-server.ts
import { bootstrap, DefaultJobQueuePlugin } from '@vendure/core';
import { populate } from '@vendure/core/cli';
import path from 'path';

import { config } from './src/vendure-config';

const initialData = path.join(__dirname, './assets/initial-data.json');
const productsCsvFile = path.join(__dirname, './assets/products.csv');

const populateConfig = {
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
      importAssetsDir: './assets/images',
    },
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