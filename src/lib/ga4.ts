import { BetaAnalyticsDataClient } from "@google-analytics/data";

const client = new BetaAnalyticsDataClient({
  credentials: {
    client_email: process.env.GA4_CLIENT_EMAIL,
    private_key: process.env.GA4_PRIVATE_KEY?.replace(/\\n/g, "\n"),
  },
});

const propertyId = `properties/${process.env.GA4_PROPERTY_ID}`;

export async function getGA4Overview(startDate = "30daysAgo", endDate = "today") {
  try {
    const [response] = await client.runReport({
      property: propertyId,
      dateRanges: [{ startDate, endDate }],
      metrics: [
        { name: "totalUsers" },
        { name: "sessions" },
        { name: "screenPageViews" },
        { name: "averageSessionDuration" },
        { name: "bounceRate" },
      ],
    });
    const row = response.rows?.[0]?.metricValues;
    return {
      users: parseInt(row?.[0]?.value ?? "0"),
      sessions: parseInt(row?.[1]?.value ?? "0"),
      pageViews: parseInt(row?.[2]?.value ?? "0"),
      avgSessionDuration: Math.round(parseFloat(row?.[3]?.value ?? "0")),
      bounceRate: Math.round(parseFloat(row?.[4]?.value ?? "0") * 100),
    };
  } catch {
    return null;
  }
}

export async function getGA4TopPages(startDate = "30daysAgo", endDate = "today") {
  try {
    const [response] = await client.runReport({
      property: propertyId,
      dateRanges: [{ startDate, endDate }],
      dimensions: [{ name: "pagePath" }],
      metrics: [{ name: "screenPageViews" }],
      orderBys: [{ metric: { metricName: "screenPageViews" }, desc: true }],
      limit: 5,
    });
    return (response.rows ?? []).map((row) => ({
      path: row.dimensionValues?.[0]?.value ?? "/",
      views: parseInt(row.metricValues?.[0]?.value ?? "0"),
    }));
  } catch {
    return [];
  }
}

export async function getGA4DeviceBreakdown(startDate = "30daysAgo", endDate = "today") {
  try {
    const [response] = await client.runReport({
      property: propertyId,
      dateRanges: [{ startDate, endDate }],
      dimensions: [{ name: "deviceCategory" }],
      metrics: [{ name: "sessions" }],
    });
    return (response.rows ?? []).map((row) => ({
      device: row.dimensionValues?.[0]?.value ?? "unknown",
      sessions: parseInt(row.metricValues?.[0]?.value ?? "0"),
    }));
  } catch {
    return [];
  }
}