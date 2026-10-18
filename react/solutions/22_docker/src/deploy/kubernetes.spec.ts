// @vitest-environment node
import { describe, expect, it } from 'vitest';
import { readYamlDocuments } from './files';

const deployment = readYamlDocuments('k8s/deployment.yaml').find((doc) => doc.kind === 'Deployment');
const service = readYamlDocuments('k8s/service.yaml').find((doc) => doc.kind === 'Service');
const ingress = readYamlDocuments('k8s/ingress.yaml').find((doc) => doc.kind === 'Ingress');
const pod = deployment?.spec?.template;
const container = pod?.spec?.containers?.[0];

describe('k8s/deployment.yaml', () => {
  it('runs the image with its port and its runtime configuration', () => {
    expect(container?.ports?.[0]?.containerPort).toBe(8080);
    expect(container?.env?.map((variable: { name: string }) => variable.name)).toEqual(
      expect.arrayContaining(['API_BASE_URL', 'APP_ENVIRONMENT']),
    );
  });

  it('refuses to start the container as root', () => {
    const securityContext = { ...pod?.spec?.securityContext, ...container?.securityContext };
    expect(securityContext.runAsNonRoot).toBe(true);
    expect(securityContext.allowPrivilegeEscalation).toBe(false);
  });

  it('only sends traffic to a pod whose nginx answers /healthz', () => {
    expect(container?.readinessProbe?.httpGet).toMatchObject({ path: '/healthz', port: 8080 });
    expect(container?.livenessProbe?.httpGet).toMatchObject({ path: '/healthz', port: 8080 });
  });

  it('declares the resources it requests and its limits', () => {
    expect(container?.resources?.requests).toMatchObject({ cpu: expect.any(String), memory: expect.any(String) });
    expect(container?.resources?.limits).toMatchObject({ memory: expect.any(String) });
  });
});

describe('k8s/service.yaml', () => {
  it('selects the pods of the Deployment', () => {
    expect(service?.spec?.selector).toBeDefined();
    expect(pod?.metadata?.labels).toMatchObject(service?.spec?.selector ?? { missing: 'selector' });
  });

  it('forwards to the port the container listens on', () => {
    expect(service?.spec?.ports?.[0]?.targetPort).toBe(container?.ports?.[0]?.containerPort);
  });
});

describe('k8s/ingress.yaml', () => {
  it('routes every path of the host to the Service', () => {
    const path = ingress?.spec?.rules?.[0]?.http?.paths?.[0];

    expect(path).toMatchObject({ path: '/', pathType: 'Prefix' });
    expect(path?.backend?.service).toEqual({
      name: service?.metadata?.name,
      port: { number: service?.spec?.ports?.[0]?.port },
    });
  });

  it('does not rewrite the path: /people/leia-organa must reach nginx as is', () => {
    // The `rewrite-target: /` annotation copied from every tutorial turns
    // every deep link into `/` — the SPA fallback never even sees it.
    expect(ingress?.metadata?.annotations?.['nginx.ingress.kubernetes.io/rewrite-target']).toBeUndefined();
  });
});
