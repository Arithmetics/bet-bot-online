const featureFlags = {
  queryDraftKings: true,
  makeBets: true,
  reportBets: true,
  useMockData: false,
  // queryDraftKings: false,
  // makeBets: false,
  // reportBets: false,
  // useMockData: true,
};

export const ATS_BET_THRESHOLD = 4.999;
export const TOTAL_BET_THRESHOLD = 4.999;

export const ATS_LOW_MINUTE = 12;
export const ATS_HIGH_MINUTE = 36;

export const TOTAL_LOW_MINUTE = 6;
export const TOTAL_HIGH_MINUTE = 42;

export default featureFlags;
