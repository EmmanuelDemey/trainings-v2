import { common } from "./common";
import { home } from "./home";
import { person } from "./person";

export const resources = {
  en: {
    common: { ...common.en },
    home: { ...home.en },
    person: { ...person.en },
  },
  fr: {
    common: { ...common.fr },
    home: { ...home.fr },
    person: { ...person.fr },
  },
};
