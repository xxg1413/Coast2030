import { WebStandardStreamableHTTPServerTransport } from "@modelcontextprotocol/sdk/server/webStandardStreamableHttp.js";
import { authenticateOperatorRequest } from "@/lib/operator-auth";
import { createCoastOperatorServer } from "@/lib/operator-mcp";

export const dynamic = "force-dynamic";

function unauthorizedResponse(): Response {
  return Response.json(
    {
      jsonrpc: "2.0",
      error: {
        code: -32001,
        message: "Unauthorized. Create an Operator token in Coast and send it as a Bearer token.",
      },
      id: null,
    },
    {
      status: 401,
      headers: {
        "WWW-Authenticate": 'Bearer realm="Coast Operator", charset="UTF-8"',
      },
    },
  );
}

async function handleMcpRequest(request: Request): Promise<Response> {
  const operator = await authenticateOperatorRequest(request);
  if (!operator) return unauthorizedResponse();

  const server = createCoastOperatorServer(operator);
  const transport = new WebStandardStreamableHTTPServerTransport({
    sessionIdGenerator: undefined,
    enableJsonResponse: true,
  });
  await server.connect(transport);
  return transport.handleRequest(request);
}

export async function POST(request: Request): Promise<Response> {
  try {
    return await handleMcpRequest(request);
  } catch (error) {
    return Response.json(
      {
        jsonrpc: "2.0",
        error: {
          code: -32603,
          message: error instanceof Error ? error.message : "Coast Operator internal error",
        },
        id: null,
      },
      { status: 500 },
    );
  }
}

export async function GET(request: Request): Promise<Response> {
  return handleMcpRequest(request);
}

export async function DELETE(request: Request): Promise<Response> {
  return handleMcpRequest(request);
}
