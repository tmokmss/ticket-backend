import * as cdk from '@aws-cdk/core';
import * as ecs from '@aws-cdk/aws-ecs';
import * as efs from '@aws-cdk/aws-efs';
import * as ec2 from '@aws-cdk/aws-ec2';

export class FargateStack extends cdk.Stack {
    constructor(scope: cdk.Construct, id: string, props?: cdk.StackProps) {
        super(scope, id, props);

        const vpc = new ec2.Vpc(this, 'vpc');

        const NFSPort = ec2.Port.tcp(2049);
        const filesystemSecurityGroup = new ec2.SecurityGroup(
            this,
            "efs-security",
            {
                vpc,
                allowAllOutbound: true,
            }
        );

        const serviceSecurityGroup = new ec2.SecurityGroup(this, "serviceSG", {
            vpc,
            allowAllOutbound: true,
        });

        filesystemSecurityGroup.addIngressRule(serviceSecurityGroup, NFSPort);
        serviceSecurityGroup.addEgressRule(filesystemSecurityGroup, NFSPort);

        const filesystem = new efs.FileSystem(this, "efs", {
            vpc,
            encrypted: true,
            lifecyclePolicy: efs.LifecyclePolicy.AFTER_60_DAYS,
            securityGroup: filesystemSecurityGroup,
            enableAutomaticBackups: true,
            removalPolicy: cdk.RemovalPolicy.DESTROY,
        });

        const cluster = new ecs.Cluster(this, 'cluster', {
            vpc: vpc,
        });

        const taskDefinition = new ecs.FargateTaskDefinition(this, "task-def", {
            cpu: 1024,
            memoryLimitMiB: 2 * 1024,
            volumes: [
                { name: "logs" },
                { name: "sockets" },
                {
                    name: "www",
                    efsVolumeConfiguration: {
                        fileSystemId: filesystem.fileSystemId,
                        transitEncryption: "ENABLED",
                    },
                },
            ],
        });
        taskDefinition.addContainer('nginx', {
            image: ecs.ContainerImage.fromRegistry('nginx'),
        });

        const service = new ecs.FargateService(this, "service", {
            platformVersion: ecs.FargatePlatformVersion.VERSION1_4,
            securityGroups: [serviceSecurityGroup],
            taskDefinition,
            cluster,
        });
    }
}
