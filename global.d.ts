import { CatClient } from "ccat-api";

declare global {
  interface Window {
    catClient?: CatClient;
  }
}
