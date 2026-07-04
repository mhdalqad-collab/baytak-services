import { databaseInfo, readDb } from "./db.js";

async function main() {
  const data = await readDb();
  console.log(JSON.stringify({
    ok: true,
    database: databaseInfo(),
    counts: {
      users: data.users?.length || 0,
      providers: data.providers?.length || 0,
      requests: data.requests?.length || 0,
      categories: data.categories?.length || 0
    }
  }, null, 2));
}

main().catch((error) => {
  console.error(JSON.stringify({ ok: false, error: error.message }, null, 2));
  process.exit(1);
});
