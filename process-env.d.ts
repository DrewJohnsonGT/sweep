declare global {
  namespace NodeJS {
    interface ProcessEnv {
      FORM_URL: string;
      EMAIL: string;
      HEADLESS: string;
    }
  }
}

export {};
