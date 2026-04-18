export async function POST(req) {
  const body = await req.json();

  console.log("Incoming payment:", body);

  return new Response(
    JSON.stringify({ message: "STK route ready" }),
    { status: 200 }
  );
}
