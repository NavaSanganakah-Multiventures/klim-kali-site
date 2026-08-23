import { z } from "zod";

export const dailyDarshanSchema = z.object({
  date: z.string().min(1, "दिनांक आवश्यक है"),
  caption: z.string().max(200).optional(),
});

export type DailyDarshanInput = z.infer<typeof dailyDarshanSchema>;

export const eventSchema = z.object({
  title: z.string().min(2, "शीर्षक आवश्यक है"),
  date: z.string().min(1, "दिनांक आवश्यक है"),
  description: z.string().optional(),
  category: z.string().optional(),
});

export type EventInput = z.infer<typeof eventSchema>;

export const eventActivitySchema = z.object({
  event_id: z.string().min(1, "Event ID आवश्यक है"),
  activity_time: z.string().min(1, "समय आवश्यक है"),
  title: z.string().min(1, "गतिविधि का नाम आवश्यक है"),
  description: z.string().optional(),
  sort_order: z.number().int().default(0),
});

export type EventActivityInput = z.infer<typeof eventActivitySchema>;
