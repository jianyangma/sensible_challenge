import { Polygon, StandardizedLine } from '../types';

// Class for a Quadtree node
export class QuadTreeNode {
    boundingBox: Polygon;
    lines: StandardizedLine[];
    children: QuadTreeNode[];

    constructor(boundingBox: Polygon) {
      this.boundingBox = boundingBox;
      this.lines = [];
      this.children = [];
    }

    insert(line: StandardizedLine) {
      // Check if the line intersects with the bounding box
      if (this.isLineInsideBoundingBox(line)) {
        this.lines.push(line);
      } else {
        // If the line doesn't fit entirely in this node, insert it into appropriate child node
        for (const child of this.children) {
          if (this.isLineInsideBoundingBox(line, child.boundingBox)) {
            child.insert(line);
            break;
          }
        }
      }
    }

    private isLineInsideBoundingBox(line: StandardizedLine, bbox: Polygon = this.boundingBox): boolean {
      return line.boundingPolygon.every(
        (point) =>
          point.x >= bbox[0].x &&
          point.x <= bbox[2].x &&
          point.y >= bbox[0].y &&
          point.y <= bbox[2].y
      );
    }
  }
