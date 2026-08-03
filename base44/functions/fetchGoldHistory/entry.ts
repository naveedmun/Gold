import { createClientFromRequest } from 'npm:@base44/sdk@0.8.40';

export default async function(req) {
  try {
    const base44 = createClientFromRequest(req);
    const body = await req.json().catch(() => ({}));
    const range = body.range || '1M';
    const date = body.date;

    // Specific date lookup
    if (date) {
      const result = await base44.asServiceRole.integrations.Core.InvokeLLM({
        prompt: `Search the web for the historical gold and silver prices in Pakistan per Tola (in PKR) on or closest to the date: ${date}

Return the rates for that specific date. If exact data is unavailable, provide the closest known rates.`,
        add_context_from_internet: true,
        model: "gemini_3_flash",
        response_json_schema: {
          type: "object",
          properties: {
            gold_per_tola_pkr: { type: "number" },
            silver_per_tola_pkr: { type: "number" },
            usd_pkr: { type: "number" },
            note: { type: "string" }
          },
          required: ["gold_per_tola_pkr", "silver_per_tola_pkr"]
        }
      });
      return Response.json({ date, ...result });
    }

    // Chart time series
    const rangeConfig = {
      "1D": { label: "1 day", points: 12 },
      "1W": { label: "1 week", points: 7 },
      "1M": { label: "1 month", points: 30 },
      "6M": { label: "6 months", points: 26 },
      "1Y": { label: "1 year", points: 52 },
      "5Y": { label: "5 years", points: 60 },
      "10Y": { label: "10 years", points: 60 }
    };

    const config = rangeConfig[range] || rangeConfig["1M"];

    const result = await base44.asServiceRole.integrations.Core.InvokeLLM({
      prompt: `Search the web for historical gold and silver prices in Pakistan (PKR per Tola) over the past ${config.label}.

Create a time series of approximately ${config.points} data points covering this period. For each point provide:
- date (YYYY-MM-DD format, or YYYY-MM-DD HH:MM for intraday 1D data)
- gold price per Tola in PKR
- silver price per Tola in PKR

Use actual historical price data. Include major price movements and trends. For longer periods (5Y, 10Y), use yearly/quarterly averages and major milestones.

Current date: ${new Date().toISOString().split('T')[0]}`,
      add_context_from_internet: true,
      model: "gemini_3_flash",
      response_json_schema: {
        type: "object",
        properties: {
          data_points: {
            type: "array",
            items: {
              type: "object",
              properties: {
                date: { type: "string" },
                gold: { type: "number" },
                silver: { type: "number" }
              },
              required: ["date", "gold", "silver"]
            }
          }
        },
        required: ["data_points"]
      }
    });

    return Response.json({ range, points: result.data_points || [] });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
}