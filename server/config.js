export const dbConfig = {
  host: process.env.PGHOST ?? '127.0.0.1',
  port: Number(process.env.PGPORT ?? '5432'),
  user: process.env.PGUSER ?? 'postgres',
  password: process.env.PGPASSWORD ?? 'password123',
  database: process.env.PGDATABASE ?? 'petualangan_kata',
}

export const serverConfig = {
  port: Number(process.env.PORT ?? '3001'),
}
