// Placeholder so the folder is recognized. Security regression suite lives in security_test.ts
// and is executed via the Deno test runner — this function is not meant to be invoked.
Deno.serve(() => new Response("security-tests: run via Deno test runner", { status: 200 }));
