import { beforeAll } from 'vitest';

beforeAll(() => {
  (process.env as any).NODE_ENV = 'test';

  // Safeguard: Ensure tests never target a production database URL
  const dbUrl = process.env.DATABASE_URL || '';
  if (
    dbUrl.includes('azure.com') ||
    dbUrl.includes('production') ||
    dbUrl.includes('prod') ||
    dbUrl.includes('coolwave-prod')
  ) {
    throw new Error(
      'SICHERHEITSABBRUCH: Test-Lauf gegen Produktions-Datenbank erkannt! Breche sofort ab.'
    );
  }
});
