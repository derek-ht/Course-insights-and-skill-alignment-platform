export interface wordCloudData {
  word: string;
  value: number;
  group: string;
}

export interface visualData {
  phrase: string;
  score: number;
  source: string;
}

export type SummaryData = {
  summary: visualData[];
};
