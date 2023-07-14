import { bootstrap, VendureConfig, DefaultJobQueuePlugin } from '@vendure/core';
import { populate } from '@vendure/core/cli';
import { createConnection } from 'typeorm';
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


export async function populateOnFirstRun(populateConfig: VendureConfig) {
    const dbTablesAlreadyExist = await tablesExist(config);
    if (!dbTablesAlreadyExist) {
        console.log(`No Vendure tables found in DB. Populating database...`);
        return populate(
            () => bootstrap({
                ...populateConfig,
                importExportOptions: {
                    importAssetsDir: importDir,
                },
                dbConnectionOptions: { ...populateConfig.dbConnectionOptions, synchronize: true }
            }),
            initialData,
            productsCsvFile
        ).then(app => app.close())
    } else {
        return;
    }
}

async function tablesExist(config: VendureConfig) {
    const connection = await createConnection(config.dbConnectionOptions);
    const result = await connection.query(`
        select n.nspname as table_schema,
               c.relname as table_name,
               c.reltuples as rows
        from pg_class c
        join pg_namespace n on n.oid = c.relnamespace
        where c.relkind = 'r'
              and n.nspname = '${process.env.DB_SCHEMA}'
        order by c.reltuples desc;`
    );
    await connection.close();
    return 0 < result.length;
}