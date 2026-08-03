import { createClientFromRequest } from 'npm:@base44/sdk@0.8.40';

export default async function(req) {
  try {
    const base44 = createClientFromRequest(req);

    const result = await base44.asServiceRole.integrations.Core.InvokeLLM({
      prompt: `You are a live precious metals price API for Pakistan. Search the web RIGHT NOW for the current live gold and silver prices in Pakistan.

Required data:
1. Gold price per Tola in PKR (Pakistani Rupees). 1 Tola = 11.6638 grams. This is the standard unit used in Pakistan.
2. Silver price per Tola in PKR
3. Current USD to PKR exchange rate
4. Gold percentage change today (can be positive or negative)
5. Silver percentage change today (can be positive or negative)

Check sources like investing.com, goldrate.pk, urdupoint.com, or any current Pakistani gold rate source.

Today's date: ${new Date().toISOString().split('T')[0]}
Current time: ${new Date().toISOString()}

Return ONLY accurate, current data. Search the web for real prices.`,
      add_context_from_internet: true,
      model: "gemini_3_flash",
      response_json_schema: {
        type: "object",
        properties: {
          gold_per_tola_pkr: { type: "number", description: "Gold price per Tola in Pakistani Rupees" },
          silver_per_tola_pkr: { type: "number", description: "Silver price per Tola in Pakistani Rupees" },
          usd_pkr: { type: "number", description: "USD to PKR exchange rate" },
          gold_change_pct: { type: "number", description: "Gold percentage change today" },
          silver_change_pct: { type: "number", description: "Silver percentage change today" },
          source: { type: "string" }
        },
        required: ["gold_per_tola_pkr", "silver_per_tola_pkr", "usd_pkr", "gold_change_pct", "silver_change_pct"]
      }
    });

    return Response.json({
      ...result,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
}