import { Pages } from "./elements";
import { getDefaultValues } from "./properties";

export const template = [
  {
    id: "home",
    name: "Home",
    body: {
      name: "Body",
      type: "body",
      id: crypto.randomUUID(),
      style: getDefaultValues("body"),
      children: [],
    },
  },
] satisfies Pages;
