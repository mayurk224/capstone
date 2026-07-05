import express from 'express';
import morgan from 'morgan';
import { createProxyMiddleware } from 'http-proxy-middleware';

const app = express();

app.use(morgan('combined'));

app.get('/api/status/healthz', (req, res) => {
    res.status(200).json({ status: 'healthy' });
});

app.get('/api/status/readyz', (req, res) => {
    res.status(200).json({ status: 'ready' });
});

const proxies = {};
const agentProxies = {};

function getSandboxRoute(host = '') {
    const [sandboxId, routeType] = host.split('.');

    if (!sandboxId || !routeType) {
        return null;
    }

    if (routeType === 'preview') {
        return { sandboxId, routeType };
    }

    if (routeType === 'agent') {
        return { sandboxId, routeType };
    }

    return null;
}

function getProxy(sandboxId) {
    const target = `http://sandbox-service-${sandboxId}`;
    if (!proxies[sandboxId]) {
        proxies[sandboxId] = createProxyMiddleware({
            target,
            changeOrigin: true,
        });
    }
    return proxies[sandboxId];
}

function getAgentProxy(sandboxId) {
    const target = `http://sandbox-service-${sandboxId}:3000`;
    if (!agentProxies[sandboxId]) {
        agentProxies[sandboxId] = createProxyMiddleware({
            target,
            changeOrigin: true,
        });
    }
    return agentProxies[sandboxId];
}

function getSandboxProxy(route) {
    return route.routeType === 'agent'
        ? getAgentProxy(route.sandboxId)
        : getProxy(route.sandboxId);
}

app.use((req, res, next) => {
    const route = getSandboxRoute(req.headers.host);

    if (!route) {
        return res.status(404).json({
            status: 'error',
            message: 'Unknown sandbox host'
        });
    }

    return getSandboxProxy(route)(req, res, next);
});

export function handleUpgrade(req, socket, head) {
    const route = getSandboxRoute(req.headers.host);

    if (!route) {
        socket.write('HTTP/1.1 404 Not Found\r\nConnection: close\r\n\r\n');
        socket.destroy();
        return;
    }

    getSandboxProxy(route).upgrade(req, socket, head);
}

export default app;
