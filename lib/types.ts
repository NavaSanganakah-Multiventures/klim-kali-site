export type UserRole = "ADMIN" | "USER";

export interface DBUser {
  id: string;
  email: string;
  name?: string | null;
  role: UserRole;
  created_at: string;
}

export type BookingStatus = "PENDING" | "CONFIRMED" | "COMPLETED" | "CANCELLED";

export interface DBBooking {
  id: string;
  user_id: string;
  service_type: string;
  date: string;
  time: string;
  name: string;
  phone: string;
  message?: string | null;
  status: BookingStatus;
  created_at: string;
}

export interface DBDailyDarshan {
  id: string;
  date: string;
  image_key: string;
  image_url: string;
  caption?: string | null;
  created_at: string;
}

export interface DBEvent {
  id: string;
  title: string;
  date: string;
  description?: string | null;
  category?: string | null;
  image_key?: string | null;
  image_url?: string | null;
  is_featured: number; // 0 or 1
  created_at: string;
}

export interface DBEventActivity {
  id: string;
  event_id: string;
  activity_time: string;
  title: string;
  description?: string | null;
  sort_order: number;
  created_at: string;
}

export const SERVICE_TYPES = {
  PERSONAL_POOJA: "व्यक्तिगत पूजा",
  CONSULT_ASTROLOGY: "परामर्श व ज्योतिष",
  SPECIAL_EVENT: "विशेष अनुष्ठान",
} as const;

export type ServiceType = (typeof SERVICE_TYPES)[keyof typeof SERVICE_TYPES];
