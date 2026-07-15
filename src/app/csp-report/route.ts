/**
 * CSP violation sink (issue #50).
 *
 * The Content-Security-Policy ships Report-Only, so browsers POST violation
 * reports here (the `report-uri` target in next.config). Log the essentials so we
 * can see what an enforcing policy would block before flipping the header, then
 * return 204. Kept off the /api namespace to avoid Payload's catch-all.
 */
export async function POST(req: Request): Promise<Response> {
  try {
    const body = (await req.json()) as Record<string, unknown>
    const r = (body['csp-report'] as Record<string, unknown>) ?? body
    console.warn(
      '[csp-report]',
      JSON.stringify({
        directive: r['violated-directive'] ?? r['effectiveDirective'],
        blocked: r['blocked-uri'] ?? r['blockedURL'],
        document: r['document-uri'] ?? r['documentURL'],
      }),
    )
  } catch {
    // ignore malformed / empty report bodies
  }
  return new Response(null, { status: 204 })
}
