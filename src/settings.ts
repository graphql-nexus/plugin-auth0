export type Settings = {
  auth0Domain: string
  auth0Audience: string
  protectedPaths?: string[]

  // useCookie?: boolean;
  // cookieName?: string;
  // verify?: (req: Request) => Promise<any> | any;
}
