import { common } from "./common";
import { create } from "./create";
import { home } from "./home";
import { person } from "./person";

export const resources = {
  en: {
    common: { ...common.en },
    home: { ...home.en },
    person: { ...person.en },
    create: { ...create.en },
  },
  fr: {
    common: { ...common.fr },
    home: { ...home.fr },
    person: { ...person.fr },
    create: { ...create.fr },
  },
};
