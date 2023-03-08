import * as cdk from 'aws-cdk-lib';
import { EnvName } from './@types/stack-props';
import { CertStack } from './stacks/cert-stack';
import { DNSStack } from './stacks/dns-stack';
import { EnvStack } from './stacks/website-stack';

// HINT: 增加每个Stack的证书
const certMap = new Map<EnvName, string>();
certMap.set('sandbox', 'ASCAUBQCIOHWRNFG5JAOV');

if (!process.env.ENV_NAME) {
  console.error(
    "MUST SET THE `ENV_NAME`( sandbox' | 'dev' | 'staging' | 'production)'"
  );
  process.exit(1);
}
const envName = process.env.ENV_NAME as EnvName;
const app = new cdk.App();
const env = {
  account: process.env.CDK_DEPLOY_ACCOUN ?? process.env.CDK_DEFAULT_ACCOUNT,
  region: process.env.CDK_DEPLOY_REGION ?? process.env.CDK_DEFAULT_REGION,
};

const addTags = (s: cdk.Stack) => {
  cdk.Tags.of(s).add('ownerEnv', envName);
  cdk.Tags.of(s).add('createdBy', 'cdk');
};

const cert = new CertStack(app, 'CertStack', {
  env,
  stackName: 'cert',
  description: 'for website setup in every account',
});
addTags(cert);

if (certMap.get(envName)) {
  const website = new EnvStack(app, 'WebsiteStack', {
    env,
    stackName: envName,
    iamCertificateId: certMap.get(envName),
    description: 'for setup a website',
  });
  addTags(website);

  const dns = new DNSStack(app, 'DNSStack', {
    env: { account: '380056528987', region: env.region },
    stackName: `dns-${envName}`,
    hostedZoneId: 'Z07615781AL3G61EODJAV',
    recordName: envName,
    zoneName: 'visualdynamics.cn',
    description: 'for DNS record in root account',
  });
  addTags(dns);
}
