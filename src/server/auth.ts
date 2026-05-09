import { Issuer, type Client, type TokenSet, type UserinfoResponse } from 'openid-client';
import { Request, Response, NextFunction } from 'express';
import crypto from 'crypto';

export type AuthUser = {
  id: string;
  name: string;
  email?: string;
  role: 'user' | 'admin';
};

type UserSession = {
  sessionId: string;
  user: AuthUser;
  createdAt: string;
};

const sessionStore = new Map<string, UserSession>();
let oauthClient: Client | null = null;

async function getOAuthClient(): Promise<Client> {
  if (oauthClient) return oauthClient;

  const issuerUrl = process.env.OAUTH_ISSUER;
  const clientId = process.env.OAUTH_CLIENT_ID;
  const clientSecret = process.env.OAUTH_CLIENT_SECRET;
  const redirectUri = process.env.OAUTH_REDIRECT_URI;

  if (!issuerUrl || !clientId || !clientSecret || !redirectUri) {
    throw new Error('OAuth configuration is missing. Check OAUTH_ISSUER, OAUTH_CLIENT_ID, OAUTH_CLIENT_SECRET, and OAUTH_REDIRECT_URI.');
  }

  const issuer = await Issuer.discover(issuerUrl);
  oauthClient = new issuer.Client({
    client_id: clientId,
    client_secret: clientSecret,
    redirect_uris: [redirectUri],
    response_types: ['code']
  });

  return oauthClient;
}

function getAfterLoginRedirect(): string {
  return process.env.OAUTH_AFTER_LOGIN_REDIRECT ?? 'http://localhost:5173';
}

declare global {
  namespace Express {
    interface Request {
      authUser?: AuthUser;
    }
  }
}

export async function loginHandler(req: Request, res: Response) {
  const client = await getOAuthClient();
  const authorizationUrl = client.authorizationUrl({
    scope: 'openid email profile',
    prompt: 'select_account'
  });
  res.redirect(authorizationUrl);
}

export async function callbackHandler(req: Request, res: Response) {
  const client = await getOAuthClient();
  const params = client.callbackParams(req);
  const tokenSet: TokenSet = await client.callback(process.env.OAUTH_REDIRECT_URI!, params, {
    response_type: 'code'
  });

  const userinfo = await client.userinfo(tokenSet.access_token as string);
  const email = typeof userinfo.email === 'string' ? userinfo.email : undefined;
  const name = typeof userinfo.name === 'string'
    ? userinfo.name
    : typeof userinfo.preferred_username === 'string'
      ? userinfo.preferred_username
      : email?.split('@')[0] ?? 'Investor';

  const sessionId = crypto.randomUUID();
  const authUser: AuthUser = {
    id: userinfo.sub ?? sessionId,
    name,
    email,
    role: 'user'
  };

  sessionStore.set(sessionId, {
    sessionId,
    user: authUser,
    createdAt: new Date().toISOString()
  });

  res.cookie('stockagent_session', sessionId, {
    httpOnly: true,
    sameSite: 'lax',
    secure: process.env.NODE_ENV === 'production',
    maxAge: 1000 * 60 * 60 * 24 * 7
  });

  res.redirect(getAfterLoginRedirect());
}

export function logoutHandler(req: Request, res: Response) {
  const sessionId = req.cookies?.stockagent_session;
  if (typeof sessionId === 'string') {
    sessionStore.delete(sessionId);
  }
  res.clearCookie('stockagent_session', { httpOnly: true, sameSite: 'lax', secure: process.env.NODE_ENV === 'production' });
  res.json({ status: 'logged_out' });
}

export function authMiddleware(req: Request, _res: Response, next: NextFunction) {
  const sessionId = req.cookies?.stockagent_session;
  if (typeof sessionId === 'string') {
    const cachedSession = sessionStore.get(sessionId);
    if (cachedSession) {
      req.authUser = cachedSession.user;
    }
  }
  next();
}
