import * as fs from 'fs';
import { join } from 'path';
import { Label, Row, StandardizedText } from '../src/types';
import { Extractor } from '../src/extractor';

let standardizedText: StandardizedText;

beforeAll(() => {
  const filePath = join(__dirname, 'standardized_text.json');
  const jsonContent = fs.readFileSync(filePath, 'utf8');

  standardizedText = JSON.parse(jsonContent);
});

describe('Extractor tests', () => {
  it('should extract a label', () => {
    const labelConfig: Label = {
      id: 'label',
      position: 'below',
      textAlignment: 'left',
      anchor: 'distance'
    };

    const extractor = new Extractor(standardizedText);

    const labelResult = extractor.extractLabel(labelConfig);
    expect(labelResult?.text).toBe('733mi');
    expect(labelResult?.boundingPolygon).toEqual([
      {
        'x': 2.005,
        'y': 4.413
      },
      {
        'x': 2.374,
        'y': 4.413
      },
      {
        'x': 2.374,
        'y': 4.541
      },
      {
        'x': 2.005,
        'y': 4.541
      }
    ]);
  });

  it('should extract a row', () => {
    const rowConfig: Row = {
      id: 'row',
      position: 'right',
      tiebreaker: 'first',
      anchor: 'line haul'
    };

    const extractor = new Extractor(standardizedText);

    const labelResult = extractor.extractRow(rowConfig);
    expect(labelResult?.text).toBe('$1770.00');
    expect(labelResult?.boundingPolygon).toEqual([
      {
        'x': 6.765,
        'y': 1.994
      },
      {
        'x': 7.315,
        'y': 1.994
      },
      {
        'x': 7.315,
        'y': 2.122
      },
      {
        'x': 6.765,
        'y': 2.122
      }
    ]);
  });

  it('should find tiebreak', () => {
    const first: Row = {
      id: 'row',
      position: 'right',
      tiebreaker: 'first',
      anchor: 'weight'
    };
    const second: Row = {
      id: 'row',
      position: 'right',
      tiebreaker: 'second',
      anchor: 'weight'
    };
    const last: Row = {
      id: 'row',
      position: 'right',
      tiebreaker: 'last',
      anchor: 'weight'
    };

    const extractor = new Extractor(standardizedText);

    let labelResult = extractor.extractRow(first);
    expect(labelResult?.text).toBe('Distance');

    labelResult = extractor.extractRow(second);
    expect(labelResult?.text).toBe('Equipment');

    labelResult = extractor.extractRow(last);
    expect(labelResult?.text).toBe('Packaging');
  });

  it('should throw an error when the anchor line is not found', () => {
    const rowConfig: Row = {
      id: 'row',
      position: 'right',
      tiebreaker: 'first',
      anchor: 'nonexistent anchor'
    };

    const extractor = new Extractor(standardizedText);

    expect(() => extractor.extractRow(rowConfig)).toThrowError(`Anchor line "${rowConfig.anchor}" not found.`);
  });
});
