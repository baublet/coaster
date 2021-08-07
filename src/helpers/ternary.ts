type Falsy = undefined | null | 0 | "" | false;

export function ternary<
  Condition extends any,
  TruthyOutcome extends any,
  FalsyOutcome extends any
>(
  condition: Condition,
  truthyOutcome: TruthyOutcome,
  falsyOutcome: FalsyOutcome
): Condition extends Falsy ? FalsyOutcome : TruthyOutcome {
  if (condition) {
    return truthyOutcome as Condition extends Falsy
      ? FalsyOutcome
      : TruthyOutcome;
  }
  return falsyOutcome as Condition extends Falsy ? FalsyOutcome : TruthyOutcome;
}
