import * as cdk from 'aws-cdk-lib';
import { CertStack } from './stacks/cert-stack';
import { DNSStack } from './stacks/dns-stack';
import { WebsiteStack } from './stacks/website-stack';

// 参数检查
const envName = process.env.ENV_NAME ?? 'sandbox';
const domain = process.env.DOMAIN ?? 'visualdynamics';
const sld = domain.includes('visualdynamics')
  ? `${domain}.cn`
  : `${domain}.com`; // (Second Level Domain,SLD)
if (!envName) {
  console.error(
    "MUST SET THE `ENV_NAME`, eg: 'sandbox' | 'dev' | 'staging' | 'prod'"
  );
  process.exit(1);
}
if (!domain) {
  console.error("MUST SET THE `DOMAIN`, eg: 'visualdynamics' | 'solarsketch'");
  process.exit(1);
}

// HINT: 账号-名域 证书维护
const certMap = new Map<string, string>();
const envId = `${envName}-${domain}`;
certMap.set('sandbox0-visualdynamics', 'ASCAUBQCIOHWXXYH7Z7NM');
certMap.set('sandbox-visualdynamics', 'ASCAUBQCIOHWXXYH7Z7NM');
certMap.set('dev-visualdynamics', '');
certMap.set('staging-visualdynamics', '');
certMap.set('prod-visualdynamics', '');
certMap.set('sandbox-solarsketch', '');
certMap.set('dev-solarsketch', '');
certMap.set('staging-solarsketch', '');
certMap.set('prod-solarsketch', '');

const zoneMap = new Map<string, string>();
zoneMap.set('visualdynamics', 'Z07615781AL3G61EODJAV');
zoneMap.set('solarsketch', 'Z0725171CORCU8PF32DB');

if (!certMap.get(envId)) {
  console.error(`ERROR: can not find the certification by ${envId}`);
  process.exit(1);
}
if (!zoneMap.get(domain)) {
  console.error(`ERROR: can not find the hostedzone by ${domain}`);
  process.exit(1);
}

// Stacks
const addTags = (s: cdk.Stack) => {
  cdk.Tags.of(s).add('ownerEnv', envId);
  cdk.Tags.of(s).add('createdBy', 'cdk');
};
const app = new cdk.App();

const cert = new CertStack(app, 'certStack', {
  env: { region: 'cn-northwest-1' },
  stackName: `${envId}-cert`,
  description: 'upload iam certification',

  codeEnvName: envName,
  sld,
});
addTags(cert);

const website = new WebsiteStack(app, 'websiteStack', {
  env: { region: 'cn-northwest-1' },
  stackName: envId,
  description: 'setup a website',

  iamCertificateId: certMap.get(envId),
  codeEnvName: envName,
  sld,
});
addTags(website);

const dns = new DNSStack(app, 'dnsStack', {
  env: { region: 'cn-northwest-1' },
  stackName: `${envId}-dns`,
  description: 'manage DNS record in root account',

  hostedZoneId: zoneMap.get(domain),
  recordName: envName,
  zoneName: sld,
});
addTags(dns);
