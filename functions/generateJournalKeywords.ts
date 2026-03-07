import { createClientFromRequest } from 'npm:@base44/sdk@0.8.6';

Deno.serve(async (req) => {
  const base44 = createClientFromRequest(req);
  const user = await base44.auth.me();
  if (!user) return Response.json({ error: 'Unauthorized' }, { status: 401 });

  const { journal_id, journal_name } = await req.json();
  if (!journal_id || !journal_name) {
    return Response.json({ error: 'journal_id and journal_name required' }, { status: 400 });
  }

  // Check cache first
  const existing = await base44.asServiceRole.entities.JournalScope.filter({ journal_id });
  if (existing.length > 0 && existing[0].keywords?.length > 0) {
    return Response.json({ keywords: existing[0].keywords, summary: existing[0].scope_summary, cached: true });
  }

  const result = await base44.asServiceRole.integrations.Core.InvokeLLM({
    prompt: `You are a scientific literature expert with deep knowledge of academic journals.

Generate a comprehensive list of specific scope keywords for the journal: "${journal_name}"

Include keywords covering:
- Core research topics and subject areas this journal publishes on
- Methods and techniques commonly featured
- Application domains and fields
- Specific subdisciplines
- Types of compounds, materials, or systems studied

Examples of good keywords: "toxicology", "drug safety", "environmental monitoring", "HPLC", "biomarkers", "occupational exposure", "risk assessment", "chemical hazards", "metabolism", "pharmacokinetics"

Return ONLY a JSON object with 25-40 specific, relevant keywords.`,
    response_json_schema: {
      type: 'object',
      properties: {
        keywords: { type: 'array', items: { type: 'string' } },
        summary: { type: 'string' }
      }
    }
  });

  // Cache the result
  await base44.asServiceRole.entities.JournalScope.create({
    journal_id,
    journal_name,
    keywords: result.keywords || [],
    scope_summary: result.summary || ''
  });

  return Response.json({ keywords: result.keywords, summary: result.summary, cached: false });
});