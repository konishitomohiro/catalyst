import type { Role } from "@/lib/roles";

export interface QuestionMemoItem {
  id: string;
  term: string;
  reading?: string;
  note: string;
  checked: boolean;
}

export interface ChatMessage {
  id: string;
  senderRole: Role;
  recipientRole: Role;
  text: string;
  timestamp: string;
}

export interface HistoryRecord {
  id: string;
  date: string;
  timeRange: string;
  duration: string;
  sender: Role;
  recipient: Role;
  summary: string;
  resolvedMemos: {
    term: string;
    reading?: string;
    topic: string;
    resolution: string;
  }[];
  transcript: ChatMessage[];
}
