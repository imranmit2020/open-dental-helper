import React from "react";

interface SankeyNode {
  id: string;
  label: string;
  x: number;
  y: number;
  width: number;
  height: number;
  color: string;
}

interface SankeyLink {
  source: string;
  target: string;
  value: number;
  color: string;
}

interface SankeyChartProps {
  nodes: SankeyNode[];
  links: SankeyLink[];
  title?: string;
}

const SankeyChart: React.FC<SankeyChartProps> = ({ nodes, links, title }) => {
  const svgWidth = 600;
  const svgHeight = 400;

  const renderNode = (node: SankeyNode) => (
    <g key={node.id}>
      <rect
        x={node.x}
        y={node.y}
        width={node.width}
        height={node.height}
        fill={node.color}
        rx={4}
        className="hover:opacity-80 transition-opacity"
      />
      <text
        x={node.x + node.width / 2}
        y={node.y + node.height / 2}
        textAnchor="middle"
        dominantBaseline="middle"
        className="fill-white text-sm font-medium"
      >
        {node.label}
      </text>
    </g>
  );

  const renderLink = (link: SankeyLink, index: number) => {
    const sourceNode = nodes.find(n => n.id === link.source);
    const targetNode = nodes.find(n => n.id === link.target);
    
    if (!sourceNode || !targetNode) return null;

    const strokeWidth = Math.max(link.value / 10, 2);
    const sourceX = sourceNode.x + sourceNode.width;
    const sourceY = sourceNode.y + sourceNode.height / 2;
    const targetX = targetNode.x;
    const targetY = targetNode.y + targetNode.height / 2;
    
    const controlX1 = sourceX + (targetX - sourceX) * 0.5;
    const controlX2 = targetX - (targetX - sourceX) * 0.5;

    const path = `M ${sourceX} ${sourceY} C ${controlX1} ${sourceY} ${controlX2} ${targetY} ${targetX} ${targetY}`;

    return (
      <g key={`link-${index}`}>
        <path
          d={path}
          stroke={link.color}
          strokeWidth={strokeWidth}
          fill="none"
          opacity={0.6}
          className="hover:opacity-80 transition-opacity"
        />
        <text
          x={(sourceX + targetX) / 2}
          y={(sourceY + targetY) / 2 - 10}
          textAnchor="middle"
          className="fill-muted-foreground text-xs"
        >
          {link.value}
        </text>
      </g>
    );
  };

  return (
    <div className="w-full">
      {title && (
        <h3 className="text-lg font-semibold mb-4 text-foreground">{title}</h3>
      )}
      <div className="bg-gradient-card rounded-xl border border-border/30 p-6">
        <svg width="100%" height={svgHeight} viewBox={`0 0 ${svgWidth} ${svgHeight}`}>
          {links.map(renderLink)}
          {nodes.map(renderNode)}
        </svg>
      </div>
    </div>
  );
};

export default SankeyChart;