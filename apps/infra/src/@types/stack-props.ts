import * as cdk from 'aws-cdk-lib';

export type EnvName = 'sandbox' | 'dev' | 'staging' | 'production';

export interface CertStackProps extends cdk.StackProps {
  stackName: string;
}

export interface WebsiteStackProps extends cdk.StackProps {
  iamCertificateId: string;

  stackName: string;

  dnsStack: cdk.Stack;
  hostedZoneId: string;
  zoneName: string;
}

export interface DNSStackProps extends cdk.StackProps {
  distributionDomainName: string;
}
