export type NodeData = string | { [key: string]: string };

export type NodeHierarchy =
  | d3.HierarchyRectangularNode<NodeData>
  | d3.HierarchyRectangularNode<unknown>;
