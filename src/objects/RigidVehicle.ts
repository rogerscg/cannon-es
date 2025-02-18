import { Vec3 } from '../math/Vec3'
import { Body } from '../objects/Body'
import { Sphere } from '../shapes/Sphere'
import { Box } from '../shapes/Box'
import { HingeConstraint } from '../constraints/HingeConstraint'
import type { World } from '../world/World'

export type RigidVehicleOptions = {
  coordinateSystem?: Vec3
  chassisBody?: Body
}

export type RigidVehicleWheelOptions = {
  body?: Body
  position?: Vec3
  axis?: Vec3
}

/**
 * Simple vehicle helper class with spherical rigid body wheels.
 * @class RigidVehicle
 * @constructor
 * @param {Body} [options.chassisBody]
 */
export class RigidVehicle {
  wheelBodies: Body[]
  coordinateSystem: Vec3
  chassisBody: Body
  constraints: (HingeConstraint & { motorTargetVelocity?: number })[]
  wheelAxes: Vec3[]
  wheelForces: number[]

  constructor(options: RigidVehicleOptions = {}) {
    this.wheelBodies = []
    this.coordinateSystem =
      typeof options.coordinateSystem !== 'undefined' ? options.coordinateSystem.clone() : new Vec3(1, 2, 3)

    if (options.chassisBody) {
      this.chassisBody = options.chassisBody
    } else {
      // No chassis body given. Create it!
      this.chassisBody = new Body({ mass: 1, shape: new Box(new Vec3(5, 2, 0.5)) })
    }

    this.constraints = []
    this.wheelAxes = []
    this.wheelForces = []
  }

  /**
   * Add a wheel
   * @method addWheel
   * @param {object} options
   * @param {boolean} [options.isFrontWheel]
   * @param {Vec3} [options.position] Position of the wheel, locally in the chassis body.
   * @param {Vec3} [options.direction] Slide direction of the wheel along the suspension.
   * @param {Vec3} [options.axis] Axis of rotation of the wheel, locally defined in the chassis.
   * @param {Body} [options.body] The wheel body.
   */
  addWheel(options: RigidVehicleWheelOptions = {}): number {
    let wheelBody: Body

    if (options.body) {
      wheelBody = options.body
    } else {
      // No wheel body given. Create it!
      wheelBody = new Body({ mass: 1, shape: new Sphere(1.2) })
    }

    this.wheelBodies.push(wheelBody)
    this.wheelForces.push(0)

    // Position constrain wheels
    const zero = new Vec3()
    const position = typeof options.position !== 'undefined' ? options.position.clone() : new Vec3()

    // Set position locally to the chassis
    const worldPosition = new Vec3()
    this.chassisBody.pointToWorldFrame(position, worldPosition)
    wheelBody.position.set(worldPosition.x, worldPosition.y, worldPosition.z)

    // Constrain wheel
    const axis = typeof options.axis !== 'undefined' ? options.axis.clone() : new Vec3(0, 1, 0)
    this.wheelAxes.push(axis)

    const hingeConstraint = new HingeConstraint(this.chassisBody, wheelBody, {
      pivotA: position,
      axisA: axis,
      pivotB: Vec3.ZERO,
      axisB: axis,
      collideConnected: false,
    })
    this.constraints.push(hingeConstraint)

    return this.wheelBodies.length - 1
  }

  /**
   * Set the steering value of a wheel.
   * @method setSteeringValue
   * @param {number} value
   * @param {integer} wheelIndex
   * @todo check coordinateSystem
   */
  setSteeringValue(value: number, wheelIndex: number): void {
    // Set angle of the hinge axis
    const axis = this.wheelAxes[wheelIndex]

    const c = Math.cos(value)
    const s = Math.sin(value)
    const x = axis.x
    const y = axis.y
    this.constraints[wheelIndex].axisA.set(c * x - s * y, s * x + c * y, 0)
  }

  /**
   * Set the target rotational speed of the hinge constraint.
   * @method setMotorSpeed
   * @param {number} value
   * @param {integer} wheelIndex
   */
  setMotorSpeed(value: number, wheelIndex: number): void {
    const hingeConstraint = this.constraints[wheelIndex]
    hingeConstraint.enableMotor()
    hingeConstraint.motorTargetVelocity = value
  }

  /**
   * Set the target rotational speed of the hinge constraint.
   * @method disableMotor
   * @param {number} value
   * @param {integer} wheelIndex
   */
  disableMotor(wheelIndex: number): void {
    const hingeConstraint = this.constraints[wheelIndex]
    hingeConstraint.disableMotor()
  }

  /**
   * Set the wheel force to apply on one of the wheels each time step
   * @method setWheelForce
   * @param  {number} value
   * @param  {integer} wheelIndex
   */
  setWheelForce(value: number, wheelIndex: number): void {
    this.wheelForces[wheelIndex] = value
  }

  /**
   * Apply a torque on one of the wheels.
   * @method applyWheelForce
   * @param  {number} value
   * @param  {integer} wheelIndex
   */
  applyWheelForce(value: number, wheelIndex: number): void {
    const axis = this.wheelAxes[wheelIndex]
    const wheelBody = this.wheelBodies[wheelIndex]
    const bodyTorque = wheelBody.torque

    axis.scale(value, torque)
    wheelBody.vectorToWorldFrame(torque, torque)
    bodyTorque.vadd(torque, bodyTorque)
  }

  /**
   * Add the vehicle including its constraints to the world.
   * @method addToWorld
   * @param {World} world
   */
  addToWorld(world: World): void {
    const constraints = this.constraints
    const bodies = this.wheelBodies.concat([this.chassisBody])

    for (let i = 0; i < bodies.length; i++) {
      world.addBody(bodies[i])
    }

    for (let i = 0; i < constraints.length; i++) {
      world.addConstraint(constraints[i])
    }

    world.addEventListener('preStep', this._update.bind(this))
  }

  private _update(): void {
    const wheelForces = this.wheelForces
    for (let i = 0; i < wheelForces.length; i++) {
      this.applyWheelForce(wheelForces[i], i)
    }
  }

  /**
   * Remove the vehicle including its constraints from the world.
   * @method removeFromWorld
   * @param {World} world
   */
  removeFromWorld(world: World): void {
    const constraints = this.constraints
    const bodies = this.wheelBodies.concat([this.chassisBody])

    for (let i = 0; i < bodies.length; i++) {
      world.removeBody(bodies[i])
    }

    for (let i = 0; i < constraints.length; i++) {
      world.removeConstraint(constraints[i])
    }
  }

  /**
   * Get current rotational velocity of a wheel
   * @method getWheelSpeed
   * @param {integer} wheelIndex
   */
  getWheelSpeed(wheelIndex: number): number {
    const axis = this.wheelAxes[wheelIndex]
    const wheelBody = this.wheelBodies[wheelIndex]
    const w = wheelBody.angularVelocity
    this.chassisBody.vectorToWorldFrame(axis, worldAxis)
    return w.dot(worldAxis)
  }
}

const torque = new Vec3()

const worldAxis = new Vec3()
