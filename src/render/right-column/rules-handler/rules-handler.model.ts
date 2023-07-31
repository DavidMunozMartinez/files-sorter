export type RulesHandlerBind = {
  category: string
  hideOverlay: boolean;
  showTip: boolean;
  conditions: RuleCondition
  activeCondition: string;
  rules: []
  activeRules: number;

  onKeydown: (event: KeyboardEvent) => void
  showRules: () => void
  selectCondition: (key: string) => void;
  removeRule: (rule: any) => void
  selectRule: (event: MouseEvent, rule: any) => void
  joinConditions: () => void;
}

export type RuleCondition = {
  starts_with: "Starts with",
  contains: "Contains",
  ends_with: "Ends with",
}