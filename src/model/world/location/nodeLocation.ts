import { Override } from "@/types";
import { LocationConfig, Type, Location } from "./location";
import { LocationNode, LocationNodeConfig } from "./locationNode";


export interface NodeLocationConfig extends LocationConfig {
  type: Type.Node;
  startingSubNodeId: string;
  subNodes: Record<string, LocationNodeConfig>;
}

export class NodeLocation extends Location {
  #data: Override<NodeLocationConfig, { subNodes: Map<string, LocationNode> }>;

  constructor({ subNodes, ...config }: NodeLocationConfig) {
    super(config);

    this.#data = {
      ...config,
      subNodes: new Map(Object.entries(subNodes).map(([id, config]) => [id, new LocationNode(config)]))
    }
  }

  get startingSubNodeId() { return this.#data.startingSubNodeId; }
  get subNodes() { return new Map(this.#data.subNodes); }

  toJSON(): NodeLocationConfig {
    return {
      ...this.#data,
      subNodes: Object.fromEntries(Array.from(this.#data.subNodes.entries()).map(([id, node]) => [id, node.toJSON()]))
    };
  }
}