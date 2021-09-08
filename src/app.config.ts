import { ConfigEnv } from './core/config';

const env: { [k: string]: ConfigEnv } = {
  development: {
    name: 'jobs-service',
    prefix: 'api',
    port: 3000,
    mongo: {
      database: 'jobs',
    },
  },
};
env.production = {
  ...env.development,
  port: 3000,
};
export const config: { [k: string]: ConfigEnv } = env;
