import { Stack, App } from 'aws-cdk-lib';
import { Template } from 'aws-cdk-lib/assertions';
import { CertStack } from './stacks/cert-stack';

test('Common Stack', () => {
  const app = new App();
  // WHEN
  const stack = new CertStack(app, 'infraTestStack');
  // THEN
  Template.fromStack(stack as Stack).templateMatches({
    Resources: {
      domainCert: {
        Type: 'AWS::IAM::ServerCertificate',
        Properties: {
          Path: '/cloudfront/',
        },
      },
    },
  });
});
