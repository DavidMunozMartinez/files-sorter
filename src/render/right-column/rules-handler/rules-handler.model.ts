export type RulesHandlerBind = {
  category: string
  showOverlay: boolean;
  showTip: boolean;
  conditions: RuleCondition
  activeCondition: string;
  rules: Rule[]
  activeRules: number;
  activeJoinedRules: number,

  onKeydown: (event: KeyboardEvent) => void
  showRules: () => void
  selectCondition: (key: string) => void;
  removeRule: (rule: any) => void
  selectRule: (event: MouseEvent, rule: any) => void
  joinConditions: () => void;
  breakConditions: () => void;
}

export type Rule = {
  active: boolean,
  display: string,
  value: string
}

export type RuleCondition = {
  starts_with: "Starts with",
  contains: "Contains",
  ends_with: "Ends with",
}