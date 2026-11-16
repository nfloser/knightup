import { openDB } from "idb";
export const database = () =>
  openDB("knightup", 1, {
    upgrade(db) {
      db.createObjectStore("settings");
    },
  });
