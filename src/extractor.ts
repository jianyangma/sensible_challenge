import { Label, Polygon, Row, StandardizedText, StandardizedLine } from './types';
import { QuadTree } from './utils/quadtree';

// Define the Extractor class using Quadtree
export class Extractor {
    quadtree: QuadTree;
    text: StandardizedText;

    constructor(text: StandardizedText) {
      this.text = text;
      const boundingBox = this.calculateBoundingBox(text);
      const maxDepth = 5;
      this.quadtree = new QuadTree(boundingBox, maxDepth);

      // Populate Quadtree
      for (const page of text.pages) {
        for (const line of page.lines) {
          this.quadtree.insert(line);
        }
      }
    }

    extractLabel(configuration: Label): StandardizedLine | undefined {
      const { position, anchor } = configuration;

      // Find the anchor line based on the anchor text
      const anchorLine = this.findAnchorLine(anchor);
      if (!anchorLine) throw new Error(`Anchor line "${anchor}" not found.`);

      // Search for adjacent lines based on position
      const adjacentLines = this.quadtree.searchAdjacentLines(anchorLine, position);

      return adjacentLines;
    }

    extractRow(configuration: Row): StandardizedLine | undefined {
        const { position, tiebreaker, anchor } = configuration;

        // Find the anchor line based on the anchor text
        const anchorLine = this.findAnchorLine(anchor);
        if (!anchorLine) throw new Error(`Anchor line "${anchor}" not found.`);

        const anchorX = (anchorLine.boundingPolygon[0].x + anchorLine.boundingPolygon[2].x) / 2;

        // Find the associated row for the anchor line
        const anchorRow = this.findRow(anchorLine);
        if (!anchorRow) throw new Error(`Row for anchor line "${anchor}" not found.`);

        const textInRowPosition: StandardizedLine[] = [];
        for (const line of anchorRow) {
            const lineX = (line.boundingPolygon[0].x + line.boundingPolygon[2].x) / 2;
            if ((position === 'left' && lineX < anchorX) || (position === 'right' && lineX > anchorX)) {
            textInRowPosition.push(line);
            }
        }

        // Apply tiebreaker logic to select the closest text label
        const closestLabel = this.applyTiebreaker(textInRowPosition, tiebreaker);

        return closestLabel;
    }

    private findAnchorLine(anchor: string): StandardizedLine | undefined {
      for (const page of this.text.pages) {
        for (const line of page.lines) {
          if (line.text.toLowerCase().includes(anchor.toLowerCase())) {
            return line;
          }
        }
      }
      return undefined;
    }

    // Find all lines in the same row as the anchor line
    private findRow(anchorLine: StandardizedLine): StandardizedLine[] | undefined {
        const anchorY = (anchorLine.boundingPolygon[0].y + anchorLine.boundingPolygon[2].y) / 2;
        const allLines: StandardizedLine[] = [];

        for (const page of this.text.pages) {
          for (const line of page.lines) {
            const lineY = (line.boundingPolygon[0].y + line.boundingPolygon[2].y) / 2;
            if (Math.abs(lineY - anchorY) < 0.01) { // Tolerance for floating point comparison
              allLines.push(line);
            }
          }
        }

        return allLines.length > 0 ? allLines : undefined;
      }

      private applyTiebreaker(textInRowPosition: StandardizedLine[], tiebreaker: 'first' | 'second' | 'last'): StandardizedLine | undefined {
        if (textInRowPosition.length === 0) return undefined;

          switch (tiebreaker) {
            case 'first':
              return textInRowPosition[0];
            case 'second':
              return textInRowPosition[1];
            case 'last':
              return textInRowPosition[textInRowPosition.length - 1];
            default:
              return undefined;
          }
        };

    private calculateBoundingBox(text: StandardizedText): Polygon {
      let minX = Infinity;
      let minY = Infinity;
      let maxX = -Infinity;
      let maxY = -Infinity;

      for (const page of text.pages) {
        for (const line of page.lines) {
          for (const point of line.boundingPolygon) {
            minX = Math.min(minX, point.x);
            minY = Math.min(minY, point.y);
            maxX = Math.max(maxX, point.x);
            maxY = Math.max(maxY, point.y);
          }
        }
      }

      return [{ x: minX, y: minY }, { x: maxX, y: minY }, { x: maxX, y: maxY }, { x: minX, y: maxY }];
    }
  }