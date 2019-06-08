const isProd = process.env['PROD'] === 'true';
export const mongoUrl = `mongodb://${isProd ? process.env['MONGODB_URL'] : 'localhost'}:27017/pbl`;
export const redisUrl = isProd ? process.env['REDIS_URL'] : 'localhost';

export const services = new Proxy({}, {
    get(target, p, receiver) {
        if (isProd) return `${p}-service:4000`;
        return {
            'user-project': 'localhost:4001'
        }[p]
    }
});
