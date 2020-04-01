import {TypeOrmModuleOptions} from '@nestjs/typeorm';

export const typeOrmConfig: TypeOrmModuleOptions = {
    type: 'postgres',
    host: 'localhost',
    port: 5432,
    username: 'postgres',
    password: 'ys250911!',
    database: 'housie',
    entities: [__dirname + '/../**/*.entity.{js,ts}'],
    synchronize: false
}