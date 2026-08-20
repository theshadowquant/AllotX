import { db } from '../db';

/**
 * Derives event milestones and updates IPO status automatically
 * based on date boundaries AND actual registrar verification confirmation.
 */
export async function deriveIPOEventsAndStatus(): Promise<{ updatedCount: number; eventsCreated: number }> {
  const now = new Date();
  let updatedCount = 0;
  let eventsCreated = 0;

  try {
    const ipos = await db.iPO.findMany({
      include: {
        events: true,
        allotmentChecks: {
          where: {
            status: { in: ['ALLOTTED', 'NOT_ALLOTTED'] },
          },
          take: 1,
        },
      },
    });

    for (const ipo of ipos) {
      let targetStatus = ipo.status;
      const openTs = new Date(ipo.openDate).getTime();
      const closeTs = new Date(ipo.closeDate).getTime();
      const allotmentTs = new Date(ipo.allotmentDate).getTime();
      const listingTs = new Date(ipo.listingDate).getTime();
      const nowTs = now.getTime();

      // Determine date-derived status with strict allotment verification check
      if (nowTs < openTs) {
        targetStatus = 'UPCOMING';
      } else if (nowTs >= openTs && nowTs <= closeTs) {
        targetStatus = 'OPEN';
      } else if (nowTs > closeTs && nowTs < allotmentTs) {
        targetStatus = 'CLOSED';
      } else if (nowTs >= allotmentTs && nowTs < listingTs) {
        // Data Integrity Fix:
        // Do NOT infer ALLOTMENT_AVAILABLE purely from the date calendar.
        // Set ALLOTMENT_AVAILABLE only if actual registrar allotment checks exist in DB.
        const hasVerifiedAllotments = ipo.allotmentChecks.length > 0;
        targetStatus = hasVerifiedAllotments ? 'ALLOTMENT_AVAILABLE' : 'ALLOTMENT_PENDING';
      } else if (nowTs >= listingTs) {
        targetStatus = 'LISTED';
      }

      // Update IPO status if changed
      if (targetStatus !== ipo.status) {
        await db.iPO.update({
          where: { id: ipo.id },
          data: { status: targetStatus },
        });
        updatedCount++;
      }

      // Ensure key event records exist in IPOEvent table
      const existingTypes = new Set(ipo.events.map((e) => e.eventType));

      if (nowTs >= openTs && !existingTypes.has('IPO_OPEN')) {
        await db.iPOEvent.create({
          data: {
            ipoId: ipo.id,
            eventType: 'IPO_OPEN',
            eventDate: ipo.openDate,
            description: `${ipo.name} opened for bidding.`,
          },
        });
        eventsCreated++;
      }

      if (nowTs >= closeTs && !existingTypes.has('IPO_CLOSE')) {
        await db.iPOEvent.create({
          data: {
            ipoId: ipo.id,
            eventType: 'IPO_CLOSE',
            eventDate: ipo.closeDate,
            description: `${ipo.name} bidding period closed.`,
          },
        });
        eventsCreated++;
      }

      if (nowTs >= allotmentTs && !existingTypes.has('ALLOTMENT')) {
        await db.iPOEvent.create({
          data: {
            ipoId: ipo.id,
            eventType: 'ALLOTMENT',
            eventDate: ipo.allotmentDate,
            description: `Expected Basis of Allotment date for ${ipo.name}.`,
          },
        });
        eventsCreated++;
      }

      if (nowTs >= listingTs && !existingTypes.has('LISTING')) {
        await db.iPOEvent.create({
          data: {
            ipoId: ipo.id,
            eventType: 'LISTING',
            eventDate: ipo.listingDate,
            description: `${ipo.name} listed on stock exchange.`,
          },
        });
        eventsCreated++;
      }
    }
  } catch (err) {
    console.error('Error in deriveIPOEventsAndStatus:', err);
  }

  return { updatedCount, eventsCreated };
}
