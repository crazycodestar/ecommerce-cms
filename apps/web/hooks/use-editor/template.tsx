import { Pages } from "./elements";

export const template = [
  {
    id: "home",
    name: "Home",
    body: {
      name: "Body",
      type: "body",
      id: crypto.randomUUID(),
      children: [],
    },
  },
] satisfies Pages;
