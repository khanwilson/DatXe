interface Point {
  x: number;
  y: number;
}

interface Size {
  width: number;
  height: number;
}

interface Transform {
  transform?: Record<string, unknown>[];
  [key: string]: unknown;
}

export function withAnchorPoint(
  transform: Transform,
  anchorPoint: Point,
  size: Size,
) {
  'worklet';
  if (!transform || !transform.transform) {
    return transform;
  }

  const { transform: transformList, ...rest } = transform;
  if (!Array.isArray(transformList)) {
    return transform;
  }

  const anchorX = size.width * anchorPoint.x;
  const anchorY = size.height * anchorPoint.y;

  let translateX = 0;
  let translateY = 0;

  // Extract existing translate values
  transformList.forEach((t) => {
    if (t && typeof t === 'object') {
      if ('translateX' in t) {
        translateX = t.translateX as number;
      }
      if ('translateY' in t) {
        translateY = t.translateY as number;
      }
    }
  });

  // Apply anchor point transformation
  const newTransform = transformList.map((t) => {
    if (t && typeof t === 'object') {
      if ('translateX' in t) {
        return { ...t, translateX: (t.translateX as number) - anchorX };
      }
      if ('translateY' in t) {
        return { ...t, translateY: (t.translateY as number) - anchorY };
      }
    }
    return t;
  });

  // Add translation to compensate for anchor point
  newTransform.push({ translateX: anchorX + translateX });
  newTransform.push({ translateY: anchorY + translateY });

  return {
    ...rest,
    transform: newTransform,
  };
}

