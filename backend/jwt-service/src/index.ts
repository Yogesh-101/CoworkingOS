/**
 * Minimal JWT provider compatible with SereniBase auth provider contract.
 * SereniBase validates passwords locally, then calls this service for tokens.
 */
import cors from 'cors';
import express from 'express';
import jwt from 'jsonwebtoken';

const app = express();
const PORT = Number(process.env.SERVER_PORT || process.env.AUTH_PORT || 8081);
const HOST = process.env.SERVER_HOST || process.env.AUTH_HOST || '0.0.0.0';
const SECRET = process.env.JWT_SECRET || process.env.AUTH_JWT_SECRET || '';
const ACCESS_EXPIRY = process.env.ACCESS_TOKEN_DURATION || '15m';
const REFRESH_EXPIRY = process.env.REFRESH_TOKEN_DURATION || '168h';

if (!SECRET || SECRET.length < 32) {
  console.error('JWT_SECRET / AUTH_JWT_SECRET must be at least 32 characters');
  process.exit(1);
}

app.use(cors({ origin: true, credentials: true }));
app.use(express.json());

function success<T>(data: T, message = 'OK') {
  return { success: true, code: 'SUCCESS', message, data };
}

function failure(code: string, message: string) {
  return { success: false, code, message, data: null };
}

interface LoginBody {
  id: string;
  email: string;
  email_verified?: boolean;
  roles?: string[];
}

app.get('/health', (_req, res) => {
  res.json({ status: 'ok' });
});

app.post('/auth/login', (req, res) => {
  const body = req.body as LoginBody;
  if (!body?.id || !body?.email) {
    res.status(400).json(failure('INVALID_REQUEST', 'id and email are required'));
    return;
  }

  const roles = Array.isArray(body.roles) ? body.roles.join(',') : String(body.roles ?? 'Admin');
  const baseClaims = {
    sub: body.id,
    user_id: body.id,
    email: body.email,
    email_verified: Boolean(body.email_verified),
    roles,
  };

  const accessToken = jwt.sign({ ...baseClaims, token_type: 'access' }, SECRET, {
    expiresIn: ACCESS_EXPIRY,
  });
  const refreshToken = jwt.sign({ ...baseClaims, token_type: 'refresh' }, SECRET, {
    expiresIn: REFRESH_EXPIRY,
  });

  res.json(
    success({
      access_token: accessToken,
      refresh_token: refreshToken,
      token_type: 'Bearer',
      expires_in: 900,
    })
  );
});

app.post('/auth/validate-token', (req, res) => {
  const token = (req.body as { token?: string })?.token;
  if (!token) {
    res.status(400).json(failure('INVALID_REQUEST', 'token is required'));
    return;
  }

  try {
    const decoded = jwt.verify(token, SECRET) as jwt.JwtPayload;
    res.json(
      success({
        sub: decoded.sub ?? decoded.user_id,
        email: decoded.email,
        roles: decoded.roles ?? '',
        token_type: decoded.token_type,
        exp: decoded.exp,
        iat: decoded.iat,
        nbf: decoded.nbf,
      })
    );
  } catch (err) {
    const expired = err instanceof jwt.TokenExpiredError;
    res.status(401).json(
      failure(expired ? 'TOKEN_EXPIRED' : 'TOKEN_INVALID', expired ? 'Token expired' : 'Invalid token')
    );
  }
});

app.post('/auth/refresh', (req, res) => {
  const refreshToken = (req.body as { refresh_token?: string })?.refresh_token;
  if (!refreshToken) {
    res.status(400).json(failure('INVALID_REQUEST', 'refresh_token is required'));
    return;
  }

  try {
    const decoded = jwt.verify(refreshToken, SECRET) as jwt.JwtPayload;
    if (decoded.token_type !== 'refresh') {
      res.status(401).json(failure('TOKEN_INVALID', 'Not a refresh token'));
      return;
    }

    const baseClaims = {
      sub: decoded.sub,
      user_id: decoded.user_id ?? decoded.sub,
      email: decoded.email,
      roles: decoded.roles,
    };

    const accessToken = jwt.sign({ ...baseClaims, token_type: 'access' }, SECRET, {
      expiresIn: ACCESS_EXPIRY,
    });
    const newRefresh = jwt.sign({ ...baseClaims, token_type: 'refresh' }, SECRET, {
      expiresIn: REFRESH_EXPIRY,
    });

    res.json(
      success({
        access_token: accessToken,
        refresh_token: newRefresh,
        token_type: 'Bearer',
        expires_in: 900,
      })
    );
  } catch {
    res.status(401).json(failure('TOKEN_INVALID', 'Invalid refresh token'));
  }
});

app.listen(PORT, HOST, () => {
  console.log(`CoworkingOS JWT service listening on ${HOST}:${PORT}`);
});
