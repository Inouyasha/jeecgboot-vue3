import { options } from '/@/assets/config/society.json';

export type OptionType = { value: string; label: string; queryItem?: string };
export function getOptions(): OptionType[] {
  return options;
}
