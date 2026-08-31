// Coverage Galaxy — Mission: Tutorial (Telemetry Validator)
// Config: Simulator + GCC RISC-V 32 + Debug
// Function: validate_telemetry_range — validates a decoded telemetry value is within limits

export const MISSION_TUTORIAL = {
  id: 'tutorial-telemetry',
  planetName: 'Telemetry Validator',
  constellation: 'OBC Cluster',
  planetEmoji: '📡',
  description: 'Valida che un valore di telemetria decodificato sia entro i limiti accettabili. Tutorial guidato.',
  functionSig: 'bool validate_telemetry_range(int32_t raw_value, int32_t min_limit, int32_t max_limit)',
  sourceCode: `#include <stdint.h>
#include <stdbool.h>

/* Requirement: REQ-TLM-001 */
/* Validate decoded telemetry value is within operational limits */
bool validate_telemetry_range(int32_t raw_value,
                              int32_t min_limit,
                              int32_t max_limit)
{
    bool result = false;                    /* S1 */
    if (raw_value >= min_limit) {           /* S2 D1 m0 */
        if (raw_value <= max_limit) {       /* S3 D1 m1 */
            result = true;                  /* S4 */
        }
    }
    return result;                          /* S5 */
}`,
  requirements: [
    { id: 'REQ-TLM-001', text: 'Validate that decoded telemetry is within operational limits', method: 'Unit Test' },
    { id: 'REQ-TLM-002', text: 'Return TRUE if value is within [min, max] inclusive', method: 'Unit Test' },
    { id: 'REQ-TLM-003', text: 'Return FALSE if value is outside limits', method: 'Unit Test' },
  ],
  config: { compiler: 'GCC RISC-V 32', platform: 'Simulator', build: 'Debug', charSigned: true, alignment: 'standard' },
  stations: [
    { id: 'S1', label: 'bool result = false;', line: 13 },
    { id: 'S2', label: 'if (raw_value >= min_limit)', line: 14 },
    { id: 'S3', label: 'if (raw_value <= max_limit)', line: 16 },
    { id: 'S4', label: 'result = true;', line: 17 },
    { id: 'S5', label: 'return result;', line: 20 },
  ],
  routes: [
    { from: 'S2', to: 'S3', decisionId: 'D1', moonIndex: 1, label: 'raw >= min → true' },
    { from: 'S2', to: 'S5', decisionId: 'D1', moonIndex: 0, label: 'raw >= min → false' },
    { from: 'S3', to: 'S4', decisionId: 'D1', moonIndex: 1, label: 'raw <= max → true' },
    { from: 'S3', to: 'S5', decisionId: 'D1', moonIndex: 0, label: 'raw <= max → false' },
  ],
  moons: [
    { id: 'M1', expr: 'raw_value >= min_limit', decisionId: 'D1', index: 0 },
    { id: 'M2', expr: 'raw_value <= max_limit', decisionId: 'D1', index: 1 },
  ],
  dependencies: [
    { id: 'dep_none', kind: 'none', name: 'Nessuna dipendenza esterna', keepable: false },
  ],
  sim: {
    inputs: [
      { name: 'raw_value', type: 'int32', min: -2147483648, max: 2147483647 },
      { name: 'min_limit', type: 'int32', min: -2147483648, max: 2147483647 },
      { name: 'max_limit', type: 'int32', min: -2147483648, max: 2147483647 },
    ],
    decisions: [{ id: 'D1', moons: ['raw_value >= min_limit', 'raw_value <= max_limit'] }],
    rules: [
      { when: { 'D1.m0': true, 'D1.m1': true }, trace: ['S1', 'S2', 'S3', 'S4', 'S5'], returns: true },
      { when: { 'D1.m0': true, 'D1.m1': false }, trace: ['S1', 'S2', 'S3', 'S5'], returns: false },
      { when: { 'D1.m0': false, 'D1.m1': false }, trace: ['S1', 'S2', 'S5'], returns: false },
      { when: { 'D1.m0': false, 'D1.m1': true }, trace: ['S1', 'S2', 'S5'], returns: false },
    ],
  },
  coverageTargets: { statement: 80, branch: 75, mcdc: 0 },
  xpReward: 500,
  badgeAward: undefined,
};
