import {
  uniqueNamesGenerator,
  adjectives,
  animals,
  type Config,
} from "unique-names-generator";

const config: Config = {
  dictionaries: [adjectives, animals],
  separator: "_",
  style: "lowerCase",
};

export function generateAnonName(): string {
  return uniqueNamesGenerator(config);
}
