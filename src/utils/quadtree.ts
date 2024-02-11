import { QuadTreeNode } from './node';
import { Polygon, StandardizedLine, Direction } from '../types';

  // Class for Quadtree
  export class QuadTree {
    root: QuadTreeNode;
    maxDepth: number;

    constructor(boundingBox: Polygon, maxDepth: number) {
      this.root = new QuadTreeNode(boundingBox);
      this.maxDepth = maxDepth;
    }

    insert(line: StandardizedLine) {
      this.root.insert(line);
    }

    searchAdjacentLines(anchorLine: StandardizedLine, position: Direction): StandardizedLine | undefined {
        let closestLine: StandardizedLine | undefined;
        let minDistanceSquared = Infinity;

        const anchorX = (anchorLine.boundingPolygon[0].x + anchorLine.boundingPolygon[2].x) / 2;
        const anchorY = (anchorLine.boundingPolygon[0].y + anchorLine.boundingPolygon[2].y) / 2;

        // helper function to search in a node
        const searchInNode = (node: QuadTreeNode) => {
          if (!node) return;

          for (const line of node.lines) {
            const lineX = (line.boundingPolygon[0].x + line.boundingPolygon[2].x) / 2;
            const lineY = (line.boundingPolygon[0].y + line.boundingPolygon[2].y) / 2;

            let distanceSquared;
            switch (position) {
              case 'above':
                if (lineY < anchorY) {
                  distanceSquared = (lineX - anchorX) ** 2 + (lineY - anchorY) ** 2;
                  if (distanceSquared < minDistanceSquared) {
                    minDistanceSquared = distanceSquared;
                    closestLine = line;
                  }
                }
                break;
              case 'below':
                if (lineY > anchorY) {
                  distanceSquared = (lineX - anchorX) ** 2 + (lineY - anchorY) ** 2;
                  if (distanceSquared < minDistanceSquared) {
                    minDistanceSquared = distanceSquared;
                    closestLine = line;
                  }
                }
                break;
              case 'left':
                if (lineX < anchorX) {
                  distanceSquared = (lineX - anchorX) ** 2 + (lineY - anchorY) ** 2;
                  if (distanceSquared < minDistanceSquared) {
                    minDistanceSquared = distanceSquared;
                    closestLine = line;
                  }
                }
                break;
              case 'right':
                if (lineX > anchorX) {
                  distanceSquared = (lineX - anchorX) ** 2 + (lineY - anchorY) ** 2;
                  if (distanceSquared < minDistanceSquared) {
                    minDistanceSquared = distanceSquared;
                    closestLine = line;
                  }
                }
                break;
            }
          }

          for (const child of node.children) {
            if (this.intersects(anchorLine.boundingPolygon, child.boundingBox)) {
              searchInNode(child);
            }
          }
        };

        searchInNode(this.root);

        return closestLine;
    }

    private intersects(poly: Polygon, bbox: Polygon): boolean {
      const [p1, p2, p3, p4] = poly;
      const { x: minX, y: minY } = bbox[0];
      const { x: maxX, y: maxY } = bbox[2];

      return (
        this.intersectSegment(p1.x, p1.y, p2.x, p2.y, minX, minY, maxX, minY) ||
        this.intersectSegment(p2.x, p2.y, p3.x, p3.y, maxX, minY, maxX, maxY) ||
        this.intersectSegment(p3.x, p3.y, p4.x, p4.y, minX, maxY, maxX, maxY) ||
        this.intersectSegment(p4.x, p4.y, p1.x, p1.y, minX, minY, minX, maxY)
      );
    }

    private intersectSegment(x1: number, y1: number, x2: number, y2: number, x3: number, y3: number, x4: number, y4: number) {
      const ua =
        ((x4 - x3) * (y1 - y3) - (y4 - y3) * (x1 - x3)) /
        ((y4 - y3) * (x2 - x1) - (x4 - x3) * (y2 - y1));
      const ub = ((x2 - x1) * (y1 - y3) - (y2 - y1) * (x1 - x3)) / ((y4 - y3) * (x2 - x1) - (x4 - x3) * (y2 - y1));

      return ua >= 0 && ua <= 1 && ub >= 0 && ub <= 1;
    }
  }