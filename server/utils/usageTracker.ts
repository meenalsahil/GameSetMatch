import { db } from "../db";
import { apiUsage } from "@db/schema";
import { eq } from "drizzle-orm";

export async function incrementApiUsage(count = 1) {
  const now = new Date();
  const currentMonth = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;

  try {
    // 1. Find record for this month
    const [record] = await db
      .select()
      .from(apiUsage)
      .where(eq(apiUsage.month, currentMonth))
      .limit(1);

    if (record) {
      // 2. Increment
      await db
        .update(apiUsage)
        .set({ 
          requestCount: record.requestCount + count,
          lastRequestAt: new Date()
        })
        .where(eq(apiUsage.id, record.id));
      return record.requestCount + count;
    } else {
      // 3. Create new
      await db.insert(apiUsage).values({
        month: currentMonth,
        requestCount: count,
      });
      return count;
    }
  } catch (err) {
    console.error("Failed to track API usage:", err);
    return 0;
  }
}

export async function getApiUsage() {
  const now = new Date();
  const currentMonth = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;
  
  const [record] = await db
    .select()
    .from(apiUsage)
    .where(eq(apiUsage.month, currentMonth))
    .limit(1);

  return record?.requestCount || 0;
}