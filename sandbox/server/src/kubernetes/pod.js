import { k8sCoreV1Api } from "./config.js";

const TEMPLATE_IMAGE = process.env.SANDBOX_TEMPLATE_IMAGE || "template";
const AGENT_IMAGE = process.env.SANDBOX_AGENT_IMAGE || "agent";

export async function createPod(sandboxId) {

    const podManifest = {
        metadata: {
            name: `sandbox-pod-${sandboxId}`,
            labels: {
                app: 'sandbox',
                sandboxId: sandboxId
            }
        },
        spec: {
            volumes: [
                {
                    name: 'workspace-volume',
                    emptyDir: {}
                }
            ],
            initContainers: [{
                name: 'init-container',
                image: TEMPLATE_IMAGE,
                imagePullPolicy: "IfNotPresent",
                command: ['sh', '-c', 'cp -r /workspace/. /seed/'],
                volumeMounts: [
                    {
                        name: 'workspace-volume',
                        mountPath: '/seed',
                    }
                ],
            }
            ],
            containers: [
                {
                    image: TEMPLATE_IMAGE,
                    imagePullPolicy: "IfNotPresent",
                    name: 'sandbox-container',
                    ports: [{ containerPort: 5173, name: "http" }],
                    env: [
                        {
                            name: 'VITE_HMR_CLIENT_PORT',
                            value: '80'
                        }
                    ],
                    resources: {
                        limits: { cpu: "500m", memory: "1Gi" },
                        requests: { cpu: "250m", memory: "500Mi" }
                    },
                    volumeMounts: [
                        {
                            name: 'workspace-volume',
                            mountPath: '/workspace',
                        }
                    ],
                },
                {
                    image: AGENT_IMAGE,
                    imagePullPolicy: "IfNotPresent",
                    name: 'agent-container',
                    ports: [{ containerPort: 3000, name: "http" }],
                    resources: {
                        limits: { cpu: "500m", memory: "1Gi" },
                        requests: { cpu: "250m", memory: "500Mi" }
                    },
                    volumeMounts: [
                        {
                            name: 'workspace-volume',
                            mountPath: '/workspace',
                        }
                    ],
                }
            ]
        }
    }

    const response = await k8sCoreV1Api.createNamespacedPod({
        namespace: 'default',
        body: podManifest
    })

    return response;
}
