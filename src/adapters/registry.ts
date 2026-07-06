import type { SourceAdapter } from './types.js';
import { kopisAdapter } from './kopis.js';
import { culturePortalAdapter } from './culturePortal.js';
import { cultureDataPlazaExpoAdapter } from './cultureDataPlazaExpo.js';
import { seoulCultureEventAdapter } from './seoulCultureEvent.js';
import { worknetJobFairAdapter } from './worknetJobFair.js';

// 나머지 소스(culture_data_plaza_perf(보류), motie_trade_fair, at_agrifood_fair)는
// base_url/응답 스키마 확인이 끝나는 대로 여기에 어댑터를 추가한다.
const adapters: Record<string, SourceAdapter> = {
  [kopisAdapter.code]: kopisAdapter,
  [culturePortalAdapter.code]: culturePortalAdapter,
  [cultureDataPlazaExpoAdapter.code]: cultureDataPlazaExpoAdapter,
  [seoulCultureEventAdapter.code]: seoulCultureEventAdapter,
  [worknetJobFairAdapter.code]: worknetJobFairAdapter,
};

export function getAdapter(code: string): SourceAdapter {
  const adapter = adapters[code];
  if (!adapter) {
    throw new Error(`'${code}' 소스의 수집 어댑터가 아직 구현되지 않았습니다. 구현된 소스: ${listAdapterCodes().join(', ')}`);
  }
  return adapter;
}

export function listAdapterCodes(): string[] {
  return Object.keys(adapters);
}
