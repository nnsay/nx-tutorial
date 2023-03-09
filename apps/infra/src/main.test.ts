import { Stack, App } from 'aws-cdk-lib';
import { Template } from 'aws-cdk-lib/assertions';
import { CertStack } from './stacks/cert-stack';
import { DNSStack } from './stacks/dns-stack';
import { WebsiteStack } from './stacks/website-stack';

describe('Test all stack', () => {
  const codeEnvName = process.env.ENV_NAME; // test
  const stackName = 'test-stack';
  const domain = process.env.DOMAIN; // localhost

  test('cert stack', () => {
    const app = new App();
    // WHEN
    const stack = new CertStack(app, 'infraTestStack', {
      sld: `${domain}.cn`,
      codeEnvName,
      stackName,
    });
    // THEN
    Template.fromStack(stack as Stack).templateMatches({
      Resources: {
        [`${domain}Cert`]: {
          Type: 'AWS::IAM::ServerCertificate',
          Properties: {
            Path: '/cloudfront/',
            PrivateKey: process.env.CERT_PRIVATE_TEST_LOCALHOST,
            ServerCertificateName: `${domain}2023`,
          },
        },
      },
    });
  });

  test('dns tack', () => {
    const app = new App();
    // WHEN
    const stack = new DNSStack(app, 'infraTestStack', {
      recordName: 'unit',
      zoneName: 'test.cn',
      hostedZoneId: 'test-hostedZoneId',
      stackName,
    });
    // THEN
    Template.fromStack(stack).hasParameter('distributionDomainName', {
      Type: 'String',
    });
    Template.fromStack(stack).hasResource('AWS::Route53::RecordSet', {
      Properties: {
        Name: 'unit.test.cn.',
        Type: 'CNAME',
        HostedZoneId: 'test-hostedZoneId',
        ResourceRecords: [{ Ref: 'distributionDomainName' }],
      },
    });
  });

  test('website stack', () => {
    const app = new App();
    // WHEN
    const stack = new WebsiteStack(app, 'infraTestStack', {
      iamCertificateId: 'test-cert-id',
      sld: 'test.cn',
      stackName,
      codeEnvName,
    });
    // THEN
    Template.fromStack(stack).hasResource('AWS::S3::Bucket', {
      Properties: {
        BucketName: `${stackName}-wb`,
      },
    });
    Template.fromStack(stack).hasResource('AWS::CloudFront::Distribution', {
      Properties: {
        DistributionConfig: {
          Aliases: [`${codeEnvName}.test.cn`],
          PriceClass: 'PriceClass_All',
          ViewerCertificate: {
            IamCertificateId: 'test-cert-id',
          },
        },
      },
    });
  });
});
