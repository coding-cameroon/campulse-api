export function generateDicebearUrl(seed: string): string {
  return `https://api.dicebear.com/9.x/adventurer/svg?seed=${seed}`;
}
