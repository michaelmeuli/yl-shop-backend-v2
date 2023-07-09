import { populate } from '@vendure/core/cli';
import { bootstrap, VendureConfig, DefaultJobQueuePlugin } from '@vendure/core';
import path from 'path';

import { config } from './vendure-config';

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


export async function populateOnFirstRun(populateConfig: VendureConfig) {
    return populate(
        () => bootstrap({
            ...populateConfig,
            importExportOptions: {
              importAssetsDir: './assets/images',
            },
            dbConnectionOptions: { ...populateConfig.dbConnectionOptions, synchronize: true }
        }),
        initialData,
        productsCsvFile
    ).then(app => app.close())
}
