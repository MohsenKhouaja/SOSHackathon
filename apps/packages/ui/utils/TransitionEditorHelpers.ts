import type { TransitionType } from "@backend/schemas/enums";
import type { FullStatusTransition } from "@shared/validators/status-transition-validator";
import type { BaseStatusesValidatorType } from "@shared/validators/statuses-validator";
import dagre from "dagre";
import { type Edge, MarkerType, type Node } from "reactflow";

export type StatusNodeData = {
  status: BaseStatusesValidatorType;
};

export type EdgeData = {
  transition: FullStatusTransition;
};

export type CustomNode = {
  id: string;
  type: string;
  position: { x: number; y: number };
  data: StatusNodeData;
};

export type CustomEdge = Edge<EdgeData> & {
  label?: string;
  labelStyle?: React.CSSProperties;
};

export const transitionTypeMaps: Record<
  TransitionType,
  { name: string; color: string }
> = {
  SUCCESS_NEXT_PHASE: { name: "Success next phase", color: "#10b981" },
  SUCCESS_REDO_PHASE: { name: "Success redo phase", color: "#06b6d4" },
  SUCCESS_RETRY_PHASE: { name: "Success retry phase", color: "#8b5cf6" },
  FAIL_REDO_PHASE: { name: "Failed redo phase", color: "#f59e0b" },
  FAIL_NEXT_PHASE: { name: "Failed next phase", color: "#ef4444" },
  FAIL_RETRY_PHASE: { name: "Failed retry phase", color: "#f97316" },
  CANCELLED: { name: "Cancelled", color: "#6b7280" },
  FAILED: { name: "Failed", color: "#dc2626" },
  COMPLETED: { name: "Completed", color: "#059669" },
};

const dagreGraph = new dagre.graphlib.Graph();
dagreGraph.setDefaultEdgeLabel(() => ({}));

export const getLayoutedElements = (
  nodes: Node<StatusNodeData>[],
  edges: Edge<EdgeData>[],
  direction = "TB"
) => {
  dagreGraph.setGraph({ rankdir: direction });

  for (const node of nodes) {
    dagreGraph.setNode(node.id, { width: 200, height: 50 });
  }

  for (const edge of edges) {
    dagreGraph.setEdge(edge.source, edge.target);
  }

  dagre.layout(dagreGraph);

  for (const node of nodes) {
    const nodeWithPosition = dagreGraph.node(node.id);
    node.position = {
      x: nodeWithPosition.x - 100,
      y: nodeWithPosition.y - 25,
    };
  }

  return { nodes, edges };
};

export const createEdgeFromTransition = (
  transition: FullStatusTransition
): CustomEdge => ({
  id: `${transition.fromStatusId}-${transition.toStatusId}-${transition.transitionType}`,
  source: transition.fromStatusId,
  target: transition.toStatusId,
  type: "default",
  animated: true,
  style: {
    stroke: transitionTypeMaps[transition.transitionType]?.color,
    strokeWidth: 3,
    transition: "none",
  },
  markerEnd: {
    type: MarkerType.ArrowClosed,
    color: transitionTypeMaps[transition.transitionType]?.color,
  },
  label: transitionTypeMaps[transition.transitionType]?.name,
  labelStyle: {
    fontSize: 11,
    fontWeight: 500,
  },
  data: {
    transition,
  },
});

export const createNodeFromStatus = (
  status: BaseStatusesValidatorType,
  index: number
): CustomNode => ({
  id: status.statusId,
  type: "statusNode",
  position: {
    x: 200 + (index % 6) * 300,
    y: 150 + Math.floor(index / 6) * 200,
  },
  data: {
    status,
  },
});
