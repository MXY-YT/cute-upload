import {dev} from "./dev";
import {prod} from "./prod";

let config = {
    port: 5845,
    db: {
        host: 'localhost',
        port: 3306,
        user: 'root',
        password: '123456',
        database: 'cute-upload-demo',
        connectionLimit: 30, // 设置连接池的最大连接数
        logging: true, // 打印日志
    },
    upload: {
        host: 'http://localhost:5845/', // 项目部署的 URL, 例如： http://localhost:5845/
        path: 'public/upload',
        maxSize: 1024 * 1024 * 1024 * 5, // 5G
    },
    debug: true,
}
export default {...config, ...(process.env.NODE_ENV === 'dev' ? dev : prod ?? {})}
