import * as cdk from 'aws-cdk-lib';
import { aws_route53 as route53, CfnParameter } from 'aws-cdk-lib';
import { Construct } from 'constructs';
import { DNSStackProps } from '../@types/stack-props';

export class DNSStack extends cdk.Stack {
  constructor(scope: Construct, id: string, props: DNSStackProps) {
    super(scope, id, props);
    // route53
    const hostedZone = route53.HostedZone.fromHostedZoneAttributes(
      this,
      'rootHostedzone',
      {
        hostedZoneId: props.hostedZoneId,
        zoneName: props.zoneName,
      }
    );
    const domainName = new CfnParameter(this, 'distributionDomainName', {
      type: 'String',
      description: 'The cloudfront domain name',
    });
    new route53.CnameRecord(this, 'websiteCname', {
      recordName: this.stackName,
      domainName: domainName.valueAsString,
      zone: hostedZone,
    });
  }
}
