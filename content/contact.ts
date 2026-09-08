import type { Contact } from "./types";

export const contact: Contact = {
  email: "qsao2212@gmail.com",
  /*
   * Two forms, because the two uses genuinely differ.
   *
   * `phone` is what a reader sees. `phoneHref` is what `tel:` gets, and it has
   * to be E.164 — the bare national form "0941697009" only dials from inside
   * Vietnam, so a recruiter tapping it from anywhere else reached nothing. The
   * site lists a Ho Chi Minh City location and is written in English, which
   * makes "the visitor is dialling from abroad" the case worth handling.
   */
  phone: "+84 941 697 009",
  phoneHref: "+84941697009",
  github: "https://github.com/quanva2003",
  linkedin: "https://www.linkedin.com/in/wuanvan5076",
};
