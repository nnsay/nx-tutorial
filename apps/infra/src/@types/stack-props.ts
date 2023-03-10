import * as cdk from 'aws-cdk-lib';

export type EnvName = 'sandbox' | 'dev' | 'staging' | 'production';

export interface CertStackProps extends cdk.StackProps {
  stackName: string;
}

export interface WebsiteStackProps extends cdk.StackProps {
  stackName: string;

  iamCertificateId: string;
}

export interface DNSStackProps extends cdk.StackProps {
  stackName: string;

  zoneName: string;
  hostedZoneId: string;
}
