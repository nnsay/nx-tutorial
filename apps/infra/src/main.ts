import * as cdk from 'aws-cdk-lib';
import { CertStackProps, EnvName } from './@types/stack-props';
import { CertStack } from './stacks/cert-stack';
import { EnvStack } from './stacks/website-stack';

// HINT: 增加每个Stack的证书
const certMap = new Map<EnvName, string>();
certMap.set('sandbox', 'ASCAUBQCIOHWRNKWYB4GD');

const envName = (process.env.STACK_NAME ?? 'sandbox') as EnvName;
const app = new cdk.App();

const env = {
  account: process.env.CDK_DEPLOY_ACCOUN ?? process.env.CDK_DEFAULT_ACCOUNT,
  region: process.env.CDK_DEPLOY_REGION ?? process.env.CDK_DEFAULT_REGION,
};

// TODO: here should use the root account/region
const dnsStack = new cdk.Stack(app, 'DNSStack', {
  env: { account: env.account, region: env.region },
  stackName: `dns-${envName}`,
  description: 'for DNS record in root account',
} as CertStackProps);
cdk.Tags.of(dnsStack).add('ownerEnv', envName);
cdk.Tags.of(dnsStack).add('createdBy', 'cdk');

const certStack = new CertStack(app, 'CertStack', {
  env,
  stackName: 'cert',
  description: 'for website setup in every account',
});
cdk.Tags.of(certStack).add('ownerEnv', envName);
cdk.Tags.of(certStack).add('createdBy', 'cdk');

if (certMap.get(envName)) {
  const website = new EnvStack(app, 'WebsiteStack', {
    env,
    stackName: envName,
    dnsStack: dnsStack,
    iamCertificateId: certMap.get(envName),
    hostedZoneId: 'Z076424035STJQQZSIJQ9',
    zoneName: 'visualdynamics.cn',
    description: 'for setup a website',
  });
  cdk.Tags.of(website).add('ownerEnv', envName);
  cdk.Tags.of(certStack).add('createdBy', 'cdk');
  dnsStack.addDependency(dnsStack);
}
