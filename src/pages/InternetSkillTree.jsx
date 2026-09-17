import { FaNetworkWired } from 'react-icons/fa';
import { MarkerType } from '@xyflow/react';
import SkillTreeBase from '../components/SkillTreeBase';

const INTERNET_SKILL_TREE = {
  nodes: [
    // ═══ LEVEL 0 ═══
    { id: 'net-a', type: 'skillNode', position: { x: 50, y: 1200 }, data: { title: 'OSI Model Basics', level: 'Level 0 • Foundation', track: 'network', microSkills: ['7 Layers Overview', 'Physical Layer', 'Data Link Layer'], xpReward: 150, state: 'available', description: 'Foundation of network communication: understand the 7-layer OSI model.' } },
    { id: 'net-b', type: 'skillNode', position: { x: 550, y: 1200 }, data: { title: 'Network Protocols', level: 'Level 0 • Protocols', track: 'network', microSkills: ['TCP vs UDP', 'IP Addressing', 'ARP & ICMP'], xpReward: 150, state: 'available', description: 'Core protocols that enable device-to-device communication.' } },
    // ═══ LEVEL 1 ═══
    { id: 'net-c', type: 'skillNode', position: { x: 50, y: 900 }, data: { title: 'Subnetting & CIDR', level: 'Level 1 • Addressing', track: 'web', microSkills: ['IPv4 Subnetting', 'CIDR Notation', 'Private vs Public IP'], xpReward: 250, state: 'locked', description: 'Divide networks into subnets and master IP addressing schemes.' } },
    { id: 'net-d', type: 'skillNode', position: { x: 550, y: 900 }, data: { title: 'DNS & DHCP', level: 'Level 1 • Services', track: 'web', microSkills: ['DNS Resolution', 'DHCP Lease', 'Name Servers'], xpReward: 250, state: 'locked', description: 'Core network services: domain resolution and automatic IP assignment.' } },
    // ═══ LEVEL 2 ═══
    { id: 'net-e', type: 'skillNode', position: { x: -100, y: 600 }, data: { title: 'Routing & Switching', level: 'Level 2 • Routing', track: 'convergence', microSkills: ['Static Routing', 'OSPF', 'BGP Basics'], xpReward: 400, state: 'locked', description: 'Direct network traffic efficiently with routing protocols.' } },
    { id: 'net-f', type: 'skillNode', position: { x: 300, y: 600 }, data: { title: 'HTTP & Web Protocols', level: 'Level 2 • Web', track: 'convergence', microSkills: ['HTTP/HTTPS', 'REST APIs', 'WebSockets'], xpReward: 350, state: 'locked', description: 'Understand web communication protocols and API design.' } },
    { id: 'net-g', type: 'skillNode', position: { x: 700, y: 600 }, data: { title: 'Firewalls & NAT', level: 'Level 2 • Security', track: 'convergence', microSkills: ['Packet Filtering', 'NAT/PAT', 'ACLs'], xpReward: 400, state: 'locked', description: 'Protect networks with firewalls and address translation.' } },
    // ═══ LEVEL 3 ═══
    { id: 'net-h', type: 'skillNode', position: { x: -100, y: 300 }, data: { title: 'VPN & Tunneling', level: 'Level 3 • VPN', track: 'security', microSkills: ['IPSec', 'OpenVPN', 'TLS/SSL'], xpReward: 450, state: 'locked', description: 'Secure communications over public networks with VPN technologies.' } },
    { id: 'net-i', type: 'skillNode', position: { x: 300, y: 300 }, data: { title: 'Load Balancing & CDN', level: 'Level 3 • Scale', track: 'security', microSkills: ['Round Robin', 'CDN Architecture', 'Reverse Proxy'], xpReward: 450, state: 'locked', description: 'Scale network services with load balancers and content delivery.' } },
    { id: 'net-j', type: 'skillNode', position: { x: 700, y: 300 }, data: { title: 'Network Monitoring', level: 'Level 3 • Ops', track: 'security', microSkills: ['Wireshark', 'SNMP', 'Network Logs'], xpReward: 500, state: 'locked', description: 'Monitor and troubleshoot networks with professional tools.' } },
    // ═══ LEVEL 4 (APEX) ═══
    { id: 'net-boss', type: 'skillNode', position: { x: 250, y: -70 }, data: { title: 'Network Architecture', level: 'Level 4 • APEX BOSS', track: 'boss', microSkills: ['SD-WAN', 'Zero Trust Architecture', 'Cloud Networking', 'IPv6 Migration', 'Network Automation'], xpReward: 1000, state: 'locked', description: 'Design enterprise-grade network architectures at scale.' } },
  ],
  edges: [
    { id: 'e-a-c', source: 'net-a', target: 'net-c', type: 'smoothstep', animated: true, style: { stroke: '#10b981', strokeWidth: 2 }, markerEnd: { type: MarkerType.ArrowClosed, color: '#10b981' } },
    { id: 'e-b-d', source: 'net-b', target: 'net-d', type: 'smoothstep', animated: true, style: { stroke: '#10b981', strokeWidth: 2 }, markerEnd: { type: MarkerType.ArrowClosed, color: '#10b981' } },
    { id: 'e-c-e', source: 'net-c', target: 'net-e', type: 'smoothstep', animated: true, style: { stroke: '#10b981', strokeWidth: 2 }, markerEnd: { type: MarkerType.ArrowClosed, color: '#10b981' } },
    { id: 'e-c-f', source: 'net-c', target: 'net-f', type: 'smoothstep', animated: true, style: { stroke: '#10b981', strokeWidth: 2 }, markerEnd: { type: MarkerType.ArrowClosed, color: '#10b981' } },
    { id: 'e-d-f', source: 'net-d', target: 'net-f', type: 'smoothstep', animated: true, style: { stroke: '#10b981', strokeWidth: 2 }, markerEnd: { type: MarkerType.ArrowClosed, color: '#10b981' } },
    { id: 'e-d-g', source: 'net-d', target: 'net-g', type: 'smoothstep', animated: true, style: { stroke: '#10b981', strokeWidth: 2 }, markerEnd: { type: MarkerType.ArrowClosed, color: '#10b981' } },
    { id: 'e-e-h', source: 'net-e', target: 'net-h', type: 'smoothstep', animated: true, style: { stroke: '#10b981', strokeWidth: 2 }, markerEnd: { type: MarkerType.ArrowClosed, color: '#10b981' } },
    { id: 'e-e-i', source: 'net-e', target: 'net-i', type: 'smoothstep', animated: true, style: { stroke: '#10b981', strokeWidth: 2 }, markerEnd: { type: MarkerType.ArrowClosed, color: '#10b981' } },
    { id: 'e-f-i', source: 'net-f', target: 'net-i', type: 'smoothstep', animated: true, style: { stroke: '#10b981', strokeWidth: 2 }, markerEnd: { type: MarkerType.ArrowClosed, color: '#10b981' } },
    { id: 'e-g-j', source: 'net-g', target: 'net-j', type: 'smoothstep', animated: true, style: { stroke: '#10b981', strokeWidth: 2 }, markerEnd: { type: MarkerType.ArrowClosed, color: '#10b981' } },
    { id: 'e-h-boss', source: 'net-h', target: 'net-boss', type: 'smoothstep', animated: true, style: { stroke: '#f59e0b', strokeWidth: 3 }, markerEnd: { type: MarkerType.ArrowClosed, color: '#f59e0b' } },
    { id: 'e-i-boss', source: 'net-i', target: 'net-boss', type: 'smoothstep', animated: true, style: { stroke: '#f59e0b', strokeWidth: 3 }, markerEnd: { type: MarkerType.ArrowClosed, color: '#f59e0b' } },
    { id: 'e-j-boss', source: 'net-j', target: 'net-boss', type: 'smoothstep', animated: true, style: { stroke: '#f59e0b', strokeWidth: 3 }, markerEnd: { type: MarkerType.ArrowClosed, color: '#f59e0b' } },
  ],
};

export default function InternetSkillTree() {
  return (
    <SkillTreeBase
      treeData={INTERNET_SKILL_TREE}
      title="Networking"
      TitleIcon={<FaNetworkWired />}
      accentColor="#10b981"
      BossIcon={<FaNetworkWired />}
    />
  );
}
