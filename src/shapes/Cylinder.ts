import { ConvexPolyhedron } from '../shapes/ConvexPolyhedron'
import { Vec3 } from '../math/Vec3'

/**
 * @class Cylinder
 * @constructor
 * @extends ConvexPolyhedron
 * @author schteppe / https://github.com/schteppe
 * @param {Number} radiusTop
 * @param {Number} radiusBottom
 * @param {Number} height
 * @param {Number} numSegments The number of segments to build the cylinder out of
 */
export class Cylinder extends ConvexPolyhedron {
  constructor(radiusTop: number, radiusBottom: number, height: number, numSegments: number) {
    const N = numSegments
    const vertices = []
    const axes = []
    const faces = []
    const bottomface = []
    const topface = []
    const cos = Math.cos
    const sin = Math.sin

    // First bottom point
    vertices.push(new Vec3(-radiusBottom * sin(0), -height * 0.5, radiusBottom * cos(0)))
    bottomface.push(0)

    // First top point
    vertices.push(new Vec3(-radiusTop * sin(0), height * 0.5, radiusTop * cos(0)))
    topface.push(1)

    for (let i = 0; i < N; i++) {
      const theta = ((2 * Math.PI) / N) * (i + 1)
      const thetaN = ((2 * Math.PI) / N) * (i + 0.5)
      if (i < N - 1) {
        // Bottom
        vertices.push(new Vec3(-radiusBottom * sin(theta), -height * 0.5, radiusBottom * cos(theta)))
        bottomface.push(2 * i + 2)
        // Top
        vertices.push(new Vec3(-radiusTop * sin(theta), height * 0.5, radiusTop * cos(theta)))
        topface.push(2 * i + 3)

        // Face
        faces.push([2 * i, 2 * i + 1, 2 * i + 3, 2 * i + 2])
      } else {
        faces.push([2 * i, 2 * i + 1, 1, 0]) // Connect
      }

      // Axis: we can cut off half of them if we have even number of segments
      if (N % 2 === 1 || i < N / 2) {
        axes.push(new Vec3(-sin(thetaN), 0, cos(thetaN)))
      }
    }
    faces.push(bottomface)
    axes.push(new Vec3(0, 1, 0))

    // Reorder top face
    const temp = []
    for (let i = 0; i < topface.length; i++) {
      temp.push(topface[topface.length - i - 1])
    }
    faces.push(temp)

    super({ vertices, faces, axes })
  }
}
