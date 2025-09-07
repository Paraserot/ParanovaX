
export async function GET() {
  const next = require('next/package.json').version;
  return new Response(JSON.stringify({ next, node: process.version }), {
    headers: { 'content-type': 'application/json' },
  });
}
